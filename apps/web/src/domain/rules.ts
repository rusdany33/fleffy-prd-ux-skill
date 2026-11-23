import type { Checklist, Decision, Order, Role, VerificationRequest, VerificationState, Verifier } from './types'

export const isVerifier = (r: Role): r is Verifier => r === 'owner' || r === 'finance'

/** Permintaan aktif = permintaan terbaru (termasuk yang stale, agar bisa ditandai kedaluwarsa). */
export const latestRequest = (o: Order): VerificationRequest | undefined => o.requests[o.requests.length - 1]

/** Permintaan yang masih berlaku untuk data terbaru. */
export function activeRequest(o: Order): VerificationRequest | undefined {
  const r = latestRequest(o)
  return r && !r.stale ? r : undefined
}

export function verificationState(o: Order): VerificationState {
  if (o.method !== 'transfer') return 'tidak_perlu'
  const r = activeRequest(o)
  if (!r) return 'belum_diminta'
  return r.result ? 'hasil_tersedia' : 'menunggu'
}

export const checklistComplete = (c: Checklist) => c.identity && c.amount && c.time && c.received

/** Snapshot permintaan sesuai data pesanan sekarang (INTERACTION-SPEC §4.4 butir 3). */
export function matchesLatestData(o: Order, r: VerificationRequest): boolean {
  const s = r.snapshot
  return s.orderCode === o.code && s.customerName === o.customerName && s.amount === o.amount && s.method === o.method &&
    s.proofId === o.proof?.id && s.proofAmount === o.proof?.amount && s.proofAt === o.proof?.transferAt
}

/** Hasil memadai (INTERACTION-SPEC §4.4). */
export function resultAdequate(o: Order): boolean {
  if (o.method !== 'transfer') return false
  const r = activeRequest(o)
  const res = r?.result
  if (!r || !res) return false
  return isVerifier(res.by) && r.snapshot.orderCode === o.code && matchesLatestData(o, r) &&
    res.conclusion === 'sesuai' && checklistComplete(res.checklist)
}

/** Dana dikonfirmasi hanya bila hasil memadai (AC-004). */
export const fundsConfirmed = resultAdequate

/** Hasil terakhir dibuat untuk data lama (P05). */
export function hasStaleResult(o: Order): boolean {
  const r = latestRequest(o)
  return !!r && r.stale
}

export function canRequest(o: Order, role: Role): { ok: boolean; reason?: string } {
  if (role !== 'admin') return { ok: false, reason: 'Permintaan pemeriksaan dibuat oleh Admin.' }
  if (o.method !== 'transfer') return { ok: false, reason: 'Pembayaran tunai tidak memerlukan pemeriksaan transfer.' }
  const r = activeRequest(o)
  if (!r) return { ok: true }
  if (!r.result) return { ok: false, reason: 'Permintaan sebelumnya masih menunggu hasil.' }
  if (resultAdequate(o)) return { ok: false, reason: 'Hasil pemeriksaan sudah memadai.' }
  return { ok: true }
}

export const latestDecision = (o: Order): Decision | undefined => o.decisions[o.decisions.length - 1]

/** Keputusan masih berlaku bila (tunai) atau merujuk permintaan aktif. */
export function decisionValid(o: Order, d: Decision): boolean {
  if (o.method === 'tunai') return true
  const r = activeRequest(o)
  if (d.type === 'teruskan') return !!r && d.requestId === r.id && resultAdequate(o)
  return !d.requestId || d.requestId === r?.id || !r
}

export function currentDecision(o: Order): Decision | undefined {
  const d = latestDecision(o)
  return d && decisionValid(o, d) ? d : undefined
}

export const isForwarded = (o: Order) => currentDecision(o)?.type === 'teruskan'

export function canForward(o: Order, role: Role): { ok: boolean; reason?: string } {
  if (role !== 'admin') return { ok: false, reason: 'Keputusan dicatat oleh Admin.' }
  if (isForwarded(o)) return { ok: false, reason: 'Keputusan Teruskan sudah tersimpan.' }
  if (o.method === 'tunai') return { ok: true }
  if (hasStaleResult(o)) return { ok: false, reason: 'Diperlukan hasil yang cocok dengan data terbaru.' }
  const st = verificationState(o)
  if (st === 'belum_diminta') return { ok: false, reason: 'Minta pemeriksaan terlebih dahulu. Pembayaran tercatat belum memastikan dana masuk.' }
  if (st === 'menunggu') return { ok: false, reason: 'Tunggu hasil yang sesuai dengan pesanan dan data terbaru.' }
  if (!resultAdequate(o)) return { ok: false, reason: 'Hasil belum memenuhi dasar keputusan untuk data terbaru.' }
  return { ok: true }
}

/** Status ringkas untuk kartu & antrean. */
export type QueueKey = 'belum_diminta' | 'menunggu' | 'hasil_tersedia' | 'keputusan'
export function queueKey(o: Order): QueueKey | null {
  if (o.method !== 'transfer') return null
  if (currentDecision(o)?.type === 'teruskan') return 'keputusan'
  return verificationState(o) as Exclude<VerificationState, 'tidak_perlu'>
}

export function summary(orders: Order[]) {
  const count = (k: QueueKey) => orders.filter((o) => queueKey(o) === k).length
  return { belum_diminta: count('belum_diminta'), menunggu: count('menunggu'), hasil_tersedia: count('hasil_tersedia'), keputusan: count('keputusan') }
}

export function searchOrders(orders: Order[], q: string) {
  const s = q.trim().toLowerCase()
  if (!s) return orders
  return orders.filter((o) => o.code.toLowerCase().includes(s) || o.customerName.toLowerCase().includes(s) || o.proof?.id.toLowerCase().includes(s))
}

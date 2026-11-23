import type {
  Checklist, EntryStatus, PaymentEntry, Role, Stage, StageChange, Transaction, VerificationRequest, VerificationState, Verifier,
} from './types'

export const isVerifier = (r: Role): r is Verifier => r === 'owner' || r === 'finance'
export const isNonCash = (p: PaymentEntry) => p.method !== 'cash'
export const activeEntries = (t: Transaction) => t.payments.filter((p) => !p.cancelled)
export const checklistComplete = (c: Checklist) => c.identity && c.amount && c.time && c.received

export const STAGES: Stage[] = ['antrian', 'diproses', 'finishing', 'qc', 'selesai']
export const nextStage = (s: Stage): Stage | undefined => STAGES[STAGES.indexOf(s) + 1]

/** Hasil memadai: dari pemeriksa, Sesuai, dan 4 butir cocok (INTERACTION-SPEC §4.4 / §11.3). */
export function resultAdequate(r: VerificationRequest): boolean {
  const res = r.result
  return !!res && isVerifier(res.by) && res.conclusion === 'sesuai' && checklistComplete(res.checklist)
}

/** Permintaan terbaru yang memuat entri tertentu. */
export function requestFor(t: Transaction, entryId: string): VerificationRequest | undefined {
  for (let i = t.requests.length - 1; i >= 0; i--) if (t.requests[i].entries.some((e) => e.id === entryId)) return t.requests[i]
  return undefined
}

export function entryStatus(t: Transaction, p: PaymentEntry): EntryStatus {
  if (p.method === 'cash') return 'tunai'
  const r = requestFor(t, p.id)
  if (!r) return 'belum_diminta'
  if (!r.result) return 'menunggu'
  if (resultAdequate(r)) return 'dikonfirmasi'
  return r.result.conclusion === 'tidak_sesuai' ? 'tidak_sesuai' : 'perlu_klarifikasi'
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
/** Dibayar tercatat (semua entri). */
export const paidRecorded = (t: Transaction) => sum(activeEntries(t).map((p) => p.amount))
/** Dana dikonfirmasi: tunai + non-tunai dengan hasil memadai (UX-SPEC §7.2). */
export const paidConfirmed = (t: Transaction) =>
  sum(activeEntries(t).filter((p) => ['tunai', 'dikonfirmasi'].includes(entryStatus(t, p))).map((p) => p.amount))
export const remaining = (t: Transaction) => Math.max(0, t.bill - paidRecorded(t))
export const isLunas = (t: Transaction) => paidRecorded(t) >= t.bill
export const fullyConfirmed = (t: Transaction) => paidConfirmed(t) >= t.bill

/** Entri yang perlu (diminta) diperiksa. */
export const entriesToRequest = (t: Transaction) =>
  activeEntries(t).filter((p) => ['belum_diminta', 'perlu_klarifikasi', 'tidak_sesuai'].includes(entryStatus(t, p)))

export const pendingRequest = (t: Transaction) => t.requests.find((r) => !r.result)
export const latestRequest = (t: Transaction) => t.requests[t.requests.length - 1]

export function verificationState(t: Transaction): VerificationState {
  const nc = activeEntries(t).filter(isNonCash)
  if (!nc.length) return 'tidak_perlu'
  const st = nc.map((p) => entryStatus(t, p))
  if (st.includes('belum_diminta')) return 'belum_diminta'
  if (st.includes('menunggu')) return 'menunggu'
  return 'hasil_tersedia'
}

/** Semua entri non-tunai sudah dikonfirmasi. */
export const allNonCashConfirmed = (t: Transaction) =>
  activeEntries(t).filter(isNonCash).every((p) => entryStatus(t, p) === 'dikonfirmasi')

export function canRequest(t: Transaction, role: Role): { ok: boolean; reason?: string } {
  if (role !== 'admin') return { ok: false, reason: 'Permintaan pemeriksaan dibuat oleh Admin.' }
  if (pendingRequest(t)) return { ok: false, reason: 'Permintaan sebelumnya masih menunggu hasil.' }
  if (!entriesToRequest(t).length) return { ok: false, reason: 'Tidak ada pembayaran non-tunai yang perlu diperiksa.' }
  return { ok: true }
}

/** Gerbang tahap berikutnya (UX-SPEC §7.4). */
export function canAdvance(t: Transaction, role: Role): { ok: boolean; reason?: string; to?: Stage } {
  if (role !== 'admin') return { ok: false, reason: 'Status pengerjaan diubah oleh Admin.' }
  const to = nextStage(t.stage)
  if (!to) return { ok: false, reason: 'Transaksi sudah selesai.' }
  if (t.stage === 'antrian') {
    if (!activeEntries(t).length) return { ok: false, reason: 'Belum ada pembayaran tercatat.', to }
    const st = verificationState(t)
    if (!allNonCashConfirmed(t)) {
      if (st === 'belum_diminta') return { ok: false, reason: 'Minta pemeriksaan terlebih dahulu. Pembayaran tercatat belum memastikan dana masuk.', to }
      if (st === 'menunggu') return { ok: false, reason: 'Tunggu hasil yang sesuai untuk pembayaran transaksi ini.', to }
      return { ok: false, reason: 'Hasil pemeriksaan belum memadai. Minta pemeriksaan ulang atau tahan transaksi.', to }
    }
  }
  if (t.stage === 'qc' && !fullyConfirmed(t)) {
    return { ok: false, reason: 'Dana dikonfirmasi belum sama dengan tagihan. Sepatu belum boleh diserahkan.', to }
  }
  return { ok: true, to }
}

export function canCancelEntry(t: Transaction, p: PaymentEntry, role: Role): { ok: boolean; reason?: string } {
  if (role !== 'admin') return { ok: false, reason: 'Pembayaran dicatat oleh Admin.' }
  if (p.cancelled) return { ok: false, reason: 'Entri sudah dibatalkan.' }
  const st = entryStatus(t, p)
  // Tidak sesuai = dana tidak ditemukan pemeriksa → kasir boleh membatalkan catatannya.
  if (!['tunai', 'belum_diminta', 'tidak_sesuai'].includes(st)) return { ok: false, reason: 'Entri yang sedang diperiksa atau sudah dikonfirmasi tidak dapat dibatalkan.' }
  if (t.stage !== 'antrian') return { ok: false, reason: 'Pengerjaan sudah berjalan.' }
  return { ok: true }
}

export const lastHold = (t: Transaction): StageChange | undefined => {
  const c = t.changes[t.changes.length - 1]
  return c?.kind === 'tahan' && t.stage === 'antrian' ? c : undefined
}

export const isForwarded = (t: Transaction) => t.stage !== 'antrian'

/** Kunci antrean (N2). */
export type QueueKey = 'belum_diminta' | 'menunggu' | 'hasil_tersedia' | 'diteruskan'
export function queueKey(t: Transaction): QueueKey | null {
  const st = verificationState(t)
  if (st === 'tidak_perlu') return null
  if (isForwarded(t) && st === 'hasil_tersedia') return 'diteruskan'
  return st
}

export function summary(ts: Transaction[]) {
  const c = (k: QueueKey) => ts.filter((t) => queueKey(t) === k).length
  return { belum_diminta: c('belum_diminta'), menunggu: c('menunggu'), hasil_tersedia: c('hasil_tersedia'), diteruskan: c('diteruskan') }
}

export function searchTransactions(ts: Transaction[], q: string) {
  const s = q.trim().toLowerCase()
  if (!s) return ts
  return ts.filter((t) => [t.invoice, t.customerName, t.customerCode, t.phone, ...t.payments.map((p) => p.id)].some((v) => v.toLowerCase().includes(s)))
}

/** Notifikasi per peran (UX-SPEC §7.5). */
export interface Notice { txId: string; title: string; text: string; at: string }
export function notices(ts: Transaction[], role: Role): Notice[] {
  const out: Notice[] = []
  for (const t of ts) {
    for (const r of t.requests) {
      const total = sum(r.entries.map((e) => e.amount))
      const methods = [...new Set(r.entries.map((e) => (e.method === 'transfer' ? 'Bank Transfer' : 'E-Wallet')))].join(' + ')
      if (isVerifier(role) && !r.result && r.verifier === role) {
        out.push({ txId: t.id, at: r.requestedAt, title: `Permintaan pemeriksaan ${t.invoice}`, text: `${r.id} · ${methods} Rp${total.toLocaleString('id-ID')} · ${t.customerCode} ${t.customerName}` })
      }
      if (role === 'admin' && r.result && r === latestRequest(t) && t.stage === 'antrian') {
        out.push({ txId: t.id, at: r.result.at, title: `Hasil pemeriksaan masuk ${t.invoice}`, text: `${r.result.id} · ${r.result.byName} · ${resultAdequate(r) ? 'Sesuai' : 'Belum memadai'}` })
      }
    }
  }
  return out.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5)
}

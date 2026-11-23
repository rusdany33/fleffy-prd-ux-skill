import type {
  AppState, Checklist, Conclusion, Decision, HoldReason, Order, Proof, RequestSnapshot, Role, VerificationRequest, Verifier,
} from './types'
import { orderCode, proofId, requestId, resultId, uid } from './ids'
import { activeRequest, canForward, canRequest, checklistComplete, isVerifier, latestRequest } from './rules'
import { validateDraft, type OrderDraft } from '../utils/validation'
import { ROLE_LABEL, VERIFIER_LABEL, CONCLUSION_LABEL, HOLD_REASON_LABEL } from '../utils/format'

/** Kesalahan aturan bisnis — pesannya aman ditampilkan ke pengguna. */
export class RuleError extends Error {}

const now = () => new Date().toISOString()

function withOrder(s: AppState, id: string, fn: (o: Order) => Order): AppState {
  const i = s.orders.findIndex((o) => o.id === id)
  if (i < 0) throw new RuleError('Pesanan tidak ditemukan.')
  const orders = s.orders.slice()
  orders[i] = fn(orders[i])
  return { ...s, orders }
}

const actorName = (s: AppState) => `${s.names[s.role]} · ${ROLE_LABEL[s.role]}`

function draftToFields(d: OrderDraft, seq: number) {
  const proof: Proof | undefined = d.method === 'transfer' && d.hasProof
    ? { id: proofId(seq), amount: +d.proofAmount, transferAt: new Date(d.proofAt).toISOString(), sender: d.proofSender.trim(), note: d.proofNote.trim() }
    : undefined
  return {
    customerName: d.customerName.trim(), whatsapp: d.whatsapp.trim(), service: d.service, pairs: +d.pairs, amount: +d.amount,
    method: d.method, note: d.note.trim(), proof,
  }
}

export function snapshotOf(o: Order): RequestSnapshot {
  return {
    orderCode: o.code, customerName: o.customerName, amount: o.amount, method: o.method,
    proofId: o.proof?.id, proofAmount: o.proof?.amount, proofAt: o.proof?.transferAt,
  }
}

// ---------- Pesanan ----------

export function createOrder(s: AppState, d: OrderDraft): { state: AppState; order: Order } {
  if (s.role !== 'admin') throw new RuleError('Pesanan dicatat oleh Admin.')
  if (Object.keys(validateDraft(d)).length) throw new RuleError('Periksa kembali isian yang ditandai.')
  const seq = s.seq + 1
  const t = now()
  const order: Order = {
    id: uid(), code: orderCode(seq), seq, ...draftToFields(d, seq), createdAt: t, updatedAt: t,
    requests: [], decisions: [],
    history: [{ at: t, actor: actorName(s), text: `Pesanan ${orderCode(seq)} dibuat. Pembayaran ${d.method === 'transfer' ? 'Bank Transfer' : 'tunai'} tercatat.` }],
  }
  return { state: { ...s, seq, orders: [...s.orders, order] }, order }
}

export function updateOrder(s: AppState, id: string, d: OrderDraft): AppState {
  if (s.role !== 'admin') throw new RuleError('Pesanan diubah oleh Admin.')
  if (Object.keys(validateDraft(d)).length) throw new RuleError('Periksa kembali isian yang ditandai.')
  return withOrder(s, id, (o) => {
    const t = now()
    const next: Order = { ...o, ...draftToFields(d, o.seq), updatedAt: t }
    const changed: string[] = []
    if (o.customerName !== next.customerName) changed.push('pelanggan')
    if (o.service !== next.service || o.pairs !== next.pairs) changed.push('layanan')
    if (o.amount !== next.amount) changed.push('nominal')
    if (o.method !== next.method) changed.push('metode')
    if (JSON.stringify(o.proof ?? null) !== JSON.stringify(next.proof ?? null)) changed.push('bukti')
    if (o.whatsapp !== next.whatsapp || o.note !== next.note) changed.push('kontak/catatan')
    const history = [...o.history]
    if (changed.length) history.push({ at: t, actor: actorName(s), text: `Pesanan diubah (${changed.join(', ')}).` })
    // INTERACTION-SPEC §3.3 / AGENTS §5.3 — data yang diperiksa berubah → hasil lama kedaluwarsa
    const critical = changed.some((c) => ['pelanggan', 'nominal', 'metode', 'bukti'].includes(c))
    const last = latestRequest(o)
    let requests = o.requests
    if (critical && last && !last.stale) {
      requests = o.requests.map((r) => (r.id === last.id ? { ...r, stale: true } : r))
      history.push({ at: t, actor: 'Sistem', text: `${last.id}${last.result ? ` / ${last.result.id}` : ''} dibuat untuk data sebelumnya dan tidak berlaku lagi.` })
    }
    return { ...next, requests, history }
  })
}

// ---------- Pemeriksaan ----------

export function requestVerification(s: AppState, id: string, verifier: Verifier, note: string): AppState {
  if (note.length > 300) throw new RuleError('Catatan maksimal 300 karakter.')
  return withOrder(s, id, (o) => {
    const c = canRequest(o, s.role)
    if (!c.ok) throw new RuleError(c.reason)
    const t = now()
    const attempt = o.requests.length + 1
    const req: VerificationRequest = {
      id: requestId(o.seq, attempt), verifier, note: note.trim(), requestedAt: t, requestedBy: actorName(s),
      snapshot: snapshotOf(o), stale: false,
    }
    // permintaan sebelumnya (hasil belum memadai / kedaluwarsa) tetap di riwayat tetapi tidak aktif
    const requests = o.requests.map((r) => ({ ...r, stale: true }))
    return {
      ...o, updatedAt: t, requests: [...requests, req],
      history: [...o.history, { at: t, actor: actorName(s), text: `Permintaan ${req.id} dikirim ke ${VERIFIER_LABEL[verifier]}.${req.note ? ` Catatan: ${req.note}` : ''}` }],
    }
  })
}

export function recordResult(s: AppState, id: string, conclusion: Conclusion, checklist: Checklist, note: string): AppState {
  if (!isVerifier(s.role)) throw new RuleError('Hasil pemeriksaan hanya dapat dicatat oleh Owner atau Finance.')
  if (conclusion === 'sesuai' && !checklistComplete(checklist)) throw new RuleError('Kesimpulan Sesuai membutuhkan keempat butir pemeriksaan tercentang.')
  if (conclusion !== 'sesuai' && !note.trim()) throw new RuleError('Catatan wajib diisi untuk hasil Perlu klarifikasi atau Tidak sesuai.')
  return withOrder(s, id, (o) => {
    const r = activeRequest(o)
    if (!r) throw new RuleError('Tidak ada permintaan aktif untuk pesanan ini.')
    if (r.result) throw new RuleError(`Hasil untuk ${r.id} sudah tercatat.`)
    const t = now()
    const attempt = o.requests.findIndex((x) => x.id === r.id) + 1
    const result = { id: resultId(o.seq, attempt), conclusion, checklist, note: note.trim(), by: s.role, byName: s.names[s.role], at: t }
    return {
      ...o, updatedAt: t,
      requests: o.requests.map((x) => (x.id === r.id ? { ...x, result } : x)),
      history: [...o.history, { at: t, actor: actorName(s), text: `Hasil ${result.id} untuk ${r.id}: ${CONCLUSION_LABEL[conclusion]}.${result.note ? ` Catatan: ${result.note}` : ''}` }],
    }
  })
}

// ---------- Keputusan ----------

export function decideForward(s: AppState, id: string): AppState {
  return withOrder(s, id, (o) => {
    const c = canForward(o, s.role)
    if (!c.ok) throw new RuleError(c.reason)
    const t = now()
    const r = activeRequest(o)
    const d: Decision = { id: uid(), type: 'teruskan', note: '', requestId: r?.id, resultId: r?.result?.id, by: actorName(s), at: t }
    return {
      ...o, updatedAt: t, decisions: [...o.decisions, d],
      history: [...o.history, { at: t, actor: d.by, text: `Keputusan Teruskan disimpan${d.resultId ? ` berdasarkan ${d.resultId}` : ''}.` }],
    }
  })
}

export function decideHold(s: AppState, id: string, reason: HoldReason, note: string): AppState {
  if (s.role !== 'admin') throw new RuleError('Keputusan dicatat oleh Admin.')
  if (!reason) throw new RuleError('Pilih alasan menahan pesanan.')
  if (reason === 'lainnya' && !note.trim()) throw new RuleError('Tuliskan alasan lainnya.')
  return withOrder(s, id, (o) => {
    const t = now()
    const r = activeRequest(o)
    const d: Decision = { id: uid(), type: 'tahan', reason, note: note.trim(), requestId: r?.id, resultId: r?.result?.id, by: actorName(s), at: t }
    return {
      ...o, updatedAt: t, decisions: [...o.decisions, d],
      history: [...o.history, { at: t, actor: d.by, text: `Keputusan Tahan disimpan. Alasan: ${HOLD_REASON_LABEL[reason]}${d.note ? ` — ${d.note}` : ''}.` }],
    }
  })
}

export const roleLabel = (r: Role) => ROLE_LABEL[r]

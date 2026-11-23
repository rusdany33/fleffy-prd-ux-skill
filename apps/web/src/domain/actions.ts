import type { AppState, Checklist, Conclusion, HoldReason, PaymentEntry, Transaction, VerificationRequest, Verifier } from './types'
import { customerCode, invoiceNo, paymentId, requestId, resultId, uid } from './ids'
import {
  activeEntries, canAdvance, canCancelEntry, canRequest, checklistComplete, entriesToRequest, isVerifier, pendingRequest, remaining,
} from './rules'
import { validatePayment, validateTx, type PaymentDraft, type TxDraft } from '../utils/validation'
import { CONCLUSION_LABEL, HOLD_REASON_LABEL, METHOD_LABEL, ROLE_LABEL, STAGE_LABEL, rupiah } from '../utils/format'

/** Kesalahan aturan bisnis — pesannya aman ditampilkan ke pengguna. */
export class RuleError extends Error {}

const now = () => new Date().toISOString()
const actor = (s: AppState) => `${s.names[s.role]} · ${ROLE_LABEL[s.role]}`

function withTx(s: AppState, id: string, fn: (t: Transaction) => Transaction): AppState {
  const i = s.transactions.findIndex((t) => t.id === id)
  if (i < 0) throw new RuleError('Transaksi tidak ditemukan.')
  const transactions = s.transactions.slice()
  transactions[i] = fn(transactions[i])
  return { ...s, transactions }
}

function makeEntry(t: Pick<Transaction, 'seq' | 'payments'>, p: PaymentDraft, by: string): PaymentEntry {
  return {
    id: paymentId(t.seq, t.payments.length + 1), method: p.method, amount: +p.amount, at: now(), by,
    proof: p.method === 'cash' ? undefined : { sender: p.sender.trim(), transferAt: new Date(p.transferAt).toISOString(), note: p.note.trim() },
  }
}

// ---------- Transaksi ----------

export function createTransaction(s: AppState, d: TxDraft): { state: AppState; tx: Transaction } {
  if (s.role !== 'admin') throw new RuleError('Transaksi dicatat oleh Admin.')
  if (Object.keys(validateTx(d)).length) throw new RuleError('Periksa kembali isian yang ditandai.')
  const seq = s.seq + 1
  const t0 = now()
  const base: Transaction = {
    id: uid(), seq, invoice: invoiceNo(seq), customerCode: customerCode(seq), customerName: d.customerName.trim(), phone: d.phone.trim(),
    service: d.service, pairs: +d.pairs, bill: +d.bill, note: d.note.trim(), stage: 'antrian', createdAt: t0, updatedAt: t0,
    payments: [], requests: [], changes: [],
    history: [{ at: t0, actor: actor(s), text: `Transaksi ${invoiceNo(seq)} dibuat. Status Antrian.` }],
  }
  if (d.withPayment) {
    const e = makeEntry(base, d.payment, actor(s))
    base.payments = [e]
    base.history.push({ at: t0, actor: actor(s), text: `Pembayaran ${e.id} ${METHOD_LABEL[e.method]} ${rupiah(e.amount)} tercatat.` })
  }
  return { state: { ...s, seq, transactions: [...s.transactions, base] }, tx: base }
}

export function updateTransaction(s: AppState, id: string, d: TxDraft): AppState {
  if (s.role !== 'admin') throw new RuleError('Transaksi diubah oleh Admin.')
  const errs = validateTx({ ...d, withPayment: false })
  if (Object.keys(errs).length) throw new RuleError('Periksa kembali isian yang ditandai.')
  return withTx(s, id, (t) => {
    const paid = activeEntries(t).reduce((a, p) => a + p.amount, 0)
    if (+d.bill < paid) throw new RuleError(`Tagihan tidak boleh lebih kecil dari pembayaran tercatat (${rupiah(paid)}).`)
    const changed: string[] = []
    if (t.customerName !== d.customerName.trim() || t.phone !== d.phone.trim()) changed.push('pelanggan')
    if (t.service !== d.service || t.pairs !== +d.pairs) changed.push('layanan')
    if (t.bill !== +d.bill) changed.push(`tagihan ${rupiah(t.bill)} → ${rupiah(+d.bill)}`)
    if (t.note !== d.note.trim()) changed.push('catatan')
    const t1 = now()
    return {
      ...t, customerName: d.customerName.trim(), phone: d.phone.trim(), service: d.service, pairs: +d.pairs, bill: +d.bill, note: d.note.trim(), updatedAt: t1,
      history: changed.length ? [...t.history, { at: t1, actor: actor(s), text: `Transaksi diubah (${changed.join(', ')}).` }] : t.history,
    }
  })
}

// ---------- Pembayaran ----------

export function addPayment(s: AppState, id: string, p: PaymentDraft): AppState {
  if (s.role !== 'admin') throw new RuleError('Pembayaran dicatat oleh Admin.')
  return withTx(s, id, (t) => {
    const errs = validatePayment(p, remaining(t))
    if (Object.keys(errs).length) throw new RuleError(Object.values(errs)[0]!)
    const e = makeEntry(t, p, actor(s))
    return {
      ...t, updatedAt: e.at, payments: [...t.payments, e],
      history: [...t.history, { at: e.at, actor: actor(s), text: `Pembayaran ${e.id} ${METHOD_LABEL[e.method]} ${rupiah(e.amount)} tercatat.` }],
    }
  })
}

export function cancelPayment(s: AppState, id: string, entryId: string): AppState {
  return withTx(s, id, (t) => {
    const p = t.payments.find((x) => x.id === entryId)
    if (!p) throw new RuleError('Entri pembayaran tidak ditemukan.')
    const c = canCancelEntry(t, p, s.role)
    if (!c.ok) throw new RuleError(c.reason)
    const t1 = now()
    return {
      ...t, updatedAt: t1, payments: t.payments.map((x) => (x.id === entryId ? { ...x, cancelled: true } : x)),
      history: [...t.history, { at: t1, actor: actor(s), text: `Pembayaran ${p.id} ${rupiah(p.amount)} dibatalkan.` }],
    }
  })
}

// ---------- Pemeriksaan ----------

export function requestVerification(s: AppState, id: string, verifier: Verifier, note: string): AppState {
  if (note.length > 300) throw new RuleError('Catatan maksimal 300 karakter.')
  return withTx(s, id, (t) => {
    const c = canRequest(t, s.role)
    if (!c.ok) throw new RuleError(c.reason)
    const t1 = now()
    const req: VerificationRequest = {
      id: requestId(t.seq, t.requests.length + 1), verifier, note: note.trim(), requestedAt: t1, requestedBy: actor(s),
      invoice: t.invoice, customer: `${t.customerCode} ${t.customerName}`,
      entries: entriesToRequest(t).map((p) => ({ id: p.id, method: p.method, amount: p.amount, sender: p.proof?.sender, transferAt: p.proof?.transferAt })),
    }
    return {
      ...t, updatedAt: t1, requests: [...t.requests, req],
      history: [...t.history, { at: t1, actor: actor(s), text: `Permintaan ${req.id} (${req.entries.map((e) => e.id).join(', ')}) dikirim ke ${verifier === 'owner' ? 'Owner' : 'Finance'}.` }],
    }
  })
}

export function recordResult(s: AppState, id: string, conclusion: Conclusion, checklist: Checklist, note: string): AppState {
  if (!isVerifier(s.role)) throw new RuleError('Hasil pemeriksaan hanya dapat dicatat oleh Owner atau Finance.')
  if (conclusion === 'sesuai' && !checklistComplete(checklist)) throw new RuleError('Kesimpulan Sesuai membutuhkan keempat butir pemeriksaan tercentang.')
  if (conclusion !== 'sesuai' && !note.trim()) throw new RuleError('Catatan wajib diisi untuk hasil Perlu klarifikasi atau Tidak sesuai.')
  return withTx(s, id, (t) => {
    const r = pendingRequest(t)
    if (!r) throw new RuleError('Tidak ada permintaan yang menunggu hasil.')
    const t1 = now()
    const attempt = t.requests.findIndex((x) => x.id === r.id) + 1
    const result = { id: resultId(t.seq, attempt), conclusion, checklist, note: note.trim(), by: s.role, byName: s.names[s.role], at: t1 }
    return {
      ...t, updatedAt: t1, requests: t.requests.map((x) => (x.id === r.id ? { ...x, result } : x)),
      history: [...t.history, { at: t1, actor: actor(s), text: `Hasil ${result.id} untuk ${r.id}: ${CONCLUSION_LABEL[conclusion]}.${result.note ? ` Catatan: ${result.note}` : ''}` }],
    }
  })
}

// ---------- Status pengerjaan ----------

export function advanceStage(s: AppState, id: string): AppState {
  return withTx(s, id, (t) => {
    const c = canAdvance(t, s.role)
    if (!c.ok || !c.to) throw new RuleError(c.reason)
    const t1 = now()
    const basis = [...t.requests].reverse().find((r) => r.result)?.result?.id
    return {
      ...t, stage: c.to, updatedAt: t1,
      changes: [...t.changes, { id: uid(), kind: 'stage', from: t.stage, to: c.to, note: '', basis: t.stage === 'antrian' ? basis : undefined, by: actor(s), at: t1 }],
      history: [...t.history, { at: t1, actor: actor(s), text: `Status ${STAGE_LABEL[t.stage]} → ${STAGE_LABEL[c.to]}${t.stage === 'antrian' && basis ? ` (dasar ${basis})` : ''}.` }],
    }
  })
}

export function holdTransaction(s: AppState, id: string, reason: HoldReason, note: string): AppState {
  if (s.role !== 'admin') throw new RuleError('Keputusan dicatat oleh Admin.')
  if (!reason) throw new RuleError('Pilih alasan menahan transaksi.')
  if (reason === 'lainnya' && !note.trim()) throw new RuleError('Tuliskan alasan lainnya.')
  return withTx(s, id, (t) => {
    if (t.stage !== 'antrian') throw new RuleError('Transaksi sudah diteruskan ke teknisi.')
    const t1 = now()
    const basis = [...t.requests].reverse().find((r) => r.result)?.result?.id
    return {
      ...t, updatedAt: t1,
      changes: [...t.changes, { id: uid(), kind: 'tahan', reason, note: note.trim(), basis, by: actor(s), at: t1 }],
      history: [...t.history, { at: t1, actor: actor(s), text: `Transaksi ditahan. Alasan: ${HOLD_REASON_LABEL[reason]}${note.trim() ? ` — ${note.trim()}` : ''}.` }],
    }
  })
}

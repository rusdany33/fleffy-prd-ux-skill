import { describe, expect, it } from 'vitest'
import type { AppState, Checklist } from '../domain/types'
import { addPayment, advanceStage, cancelPayment, createTransaction, holdTransaction, recordResult, requestVerification, updateTransaction } from '../domain/actions'
import {
  canAdvance, entryStatus, fullyConfirmed, isLunas, lastHold, notices, paidConfirmed, paidRecorded, pendingRequest, queueKey, searchTransactions, summary,
  verificationState,
} from '../domain/rules'
import { customerCode, invoiceNo, paymentId, requestId, resultId } from '../domain/ids'
import { validatePayment, validateTx, type PaymentDraft, type TxDraft } from '../utils/validation'
import { seedState } from '../services/seed'

const ALL: Checklist = { identity: true, amount: true, time: true, received: true }
const pay = (o: Partial<PaymentDraft> = {}): PaymentDraft => ({ method: 'transfer', amount: '150000', sender: 'UJI', transferAt: '2026-11-20T10:00', note: '', ...o })
const draft = (o: Partial<TxDraft> = {}): TxDraft => ({
  customerName: 'Uji', phone: '081234567890', service: 'Deep Clean', pairs: '2', bill: '150000', note: '', withPayment: true, payment: pay(), ...o,
})
const as = (s: AppState, role: AppState['role']): AppState => ({ ...s, role })
const get = (s: AppState, id: string) => s.transactions.find((t) => t.id === id)!

function fresh(d: Partial<TxDraft> = {}) {
  const base: AppState = { ...seedState(), transactions: [], seq: 14, role: 'admin' }
  const { state, tx } = createTransaction(base, draft(d))
  return { s: state, id: tx.id }
}
const confirm = (s: AppState, id: string, conclusion: 'sesuai' | 'perlu_klarifikasi' | 'tidak_sesuai' = 'sesuai') => {
  let x = requestVerification(s, id, 'owner', '')
  x = recordResult(as(x, 'owner'), id, conclusion, conclusion === 'sesuai' ? ALL : { ...ALL, received: false }, conclusion === 'sesuai' ? '' : 'cek')
  return as(x, 'admin')
}

describe('Identitas Fleffy (AC-041)', () => {
  it('INV, kode pelanggan, BYR, PRM, HAS', () => {
    const { s, id } = fresh()
    const t = get(s, id)
    expect(t.invoice).toMatch(/^INV-\d{6}-015$/)
    expect(t.customerCode).toBe('K-15')
    expect(t.payments[0].id).toBe('BYR-015-1')
    expect(invoiceNo(7, new Date('2026-11-23'))).toBe('INV-261123-007')
    expect(customerCode(3)).toBe('K-3')
    expect(paymentId(15, 2)).toBe('BYR-015-2')
    expect(requestId(15, 2)).toBe('PRM-015-B')
    expect(resultId(15, 1)).toBe('HAS-015')
  })
  it('hanya Admin membuat transaksi', () => {
    expect(() => createTransaction(as(seedState(), 'owner'), draft())).toThrow()
  })
})

describe('Validasi (AC-002, AC-042)', () => {
  it('menolak field wajib kosong, tagihan 0, pengirim kosong', () => {
    const e = validateTx(draft({ customerName: ' ', bill: '0', pairs: '0', payment: pay({ sender: '' }) }))
    expect(e.customerName && e.bill && e.pairs).toBeTruthy()
  })
  it('nominal melebihi sisa tagihan ditolak', () => {
    expect(validatePayment(pay({ amount: '200000' }), 150000).payAmount).toMatch(/melebihi/)
    expect(validateTx(draft({ payment: pay({ amount: '200000' }) })).payAmount).toBeTruthy()
  })
  it('cash tidak memerlukan bukti', () => {
    expect(validatePayment(pay({ method: 'cash', sender: '', transferAt: '' }), 150000)).toEqual({})
  })
})

describe('Dibayar vs dikonfirmasi (AC-043, AC-004)', () => {
  it('transfer tercatat → LUNAS tetapi dana belum dikonfirmasi', () => {
    const { s, id } = fresh()
    const t = get(s, id)
    expect(isLunas(t)).toBe(true)
    expect(paidRecorded(t)).toBe(150000)
    expect(paidConfirmed(t)).toBe(0)
    expect(verificationState(t)).toBe('belum_diminta')
  })
  it('tunai langsung terhitung dikonfirmasi', () => {
    const { s, id } = fresh({ payment: pay({ method: 'cash', amount: '50000' }) })
    expect(paidConfirmed(get(s, id))).toBe(50000)
    expect(verificationState(get(s, id))).toBe('tidak_perlu')
  })
  it('setelah Sesuai dana dikonfirmasi', () => {
    const { s, id } = fresh()
    const t = get(confirm(s, id), id)
    expect(paidConfirmed(t)).toBe(150000)
    expect(fullyConfirmed(t)).toBe(true)
  })
})

describe('Multi-pembayaran & pemeriksaan per entri (AC-042, AC-044)', () => {
  it('DP dikonfirmasi, pelunasan baru kembali Belum diminta', () => {
    const { s, id } = fresh({ bill: '75000', payment: pay({ amount: '50000' }) })
    let x = confirm(s, id)
    x = addPayment(x, id, pay({ amount: '25000' }))
    const t = get(x, id)
    expect(t.payments.map((p) => entryStatus(t, p))).toEqual(['dikonfirmasi', 'belum_diminta'])
    expect(paidRecorded(t)).toBe(75000)
    expect(paidConfirmed(t)).toBe(50000)
    x = requestVerification(x, id, 'finance', '')
    expect(pendingRequest(get(x, id))!.entries.map((e) => e.id)).toEqual(['BYR-015-2'])
    expect(pendingRequest(get(x, id))!.id).toBe('PRM-015-B')
  })
  it('menolak permintaan kedua saat menunggu', () => {
    const { s, id } = fresh()
    const x = requestVerification(s, id, 'owner', '')
    expect(() => requestVerification(x, id, 'owner', '')).toThrow(/menunggu/)
  })
  it('hasil Perlu klarifikasi bisa diminta ulang dengan entri yang sama', () => {
    const { s, id } = fresh()
    let x = confirm(s, id, 'perlu_klarifikasi')
    expect(entryStatus(get(x, id), get(x, id).payments[0])).toBe('perlu_klarifikasi')
    x = requestVerification(x, id, 'finance', '')
    expect(pendingRequest(get(x, id))!.entries[0].id).toBe('BYR-015-1')
  })
  it('nominal tambahan melebihi sisa ditolak', () => {
    const { s, id } = fresh()
    expect(() => addPayment(s, id, pay({ amount: '1' }))).toThrow()
  })
})

describe('Hasil hanya oleh pemeriksa (AC-013, AC-014)', () => {
  it('Admin ditolak; Sesuai butuh checklist; selain Sesuai wajib catatan', () => {
    const { s, id } = fresh()
    const x = requestVerification(s, id, 'owner', '')
    expect(() => recordResult(x, id, 'sesuai', ALL, '')).toThrow(/Owner atau Finance/)
    expect(() => recordResult(as(x, 'owner'), id, 'sesuai', { ...ALL, time: false }, '')).toThrow()
    expect(() => recordResult(as(x, 'owner'), id, 'tidak_sesuai', ALL, ' ')).toThrow()
  })
})

describe('Gerbang status pengerjaan (AC-045, AC-046)', () => {
  it('Antrian → Diproses ditolak sebelum dikonfirmasi', () => {
    const { s, id } = fresh()
    expect(canAdvance(get(s, id), 'admin').ok).toBe(false)
    expect(() => advanceStage(s, id)).toThrow(/Minta pemeriksaan/)
    const x = requestVerification(s, id, 'owner', '')
    expect(() => advanceStage(x, id)).toThrow(/Tunggu hasil/)
  })
  it('tanpa pembayaran ditolak', () => {
    const { s, id } = fresh({ withPayment: false })
    expect(() => advanceStage(s, id)).toThrow(/Belum ada pembayaran/)
  })
  it('DP yang dikonfirmasi cukup untuk Diproses; Selesai butuh dana penuh', () => {
    const { s, id } = fresh({ bill: '75000', payment: pay({ amount: '50000' }) })
    let x = confirm(s, id)
    x = advanceStage(x, id)
    expect(get(x, id).stage).toBe('diproses')
    expect(get(x, id).changes.at(-1)!.basis).toBe('HAS-015')
    x = advanceStage(advanceStage(x, id), id)
    expect(get(x, id).stage).toBe('qc')
    expect(() => advanceStage(x, id)).toThrow(/belum sama dengan tagihan/)
    x = addPayment(x, id, pay({ method: 'cash', amount: '25000' }))
    x = advanceStage(x, id)
    expect(get(x, id).stage).toBe('selesai')
  })
  it('tunai penuh boleh langsung diteruskan', () => {
    const { s, id } = fresh({ payment: pay({ method: 'cash' }) })
    expect(get(advanceStage(s, id), id).stage).toBe('diproses')
  })
  it('hanya Admin mengubah status & menahan', () => {
    const { s, id } = fresh()
    const x = confirm(s, id)
    expect(() => advanceStage(as(x, 'owner'), id)).toThrow()
    expect(() => holdTransaction(as(x, 'finance'), id, 'lainnya', 'x')).toThrow()
  })
  it('Tahan wajib alasan; Lainnya wajib catatan', () => {
    const { s, id } = fresh()
    expect(() => holdTransaction(s, id, 'lainnya', '')).toThrow()
    const x = holdTransaction(s, id, 'data_perlu_dicek', '')
    expect(lastHold(get(x, id))?.reason).toBe('data_perlu_dicek')
  })
})

describe('Batalkan entri (AC-047) & ubah data (§11.6)', () => {
  it('belum diminta boleh dibatalkan; menunggu/dikonfirmasi tidak', () => {
    const { s, id } = fresh()
    const x = cancelPayment(s, id, 'BYR-015-1')
    expect(paidRecorded(get(x, id))).toBe(0)
    const y = requestVerification(s, id, 'owner', '')
    expect(() => cancelPayment(y, id, 'BYR-015-1')).toThrow()
    expect(() => cancelPayment(confirm(s, id), id, 'BYR-015-1')).toThrow()
  })
  it('ubah tagihan tidak membatalkan konfirmasi; tagihan < dibayar ditolak', () => {
    const { s, id } = fresh({ bill: '150000', payment: pay({ amount: '100000' }) })
    let x = confirm(s, id)
    x = updateTransaction(x, id, draft({ bill: '120000' }))
    expect(paidConfirmed(get(x, id))).toBe(100000)
    expect(() => updateTransaction(x, id, draft({ bill: '90000' }))).toThrow()
  })
})

describe('Data contoh, antrean, notifikasi (AC-006, AC-023, AC-048)', () => {
  it('dua transaksi Rp150.000 dibedakan nota & pelanggan', () => {
    const s = seedState()
    const same = s.transactions.filter((t) => t.bill === 150000)
    expect(same.map((t) => t.customerCode)).toEqual(['K-15', 'K-16'])
    expect(searchTransactions(s.transactions, 'pelanggan b').map((t) => t.customerCode)).toEqual(['K-16'])
    expect(searchTransactions(s.transactions, 'BYR-018-1')).toHaveLength(1)
  })
  it('ringkasan antrean', () => {
    const s = seedState()
    expect(summary(s.transactions)).toEqual({ belum_diminta: 1, menunggu: 1, hasil_tersedia: 2, diteruskan: 1 })
    expect(queueKey(s.transactions.find((t) => t.customerCode === 'K-19')!)).toBeNull()
  })
  it('notifikasi sesuai peran', () => {
    const s = seedState()
    expect(notices(s.transactions, 'owner').map((n) => n.title)).toEqual([expect.stringContaining('Permintaan pemeriksaan')])
    expect(notices(s.transactions, 'finance')).toHaveLength(0)
    expect(notices(s.transactions, 'admin').length).toBe(2)
  })
})

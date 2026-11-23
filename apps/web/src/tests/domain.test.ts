import { describe, expect, it } from 'vitest'
import type { AppState, Checklist } from '../domain/types'
import { createOrder, decideForward, decideHold, recordResult, requestVerification, updateOrder } from '../domain/actions'
import {
  activeRequest, canForward, currentDecision, fundsConfirmed, hasStaleResult, isForwarded, queueKey, resultAdequate, searchOrders, summary, verificationState,
} from '../domain/rules'
import { orderCode, requestId, resultId } from '../domain/ids'
import { validateDraft, type OrderDraft } from '../utils/validation'
import { seedState } from '../services/seed'

const ALL: Checklist = { identity: true, amount: true, time: true, received: true }
const draft = (o: Partial<OrderDraft> = {}): OrderDraft => ({
  customerName: 'Uji', whatsapp: '081234567890', service: 'Deep Cleaning', pairs: '2', amount: '150000', method: 'transfer', note: '',
  hasProof: true, proofAmount: '150000', proofAt: '2026-11-20T10:00', proofSender: 'UJI', proofNote: '', ...o,
})
const as = (s: AppState, role: AppState['role']): AppState => ({ ...s, role })

function fresh() {
  const base: AppState = { ...seedState(), orders: [], seq: 14, role: 'admin' }
  const { state, order } = createOrder(base, draft())
  return { s: state, id: order.id }
}
const get = (s: AppState, id: string) => s.orders.find((o) => o.id === id)!

/** Alur lengkap sampai hasil Sesuai. */
function toAdequate() {
  const { s, id } = fresh()
  let x = requestVerification(s, id, 'owner', '')
  x = recordResult(as(x, 'owner'), id, 'sesuai', ALL, '')
  return { s: as(x, 'admin'), id }
}

describe('ID & pembuatan pesanan (AC-001, AC-003)', () => {
  it('membuat PSN/BKT berurutan', () => {
    const { s, id } = fresh()
    expect(get(s, id).code).toBe('PSN-015')
    expect(get(s, id).proof?.id).toBe('BKT-015')
    expect(orderCode(7)).toBe('PSN-007')
    expect(requestId(15, 2)).toBe('PRM-015-B')
    expect(resultId(15, 1)).toBe('HAS-015')
  })
  it('hanya Admin yang membuat pesanan', () => {
    expect(() => createOrder(as(seedState(), 'owner'), draft())).toThrow()
  })
})

describe('Validasi (AC-002)', () => {
  it('menolak field wajib kosong, spasi, nominal 0', () => {
    const e = validateDraft(draft({ customerName: '   ', amount: '0', pairs: '0', proofSender: '' }))
    expect(Object.keys(e).sort()).toEqual(['amount', 'customerName', 'pairs', 'proofSender'])
  })
  it('menolak waktu transfer di masa depan dan WA tidak valid', () => {
    const e = validateDraft(draft({ proofAt: '2999-01-01T10:00', whatsapp: 'abc' }), new Date('2026-11-23'))
    expect(e.proofAt).toBeTruthy()
    expect(e.whatsapp).toBeTruthy()
  })
  it('tunai tidak memerlukan bukti', () => {
    expect(validateDraft(draft({ method: 'tunai', proofAmount: '', proofSender: '', proofAt: '' }))).toEqual({})
  })
})

describe('Catatan ≠ dana dikonfirmasi (AC-004)', () => {
  it('belum dikonfirmasi saat tercatat & menunggu', () => {
    const { s, id } = fresh()
    expect(fundsConfirmed(get(s, id))).toBe(false)
    const x = requestVerification(s, id, 'owner', '')
    expect(verificationState(get(x, id))).toBe('menunggu')
    expect(fundsConfirmed(get(x, id))).toBe(false)
  })
  it('dikonfirmasi setelah hasil memadai', () => {
    const { s, id } = toAdequate()
    expect(fundsConfirmed(get(s, id))).toBe(true)
  })
})

describe('Permintaan pemeriksaan (AC-010, AC-011, AC-016)', () => {
  it('menyalin konteks tanpa input ulang', () => {
    const { s, id } = fresh()
    const r = activeRequest(get(requestVerification(s, id, 'finance', 'cek ya'), id))!
    expect(r.id).toBe('PRM-015')
    expect(r.snapshot).toMatchObject({ orderCode: 'PSN-015', customerName: 'Uji', amount: 150000, proofId: 'BKT-015' })
  })
  it('menolak permintaan kedua saat menunggu', () => {
    const { s, id } = fresh()
    const x = requestVerification(s, id, 'owner', '')
    expect(() => requestVerification(x, id, 'owner', '')).toThrow(/menunggu/)
  })
  it('permintaan ulang setelah Perlu klarifikasi → PRM-015-B', () => {
    const { s, id } = fresh()
    let x = requestVerification(s, id, 'owner', '')
    x = as(recordResult(as(x, 'owner'), id, 'perlu_klarifikasi', { ...ALL, time: false }, 'waktu beda'), 'admin')
    x = requestVerification(x, id, 'finance', '')
    expect(activeRequest(get(x, id))!.id).toBe('PRM-015-B')
    expect(get(x, id).requests).toHaveLength(2)
  })
  it('pemeriksa tidak membuat permintaan', () => {
    const { s, id } = fresh()
    expect(() => requestVerification(as(s, 'owner'), id, 'owner', '')).toThrow()
  })
})

describe('Hasil pemeriksaan (AC-013, AC-014, AC-015)', () => {
  it('Admin tidak dapat mencatat hasil', () => {
    const { s, id } = fresh()
    const x = requestVerification(s, id, 'owner', '')
    expect(() => recordResult(x, id, 'sesuai', ALL, '')).toThrow(/Owner atau Finance/)
  })
  it('Sesuai butuh checklist lengkap; selain Sesuai wajib catatan', () => {
    const { s, id } = fresh()
    const x = as(requestVerification(s, id, 'owner', ''), 'owner')
    expect(() => recordResult(x, id, 'sesuai', { ...ALL, received: false }, '')).toThrow()
    expect(() => recordResult(x, id, 'tidak_sesuai', ALL, ' ')).toThrow()
  })
  it('hasil memadai hanya untuk Sesuai + data terbaru', () => {
    const { s, id } = toAdequate()
    expect(resultAdequate(get(s, id))).toBe(true)
    expect(activeRequest(get(s, id))!.result!.id).toBe('HAS-015')
  })
})

describe('Keputusan (AC-018 – AC-022)', () => {
  it('Teruskan ditolak sebelum ada hasil memadai', () => {
    const { s, id } = fresh()
    expect(canForward(get(s, id), 'admin').ok).toBe(false)
    expect(() => decideForward(s, id)).toThrow()
    const x = requestVerification(s, id, 'owner', '')
    expect(() => decideForward(x, id)).toThrow(/Tunggu hasil/)
  })
  it('Teruskan tersimpan dengan dasar HAS & PRM', () => {
    const { s, id } = toAdequate()
    const x = decideForward(s, id)
    const d = currentDecision(get(x, id))!
    expect(d).toMatchObject({ type: 'teruskan', resultId: 'HAS-015', requestId: 'PRM-015' })
    expect(isForwarded(get(x, id))).toBe(true)
  })
  it('Tahan wajib alasan; Lainnya wajib catatan', () => {
    const { s, id } = fresh()
    expect(() => decideHold(s, id, 'lainnya', '')).toThrow()
    const x = decideHold(s, id, 'data_perlu_dicek', '')
    expect(currentDecision(get(x, id))?.type).toBe('tahan')
  })
  it('hanya Admin yang memutuskan', () => {
    const { s, id } = toAdequate()
    expect(() => decideForward(as(s, 'owner'), id)).toThrow()
    expect(() => decideHold(as(s, 'finance'), id, 'lainnya', 'x')).toThrow()
  })
  it('tunai dapat diteruskan tanpa pemeriksaan (AC-039)', () => {
    const { s } = fresh()
    const { state, order } = createOrder(s, draft({ method: 'tunai' }))
    expect(verificationState(order)).toBe('tidak_perlu')
    expect(isForwarded(get(decideForward(state, order.id), order.id))).toBe(true)
  })
})

describe('Invalidasi data (AC-008)', () => {
  it('ubah nominal setelah Teruskan → hasil kedaluwarsa & keputusan batal', () => {
    const { s, id } = toAdequate()
    let x = decideForward(s, id)
    x = updateOrder(x, id, draft({ amount: '175000', proofAmount: '175000' }))
    const o = get(x, id)
    expect(hasStaleResult(o)).toBe(true)
    expect(verificationState(o)).toBe('belum_diminta')
    expect(fundsConfirmed(o)).toBe(false)
    expect(isForwarded(o)).toBe(false)
    expect(canForward(o, 'admin').reason).toMatch(/data terbaru/)
  })
  it('ubah catatan saja tidak membatalkan', () => {
    const { s, id } = toAdequate()
    const x = updateOrder(s, id, draft({ note: 'sepatu putih' }))
    expect(resultAdequate(get(x, id))).toBe(true)
  })
})

describe('Dua pesanan nominal sama (AC-006) & antrean (AC-023)', () => {
  it('data contoh PSN-015/PSN-016 Rp150.000 dibedakan', () => {
    const s = seedState()
    const same = s.orders.filter((o) => o.amount === 150000)
    expect(same.map((o) => o.code)).toEqual(['PSN-015', 'PSN-016'])
    expect(searchOrders(s.orders, 'pelanggan b').map((o) => o.code)).toEqual(['PSN-016'])
    expect(activeRequest(same[0])).toBeUndefined()
    expect(activeRequest(same[1])!.snapshot.orderCode).toBe('PSN-016')
  })
  it('ringkasan & queueKey dari data contoh', () => {
    const s = seedState()
    expect(summary(s.orders)).toEqual({ belum_diminta: 1, menunggu: 1, hasil_tersedia: 2, keputusan: 0 })
    expect(queueKey(s.orders.find((o) => o.method === 'tunai')!)).toBeNull()
  })
})

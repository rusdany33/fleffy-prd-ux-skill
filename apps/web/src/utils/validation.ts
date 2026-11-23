import type { PayMethod } from '../domain/types'

export interface PaymentDraft {
  method: PayMethod
  amount: string
  sender: string
  transferAt: string // datetime-local
  note: string
}

export interface TxDraft {
  customerName: string
  phone: string
  service: string
  pairs: string
  bill: string
  note: string
  withPayment: boolean
  payment: PaymentDraft
}

export type DraftErrors = Partial<Record<string, string>>

const isInt = (s: string) => /^\d+$/.test(s.trim())

/** INTERACTION-SPEC §11.1–11.2 */
export function validatePayment(p: PaymentDraft, maxAmount: number, now = new Date()): DraftErrors {
  const e: DraftErrors = {}
  if (!isInt(p.amount) || +p.amount <= 0) e.payAmount = 'Nominal pembayaran harus lebih dari 0.'
  else if (+p.amount > maxAmount) e.payAmount = maxAmount > 0 ? 'Nominal melebihi sisa tagihan.' : 'Tagihan sudah terbayar penuh.'
  if (p.method !== 'cash') {
    if (!p.sender.trim()) e.paySender = 'Nama pengirim wajib diisi.'
    const t = p.transferAt ? new Date(p.transferAt) : null
    if (!t || isNaN(t.getTime()) || t.getTime() > now.getTime() + 60000) e.payAt = 'Waktu transfer tidak valid.'
  }
  if (p.note.length > 200) e.payNote = 'Maksimal 200 karakter.'
  return e
}

export function validateTx(d: TxDraft, now = new Date()): DraftErrors {
  const e: DraftErrors = {}
  const name = d.customerName.trim()
  if (!name) e.customerName = 'Nama pelanggan wajib diisi.'
  else if (name.length > 100) e.customerName = 'Maksimal 100 karakter.'
  if (d.phone.trim() && !/^\+?\d{8,15}$/.test(d.phone.replace(/[\s-]/g, ''))) e.phone = 'Nomor HP tidak valid.'
  if (!d.service) e.service = 'Pilih layanan.'
  if (!isInt(d.pairs) || +d.pairs < 1 || +d.pairs > 20) e.pairs = 'Jumlah pasang 1–20.'
  if (!isInt(d.bill) || +d.bill <= 0) e.bill = 'Tagihan harus lebih dari 0.'
  if (d.note.length > 500) e.note = 'Maksimal 500 karakter.'
  if (d.withPayment && !e.bill) Object.assign(e, validatePayment(d.payment, +d.bill, now))
  return e
}

export const TX_FIELD_ORDER = ['customerName', 'phone', 'service', 'pairs', 'bill', 'note', 'payAmount', 'paySender', 'payAt', 'payNote']

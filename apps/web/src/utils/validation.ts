import type { PaymentMethod } from '../domain/types'

export interface OrderDraft {
  customerName: string
  whatsapp: string
  service: string
  pairs: string
  amount: string
  method: PaymentMethod
  note: string
  hasProof: boolean
  proofAmount: string
  proofAt: string // datetime-local
  proofSender: string
  proofNote: string
}

export type DraftErrors = Partial<Record<keyof OrderDraft, string>>

const isInt = (s: string) => /^\d+$/.test(s.trim())

/** Aturan validasi INTERACTION-SPEC §3.2. */
export function validateDraft(d: OrderDraft, now = new Date()): DraftErrors {
  const e: DraftErrors = {}
  const name = d.customerName.trim()
  if (!name) e.customerName = 'Nama pelanggan wajib diisi.'
  else if (name.length > 100) e.customerName = 'Maksimal 100 karakter.'
  if (d.whatsapp.trim() && !/^\+?\d{8,15}$/.test(d.whatsapp.replace(/[\s-]/g, ''))) e.whatsapp = 'Nomor WhatsApp tidak valid.'
  if (!d.service) e.service = 'Pilih layanan.'
  if (!isInt(d.pairs) || +d.pairs < 1 || +d.pairs > 20) e.pairs = 'Jumlah pasang 1–20.'
  if (!isInt(d.amount) || +d.amount <= 0) e.amount = 'Nominal tagihan harus lebih dari 0.'
  if (d.note.length > 500) e.note = 'Maksimal 500 karakter.'
  if (d.method === 'transfer' && d.hasProof) {
    if (!isInt(d.proofAmount) || +d.proofAmount <= 0) e.proofAmount = 'Nominal pada bukti wajib diisi.'
    const t = d.proofAt ? new Date(d.proofAt) : null
    if (!t || isNaN(t.getTime()) || t.getTime() > now.getTime() + 60000) e.proofAt = 'Waktu transfer tidak valid.'
    if (!d.proofSender.trim()) e.proofSender = 'Nama pengirim wajib diisi.'
  }
  return e
}

export const FIELD_ORDER: (keyof OrderDraft)[] = ['customerName', 'whatsapp', 'service', 'pairs', 'amount', 'note', 'proofAmount', 'proofAt', 'proofSender']

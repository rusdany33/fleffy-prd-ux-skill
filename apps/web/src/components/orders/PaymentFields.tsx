import type { PayMethod } from '../../domain/types'
import type { DraftErrors, PaymentDraft } from '../../utils/validation'
import { METHOD_LABEL, rupiah, toLocalInput } from '../../utils/format'
import { BottomSheet, Button, Field, InfoBox, fieldAria } from '../common'
import { useState } from 'react'

/** Field pembayaran bersama (Buat Transaksi & Tambah pembayaran) — INTERACTION-SPEC §11.1–11.2. */
export function PaymentFields({ p, set, errors, max, idPrefix = 'pay' }: {
  p: PaymentDraft; set: (p: PaymentDraft) => void; errors: DraftErrors; max: number; idPrefix?: string
}) {
  const id = (k: string) => `${idPrefix}-${k}`
  return (
    <div className="stack">
      <fieldset className="seg" role="radiogroup">
        <legend>Metode pembayaran</legend>
        {(['cash', 'transfer', 'ewallet'] as PayMethod[]).map((m) => (
          <label key={m}><input type="radio" name={id('method')} checked={p.method === m} onChange={() => set({ ...p, method: m })} />{METHOD_LABEL[m]}</label>
        ))}
      </fieldset>
      <Field id={id('amount')} label="Nominal (Rp) *" error={errors.payAmount} hint={`Sisa tagihan ${rupiah(max)}`}>
        <input {...fieldAria(id('amount'), errors.payAmount)} type="number" inputMode="numeric" min={1} value={p.amount} onChange={(e) => set({ ...p, amount: e.target.value })} />
      </Field>
      {p.method !== 'cash' && (
        <>
          <InfoBox tone="warning" title="Pembayaran tercatat belum memastikan dana masuk.">Dana dikonfirmasi setelah pemeriksaan Owner/Finance.</InfoBox>
          <div className="grid-2">
            <Field id={id('sender')} label="Nama pengirim *" error={errors.paySender}>
              <input {...fieldAria(id('sender'), errors.paySender)} value={p.sender} onChange={(e) => set({ ...p, sender: e.target.value })} />
            </Field>
            <Field id={id('at')} label="Waktu transfer *" error={errors.payAt}>
              <input {...fieldAria(id('at'), errors.payAt)} type="datetime-local" max={toLocalInput(new Date().toISOString())} value={p.transferAt} onChange={(e) => set({ ...p, transferAt: e.target.value })} />
            </Field>
          </div>
          <Field id={id('note')} label="Keterangan bukti" error={errors.payNote} hint="Contoh: bukti dikirim via WhatsApp pukul 10.12">
            <input {...fieldAria(id('note'), errors.payNote)} value={p.note} onChange={(e) => set({ ...p, note: e.target.value })} />
          </Field>
        </>
      )}
    </div>
  )
}

export const emptyPayment = (amount = ''): PaymentDraft => ({ method: 'transfer', amount, sender: '', transferAt: '', note: '' })

/** Bottom sheet Tambah pembayaran. */
export function AddPaymentSheet({ invoice, max, onClose, onSubmit }: {
  invoice: string; max: number; onClose: () => void; onSubmit: (p: PaymentDraft) => DraftErrors | string | null
}) {
  const [p, setP] = useState<PaymentDraft>(emptyPayment(max ? String(max) : ''))
  const [errors, setErrors] = useState<DraftErrors>({})
  const [error, setError] = useState<string | null>(null)
  const submit = () => {
    const r = onSubmit(p)
    if (!r) return
    if (typeof r === 'string') setError(r)
    else setErrors(r)
  }
  return (
    <BottomSheet title={`Tambah pembayaran ${invoice}`} onClose={onClose}>
      <PaymentFields p={p} set={setP} errors={errors} max={max} idPrefix="sheet" />
      {error && <InfoBox tone="danger" role="alert" title={error} />}
      <Button onClick={submit}>Simpan pembayaran</Button>
      <Button variant="secondary" onClick={onClose}>Batal</Button>
    </BottomSheet>
  )
}

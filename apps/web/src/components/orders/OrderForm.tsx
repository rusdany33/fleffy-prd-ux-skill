import { useMemo, useRef, useState, type FormEvent } from 'react'
import type { Transaction } from '../../domain/types'
import { paidRecorded } from '../../domain/rules'
import { createTransaction, updateTransaction } from '../../domain/actions'
import { useStore } from '../../store/StoreContext'
import { goBack, navigate } from '../../hooks/useRoute'
import { TX_FIELD_ORDER, validateTx, type DraftErrors, type TxDraft } from '../../utils/validation'
import { SERVICES, rupiah } from '../../utils/format'
import { BottomSheet, Button, Card, Field, InfoBox, fieldAria } from '../common'
import { PaymentFields, emptyPayment } from './PaymentFields'

function toDraft(t?: Transaction): TxDraft {
  return {
    customerName: t?.customerName ?? '', phone: t?.phone ?? '', service: t?.service ?? SERVICES[0], pairs: String(t?.pairs ?? 1),
    bill: t ? String(t.bill) : '', note: t?.note ?? '', withPayment: !t, payment: emptyPayment(),
  }
}

const FIELD_ID: Record<string, string> = { payAmount: 'pay-amount', paySender: 'pay-sender', payAt: 'pay-at', payNote: 'pay-note' }

/** N1a Buat Transaksi / Ubah Transaksi — INTERACTION-SPEC §3 & §11.1 */
export function OrderForm({ tx }: { tx?: Transaction }) {
  const { state, commit, toast } = useStore()
  const initial = useMemo(() => toDraft(tx), [tx])
  const [d, setD] = useState<TxDraft>(initial)
  const [errors, setErrors] = useState<DraftErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const fallback = tx ? `/transaksi/${tx.id}` : '/transaksi'
  const dirty = JSON.stringify(d) !== JSON.stringify(initial)

  const update = (next: TxDraft) => { setD(next); if (submitted) setErrors(validateTx(next)) }
  const set = <K extends keyof TxDraft>(k: K, v: TxDraft[K]) => update({ ...d, [k]: v })

  if (state.role !== 'admin') {
    return <InfoBox title="Pencatatan transaksi dilakukan oleh Admin.">Ganti peran melalui header di Beranda untuk melanjutkan.</InfoBox>
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    setSubmitted(true)
    const errs = validateTx(d)
    if (tx && d.bill && +d.bill < paidRecorded(tx)) errs.bill = `Tagihan tidak boleh lebih kecil dari pembayaran tercatat (${rupiah(paidRecorded(tx))}).`
    setErrors(errs)
    const first = TX_FIELD_ORDER.find((k) => errs[k])
    if (first) { formRef.current?.querySelector<HTMLElement>(`#${FIELD_ID[first] ?? `f-${first}`}`)?.focus(); return }
    setBusy(true)
    let created: Transaction | undefined
    const res = commit((s) => {
      if (tx) return updateTransaction(s, tx.id, d)
      const r = createTransaction(s, d); created = r.tx; return r.state
    })
    setBusy(false)
    if (!res.ok) { setSaveError(res.kind === 'storage' ? 'Transaksi gagal disimpan. Periksa penyimpanan perangkat dan coba kembali.' : res.message); return }
    if (tx) { toast('success', `Perubahan ${tx.invoice} tersimpan.`); navigate(`/transaksi/${tx.id}`) }
    else if (created) { toast('success', `Transaksi ${created.invoice} tersimpan.`); navigate(`/transaksi/${created.id}?from=/transaksi`) }
  }

  return (
    <form ref={formRef} className="stack" onSubmit={submit} noValidate>
      <Card title="Pelanggan">
        <Field id="f-customerName" label="Nama pelanggan *" error={errors.customerName} hint={tx ? `Kode ${tx.customerCode}` : 'Kode pelanggan dibuat otomatis'}>
          <input {...fieldAria('f-customerName', errors.customerName)} value={d.customerName} maxLength={100} autoComplete="off" onChange={(e) => set('customerName', e.target.value)} />
        </Field>
        <Field id="f-phone" label="Nomor HP" error={errors.phone} hint="Opsional, contoh 081234567890">
          <input {...fieldAria('f-phone', errors.phone)} inputMode="tel" value={d.phone} onChange={(e) => set('phone', e.target.value)} />
        </Field>
      </Card>
      <Card title="Item & layanan">
        <div className="grid-2">
          <Field id="f-service" label="Layanan *" error={errors.service}>
            <select {...fieldAria('f-service', errors.service)} value={d.service} onChange={(e) => set('service', e.target.value)}>
              {SERVICES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field id="f-pairs" label="Jumlah pasang *" error={errors.pairs}>
            <input {...fieldAria('f-pairs', errors.pairs)} type="number" min={1} max={20} inputMode="numeric" value={d.pairs} onChange={(e) => set('pairs', e.target.value)} />
          </Field>
        </div>
        <Field id="f-bill" label="Total tagihan (Rp) *" error={errors.bill} hint={d.bill && +d.bill > 0 ? rupiah(+d.bill) : undefined}>
          <input {...fieldAria('f-bill', errors.bill)} type="number" min={1} inputMode="numeric" value={d.bill} onChange={(e) => set('bill', e.target.value)} />
        </Field>
        <Field id="f-note" label="Catatan" error={errors.note}>
          <textarea {...fieldAria('f-note', errors.note)} maxLength={500} value={d.note} onChange={(e) => set('note', e.target.value)} />
        </Field>
      </Card>

      {!tx && (
        <Card title="Pembayaran awal">
          <label className="check-row"><input type="checkbox" checked={d.withPayment} onChange={(e) => set('withPayment', e.target.checked)} />Pelanggan sudah membayar (DP atau lunas)</label>
          {d.withPayment
            ? <PaymentFields p={d.payment} set={(p) => set('payment', p)} errors={errors} max={+d.bill || 0} />
            : <p className="text-secondary">Transaksi akan berstatus BELUM LUNAS. Pembayaran dapat ditambahkan dari detail transaksi.</p>}
        </Card>
      )}
      {tx && <InfoBox title="Pembayaran tidak diubah dari form ini.">Entri yang sudah diperiksa tetap berlaku; status LUNAS dan dana dikonfirmasi dihitung ulang dari tagihan baru.</InfoBox>}
      {saveError && <InfoBox tone="danger" role="alert" title={saveError}>Data yang kamu isi tetap tersedia.</InfoBox>}

      <Button type="submit" loading={busy}>{tx ? 'Simpan perubahan' : 'Buat Transaksi'}</Button>
      <Button variant="secondary" onClick={() => (dirty ? setConfirmLeave(true) : goBack(fallback))}>Batal</Button>

      {confirmLeave && (
        <BottomSheet title="Buang perubahan?" onClose={() => setConfirmLeave(false)}>
          <p className="text-secondary">Perubahan yang belum disimpan akan hilang.</p>
          <Button onClick={() => { setConfirmLeave(false); goBack(fallback) }}>Buang</Button>
          <Button variant="secondary" onClick={() => setConfirmLeave(false)}>Lanjut mengubah</Button>
        </BottomSheet>
      )}
    </form>
  )
}

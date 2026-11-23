import { useMemo, useRef, useState, type FormEvent } from 'react'
import type { Order } from '../../domain/types'
import { latestRequest } from '../../domain/rules'
import { createOrder, updateOrder } from '../../domain/actions'
import { useStore } from '../../store/StoreContext'
import { goBack, navigate } from '../../hooks/useRoute'
import { FIELD_ORDER, validateDraft, type DraftErrors, type OrderDraft } from '../../utils/validation'
import { SERVICES, rupiah, toLocalInput } from '../../utils/format'
import { BottomSheet, Button, Card, Field, InfoBox, fieldAria } from '../common'

function toDraft(o?: Order): OrderDraft {
  return {
    customerName: o?.customerName ?? '', whatsapp: o?.whatsapp ?? '', service: o?.service ?? SERVICES[0], pairs: String(o?.pairs ?? 1),
    amount: o ? String(o.amount) : '', method: o?.method ?? 'transfer', note: o?.note ?? '',
    hasProof: o ? !!o.proof : true, proofAmount: o?.proof ? String(o.proof.amount) : '', proofAt: o?.proof ? toLocalInput(o.proof.transferAt) : '',
    proofSender: o?.proof?.sender ?? '', proofNote: o?.proof?.note ?? '',
  }
}

/** N1a Buat Pesanan / Ubah Pesanan — INTERACTION-SPEC §3 */
export function OrderForm({ order }: { order?: Order }) {
  const { state, commit, toast } = useStore()
  const initial = useMemo(() => toDraft(order), [order])
  const [d, setD] = useState<OrderDraft>(initial)
  const [errors, setErrors] = useState<DraftErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const fallback = order ? `/pesanan/${order.id}` : '/pesanan'

  const dirty = JSON.stringify(d) !== JSON.stringify(initial)
  const set = <K extends keyof OrderDraft>(k: K, v: OrderDraft[K]) => {
    const next = { ...d, [k]: v }
    setD(next)
    if (submitted) setErrors(validateDraft(next))
  }

  if (state.role !== 'admin') {
    return <InfoBox title="Pencatatan pesanan dilakukan oleh Admin.">Ganti peran melalui header di Beranda untuk melanjutkan.</InfoBox>
  }

  const last = order && latestRequest(order)
  const invalidates = !!order && !!last && !last.stale && (
    order.customerName !== d.customerName.trim() || String(order.amount) !== d.amount.trim() || order.method !== d.method ||
    JSON.stringify(toDraft(order).hasProof ? [order.proof?.amount, toLocalInput(order.proof!.transferAt), order.proof?.sender, order.proof?.note] : null) !==
    JSON.stringify(d.method === 'transfer' && d.hasProof ? [+d.proofAmount, d.proofAt, d.proofSender.trim(), d.proofNote.trim()] : null)
  )
  const proofMismatch = d.method === 'transfer' && d.hasProof && d.proofAmount && d.amount && +d.proofAmount !== +d.amount

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    setSubmitted(true)
    const errs = validateDraft(d)
    setErrors(errs)
    const first = FIELD_ORDER.find((k) => errs[k])
    if (first) { formRef.current?.querySelector<HTMLElement>(`#f-${first}`)?.focus(); return }
    setBusy(true)
    let created: Order | undefined
    const res = commit((s) => {
      if (order) return updateOrder(s, order.id, d)
      const r = createOrder(s, d); created = r.order; return r.state
    })
    setBusy(false)
    if (!res.ok) { setSaveError(res.kind === 'storage' ? 'Pesanan gagal disimpan. Periksa penyimpanan perangkat dan coba kembali.' : res.message); return }
    if (order) { toast('success', `Perubahan ${order.code} tersimpan.`); navigate(`/pesanan/${order.id}`) }
    else if (created) {
      toast('success', `Pesanan ${created.code} tersimpan.`)
      navigate(`/pesanan/${created.id}?from=/pesanan`)
    }
  }

  const cancel = () => (dirty ? setConfirmLeave(true) : goBack(fallback))

  return (
    <form ref={formRef} className="stack" onSubmit={submit} noValidate>
      <Card title="Pelanggan & layanan">
        <Field id="f-customerName" label="Nama pelanggan *" error={errors.customerName}>
          <input {...fieldAria('f-customerName', errors.customerName)} value={d.customerName} maxLength={100} autoComplete="off" onChange={(e) => set('customerName', e.target.value)} />
        </Field>
        <Field id="f-whatsapp" label="Nomor WhatsApp" error={errors.whatsapp} hint="Opsional, contoh 081234567890">
          <input {...fieldAria('f-whatsapp', errors.whatsapp)} inputMode="tel" value={d.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
        </Field>
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
        <Field id="f-amount" label="Nominal tagihan (Rp) *" error={errors.amount} hint={d.amount && +d.amount > 0 ? rupiah(+d.amount) : undefined}>
          <input {...fieldAria('f-amount', errors.amount)} type="number" min={1} inputMode="numeric" value={d.amount} onChange={(e) => set('amount', e.target.value)} />
        </Field>
        <Field id="f-note" label="Catatan" error={errors.note}>
          <textarea {...fieldAria('f-note', errors.note)} maxLength={500} value={d.note} onChange={(e) => set('note', e.target.value)} />
        </Field>
      </Card>

      <Card title="Pembayaran">
        <fieldset className="seg" role="radiogroup">
          <legend>Metode pembayaran *</legend>
          {(['transfer', 'tunai'] as const).map((m) => (
            <label key={m}><input type="radio" name="method" checked={d.method === m} onChange={() => set('method', m)} />{m === 'transfer' ? 'Bank Transfer' : 'Tunai'}</label>
          ))}
        </fieldset>
        {d.method === 'transfer' && <InfoBox tone="warning" title="Pencatatan pembayaran belum memastikan dana masuk.">Dana dikonfirmasi setelah ada hasil pemeriksaan Owner/Finance.</InfoBox>}
        {d.method === 'transfer' && (
          <>
            <label className="check-row"><input type="checkbox" checked={d.hasProof} onChange={(e) => set('hasProof', e.target.checked)} />Pelanggan sudah mengirim bukti transfer</label>
            {d.hasProof && (
              <div className="stack">
                <div className="grid-2">
                  <Field id="f-proofAmount" label="Nominal pada bukti (Rp) *" error={errors.proofAmount}>
                    <input {...fieldAria('f-proofAmount', errors.proofAmount)} type="number" min={1} inputMode="numeric" value={d.proofAmount} onChange={(e) => set('proofAmount', e.target.value)} />
                  </Field>
                  <Field id="f-proofAt" label="Tanggal & waktu transfer *" error={errors.proofAt}>
                    <input {...fieldAria('f-proofAt', errors.proofAt)} type="datetime-local" value={d.proofAt} max={toLocalInput(new Date().toISOString())} onChange={(e) => set('proofAt', e.target.value)} />
                  </Field>
                </div>
                {proofMismatch && <InfoBox tone="warning" title="Nominal pada bukti berbeda dari tagihan.">Periksa sebelum meminta pemeriksaan.</InfoBox>}
                <Field id="f-proofSender" label="Nama pengirim *" error={errors.proofSender}>
                  <input {...fieldAria('f-proofSender', errors.proofSender)} value={d.proofSender} onChange={(e) => set('proofSender', e.target.value)} />
                </Field>
                <Field id="f-proofNote" label="Keterangan bukti" hint="Contoh: dikirim via WhatsApp pukul 10.12">
                  <input {...fieldAria('f-proofNote')} value={d.proofNote} onChange={(e) => set('proofNote', e.target.value)} />
                </Field>
              </div>
            )}
          </>
        )}
      </Card>

      {invalidates && <InfoBox tone="warning" title="Perubahan ini membuat permintaan dan hasil pemeriksaan sebelumnya tidak berlaku.">Setelah disimpan, minta pemeriksaan ulang untuk data terbaru.</InfoBox>}
      {saveError && <InfoBox tone="danger" role="alert" title={saveError}>Data yang kamu isi tetap tersedia.</InfoBox>}

      <Button type="submit" loading={busy}>{order ? 'Simpan perubahan' : 'Simpan pesanan'}</Button>
      <Button variant="secondary" onClick={cancel}>Batal</Button>

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

import { useState } from 'react'
import type { HoldReason, Order } from '../../domain/types'
import { HOLD_REASON_LABEL } from '../../utils/format'
import { BottomSheet, Button, Field, InfoBox, fieldAria } from '../common'

/** INTERACTION-SPEC §6.2 — bottom sheet Tahan untuk klarifikasi. */
export function HoldSheet({ o, defaultReason, onClose, onSubmit }: {
  o: Order; defaultReason?: HoldReason; onClose: () => void; onSubmit: (reason: HoldReason, note: string) => string | null
}) {
  const [reason, setReason] = useState<HoldReason | null>(defaultReason ?? null)
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = () => {
    if (!reason) { setError('Pilih alasan menahan pesanan.'); return }
    if (reason === 'lainnya' && !note.trim()) { setError('Tuliskan alasan lainnya.'); return }
    setBusy(true)
    const err = onSubmit(reason, note)
    setBusy(false)
    if (err) setError(err)
  }

  return (
    <BottomSheet title={`Tahan pesanan ${o.code}?`} onClose={onClose}>
      <p className="text-secondary">Pesanan tidak diteruskan ke teknisi sampai ada hasil yang memadai.</p>
      <fieldset className="radio-list" role="radiogroup">
        <legend className="label mb-8">Alasan *</legend>
        {(Object.keys(HOLD_REASON_LABEL) as HoldReason[]).map((r) => (
          <label key={r}>
            <input type="radio" name="hold-reason" checked={reason === r} onChange={() => { setReason(r); setError(null) }} />
            <span aria-hidden>{reason === r ? '●' : '○'}</span>{HOLD_REASON_LABEL[r]}
          </label>
        ))}
      </fieldset>
      <Field id="hold-note" label={`Catatan${reason === 'lainnya' ? ' *' : ' (opsional)'}`}>
        <textarea {...fieldAria('hold-note')} value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} />
      </Field>
      {error && <InfoBox tone="danger" role="alert" title={error} />}
      <Button loading={busy} onClick={submit}>Simpan keputusan Tahan</Button>
      <Button variant="secondary" onClick={onClose}>Batal</Button>
    </BottomSheet>
  )
}

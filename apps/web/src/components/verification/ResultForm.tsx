import { useState } from 'react'
import type { Checklist, Conclusion, Order, VerificationRequest } from '../../domain/types'
import { checklistComplete } from '../../domain/rules'
import { recordResult } from '../../domain/actions'
import { useStore } from '../../store/StoreContext'
import { CONCLUSION_LABEL, dateTime, rupiah } from '../../utils/format'
import { Button, Field, InfoBox, fieldAria } from '../common'

export const CHECK_ITEMS: { key: keyof Checklist; label: (r: VerificationRequest) => string }[] = [
  { key: 'identity', label: () => 'Identitas pesanan dan bukti sesuai' },
  { key: 'amount', label: (r) => `Nominal sesuai: ${rupiah(r.snapshot.amount)}` },
  { key: 'time', label: () => 'Waktu transfer cocok dengan data bukti' },
  { key: 'received', label: () => 'Dana diterima menurut mutasi rekening' },
]

/** INTERACTION-SPEC §5 — hanya peran Owner/Finance. */
export function ResultForm({ o, r }: { o: Order; r: VerificationRequest }) {
  const { commit, toast } = useStore()
  const [check, setCheck] = useState<Checklist>({ identity: false, amount: false, time: false, received: false })
  const [conclusion, setConclusion] = useState<Conclusion | null>(null)
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const complete = checklistComplete(check)
  const conc = conclusion === 'sesuai' && !complete ? null : conclusion

  const save = () => {
    if (!conc) { setError('Pilih kesimpulan pemeriksaan.'); return }
    setBusy(true)
    const res = commit((s) => recordResult(s, o.id, conc, check, note))
    setBusy(false)
    if (res.ok) { toast('success', `Hasil ${r.id.replace('PRM', 'HAS')} tersimpan.`); return }
    setError(res.kind === 'storage' ? 'Hasil belum tersimpan. Periksa penyimpanan perangkat dan coba kembali.' : res.message)
  }

  return (
    <div className="stack">
      <InfoBox title="Catat hasil pemeriksaan">
        {r.id} · {r.snapshot.orderCode} · <span className="num">{rupiah(r.snapshot.amount)}</span>
        {r.snapshot.proofId && <> · {r.snapshot.proofId}{o.proof && <> ({o.proof.sender}, {dateTime(o.proof.transferAt)})</>}</>}
      </InfoBox>
      <fieldset className="stack-8 plain-fieldset">
        <legend className="label">Butir pemeriksaan</legend>
        {CHECK_ITEMS.map((c) => (
          <label key={c.key} className="check-row">
            <input type="checkbox" checked={check[c.key]} onChange={(e) => setCheck({ ...check, [c.key]: e.target.checked })} />
            {c.label(r)}
          </label>
        ))}
      </fieldset>
      <fieldset className="seg" role="radiogroup">
        <legend>Kesimpulan</legend>
        {(['sesuai', 'perlu_klarifikasi', 'tidak_sesuai'] as Conclusion[]).map((c) => (
          <label key={c}>
            <input type="radio" name={`conc-${r.id}`} checked={conc === c} disabled={c === 'sesuai' && !complete} onChange={() => { setConclusion(c); setError(null) }} />
            {CONCLUSION_LABEL[c]}
          </label>
        ))}
      </fieldset>
      {!complete && <p className="caption text-secondary">Kesimpulan Sesuai aktif setelah keempat butir dicentang.</p>}
      <Field id={`note-${r.id}`} label={`Catatan${conc && conc !== 'sesuai' ? ' *' : ' (opsional)'}`}>
        <textarea {...fieldAria(`note-${r.id}`)} value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} />
      </Field>
      {error && <InfoBox tone="danger" role="alert" title={error} />}
      <Button loading={busy} onClick={save}>Simpan hasil</Button>
    </div>
  )
}

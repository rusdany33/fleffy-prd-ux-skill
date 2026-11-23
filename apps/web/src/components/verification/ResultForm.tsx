import { useState } from 'react'
import type { Checklist, Conclusion, Transaction, VerificationRequest } from '../../domain/types'
import { checklistComplete } from '../../domain/rules'
import { recordResult } from '../../domain/actions'
import { useStore } from '../../store/StoreContext'
import { CONCLUSION_LABEL, METHOD_LABEL, dateTime, rupiah } from '../../utils/format'
import { Button, Field, InfoBox, fieldAria } from '../common'

export const requestTotal = (r: VerificationRequest) => r.entries.reduce((a, e) => a + e.amount, 0)

// eslint-disable-next-line react-refresh/only-export-components
export const CHECK_ITEMS: { key: keyof Checklist; label: (r: VerificationRequest) => string }[] = [
  { key: 'identity', label: () => 'Identitas transaksi dan bukti sesuai' },
  { key: 'amount', label: (r) => `Nominal sesuai: ${rupiah(requestTotal(r))}${r.entries.length > 1 ? ` (${r.entries.length} entri)` : ''}` },
  { key: 'time', label: () => 'Waktu transfer cocok dengan data bukti' },
  { key: 'received', label: () => 'Dana diterima menurut mutasi rekening' },
]

export function EntryList({ r }: { r: VerificationRequest }) {
  return (
    <ul className="checklist">
      {r.entries.map((e) => (
        <li key={e.id}><span aria-hidden>•</span><span>{e.id} · {METHOD_LABEL[e.method]} <span className="num">{rupiah(e.amount)}</span>{e.sender && <> · {e.sender}</>}{e.transferAt && <> · {dateTime(e.transferAt)}</>}</span></li>
      ))}
    </ul>
  )
}

/** INTERACTION-SPEC §5 / §11.3 — hanya peran Owner/Finance. */
export function ResultForm({ t, r }: { t: Transaction; r: VerificationRequest }) {
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
    const res = commit((s) => recordResult(s, t.id, conc, check, note))
    setBusy(false)
    if (res.ok) { toast('success', `Hasil ${r.id.replace('PRM', 'HAS')} tersimpan.`); return }
    setError(res.kind === 'storage' ? 'Hasil belum tersimpan. Periksa penyimpanan perangkat dan coba kembali.' : res.message)
  }

  return (
    <div className="stack">
      <InfoBox title={`Catat hasil pemeriksaan ${r.id}`}>{t.invoice} · {r.customer}</InfoBox>
      <p className="label">Entri yang diperiksa</p>
      <EntryList r={r} />
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

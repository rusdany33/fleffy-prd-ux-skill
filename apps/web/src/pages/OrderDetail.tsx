import { useState } from 'react'
import type { HoldReason, Transaction, Verifier } from '../domain/types'
import {
  activeEntries, canAdvance, canCancelEntry, canRequest, entriesToRequest, entryStatus, fullyConfirmed, isLunas, lastHold, latestRequest,
  paidConfirmed, paidRecorded, pendingRequest, remaining, resultAdequate, verificationState,
} from '../domain/rules'
import { addPayment, advanceStage, cancelPayment, holdTransaction, requestVerification } from '../domain/actions'
import { useStore } from '../store/StoreContext'
import type { Route } from '../hooks/useRoute'
import { validatePayment, type PaymentDraft } from '../utils/validation'
import { AppShell, PageHeader } from '../components/layout/AppShell'
import { Accordion, BottomSheet, Button, Field, InfoBox, KeyValue, LinkButton, SampleTag, fieldAria } from '../components/common'
import { EntryChip, PayChip, StageChip, VerificationChip } from '../components/orders/StatusChips'
import { HoldSheet } from '../components/orders/HoldSheet'
import { AddPaymentSheet } from '../components/orders/PaymentFields'
import { CHECK_ITEMS, EntryList, ResultForm } from '../components/verification/ResultForm'
import { CONCLUSION_LABEL, HOLD_REASON_LABEL, METHOD_LABEL, ROLE_LABEL, STAGE_LABEL, VERIFIER_LABEL, dateTime, rupiah } from '../utils/format'

type SectionKey = 'ringkasan' | 'pembayaran' | 'pemeriksaan' | 'pengerjaan'
type Banner = null | { tone: 'success' | 'warning' | 'danger'; title: string; text: string; retry?: string }

const NEXT_LABEL: Record<string, string> = { diproses: 'Teruskan ke teknisi', finishing: 'Lanjut ke Finishing', qc: 'Lanjut ke Quality Control', selesai: 'Tandai Selesai' }

/** Bagian default terbuka mengikuti keadaan (UX-SPEC N1b / §7.5). */
function defaultOpen(t: Transaction): Record<SectionKey, boolean> {
  const st = verificationState(t)
  if (t.stage !== 'antrian') return { ringkasan: false, pembayaran: true, pemeriksaan: false, pengerjaan: true }
  return { ringkasan: false, pembayaran: true, pemeriksaan: st !== 'tidak_perlu', pengerjaan: true }
}

function ProgressBar({ t }: { t: Transaction }) {
  const pct = (n: number) => `${Math.min(100, Math.round((n / t.bill) * 100))}%`
  return (
    <div className="progress" role="img" aria-label={`Dibayar ${rupiah(paidRecorded(t))}, dikonfirmasi ${rupiah(paidConfirmed(t))}, dari ${rupiah(t.bill)}`}>
      <span className="progress-recorded" style={{ width: pct(paidRecorded(t)) }} />
      <span className="progress-confirmed" style={{ width: pct(paidConfirmed(t)) }} />
    </div>
  )
}

export function OrderDetail({ tx: t, route }: { tx?: Transaction; route: Route }) {
  const { state, sections, setSection, commit, toast, reload } = useStore()
  const from = route.query.get('from') ?? '/transaksi'
  const fromQueue = from.startsWith('/pemeriksaan')
  const [banner, setBanner] = useState<Banner>(null)
  const [sheet, setSheet] = useState<null | 'hold' | 'pay' | { cancel: string }>(null)
  const [busy, setBusy] = useState<null | 'request' | 'advance'>(null)
  const [verifier, setVerifier] = useState<Verifier>('owner')
  const [reqNote, setReqNote] = useState('')

  if (!t) {
    return (
      <AppShell nav="transaksi" header={{ kind: 'detail', fallback: '/transaksi' }}>
        <PageHeader title="Detail transaksi" />
        <InfoBox title="Transaksi tidak ditemukan.">Periksa tautan atau cari transaksi dari daftar.</InfoBox>
        <LinkButton href="#/transaksi" variant="primary">Kembali ke Transaksi</LinkButton>
      </AppShell>
    )
  }

  const role = state.role
  const defaults = defaultOpen(t)
  const isOpen = (k: SectionKey) => sections[t.id]?.[k] ?? (k === 'pemeriksaan' && fromQueue ? true : defaults[k])
  const toggle = (k: SectionKey) => setSection(t.id, k, !isOpen(k))
  const helpCtx = `?transaksi=${t.id}`
  const st = verificationState(t)
  const pending = pendingRequest(t)
  const last = latestRequest(t)
  const reqAllowed = canRequest(t, role)
  const adv = canAdvance(t, role)
  const hold = lastHold(t)
  const entries = activeEntries(t)
  const cancelled = t.payments.filter((p) => p.cancelled)
  const contact = state.contacts.find((c) => c.verifier === pending?.verifier)

  const fail = (kind: 'rule' | 'storage', message: string, what: string) => {
    if (kind === 'storage') setBanner({ tone: 'danger', title: `${what} belum terkonfirmasi`, text: 'Data tetap tersedia. Periksa catatan sebelum mencoba lagi.', retry: 'Periksa catatan' })
    else toast('danger', message)
  }

  const sendRequest = () => {
    setBusy('request')
    let id = ''
    const res = commit((s) => { const n = requestVerification(s, t.id, verifier, reqNote); id = pendingRequest(n.transactions.find((x) => x.id === t.id)!)!.id; return n })
    setBusy(null)
    if (res.ok) { setReqNote(''); setBanner(null); toast('success', `Permintaan ${id} tercatat untuk ${VERIFIER_LABEL[verifier]}.`) }
    else fail(res.kind, res.message, 'Pengiriman')
  }

  const advance = () => {
    setBusy('advance')
    const to = adv.to!
    const res = commit((s) => advanceStage(s, t.id))
    setBusy(null)
    if (res.ok) {
      setBanner({ tone: 'success', title: 'Status diperbarui', text: `${t.invoice} kini ${STAGE_LABEL[to]}.${to === 'diproses' ? ' Pesanan siap dikerjakan teknisi.' : to === 'selesai' ? ' Sepatu siap diserahkan; dana sudah dipastikan.' : ''}` })
      window.scrollTo(0, 0)
    } else fail(res.kind, res.message, 'Perubahan status')
  }

  const submitHold = (reason: HoldReason, note: string): string | null => {
    const res = commit((s) => holdTransaction(s, t.id, reason, note))
    if (res.ok) { setSheet(null); setBanner({ tone: 'warning', title: 'Keputusan tahan tersimpan', text: `${t.invoice} menunggu klarifikasi. Pesanan belum siap diteruskan.` }); window.scrollTo(0, 0); return null }
    if (res.kind === 'storage') { setSheet(null); fail('storage', '', 'Keputusan'); return null }
    return res.message
  }

  const submitPayment = (p: PaymentDraft) => {
    const errs = validatePayment(p, remaining(t))
    if (Object.keys(errs).length) return errs
    let id = ''
    const res = commit((s) => { const n = addPayment(s, t.id, p); const x = n.transactions.find((y) => y.id === t.id)!; id = x.payments[x.payments.length - 1].id; return n })
    if (!res.ok) return res.kind === 'storage' ? 'Pembayaran belum tersimpan. Coba kembali.' : res.message
    setSheet(null)
    toast('success', `Pembayaran ${id} tercatat.`)
    return null
  }

  return (
    <AppShell nav="transaksi" header={{ kind: 'detail', fallback: from, helpHref: `#/bantuan${helpCtx}` }}>
      <PageHeader title="Detail transaksi" identity={<>{t.invoice} · {t.customerCode} {t.customerName} · {rupiah(t.bill)} {t.sample && <SampleTag />}</>} />
      <div className="chip-row"><StageChip stage={t.stage} /><PayChip t={t} /><VerificationChip t={t} /></div>

      {banner && (
        <InfoBox tone={banner.tone} role={banner.tone === 'danger' ? 'alert' : 'status'} title={banner.title}>
          {banner.text}
          {banner.retry && <div className="mt-8"><Button variant="secondary" size="sm" onClick={() => { reload(); setBanner(null) }}>{banner.retry}</Button></div>}
        </InfoBox>
      )}

      {/* 1. Ringkasan */}
      <Accordion title="Ringkasan transaksi" open={isOpen('ringkasan')} onToggle={() => toggle('ringkasan')}>
        <KeyValue rows={[
          ['Nota', t.invoice], ['Pelanggan', `${t.customerCode} · ${t.customerName}`], ['HP', t.phone || '—'],
          ['Layanan', `${t.service} · ${t.pairs} pasang`], ['Tagihan', <span className="num" key="b">{rupiah(t.bill)}</span>],
          ['Status pengerjaan', STAGE_LABEL[t.stage]], ['Dibuat', dateTime(t.createdAt)],
          ...(t.note ? [['Catatan', t.note] as [string, string]] : []),
        ]} />
        <p className="caption text-secondary">Gunakan nomor nota dan bukti untuk mencocokkan pembayaran; nominal saja tidak cukup.</p>
        {role === 'admin' && <LinkButton href={`#/transaksi/${t.id}/ubah`}>Ubah transaksi</LinkButton>}
      </Accordion>

      {/* 2. Pembayaran — UX-SPEC §7.2 */}
      <Accordion title="Pembayaran" open={isOpen('pembayaran')} onToggle={() => toggle('pembayaran')}>
        <div className="row-between"><PayChip t={t} /><span className="label num">{rupiah(t.bill)}</span></div>
        <ProgressBar t={t} />
        <KeyValue rows={[
          ['Dibayar (tercatat kasir)', <span className="num" key="r">{rupiah(paidRecorded(t))} dari {rupiah(t.bill)}</span>],
          ['Dana dikonfirmasi', <span className="num" key="c">{rupiah(paidConfirmed(t))} dari {rupiah(t.bill)}</span>],
          ...(remaining(t) > 0 ? [['Sisa tagihan', <span className="num" key="s">{rupiah(remaining(t))}</span>] as [string, React.ReactNode]] : []),
        ]} />
        {isLunas(t) && !fullyConfirmed(t) && <InfoBox tone="warning" title="LUNAS di catatan, tetapi dana belum seluruhnya dipastikan.">Status LUNAS dihitung dari nominal yang diketik kasir. Pastikan pembayaran non-tunai sudah diperiksa.</InfoBox>}
        <p className="label">Pembayaran diterima (tercatat)</p>
        {entries.length === 0 ? <p className="text-secondary">Belum ada pembayaran tercatat.</p> : (
          <ul className="entry-list">
            {entries.map((p) => {
              const es = entryStatus(t, p)
              const c = canCancelEntry(t, p, role)
              return (
                <li key={p.id} className="entry">
                  <div className="row-between"><span className="label">{METHOD_LABEL[p.method]} · <span className="num">{rupiah(p.amount)}</span></span><EntryChip status={es} /></div>
                  <span className="caption text-secondary">{p.id} · dicatat {dateTime(p.at)}{p.proof && <> · {p.proof.sender} · transfer {dateTime(p.proof.transferAt)}</>}</span>
                  <div className="entry-actions">
                    {p.proof && <a className="caption" href={`#/transaksi/${t.id}/bukti/${p.id}`}>Lihat bukti {p.id}</a>}
                    {c.ok && <button className="btn-link caption" onClick={() => setSheet({ cancel: p.id })}>Batalkan entri</button>}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        {cancelled.length > 0 && <p className="caption text-secondary">{cancelled.length} entri dibatalkan: {cancelled.map((p) => p.id).join(', ')}.</p>}
        {role === 'admin' && remaining(t) > 0 && t.stage !== 'selesai' && <Button variant="secondary" onClick={() => setSheet('pay')}>+ Tambah pembayaran</Button>}
      </Accordion>

      {/* 3. Pemeriksaan — UX-SPEC §7.3 */}
      <Accordion title="Pemeriksaan" open={isOpen('pemeriksaan')} onToggle={() => toggle('pemeriksaan')}>
        <VerificationChip t={t} />
        {st === 'tidak_perlu' && <p>{entries.length ? 'Semua pembayaran tunai; tidak memerlukan pemeriksaan transfer.' : 'Belum ada pembayaran non-tunai untuk diperiksa.'}</p>}

        {pending && (
          <>
            <KeyValue rows={[['Permintaan', pending.id], ['Pemeriksa', `${VERIFIER_LABEL[pending.verifier]}${contact ? ` — ${contact.name}` : ''}`], ['Dikirim', dateTime(pending.requestedAt)]]} />
            <EntryList r={pending} />
            {pending.note && <p className="caption text-secondary">Catatan: {pending.note}</p>}
            {role === 'admin' ? <>
              <p>Permintaan tercatat. Hasil belum tersedia.</p>
              <a className="label" href={`#/bantuan/menunggu${helpCtx}`}>Panduan saat menunggu</a>
              <a className="label" href={`#/bantuan/kontak${helpCtx}`}>Kontak pemeriksa</a>
            </> : <ResultForm t={t} r={pending} />}
          </>
        )}

        {!pending && last?.result && (
          <>
            <p className="label">Hasil terakhir</p>
            <KeyValue rows={[
              ['Sumber berwenang', `${ROLE_LABEL[last.result.by]} — ${last.result.byName}`],
              ['Hasil / permintaan', `${last.result.id} / ${last.id}`], ['Dicatat', dateTime(last.result.at)],
            ]} />
            <EntryList r={last} />
            <ul className="checklist">
              {CHECK_ITEMS.map((c) => (
                <li key={c.key}>
                  <span className={last.result!.checklist[c.key] ? 'ok' : 'no'} aria-hidden>{last.result!.checklist[c.key] ? '✓' : '✗'}</span>
                  <span>{c.label(last)}<span className="visually-hidden">{last.result!.checklist[c.key] ? ' — cocok' : ' — belum cocok'}</span></span>
                </li>
              ))}
            </ul>
            {last.result.note && <p className="caption text-secondary">Catatan pemeriksa: {last.result.note}</p>}
            <p className="label">{resultAdequate(last) ? `Kesimpulan: Sesuai — entri di atas dikonfirmasi.` : `Kesimpulan: ${CONCLUSION_LABEL[last.result.conclusion]} — penerimaan belum dapat dipastikan.`}</p>
          </>
        )}

        {role === 'admin' && reqAllowed.ok && (
          <div className="stack sub-block">
            <p className="label">{t.requests.length ? 'Minta pemeriksaan untuk entri berikut' : 'Minta pemeriksaan'}</p>
            <ul className="checklist">{entriesToRequest(t).map((p) => <li key={p.id}><span aria-hidden>•</span><span>{p.id} · {METHOD_LABEL[p.method]} <span className="num">{rupiah(p.amount)}</span> · {p.proof?.sender}</span></li>)}</ul>
            <div className="field">
              <label htmlFor="verifier" className="text-secondary">Tujuan pemeriksa</label>
              <select {...fieldAria('verifier')} value={verifier} onChange={(e) => setVerifier(e.target.value as Verifier)}>
                {state.contacts.map((c) => <option key={c.verifier} value={c.verifier}>{VERIFIER_LABEL[c.verifier]} — {c.name}</option>)}
              </select>
            </div>
            <p className="caption text-secondary">Nota, pelanggan, nominal dan bukti dipakai otomatis dari transaksi ini.</p>
            <Field id="req-note" label="Catatan tambahan (opsional)">
              <textarea {...fieldAria('req-note')} value={reqNote} maxLength={300} onChange={(e) => setReqNote(e.target.value)} />
            </Field>
            <Button loading={busy === 'request'} onClick={sendRequest}>{t.requests.length ? 'Minta pemeriksaan' : 'Minta pemeriksaan'}</Button>
          </div>
        )}

        {t.requests.length > 1 && (
          <details>
            <summary className="caption text-secondary">Riwayat permintaan ({t.requests.length})</summary>
            <ul className="timeline mt-8">
              {t.requests.map((x) => (
                <li key={x.id} className="caption">
                  <span>{x.id} → {VERIFIER_LABEL[x.verifier]} · {dateTime(x.requestedAt)} · {x.entries.map((e) => e.id).join(', ')}</span>
                  <span className="text-secondary">{x.result ? `${x.result.id}: ${CONCLUSION_LABEL[x.result.conclusion]}` : 'menunggu'}</span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </Accordion>

      {/* 4. Status pengerjaan — UX-SPEC §7.4 */}
      <Accordion title="Status pengerjaan" open={isOpen('pengerjaan')} onToggle={() => toggle('pengerjaan')}>
        <ol className="stages" aria-label="Tahap pengerjaan">
          {(['antrian', 'diproses', 'finishing', 'qc', 'selesai'] as const).map((s) => (
            <li key={s} className={s === t.stage ? 'current' : ''} aria-current={s === t.stage ? 'step' : undefined}>{STAGE_LABEL[s]}</li>
          ))}
        </ol>
        {hold && (
          <InfoBox tone="warning" title="Ditahan untuk klarifikasi">
            {HOLD_REASON_LABEL[hold.reason!]}{hold.note && ` — ${hold.note}`} · {hold.by} · {dateTime(hold.at)}{hold.basis && ` · dasar ${hold.basis}`}
          </InfoBox>
        )}
        {role === 'admin' && adv.to && (
          <>
            {t.stage === 'antrian' && adv.ok && last?.result && <p className="label">Dasar keputusan: {last.result.id}</p>}
            {adv.ok
              ? <Button loading={busy === 'advance'} onClick={advance}>{NEXT_LABEL[adv.to]}</Button>
              : <><Button disabled aria-describedby="adv-reason">{NEXT_LABEL[adv.to]}</Button><p id="adv-reason" className="caption text-secondary">{adv.reason}</p></>}
            {t.stage === 'antrian' && !adv.ok && entries.length > 0 && <Button variant="secondary" onClick={() => setSheet('hold')}>Tahan untuk klarifikasi</Button>}
          </>
        )}
        {t.stage === 'selesai' && <p className="text-secondary">Transaksi selesai. Dana dikonfirmasi {rupiah(paidConfirmed(t))}.</p>}
        {role !== 'admin' && <p className="text-secondary">Status pengerjaan diubah oleh Admin.</p>}
        <LinkButton href={`#/transaksi/${t.id}/riwayat`}>Riwayat transaksi ({t.history.length})</LinkButton>
      </Accordion>

      {sheet === 'hold' && <HoldSheet o={t} onClose={() => setSheet(null)} onSubmit={submitHold}
        defaultReason={st === 'menunggu' ? 'hasil_belum_tersedia' : st === 'hasil_tersedia' ? 'hasil_belum_memadai' : undefined} />}
      {sheet === 'pay' && <AddPaymentSheet invoice={t.invoice} max={remaining(t)} onClose={() => setSheet(null)} onSubmit={submitPayment} />}
      {sheet && typeof sheet === 'object' && (
        <BottomSheet title={`Batalkan ${sheet.cancel}?`} onClose={() => setSheet(null)}>
          <p className="text-secondary">Entri dikeluarkan dari perhitungan pembayaran dan dicatat di riwayat. Tindakan ini tidak dapat dibatalkan.</p>
          <Button onClick={() => {
            const res = commit((s) => cancelPayment(s, t.id, sheet.cancel))
            setSheet(null)
            if (res.ok) toast('success', `Pembayaran ${sheet.cancel} dibatalkan.`); else fail(res.kind, res.message, 'Pembatalan')
          }}>Batalkan entri</Button>
          <Button variant="secondary" onClick={() => setSheet(null)}>Kembali</Button>
        </BottomSheet>
      )}
    </AppShell>
  )
}

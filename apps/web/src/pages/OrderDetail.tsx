import { useState } from 'react'
import type { Order, Verifier } from '../domain/types'
import {
  activeRequest, canForward, canRequest, currentDecision, fundsConfirmed, hasStaleResult, latestRequest, resultAdequate, verificationState,
} from '../domain/rules'
import { decideForward, decideHold, requestVerification } from '../domain/actions'
import { useStore } from '../store/StoreContext'
import type { Route } from '../hooks/useRoute'
import { AppShell, PageHeader } from '../components/layout/AppShell'
import { Accordion, Button, Field, InfoBox, KeyValue, LinkButton, SampleTag, fieldAria } from '../components/common'
import { PaymentChip, VerificationChip } from '../components/orders/StatusChips'
import { HoldSheet } from '../components/orders/HoldSheet'
import { ResultForm, CHECK_ITEMS } from '../components/verification/ResultForm'
import { CONCLUSION_LABEL, HOLD_REASON_LABEL, ROLE_LABEL, VERIFIER_LABEL, dateTime, methodLabel, rupiah } from '../utils/format'

type SectionKey = 'ringkasan' | 'pembayaran' | 'pemeriksaan' | 'tindak'
type Banner = null | 'forwarded' | 'held' | 'request_failed' | 'decision_failed'

/** Bagian default terbuka mengikuti keadaan (UX-SPEC N1b). */
function defaultOpen(o: Order): Record<SectionKey, boolean> {
  const st = verificationState(o)
  const decided = !!currentDecision(o)
  const base = { ringkasan: false, pembayaran: false, pemeriksaan: false, tindak: true }
  if (decided && currentDecision(o)!.type === 'teruskan') return base
  if (st === 'belum_diminta' || st === 'tidak_perlu') return { ...base, pembayaran: true, pemeriksaan: st === 'belum_diminta' }
  return { ...base, pemeriksaan: true }
}

export function OrderDetail({ order: o, route }: { order?: Order; route: Route }) {
  const { state, sections, setSection, commit, toast, reload } = useStore()
  const from = route.query.get('from') ?? '/pesanan'
  const fromQueue = from.startsWith('/pemeriksaan')
  const [banner, setBanner] = useState<Banner>(null)
  const [holding, setHolding] = useState(false)
  const [busy, setBusy] = useState<null | 'request' | 'forward'>(null)
  const [verifier, setVerifier] = useState<Verifier>('owner')
  const [reqNote, setReqNote] = useState('')

  if (!o) {
    return (
      <AppShell nav="pesanan" header={{ kind: 'detail', fallback: '/pesanan' }}>
        <PageHeader title="Detail pesanan" />
        <InfoBox title="Pesanan tidak ditemukan.">Periksa tautan atau cari pesanan dari daftar.</InfoBox>
        <LinkButton href="#/pesanan" variant="primary">Kembali ke Pesanan</LinkButton>
      </AppShell>
    )
  }

  const role = state.role
  const defaults = defaultOpen(o)
  const isOpen = (k: SectionKey) => sections[o.id]?.[k] ?? (k === 'pemeriksaan' && fromQueue ? true : defaults[k])
  const toggle = (k: SectionKey) => setSection(o.id, k, !isOpen(k))
  const helpCtx = `?pesanan=${o.id}`

  const r = activeRequest(o)
  const last = latestRequest(o)
  const st = verificationState(o)
  const adequate = resultAdequate(o)
  const decision = currentDecision(o)
  const reqAllowed = canRequest(o, role)
  const fwd = canForward(o, role)

  const sendRequest = () => {
    setBusy('request')
    let newId = ''
    const res = commit((s) => {
      const next = requestVerification(s, o.id, verifier, reqNote)
      newId = activeRequest(next.orders.find((x) => x.id === o.id)!)!.id
      return next
    })
    setBusy(null)
    if (res.ok) { setReqNote(''); setBanner(null); toast('success', `Permintaan ${newId} tercatat untuk ${VERIFIER_LABEL[verifier]}.`) }
    else if (res.kind === 'storage') setBanner('request_failed')
    else toast('danger', res.message)
  }

  const forward = () => {
    setBusy('forward')
    const res = commit((s) => decideForward(s, o.id))
    setBusy(null)
    if (res.ok) { setBanner('forwarded'); setSection(o.id, 'tindak', true); window.scrollTo(0, 0) }
    else if (res.kind === 'storage') setBanner('decision_failed')
    else toast('danger', res.message)
  }

  const hold = (reason: Parameters<typeof decideHold>[2], note: string): string | null => {
    const res = commit((s) => decideHold(s, o.id, reason, note))
    if (res.ok) { setHolding(false); setBanner('held'); window.scrollTo(0, 0); return null }
    if (res.kind === 'storage') { setHolding(false); setBanner('decision_failed'); return null }
    return res.message
  }

  const contact = state.contacts.find((c) => c.verifier === r?.verifier)

  return (
    <AppShell nav="pesanan" header={{ kind: 'detail', fallback: from, helpHref: `#/bantuan${helpCtx}` }}>
      <PageHeader title="Detail pesanan" identity={<>{o.code} · {methodLabel(o.method)} · {rupiah(o.amount)} {o.sample && <SampleTag />}</>} />

      {/* Banner status (UX-SPEC N1b) */}
      {banner === 'forwarded' && <InfoBox tone="success" role="status" title="Keputusan lanjut tersimpan">Pesanan siap diteruskan ke teknisi.</InfoBox>}
      {banner === 'held' && decision?.type === 'tahan' && (
        <InfoBox tone="warning" role="status" title="Keputusan tahan tersimpan">{o.code} menunggu klarifikasi. Pesanan belum siap diteruskan.</InfoBox>
      )}
      {banner === 'request_failed' && (
        <InfoBox tone="danger" role="alert" title="Pengiriman belum terkonfirmasi">
          Data pesanan dan catatan tetap tersedia. Jangan mengirim ulang sebelum memeriksa permintaan.
          <div className="mt-8"><Button variant="secondary" size="sm" onClick={() => { reload(); setBanner(null) }}>Periksa permintaan</Button></div>
        </InfoBox>
      )}
      {banner === 'decision_failed' && (
        <InfoBox tone="danger" role="alert" title="Keputusan belum terkonfirmasi">
          Periksa catatan untuk mengetahui apakah keputusan sudah tersimpan.
          <div className="mt-8"><Button variant="secondary" size="sm" onClick={() => { reload(); setBanner(null) }}>Periksa catatan keputusan</Button></div>
        </InfoBox>
      )}
      {hasStaleResult(o) && !r && (
        <InfoBox tone="warning" title="Hasil sebelumnya perlu diperbarui">
          {last!.result ? `${last!.result.id}` : last!.id} dibuat untuk data sebelumnya. Jangan gunakan hasil tersebut sebagai dasar keputusan terbaru.
        </InfoBox>
      )}

      {/* 1. Ringkasan pesanan */}
      <Accordion title="Ringkasan pesanan" open={isOpen('ringkasan')} onToggle={() => toggle('ringkasan')}>
        <KeyValue rows={[
          ['ID pesanan', o.code], ['Pelanggan', o.customerName], ['WhatsApp', o.whatsapp || '—'],
          ['Layanan', `${o.service} · ${o.pairs} pasang`], ['Metode', methodLabel(o.method)],
          ['Tagihan', <span className="num">{rupiah(o.amount)}</span>], ['Dibuat', dateTime(o.createdAt)],
          ...(o.note ? [['Catatan', o.note] as [string, string]] : []),
        ]} />
        <p className="caption text-secondary">Gunakan identitas pesanan dan bukti untuk mencocokkan pembayaran; nominal saja tidak cukup.</p>
        {role === 'admin' && <LinkButton href={`#/pesanan/${o.id}/ubah`}>Ubah pesanan</LinkButton>}
      </Accordion>

      {/* 2. Pembayaran — FR-01 */}
      <Accordion title="Pembayaran" open={isOpen('pembayaran')} onToggle={() => toggle('pembayaran')}>
        <PaymentChip o={o} />
        {o.method === 'tunai' ? <p>Pembayaran tunai tercatat oleh kasir.</p>
          : fundsConfirmed(o) ? <p>Menurut hasil {VERIFIER_LABEL[r!.result!.by as Verifier]} {r!.result!.id} untuk data terbaru.</p>
            : <p className="text-secondary">Pencatatan belum memastikan dana masuk.</p>}
        {o.method === 'transfer' && (o.proof
          ? <>
            <KeyValue rows={[['Bukti', o.proof.id], ['Nominal bukti', <span className="num">{rupiah(o.proof.amount)}</span>], ['Waktu transfer', dateTime(o.proof.transferAt)]]} />
            {o.proof.amount !== o.amount && <InfoBox tone="warning" title="Nominal pada bukti berbeda dari tagihan." />}
            <a className="label" href={`#/pesanan/${o.id}/bukti`}>Lihat bukti {o.proof.id}</a>
          </>
          : <p className="text-secondary">Belum ada bukti transfer.</p>)}
      </Accordion>

      {/* 3. Pemeriksaan — FR-03/FR-06/US-07 */}
      <Accordion title="Pemeriksaan" open={isOpen('pemeriksaan')} onToggle={() => toggle('pemeriksaan')}>
        <VerificationChip o={o} />
        {st === 'tidak_perlu' && <p>Pembayaran tunai tidak memerlukan pemeriksaan transfer.</p>}

        {st === 'belum_diminta' && role === 'admin' && (
          <>
            <div className="field">
              <label htmlFor="verifier" className="row-between"><span className="text-secondary">Tujuan pemeriksa</span></label>
              <select {...fieldAria('verifier')} value={verifier} onChange={(e) => setVerifier(e.target.value as Verifier)}>
                {state.contacts.map((c) => <option key={c.verifier} value={c.verifier}>{VERIFIER_LABEL[c.verifier]} — {c.name}</option>)}
              </select>
            </div>
            <p className="text-secondary">Identitas, nominal dan bukti mengikuti pesanan ini: <span className="num">{o.code} · {rupiah(o.amount)}{o.proof ? ` · ${o.proof.id}` : ''}</span></p>
            {!o.proof && <InfoBox tone="warning" title="Belum ada bukti transfer">Pemeriksa hanya dapat mencocokkan nominal. Tambahkan bukti melalui Ubah pesanan bila tersedia.</InfoBox>}
            <Field id="req-note" label="Catatan tambahan (opsional)">
              <textarea {...fieldAria('req-note')} value={reqNote} maxLength={300} onChange={(e) => setReqNote(e.target.value)} placeholder="Catatan tambahan (opsional)" />
            </Field>
            <Button loading={busy === 'request'} onClick={sendRequest}>Minta pemeriksaan</Button>
          </>
        )}
        {st === 'belum_diminta' && role !== 'admin' && <p className="text-secondary">Belum ada permintaan pemeriksaan untuk data terbaru.</p>}

        {st === 'menunggu' && r && (
          <>
            <KeyValue rows={[['Permintaan', r.id], ['Pemeriksa', `${VERIFIER_LABEL[r.verifier]}${contact ? ` — ${contact.name}` : ''}`], ['Dikirim', dateTime(r.requestedAt)]]} />
            {r.note && <p className="caption text-secondary">Catatan: {r.note}</p>}
            {role === 'admin' && <>
              <p>Permintaan tercatat. Hasil belum tersedia.</p>
              <a className="label" href={`#/bantuan/menunggu${helpCtx}`}>Panduan saat menunggu</a>
              <a className="label" href={`#/bantuan/kontak${helpCtx}`}>Kontak pemeriksa</a>
            </>}
            {role !== 'admin' && <ResultForm o={o} r={r} />}
          </>
        )}

        {st === 'hasil_tersedia' && r?.result && (
          <>
            <KeyValue rows={[
              ['Sumber berwenang', `${ROLE_LABEL[r.result.by]} — ${r.result.byName}`],
              ['Hasil / permintaan', `${r.result.id} / ${r.id}`],
              ['Dicatat', dateTime(r.result.at)],
            ]} />
            <p className="label">Untuk {o.code} · {adequate ? 'data terbaru' : CONCLUSION_LABEL[r.result.conclusion]}</p>
            <ul className="checklist">
              {CHECK_ITEMS.map((c) => (
                <li key={c.key}>
                  <span className={r.result!.checklist[c.key] ? 'ok' : 'no'} aria-hidden>{r.result!.checklist[c.key] ? '✓' : '✗'}</span>
                  <span>{c.label(r)}<span className="visually-hidden">{r.result!.checklist[c.key] ? ' — cocok' : ' — belum cocok'}</span></span>
                </li>
              ))}
            </ul>
            {r.result.note && <p className="caption text-secondary">Catatan pemeriksa: {r.result.note}</p>}
            {!adequate && <p>Penerimaan untuk pesanan ini belum dapat dipastikan.</p>}
            {!adequate && role === 'admin' && reqAllowed.ok && (
              <>
                <div className="field">
                  <label htmlFor="verifier2" className="text-secondary">Tujuan pemeriksa</label>
                  <select {...fieldAria('verifier2')} value={verifier} onChange={(e) => setVerifier(e.target.value as Verifier)}>
                    {state.contacts.map((c) => <option key={c.verifier} value={c.verifier}>{VERIFIER_LABEL[c.verifier]} — {c.name}</option>)}
                  </select>
                </div>
                <Button variant="secondary" loading={busy === 'request'} onClick={sendRequest}>Minta pemeriksaan ulang</Button>
              </>
            )}
          </>
        )}

        {o.requests.length > 1 && (
          <details>
            <summary className="caption text-secondary">Riwayat permintaan ({o.requests.length})</summary>
            <ul className="timeline mt-8">
              {o.requests.map((x) => (
                <li key={x.id} className="caption">
                  <span>{x.id} → {VERIFIER_LABEL[x.verifier]} · {dateTime(x.requestedAt)} · {rupiah(x.snapshot.amount)}</span>
                  <span className="text-secondary">{x.result ? `${x.result.id}: ${CONCLUSION_LABEL[x.result.conclusion]}` : 'tanpa hasil'}{x.stale ? ' · tidak berlaku' : ''}</span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </Accordion>

      {/* 4. Tindak lanjut — FR-05 */}
      <Accordion title="Tindak lanjut" open={isOpen('tindak')} onToggle={() => toggle('tindak')}>
        {decision ? (
          <>
            <KeyValue rows={[
              ['Keputusan', decision.type === 'teruskan' ? 'Teruskan' : 'Tahan'],
              ['Dasar', decision.resultId ?? (o.method === 'tunai' ? 'Pembayaran tunai' : '—')],
              ...(decision.reason ? [['Alasan', HOLD_REASON_LABEL[decision.reason]] as [string, string]] : []),
              ['Petugas', decision.by], ['Waktu', dateTime(decision.at)],
            ]} />
            {decision.note && <p className="caption text-secondary">Catatan: {decision.note}</p>}
            {decision.type === 'teruskan'
              ? <p className="caption text-secondary">Status ini mencatat keputusan. Pesanan belum dinyatakan selesai dikerjakan.</p>
              : role === 'admin' && <LinkButton href={`#/bantuan/kontak${helpCtx}`}>Kontak pemeriksa</LinkButton>}
            <LinkButton href={`#/pesanan/${o.id}/keputusan`}>Lihat catatan keputusan</LinkButton>
          </>
        ) : null}

        {decision?.type !== 'teruskan' && role === 'admin' && (
          <>
            {fwd.ok && o.method === 'transfer' && <p className="label">Dasar keputusan: {r?.result?.id}</p>}
            {fwd.ok
              ? <Button loading={busy === 'forward'} onClick={forward}>Simpan keputusan Teruskan</Button>
              : <>
                <Button disabled aria-describedby="fwd-reason">Teruskan</Button>
                <p id="fwd-reason" className="caption text-secondary">{fwd.reason}</p>
              </>}
            {o.method === 'transfer' && (st === 'hasil_tersedia' || st === 'menunggu') && decision?.type !== 'tahan' && (
              <Button variant="secondary" onClick={() => setHolding(true)}>Tahan untuk klarifikasi</Button>
            )}
          </>
        )}
        {role !== 'admin' && !decision && <p className="text-secondary">Keputusan dicatat oleh Admin.</p>}
      </Accordion>

      {holding && (
        <HoldSheet o={o} onClose={() => setHolding(false)} onSubmit={hold}
          defaultReason={st === 'menunggu' ? 'hasil_belum_tersedia' : st === 'hasil_tersedia' && !adequate ? 'hasil_belum_memadai' : undefined} />
      )}
      <a className="label" href={`#/pesanan/${o.id}/keputusan`}>Riwayat pesanan ({o.history.length} catatan)</a>
    </AppShell>
  )
}

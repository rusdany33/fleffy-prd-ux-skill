import type { Transaction } from '../domain/types'
import { entryStatus, lastHold, paidConfirmed, paidRecorded, requestFor } from '../domain/rules'
import { AppShell, PageHeader } from '../components/layout/AppShell'
import { Card, InfoBox, KeyValue, LinkButton } from '../components/common'
import { EntryChip } from '../components/orders/StatusChips'
import { HOLD_REASON_LABEL, METHOD_LABEL, STAGE_LABEL, date, dateTime, rupiah, time } from '../utils/format'

// ---------- P01 Bukti pembayaran (per entri) ----------
export function ProofPage({ tx: t, entryId }: { tx?: Transaction; entryId?: string }) {
  const p = t?.payments.find((x) => x.id === entryId)
  const r = t && p ? requestFor(t, p.id) : undefined
  return (
    <AppShell nav="transaksi" header={{ kind: 'detail', fallback: t ? `/transaksi/${t.id}` : '/transaksi' }}>
      <PageHeader title="Bukti pembayaran" />
      {!t || !p?.proof ? <InfoBox title="Bukti tidak ditemukan." /> : <>
        <InfoBox title={`Terkait ${t.invoice}`}>{p.id} · {METHOD_LABEL[p.method]} · <span className="num">{rupiah(p.amount)}</span> · {t.customerCode} {t.customerName}</InfoBox>
        <Card title="Pratinjau bukti">
          <p className="text-secondary">Area berkas bukti transfer pelanggan.</p>
          <div className="proof-preview">
            <span className="label">BUKTI {METHOD_LABEL[p.method].toUpperCase()}</span>
            <strong>{p.id}</strong>
            <strong className="num">{rupiah(p.amount)}</strong>
            <span className="caption text-secondary">Data contoh — gambar bukti belum disertakan.</span>
          </div>
          <KeyValue rows={[['Tanggal bukti', date(p.proof.transferAt)], ['Waktu bukti', time(p.proof.transferAt)], ['Pengirim', p.proof.sender],
            ['Status', <EntryChip key="s" status={entryStatus(t, p)} />], ...(r ? [['Permintaan', `${r.id}${r.result ? ` / ${r.result.id}` : ''}`] as [string, string]] : []),
            ...(p.proof.note ? [['Keterangan', p.proof.note] as [string, string]] : [])]} />
          <p className="caption text-secondary">Bukti ini adalah kiriman pelanggan, bukan verifikasi penerimaan dana.</p>
          <LinkButton href={`#/transaksi/${t.id}`}>Kembali ke transaksi</LinkButton>
        </Card>
      </>}
    </AppShell>
  )
}

// ---------- P12 Riwayat & catatan keputusan ----------
export function DecisionLog({ tx: t }: { tx?: Transaction }) {
  const fwd = t?.changes.filter((c) => c.kind === 'stage' && c.from === 'antrian').at(-1)
  const hold = t && lastHold(t)
  return (
    <AppShell nav="transaksi" header={{ kind: 'detail', fallback: t ? `/transaksi/${t.id}` : '/transaksi' }}>
      <PageHeader title="Riwayat transaksi" identity={t && `${t.invoice} · ${t.customerCode} ${t.customerName} · ${rupiah(t.bill)}`} />
      {!t ? <InfoBox title="Transaksi tidak ditemukan." /> : <>
        {fwd && <InfoBox tone="success" title="Catatan keputusan ditemukan">{t.invoice} diteruskan ke teknisi pada {dateTime(fwd.at)} oleh {fwd.by}{fwd.basis && `, dasar ${fwd.basis}`}.</InfoBox>}
        {hold && <InfoBox tone="warning" title="Ditahan untuk klarifikasi">{HOLD_REASON_LABEL[hold.reason!]}{hold.note && ` — ${hold.note}`} · {hold.by}</InfoBox>}
        {!fwd && !hold && <InfoBox title="Belum ada keputusan pengerjaan">Keputusan dicatat dari bagian Status pengerjaan.</InfoBox>}
        <Card title="Ringkasan">
          <KeyValue rows={[['Status pengerjaan', STAGE_LABEL[t.stage]], ['Dibayar tercatat', rupiah(paidRecorded(t))], ['Dana dikonfirmasi', rupiah(paidConfirmed(t))], ['Tagihan', rupiah(t.bill)]]} />
        </Card>
        <Card title="Riwayat">
          <ol className="timeline">
            {[...t.history].reverse().map((h, i) => <li key={i}><span className="caption text-secondary">{dateTime(h.at)} · {h.actor}</span><span>{h.text}</span></li>)}
          </ol>
        </Card>
        <LinkButton href={`#/transaksi/${t.id}`}>Kembali ke detail</LinkButton>
      </>}
    </AppShell>
  )
}

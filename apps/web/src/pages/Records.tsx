import type { Order } from '../domain/types'
import { activeRequest, currentDecision } from '../domain/rules'
import { AppShell, PageHeader } from '../components/layout/AppShell'
import { Card, InfoBox, KeyValue, LinkButton } from '../components/common'
import { HOLD_REASON_LABEL, ROLE_LABEL, date, dateTime, methodLabel, rupiah, time } from '../utils/format'

export function ProofPage({ order: o }: { order?: Order }) {
  return (
    <AppShell nav="pesanan" header={{ kind: 'detail', fallback: o ? `/pesanan/${o.id}` : '/pesanan' }}>
      <PageHeader title="Bukti pembayaran" />
      {!o?.proof ? <InfoBox title="Bukti tidak ditemukan." /> : <>
        <InfoBox title={`Terkait ${o.code}`}>{o.proof.id} · Bank Transfer · <span className="num">{rupiah(o.proof.amount)}</span></InfoBox>
        <Card title="Pratinjau bukti">
          <p className="text-secondary">Area berkas bukti transfer pelanggan.</p>
          <div className="proof-preview">
            <span className="label">BUKTI TRANSFER</span>
            <strong>{o.proof.id}</strong>
            <strong className="num">{rupiah(o.proof.amount)}</strong>
            <span className="caption text-secondary">Data contoh — gambar bukti belum disertakan.</span>
          </div>
          <KeyValue rows={[['Tanggal bukti', date(o.proof.transferAt)], ['Waktu bukti', time(o.proof.transferAt)], ['Pengirim', o.proof.sender], ...(o.proof.note ? [['Keterangan', o.proof.note] as [string, string]] : [])]} />
          {o.proof.amount !== o.amount && <InfoBox tone="warning" title={`Nominal bukti berbeda dari tagihan ${rupiah(o.amount)}.`} />}
          <p className="caption text-secondary">Bukti ini adalah kiriman pelanggan, bukan verifikasi penerimaan dana.</p>
          <LinkButton href={`#/pesanan/${o.id}`}>Kembali ke pesanan</LinkButton>
        </Card>
      </>}
    </AppShell>
  )
}


export function DecisionLog({ order: o }: { order?: Order }) {
  const d = o && currentDecision(o)
  const r = o && activeRequest(o)
  return (
    <AppShell nav="pesanan" header={{ kind: 'detail', fallback: o ? `/pesanan/${o.id}` : '/pesanan' }}>
      <PageHeader title="Catatan keputusan" identity={o && `${o.code} · ${methodLabel(o.method)} · ${rupiah(o.amount)}`} />
      {!o ? <InfoBox title="Pesanan tidak ditemukan." /> : <>
        {d ? <InfoBox tone={d.type === 'teruskan' ? 'success' : 'warning'} title="Catatan ditemukan">Keputusan untuk {o.code} sudah tersimpan.</InfoBox>
          : <InfoBox title="Belum ada keputusan yang berlaku">Keputusan dicatat dari bagian Tindak lanjut pada detail pesanan.</InfoBox>}
        {d && (
          <Card title={o.code}>
            <KeyValue rows={[
              ['Keputusan', d.type === 'teruskan' ? 'Teruskan' : 'Tahan'], ['Dasar hasil', d.resultId ?? '—'], ['Permintaan', d.requestId ?? '—'],
              ...(d.reason ? [['Alasan', HOLD_REASON_LABEL[d.reason]] as [string, string]] : []),
              ['Petugas', d.by], ['Waktu', dateTime(d.at)], ['Status', 'Tersimpan'],
            ]} />
            <p>{d.type === 'teruskan' ? 'Pesanan siap diteruskan ke teknisi.' : 'Pesanan ditahan sampai ada hasil yang memadai.'}</p>
            {r?.result && <p className="caption text-secondary">Hasil {r.result.id} oleh {r.result.byName} ({ROLE_LABEL[r.result.by]}).</p>}
          </Card>
        )}
        <Card title="Riwayat pesanan">
          <ol className="timeline">
            {[...o.history].reverse().map((h, i) => <li key={i}><span className="caption text-secondary">{dateTime(h.at)} · {h.actor}</span><span>{h.text}</span></li>)}
          </ol>
        </Card>
        <LinkButton href={`#/pesanan/${o.id}`}>Kembali ke detail</LinkButton>
      </>}
    </AppShell>
  )
}


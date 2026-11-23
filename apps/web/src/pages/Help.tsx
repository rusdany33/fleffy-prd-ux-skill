import { latestRequest, pendingRequest } from '../domain/rules'
import { useStore } from '../store/StoreContext'
import { type Route } from '../hooks/useRoute'
import { AppShell, PageHeader } from '../components/layout/AppShell'
import { Card, InfoBox, KeyValue, LinkButton } from '../components/common'
import { VERIFIER_LABEL, rupiah } from '../utils/format'

function useHelpContext(route: Route) {
  const { state } = useStore()
  const o = state.transactions.find((x) => x.id === route.query.get('transaksi'))
  return { o, r: o && (pendingRequest(o) ?? latestRequest(o)), suffix: o ? `?transaksi=${o.id}` : '' }
}

export function HelpIndex({ route }: { route: Route }) {
  const { suffix, o } = useHelpContext(route)
  const items = [
    { href: `#/bantuan/status${suffix}`, title: 'Arti status pembayaran', text: 'Bedakan pencatatan, permintaan, hasil dan keputusan.' },
    { href: `#/bantuan/menunggu${suffix}`, title: 'Panduan saat menunggu', text: 'Tindak lanjut saat hasil pemeriksaan belum tersedia.' },
    { href: `#/bantuan/kontak${suffix}`, title: 'Kontak pemeriksa', text: 'Temukan tujuan pemeriksa pada transaksi yang dipilih.' },
  ]
  return (
    <AppShell nav="bantuan" header={o ? { kind: 'detail', fallback: `/transaksi/${o.id}` } : { kind: 'root' }}>
      <PageHeader title="Bantuan pemeriksaan" sub="Pilih bantuan sesuai kondisi transaksi." />
      {items.map((i) => <Card key={i.href} title={i.title}><p className="text-secondary">{i.text}</p><LinkButton href={i.href}>Buka panduan</LinkButton></Card>)}
    </AppShell>
  )
}

export function HelpStatus({ route }: { route: Route }) {
  const { suffix, o } = useHelpContext(route)
  const terms = [
    ['LUNAS / BELUM LUNAS', 'Dihitung dari nominal yang diketik kasir. LUNAS belum berarti dana sudah masuk rekening.'],
    ['Menunggu hasil', 'Permintaan sudah tercatat, hasil pemeriksa belum tersedia.'],
    ['Hasil tersedia', 'Ada hasil untuk dibaca. Nilai kecocokan entri pembayaran, nota, dan kewenangan sumber.'],
    ['Dana dikonfirmasi', 'Hasil pemeriksa berwenang menyatakan Sesuai untuk entri pembayaran transaksi ini.'],
    ['Teruskan ke teknisi (Diproses)', 'Hanya bisa dilakukan setelah semua pembayaran non-tunai dikonfirmasi. Selesai hanya bila dana dikonfirmasi sama dengan tagihan.'],
  ]
  return (
    <AppShell nav="bantuan" header={{ kind: 'detail', fallback: `/bantuan${suffix}` }}>
      <PageHeader title="Arti status pembayaran" />
      {terms.map(([t, d]) => <Card key={t} title={t}><p className="text-secondary">{d}</p></Card>)}
      <Card title="Kembali"><LinkButton href={o ? `#/transaksi/${o.id}` : '#/bantuan'}>{o ? `Kembali ke ${o.invoice}` : 'Kembali ke bantuan'}</LinkButton></Card>
    </AppShell>
  )
}

export function HelpWaiting({ route }: { route: Route }) {
  const { o, r, suffix } = useHelpContext(route)
  return (
    <AppShell nav="bantuan" header={{ kind: 'detail', fallback: o ? `/transaksi/${o.id}` : '/bantuan' }}>
      <PageHeader title="Panduan saat menunggu" />
      {o && <InfoBox title="Konteks tetap tersimpan">{o.invoice}{r ? ` · ${r.id} · ${VERIFIER_LABEL[r.verifier]}` : ''}</InfoBox>}
      <Card title="1. Pastikan permintaan tercatat"><p className="text-secondary">Gunakan nomor permintaan yang sudah ada. Hindari mengirim ulang sebelum memeriksa riwayat.</p></Card>
      <Card title="2. Hubungi pemeriksa yang ditetapkan"><p className="text-secondary">Sampaikan nomor nota dan ID permintaan agar pemeriksa dapat menemukan data yang tepat.</p></Card>
      <Card title="3. Jelaskan status kepada pelanggan"><p className="text-secondary">Sampaikan bahwa hasil pemeriksaan masih ditunggu. Belum ada kepastian dana masuk dari aplikasi. Jangan menjanjikan waktu selesai.</p></Card>
      <Card title="Tindak lanjut">
        <LinkButton variant="primary" href={`#/bantuan/kontak${suffix}`}>Kontak pemeriksa</LinkButton>
        <LinkButton href={o ? `#/transaksi/${o.id}?from=/pemeriksaan` : '#/pemeriksaan'}>Kembali ke pemeriksaan</LinkButton>
      </Card>
    </AppShell>
  )
}

export function HelpContacts({ route }: { route: Route }) {
  const { state } = useStore()
  const { o, r } = useHelpContext(route)
  const main = state.contacts.find((c) => c.verifier === (r?.verifier ?? 'owner'))!
  const alt = state.contacts.find((c) => c.verifier !== main.verifier)
  return (
    <AppShell nav="bantuan" header={{ kind: 'detail', fallback: o ? `/transaksi/${o.id}` : '/bantuan' }}>
      <PageHeader title="Kontak pemeriksa" />
      {o && <InfoBox title="Konteks permintaan">{o.invoice}{r ? ` · ${r.id}` : ''}</InfoBox>}
      <Card title="Pemeriksa yang ditetapkan">
        <KeyValue rows={[['Peran', VERIFIER_LABEL[main.verifier]], ['Nama', main.name], ['Kanal', main.channel]]} />
        <p className="caption text-secondary">{main.note} Kontak berupa contoh; gunakan saluran yang disepakati usaha.</p>
      </Card>
      {alt && <Card title="Pemeriksa pengganti"><KeyValue rows={[['Peran', VERIFIER_LABEL[alt.verifier]], ['Nama', alt.name], ['Kanal', alt.channel]]} /><p className="caption text-secondary">{alt.note}</p></Card>}
      <Card title="Informasi yang disampaikan">
        <p>{o ? <>Sertakan {o.invoice}{r ? `, ${r.id}` : ''}, nominal <span className="num">{rupiah(r ? r.entries.reduce((a, e) => a + e.amount, 0) : o.bill)}</span>{r ? `, entri ${r.entries.map((e) => e.id).join(', ')}` : ''} dan bagian yang perlu diklarifikasi.</>
          : 'Sertakan nomor nota, ID permintaan, nominal, dan bagian yang perlu diklarifikasi.'}</p>
        <p className="caption text-secondary">Hindari mengirim ulang jika permintaan sudah tercatat.</p>
        <LinkButton href={o ? `#/transaksi/${o.id}?from=/pemeriksaan` : '#/pemeriksaan'}>Kembali ke pemeriksaan</LinkButton>
      </Card>
    </AppShell>
  )
}


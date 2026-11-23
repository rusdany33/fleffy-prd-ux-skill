import { useState } from 'react'
import { isVerifier, notices, summary } from '../domain/rules'
import { useStore } from '../store/StoreContext'
import { AppShell, PageHeader } from '../components/layout/AppShell'
import { BottomSheet, Button, Card, InfoBox, LinkButton, SampleTag } from '../components/common'
import { dateTime } from '../utils/format'

export function Home() {
  const { state, resetSample } = useStore()
  const s = summary(state.transactions)
  const ns = notices(state.transactions, state.role)
  const [confirm, setConfirm] = useState(false)
  return (
    <AppShell nav="beranda" header={{ kind: 'root' }}>
      <PageHeader title="Beranda" />
      <p className="heading">Halo, {state.names[state.role]}</p>
      <p className="text-secondary">Periksa pembayaran sebelum pesanan diteruskan.</p>

      {/* Notifikasi peran — UX-SPEC §7.5 */}
      <section className="info info-info" aria-labelledby="notif-title">
        <div className="info-title" id="notif-title">Notifikasi</div>
        {ns.length === 0
          ? <p className="text-secondary">{isVerifier(state.role) ? 'Tidak ada permintaan pemeriksaan untukmu.' : 'Belum ada hasil pemeriksaan baru.'}</p>
          : <ul className="notif-list">{ns.map((n) => (
            <li key={n.txId + n.at}><a href={`#/transaksi/${n.txId}?from=/pemeriksaan`}><span className="label">{n.title}</span><span className="caption">{n.text}</span><span className="caption text-secondary">{dateTime(n.at)}</span></a></li>
          ))}</ul>}
      </section>

      <Card title="Pemeriksaan pembayaran">
        <p>Pantau permintaan dan tindak lanjut transaksi.</p>
        <div className="stat-list">
          <a className="stat-link" href="#/pemeriksaan?f=belum_diminta"><span>Belum diminta</span><b>{s.belum_diminta}</b></a>
          <a className="stat-link" href="#/pemeriksaan?f=menunggu"><span>Menunggu hasil</span><b>{s.menunggu}</b></a>
          <a className="stat-link" href="#/pemeriksaan?f=hasil_tersedia"><span>Hasil tersedia</span><b>{s.hasil_tersedia}</b></a>
        </div>
        <LinkButton variant="primary" href="#/pemeriksaan">Buka pemeriksaan</LinkButton>
      </Card>
      <Card title="Transaksi laundry sepatu">
        <p>Temukan transaksi melalui nomor nota atau nama pelanggan.</p>
        <LinkButton href="#/transaksi">Lihat transaksi</LinkButton>
      </Card>
      <InfoBox title="Pisahkan status dan keputusan">LUNAS di nota hanya berarti pembayaran tercatat. Gunakan hasil pemeriksa yang berwenang sebelum meneruskan ke teknisi.</InfoBox>
      <a className="label" href="#/bantuan">Bantuan pemeriksaan</a>
      <p className="caption text-secondary">Data pada aplikasi ini adalah data contoh fiktif yang ditandai <SampleTag />. <button className="btn-link caption" onClick={() => setConfirm(true)}>Muat ulang data contoh</button></p>
      {confirm && (
        <BottomSheet title="Muat ulang data contoh?" onClose={() => setConfirm(false)}>
          <p className="text-secondary">Semua transaksi dan keputusan yang kamu buat akan diganti dengan data contoh.</p>
          <Button onClick={() => { resetSample(); setConfirm(false) }}>Muat ulang</Button>
          <Button variant="secondary" onClick={() => setConfirm(false)}>Batal</Button>
        </BottomSheet>
      )}
    </AppShell>
  )
}

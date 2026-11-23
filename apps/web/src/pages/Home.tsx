import { useState } from 'react'
import { summary } from '../domain/rules'
import { useStore } from '../store/StoreContext'
import { AppShell, PageHeader } from '../components/layout/AppShell'
import { BottomSheet, Button, Card, InfoBox, LinkButton, SampleTag } from '../components/common'

export function Home() {
  const { state, resetSample } = useStore()
  const s = summary(state.orders)
  const [confirm, setConfirm] = useState(false)
  return (
    <AppShell nav="beranda" header={{ kind: 'root' }}>
      <PageHeader title="Beranda" />
      <p className="heading">Halo, {state.names[state.role]}</p>
      <p className="text-secondary">Periksa pembayaran sebelum pesanan diteruskan.</p>
      <Card title="Pemeriksaan pembayaran">
        <p>Pantau permintaan dan tindak lanjut pesanan.</p>
        <div className="stat-list">
          <a className="stat-link" href="#/pemeriksaan?f=belum_diminta"><span>Belum diminta</span><b>{s.belum_diminta}</b></a>
          <a className="stat-link" href="#/pemeriksaan?f=menunggu"><span>Menunggu hasil</span><b>{s.menunggu}</b></a>
          <a className="stat-link" href="#/pemeriksaan?f=hasil_tersedia"><span>Hasil tersedia</span><b>{s.hasil_tersedia}</b></a>
        </div>
        <LinkButton variant="primary" href="#/pemeriksaan">Buka pemeriksaan</LinkButton>
      </Card>
      <Card title="Pesanan laundry sepatu">
        <p>Temukan pesanan melalui ID atau nama pelanggan.</p>
        <LinkButton href="#/pesanan">Lihat pesanan</LinkButton>
        {state.role === 'admin' && <LinkButton href="#/pesanan/baru">Buat pesanan</LinkButton>}
      </Card>
      <InfoBox title="Pisahkan status dan keputusan">Pembayaran tercatat belum memastikan dana masuk. Gunakan hasil pemeriksa yang berwenang.</InfoBox>
      <a className="label" href="#/bantuan">Bantuan pemeriksaan</a>
      <p className="caption text-secondary">Data pada aplikasi ini adalah data contoh fiktif yang ditandai <SampleTag />. <button className="btn-link caption" onClick={() => setConfirm(true)}>Muat ulang data contoh</button></p>
      {confirm && (
        <BottomSheetConfirm title="Muat ulang data contoh?" text="Semua pesanan dan keputusan yang kamu buat akan diganti dengan data contoh."
          confirm="Muat ulang" onConfirm={() => { resetSample(); setConfirm(false) }} onClose={() => setConfirm(false)} />
      )}
    </AppShell>
  )
}

function BottomSheetConfirm({ title, text, confirm, onConfirm, onClose }: { title: string; text: string; confirm: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <BottomSheet title={title} onClose={onClose}>
      <p className="text-secondary">{text}</p>
      <Button onClick={onConfirm}>{confirm}</Button>
      <Button variant="secondary" onClick={onClose}>Batal</Button>
    </BottomSheet>
  )
}


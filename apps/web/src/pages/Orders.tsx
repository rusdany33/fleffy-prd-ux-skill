import { useState } from 'react'
import type { Transaction } from '../domain/types'
import { searchTransactions } from '../domain/rules'
import { useStore } from '../store/StoreContext'
import { replaceQuery, type Route } from '../hooks/useRoute'
import { AppShell, PageHeader } from '../components/layout/AppShell'
import { Button, Card, EmptyState, InfoBox, LinkButton } from '../components/common'
import { OrderCard } from '../components/orders/OrderCard'
import { OrderForm } from '../components/orders/OrderForm'
import { rupiah } from '../utils/format'

// ---------- N1 Transaksi ----------
export function Orders({ route }: { route: Route }) {
  const { state } = useStore()
  const [q, setQ] = useState(route.query.get('q') ?? '')
  const update = (v: string) => { setQ(v); replaceQuery(`/transaksi${v ? `?q=${encodeURIComponent(v)}` : ''}`) }
  const list = searchTransactions([...state.transactions].sort((a, b) => b.seq - a.seq), q)
  const here = `/transaksi${q ? `?q=${encodeURIComponent(q)}` : ''}`
  return (
    <AppShell nav="transaksi" header={{ kind: 'root' }}>
      <PageHeader title="Transaksi" />
      <Card title="Cari transaksi">
        <form role="search" className="stack" onSubmit={(e) => e.preventDefault()}>
          <div className="field">
            <label htmlFor="q" className="visually-hidden">Cari nama pelanggan, nota, atau kode</label>
            <input id="q" type="search" placeholder="Cari nama pelanggan, invoice, atau kode" value={q} onChange={(e) => update(e.target.value)} />
          </div>
          <Button type="submit" variant="secondary">Cari</Button>
        </form>
      </Card>
      {state.transactions.length === 0 ? (
        <EmptyState title="Belum ada transaksi yang tercatat." action={state.role === 'admin' && <LinkButton variant="primary" href="#/transaksi/baru">Buat transaksi</LinkButton>} />
      ) : list.length === 0 ? (
        <EmptyState title="Transaksi tidak ditemukan" text={<>Tidak ada hasil untuk “{q}”. Periksa nomor nota atau nama pelanggan, lalu coba kembali.</>}
          action={<Card title="Coba pencarian lain"><p className="text-secondary">Periksa ejaan atau kosongkan kata pencarian.</p><Button onClick={() => update('')}>Hapus pencarian</Button></Card>} />
      ) : list.map((t) => <OrderCard key={t.id} t={t} from={here} />)}
    </AppShell>
  )
}

// ---------- N1a / ubah ----------
export function OrderNew() {
  return (
    <AppShell nav="transaksi" header={{ kind: 'detail', fallback: '/transaksi' }}>
      <PageHeader title="Buat transaksi" sub="Catat pelanggan, layanan, tagihan, dan pembayaran awal." />
      <OrderForm />
    </AppShell>
  )
}

export function OrderEdit({ tx }: { tx?: Transaction }) {
  return (
    <AppShell nav="transaksi" header={{ kind: 'detail', fallback: tx ? `/transaksi/${tx.id}` : '/transaksi' }}>
      {tx ? <>
        <PageHeader title="Ubah transaksi" identity={`${tx.invoice} · ${tx.customerCode} ${tx.customerName} · ${rupiah(tx.bill)}`} />
        <OrderForm key={tx.id} tx={tx} />
      </> : <InfoBox title="Transaksi tidak ditemukan." />}
    </AppShell>
  )
}

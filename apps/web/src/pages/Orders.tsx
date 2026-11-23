import { useState } from 'react'
import type { Order } from '../domain/types'
import { searchOrders } from '../domain/rules'
import { useStore } from '../store/StoreContext'
import { replaceQuery, type Route } from '../hooks/useRoute'
import { AppShell, PageHeader } from '../components/layout/AppShell'
import { Button, Card, EmptyState, InfoBox, LinkButton } from '../components/common'
import { OrderCard } from '../components/orders/OrderCard'
import { OrderForm } from '../components/orders/OrderForm'
import { methodLabel, rupiah } from '../utils/format'

export function Orders({ route }: { route: Route }) {
  const { state } = useStore()
  const [q, setQ] = useState(route.query.get('q') ?? '')
  const update = (v: string) => { setQ(v); replaceQuery(`/pesanan${v ? `?q=${encodeURIComponent(v)}` : ''}`) }
  const list = searchOrders([...state.orders].sort((a, b) => b.seq - a.seq), q)
  const here = `/pesanan${q ? `?q=${encodeURIComponent(q)}` : ''}`
  return (
    <AppShell nav="pesanan" header={{ kind: 'root' }}>
      <PageHeader title="Pesanan" />
      <Card title="Cari pesanan">
        <form role="search" className="stack" onSubmit={(e) => e.preventDefault()}>
          <div className="field">
            <label htmlFor="q" className="visually-hidden">Cari ID atau nama pelanggan</label>
            <input id="q" type="search" placeholder="Cari ID / nama pelanggan" value={q} onChange={(e) => update(e.target.value)} />
          </div>
          <Button type="submit" variant="secondary">Cari</Button>
        </form>
      </Card>
      {state.role === 'admin' && <LinkButton variant="primary" href="#/pesanan/baru">+ Buat pesanan</LinkButton>}
      {state.orders.length === 0 ? (
        <EmptyState title="Belum ada pesanan yang tercatat." action={state.role === 'admin' && <LinkButton variant="primary" href="#/pesanan/baru">Buat pesanan</LinkButton>} />
      ) : list.length === 0 ? (
        <EmptyState title="Pesanan tidak ditemukan" text={<>Tidak ada hasil untuk “{q}”. Periksa ID atau nama pelanggan, lalu coba kembali.</>}
          action={<Card title="Coba pencarian lain"><p className="text-secondary">Periksa ejaan atau kosongkan kata pencarian.</p><Button onClick={() => update('')}>Hapus pencarian</Button></Card>} />
      ) : list.map((o) => <OrderCard key={o.id} o={o} from={here} showPayment />)}
    </AppShell>
  )
}


export function OrderNew() {
  return (
    <AppShell nav="pesanan" header={{ kind: 'detail', fallback: '/pesanan' }}>
      <PageHeader title="Buat pesanan" sub="Catat pelanggan, layanan, dan pembayaran." />
      <OrderForm />
    </AppShell>
  )
}
export function OrderEdit({ order }: { order?: Order }) {
  return (
    <AppShell nav="pesanan" header={{ kind: 'detail', fallback: order ? `/pesanan/${order.id}` : '/pesanan' }}>
      {order ? <>
        <PageHeader title="Ubah pesanan" identity={`${order.code} · ${methodLabel(order.method)} · ${rupiah(order.amount)}`} />
        <OrderForm key={order.id} order={order} />
      </> : <InfoBox title="Pesanan tidak ditemukan." />}
    </AppShell>
  )
}


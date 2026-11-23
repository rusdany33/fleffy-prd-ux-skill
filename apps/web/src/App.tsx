import { useRoute } from './hooks/useRoute'
import { useStore } from './store/StoreContext'
import { Home } from './pages/Home'
import { Orders, OrderNew, OrderEdit } from './pages/Orders'
import { OrderDetail } from './pages/OrderDetail'
import { ProofPage, DecisionLog } from './pages/Records'
import { Queue } from './pages/Queue'
import { HelpContacts, HelpIndex, HelpStatus, HelpWaiting } from './pages/Help'
import { NotFound } from './pages/NotFound'

/** Hash routing sesuai IA (UX-SPEC §3). */
export default function App() {
  const route = useRoute()
  const { state } = useStore()
  const [a, b, c] = route.path
  const order = state.orders.find((o) => o.id === b)

  if (!a) return <Home />
  if (a === 'pesanan') {
    if (!b) return <Orders route={route} />
    if (b === 'baru') return <OrderNew />
    if (c === 'ubah') return <OrderEdit order={order} />
    if (c === 'bukti') return <ProofPage order={order} />
    if (c === 'keputusan') return <DecisionLog order={order} />
    return <OrderDetail key={b} order={order} route={route} />
  }
  if (a === 'pemeriksaan') return <Queue key={`${state.role}-${route.query.get('f')}`} route={route} />
  if (a === 'bantuan') {
    if (b === 'status') return <HelpStatus route={route} />
    if (b === 'menunggu') return <HelpWaiting route={route} />
    if (b === 'kontak') return <HelpContacts route={route} />
    return <HelpIndex route={route} />
  }
  return <NotFound />
}

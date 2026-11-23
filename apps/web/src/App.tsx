import { useRoute } from './hooks/useRoute'
import { useStore } from './store/StoreContext'
import { Home } from './pages/Home'
import { Orders, OrderNew, OrderEdit } from './pages/Orders'
import { OrderDetail } from './pages/OrderDetail'
import { ProofPage, DecisionLog } from './pages/Records'
import { Queue } from './pages/Queue'
import { HelpContacts, HelpIndex, HelpStatus, HelpWaiting } from './pages/Help'
import { NotFound } from './pages/NotFound'

/** Hash routing sesuai IA (UX-SPEC §3, §7.5). */
export default function App() {
  const route = useRoute()
  const { state } = useStore()
  const [a, b, c, d] = route.path
  const tx = state.transactions.find((t) => t.id === b)

  if (!a) return <Home />
  if (a === 'transaksi') {
    if (!b) return <Orders route={route} />
    if (b === 'baru') return <OrderNew />
    if (c === 'ubah') return <OrderEdit tx={tx} />
    if (c === 'bukti') return <ProofPage tx={tx} entryId={d} />
    if (c === 'riwayat') return <DecisionLog tx={tx} />
    return <OrderDetail key={b} tx={tx} route={route} />
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

import { useState } from 'react'
import { activeRequest, queueKey, searchOrders, type QueueKey } from '../domain/rules'
import { isVerifier } from '../domain/rules'
import { useStore } from '../store/StoreContext'
import { replaceQuery, type Route } from '../hooks/useRoute'
import { AppShell, PageHeader } from '../components/layout/AppShell'
import { Button, Card, EmptyState, InfoBox } from '../components/common'
import { OrderCard } from '../components/orders/OrderCard'
import { VERIFIER_LABEL } from '../utils/format'

const FILTERS: { key: QueueKey; label: string; heading: string; empty: string }[] = [
  { key: 'belum_diminta', label: 'Belum diminta', heading: 'Belum diminta', empty: 'Tidak ada pesanan yang belum diminta.' },
  { key: 'menunggu', label: 'Menunggu hasil', heading: 'Menunggu hasil', empty: 'Tidak ada pesanan yang menunggu hasil.' },
  { key: 'hasil_tersedia', label: 'Hasil tersedia', heading: 'Hasil tersedia', empty: 'Tidak ada hasil yang perlu dibaca.' },
  { key: 'keputusan', label: 'Keputusan tersimpan', heading: 'Keputusan Teruskan tersimpan', empty: 'Belum ada keputusan Teruskan.' },
]

export function Queue({ route }: { route: Route }) {
  const { state } = useStore()
  const role = state.role
  const initF = route.query.get('f') as QueueKey | null
  const [f, setF] = useState<QueueKey>(FILTERS.some((x) => x.key === initF) ? initF! : isVerifier(role) ? 'menunggu' : 'belum_diminta')
  const [q, setQ] = useState(route.query.get('q') ?? '')
  const here = `/pemeriksaan?f=${f}${q ? `&q=${encodeURIComponent(q)}` : ''}`
  const sync = (nf: QueueKey, nq: string) => replaceQuery(`/pemeriksaan?f=${nf}${nq ? `&q=${encodeURIComponent(nq)}` : ''}`)
  const transfers = state.orders.filter((o) => o.method === 'transfer')
  const inFilter = (k: QueueKey) => transfers.filter((o) => queueKey(o) === k)
  const list = searchOrders(inFilter(f), q).sort((a, b) => (activeRequest(a)?.requestedAt ?? a.createdAt).localeCompare(activeRequest(b)?.requestedAt ?? b.createdAt))
  const meta = FILTERS.find((x) => x.key === f)!
  const mine = isVerifier(role) ? transfers.filter((o) => queueKey(o) === 'menunggu' && activeRequest(o)?.verifier === role).length : 0

  return (
    <AppShell nav="pemeriksaan" header={{ kind: 'root' }}>
      <PageHeader title="Pemeriksaan pembayaran" />
      {isVerifier(role) && <InfoBox tone="info" title={`${mine} permintaan menunggu hasil dari ${VERIFIER_LABEL[role]}.`}>Buka pesanan untuk mencatat hasil pemeriksaan.</InfoBox>}
      <Card title="Cari pemeriksaan">
        <div className="field">
          <label htmlFor="qq" className="visually-hidden">Cari ID pesanan</label>
          <input id="qq" type="search" placeholder="Cari ID pesanan" value={q} onChange={(e) => { setQ(e.target.value); sync(f, e.target.value) }} />
        </div>
      </Card>
      <fieldset className="radio-list" role="radiogroup" aria-label="Keadaan pemeriksaan">
        {FILTERS.map((x) => (
          <label key={x.key}>
            <input type="radio" name="queue-filter" checked={f === x.key} onChange={() => { setF(x.key); sync(x.key, q) }} />
            <span aria-hidden>{f === x.key ? '●' : '○'}</span>{x.label}<span className="count">{inFilter(x.key).length}</span>
          </label>
        ))}
      </fieldset>
      <h2 className="heading">{meta.heading}</h2>
      {list.length === 0
        ? <EmptyState title={q ? 'Pesanan tidak ditemukan' : 'Tidak ada pesanan pada keadaan ini.'} text={q ? `Tidak ada hasil untuk “${q}” pada keadaan ${meta.label}.` : meta.empty}
          action={<Button variant="secondary" onClick={() => { setQ(''); setF('belum_diminta'); sync('belum_diminta', '') }}>Lihat semua keadaan</Button>} />
        : list.map((o) => <OrderCard key={o.id} o={o} from={here} />)}
    </AppShell>
  )
}


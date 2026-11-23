import type { Order } from '../../domain/types'
import { activeRequest, currentDecision, hasStaleResult, resultAdequate, verificationState } from '../../domain/rules'
import { methodLabel, rupiah, VERIFIER_LABEL } from '../../utils/format'
import { Card, KeyValue, LinkButton, SampleTag } from '../common'
import { DecisionChip, PaymentChip, VerificationChip } from './StatusChips'

/** Baris konteks kartu (UX-SPEC N2). */
function contextLine(o: Order): string | null {
  if (o.method === 'tunai') return 'Pembayaran tunai — tidak memerlukan pemeriksaan transfer.'
  const d = currentDecision(o)
  const r = activeRequest(o)
  if (d?.type === 'teruskan') return `Keputusan Teruskan tersimpan · dasar ${d.resultId}.`
  if (hasStaleResult(o) && !r) return 'Hasil sebelumnya dibuat untuk data lama. Minta pemeriksaan ulang.'
  const st = verificationState(o)
  if (st === 'belum_diminta') return 'Belum ada permintaan untuk data terbaru.'
  if (st === 'menunggu') return `${r!.id} · ${VERIFIER_LABEL[r!.verifier]} · hasil belum tersedia.`
  if (resultAdequate(o)) return `${VERIFIER_LABEL[r!.verifier]} · ${r!.result!.id}. Baca isi hasil sebelum mengambil keputusan.`
  return `${r!.result!.id} belum memadai untuk keputusan.${d?.type === 'tahan' ? ' Pesanan ditahan.' : ''}`
}

export function OrderCard({ o, from, showPayment }: { o: Order; from: string; showPayment?: boolean }) {
  const ctx = contextLine(o)
  return (
    <Card className="order-card">
      <div className="title"><span>{o.code} · {o.customerName}</span>{o.sample && <SampleTag />}</div>
      <div className="text-secondary">{o.service} ({o.pairs} pasang) · {methodLabel(o.method)}</div>
      <KeyValue rows={[['Tagihan', <span className="num">{rupiah(o.amount)}</span>]]} />
      <div className="chip-row">
        {showPayment && <PaymentChip o={o} />}
        <VerificationChip o={o} />
        <DecisionChip o={o} />
      </div>
      {ctx && <p className="context">{ctx}</p>}
      <LinkButton href={`#/pesanan/${o.id}?from=${encodeURIComponent(from)}`}>Buka {o.code}</LinkButton>
    </Card>
  )
}

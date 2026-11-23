import type { Order } from '../../domain/types'
import { activeRequest, currentDecision, fundsConfirmed, hasStaleResult, resultAdequate, verificationState } from '../../domain/rules'
import { CONCLUSION_LABEL } from '../../utils/format'
import { Chip } from '../common'

/** Pemetaan status → chip, DESIGN-SYSTEM §2.3 */
export function PaymentChip({ o }: { o: Order }) {
  if (o.method === 'tunai') return <Chip>Tunai</Chip>
  return fundsConfirmed(o) ? <Chip tone="success">✓ Dana dikonfirmasi</Chip> : <Chip tone="warning">Pembayaran tercatat</Chip>
}

export function VerificationChip({ o }: { o: Order }) {
  const st = verificationState(o)
  if (st === 'tidak_perlu') return null
  if (st === 'belum_diminta') return <Chip>{hasStaleResult(o) ? 'Perlu diperbarui' : 'Belum diminta'}</Chip>
  if (st === 'menunggu') return <Chip tone="info">Menunggu hasil</Chip>
  if (resultAdequate(o)) return <Chip tone="success">Hasil tersedia</Chip>
  const c = activeRequest(o)!.result!.conclusion
  return <Chip tone={c === 'tidak_sesuai' ? 'danger' : 'warning'}>{CONCLUSION_LABEL[c]}</Chip>
}

export function DecisionChip({ o }: { o: Order }) {
  const d = currentDecision(o)
  if (!d) return null
  return d.type === 'teruskan' ? <Chip tone="success">Diteruskan</Chip> : <Chip tone="warning">Ditahan</Chip>
}

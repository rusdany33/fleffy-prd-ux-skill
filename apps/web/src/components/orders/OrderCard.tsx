import type { Transaction } from '../../domain/types'
import { latestRequest, lastHold, paidConfirmed, paidRecorded, pendingRequest, resultAdequate, verificationState } from '../../domain/rules'
import { VERIFIER_LABEL, rupiah } from '../../utils/format'
import { Card, KeyValue, LinkButton, SampleTag } from '../common'
import { PayChip, StageChip, VerificationChip } from './StatusChips'

/** Baris konteks kartu (UX-SPEC N2 / §7.5). */
function contextLine(t: Transaction): string {
  const st = verificationState(t)
  if (st === 'tidak_perlu') return t.payments.some((p) => !p.cancelled) ? 'Pembayaran tunai — tidak memerlukan pemeriksaan transfer.' : 'Belum ada pembayaran tercatat.'
  if (st === 'belum_diminta') return 'Ada pembayaran non-tunai yang belum diminta pemeriksaannya.'
  const p = pendingRequest(t)
  if (st === 'menunggu' && p) return `${p.id} · ${VERIFIER_LABEL[p.verifier]} · hasil belum tersedia.`
  const r = latestRequest(t)!
  if (resultAdequate(r)) return `${VERIFIER_LABEL[r.verifier]} · ${r.result!.id}. ${t.stage === 'antrian' ? 'Siap diteruskan ke teknisi.' : 'Sudah diteruskan.'}`
  return `${r.result!.id} belum memadai.${lastHold(t) ? ' Transaksi ditahan.' : ''}`
}

export function OrderCard({ t, from }: { t: Transaction; from: string }) {
  return (
    <Card className="order-card">
      <div className="title"><span>{t.invoice}</span>{t.sample && <SampleTag />}</div>
      <div><span className="label">{t.customerCode} · {t.customerName}</span> <span className="text-secondary">· {t.service} ({t.pairs} pasang)</span></div>
      <KeyValue rows={[
        ['Tagihan', <span className="num" key="b">{rupiah(t.bill)}</span>],
        ['Dibayar / dikonfirmasi', <span className="num" key="p">{rupiah(paidRecorded(t))} / {rupiah(paidConfirmed(t))}</span>],
      ]} />
      <div className="chip-row"><PayChip t={t} /><VerificationChip t={t} /><StageChip stage={t.stage} /></div>
      <p className="context">{contextLine(t)}</p>
      <LinkButton href={`#/transaksi/${t.id}?from=${encodeURIComponent(from)}`}>Buka {t.invoice}</LinkButton>
    </Card>
  )
}

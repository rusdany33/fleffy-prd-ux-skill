import type { EntryStatus, Stage, Transaction } from '../../domain/types'
import { activeEntries, fullyConfirmed, isLunas, latestRequest, resultAdequate, verificationState } from '../../domain/rules'
import { CONCLUSION_LABEL, ENTRY_STATUS_LABEL, STAGE_LABEL } from '../../utils/format'
import { Chip } from '../common'

/** DESIGN-SYSTEM §8 — chip status bayar ala Fleffy (tercatat). */
export function PayChip({ t }: { t: Transaction }) {
  return isLunas(t) ? <Chip tone="success">LUNAS</Chip> : <Chip tone="warning">BELUM LUNAS</Chip>
}

export function StageChip({ stage }: { stage: Stage }) {
  return <Chip tone={stage === 'selesai' ? 'success' : stage === 'antrian' ? 'neutral' : 'info'}>{STAGE_LABEL[stage]}</Chip>
}

export function VerificationChip({ t }: { t: Transaction }) {
  const st = verificationState(t)
  if (st === 'tidak_perlu') return activeEntries(t).length ? <Chip>Tunai · tanpa pemeriksaan</Chip> : <Chip>Belum ada pembayaran</Chip>
  if (st === 'belum_diminta') return <Chip>Belum diminta</Chip>
  if (st === 'menunggu') return <Chip tone="info">Menunggu hasil</Chip>
  const r = latestRequest(t)!
  // Lengkap hanya bila seluruh tagihan sudah dikonfirmasi; DP terkonfirmasi ditandai sebagian.
  if (resultAdequate(r)) return fullyConfirmed(t) ? <Chip tone="success">✓ Dana dikonfirmasi</Chip> : <Chip tone="success">✓ Dikonfirmasi sebagian</Chip>
  return <Chip tone={r.result!.conclusion === 'tidak_sesuai' ? 'danger' : 'warning'}>{CONCLUSION_LABEL[r.result!.conclusion]}</Chip>
}

const ENTRY_TONE: Record<EntryStatus, 'neutral' | 'info' | 'success' | 'warning' | 'danger'> = {
  tunai: 'neutral', belum_diminta: 'neutral', menunggu: 'info', dikonfirmasi: 'success', perlu_klarifikasi: 'warning', tidak_sesuai: 'danger',
}
export function EntryChip({ status }: { status: EntryStatus }) {
  return <Chip tone={ENTRY_TONE[status]}>{status === 'dikonfirmasi' ? '✓ ' : ''}{ENTRY_STATUS_LABEL[status]}</Chip>
}

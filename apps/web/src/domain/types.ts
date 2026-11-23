export type Role = 'admin' | 'owner' | 'finance'
export type Verifier = 'owner' | 'finance'
export type PayMethod = 'cash' | 'transfer' | 'ewallet'
export type Conclusion = 'sesuai' | 'perlu_klarifikasi' | 'tidak_sesuai'
export type HoldReason = 'hasil_belum_tersedia' | 'hasil_belum_memadai' | 'data_perlu_dicek' | 'lainnya'
/** Alur status pengerjaan Fleffy (UX-SPEC §7.1). */
export type Stage = 'antrian' | 'diproses' | 'finishing' | 'qc' | 'selesai'

/** Keadaan pemeriksaan transaksi — diturunkan dari entri (UX-SPEC §7.3). */
export type VerificationState = 'tidak_perlu' | 'belum_diminta' | 'menunggu' | 'hasil_tersedia'
/** Status per entri pembayaran (UX-SPEC §7.2). */
export type EntryStatus = 'tunai' | 'belum_diminta' | 'menunggu' | 'dikonfirmasi' | 'perlu_klarifikasi' | 'tidak_sesuai'

export interface PaymentEntry {
  id: string // BYR-NNN-k
  method: PayMethod
  amount: number
  at: string // waktu dicatat kasir
  by: string
  /** Bukti pelanggan — hanya non-tunai. */
  proof?: { sender: string; transferAt: string; note: string }
  cancelled?: boolean
}

export interface Checklist {
  identity: boolean
  amount: boolean
  time: boolean
  received: boolean
}

export interface VerificationResult {
  id: string // HAS-NNN[-B]
  conclusion: Conclusion
  checklist: Checklist
  note: string
  by: Role
  byName: string
  at: string
}

export interface VerificationRequest {
  id: string // PRM-NNN[-B]
  verifier: Verifier
  note: string
  requestedAt: string
  requestedBy: string
  /** Snapshot entri yang diperiksa (FR-06). */
  entries: { id: string; method: PayMethod; amount: number; sender?: string; transferAt?: string }[]
  invoice: string
  customer: string
  result?: VerificationResult
}

export interface StageChange {
  id: string
  kind: 'stage' | 'tahan'
  from?: Stage
  to?: Stage
  reason?: HoldReason
  note: string
  basis?: string // HAS-ID dasar keputusan
  by: string
  at: string
}

export interface HistoryEntry { at: string; actor: string; text: string }

export interface Transaction {
  id: string
  seq: number
  invoice: string // INV-YYMMDD-NNN
  customerCode: string // K-n
  customerName: string
  phone: string
  service: string
  pairs: number
  bill: number // tagihan
  note: string
  stage: Stage
  createdAt: string
  updatedAt: string
  payments: PaymentEntry[]
  requests: VerificationRequest[]
  changes: StageChange[]
  history: HistoryEntry[]
  sample?: boolean
}

export interface Contact { verifier: Verifier; name: string; channel: string; note: string }

export interface AppState {
  version: 2
  seq: number
  role: Role
  names: Record<Role, string>
  contacts: Contact[]
  transactions: Transaction[]
}

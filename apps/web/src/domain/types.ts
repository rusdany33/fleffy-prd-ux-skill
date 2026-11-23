export type Role = 'admin' | 'owner' | 'finance'
export type Verifier = 'owner' | 'finance'
export type PaymentMethod = 'transfer' | 'tunai'
export type Conclusion = 'sesuai' | 'perlu_klarifikasi' | 'tidak_sesuai'
export type DecisionType = 'teruskan' | 'tahan'
export type HoldReason = 'hasil_belum_tersedia' | 'hasil_belum_memadai' | 'data_perlu_dicek' | 'lainnya'

/** Keadaan pemeriksaan — selalu diturunkan dari data (AGENTS §5.1). */
export type VerificationState = 'tidak_perlu' | 'belum_diminta' | 'menunggu' | 'hasil_tersedia'

export interface Proof {
  id: string // BKT-NNN
  amount: number
  transferAt: string
  sender: string
  note: string
}

export interface Checklist {
  identity: boolean // Identitas pesanan dan bukti sesuai
  amount: boolean // Nominal sesuai
  time: boolean // Waktu transfer cocok dengan data bukti
  received: boolean // Dana diterima menurut mutasi rekening
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

export interface RequestSnapshot {
  orderCode: string
  customerName: string
  amount: number
  method: PaymentMethod
  proofId?: string
  proofAmount?: number
  proofAt?: string
}

export interface VerificationRequest {
  id: string // PRM-NNN[-B]
  verifier: Verifier
  note: string
  requestedAt: string
  requestedBy: string
  snapshot: RequestSnapshot
  /** true bila data pesanan berubah setelah permintaan dibuat. */
  stale: boolean
  result?: VerificationResult
}

export interface Decision {
  id: string
  type: DecisionType
  reason?: HoldReason
  note: string
  requestId?: string
  resultId?: string
  by: string
  at: string
}

export interface HistoryEntry {
  at: string
  actor: string
  text: string
}

export interface Order {
  id: string // internal
  code: string // PSN-NNN
  seq: number
  customerName: string
  whatsapp: string
  service: string
  pairs: number
  amount: number
  method: PaymentMethod
  note: string
  proof?: Proof
  createdAt: string
  updatedAt: string
  requests: VerificationRequest[]
  decisions: Decision[]
  history: HistoryEntry[]
  sample?: boolean
}

export interface Contact {
  verifier: Verifier
  name: string
  channel: string
  note: string
}

export interface AppState {
  version: 1
  seq: number
  role: Role
  names: Record<Role, string>
  contacts: Contact[]
  orders: Order[]
}

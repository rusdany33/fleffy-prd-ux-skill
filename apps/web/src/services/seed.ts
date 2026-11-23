import type { AppState, PaymentEntry, Transaction, VerificationRequest } from '../domain/types'
import { customerCode, invoiceNo, paymentId, requestId, resultId } from '../domain/ids'

const ago = (min: number) => new Date(Date.now() - min * 60000).toISOString()
const ALL = { identity: true, amount: true, time: true, received: true }
const ADMIN = 'Ari · Admin'

/** Data contoh fiktif (ditandai `sample`) mengikuti skenario wireframe & aplikasi Fleffy. */
export function seedState(): AppState {
  const d = new Date()
  const mk = (seq: number, name: string, o: Partial<Transaction>): Transaction => ({
    id: `seed-${seq}`, seq, invoice: invoiceNo(seq, d), customerCode: customerCode(seq), customerName: name, phone: `0812345000${seq}`,
    service: 'Deep Clean', pairs: 2, bill: 150000, note: '', stage: 'antrian', createdAt: ago(400 - seq * 10), updatedAt: ago(400 - seq * 10),
    payments: [], requests: [], changes: [], history: [{ at: ago(400 - seq * 10), actor: ADMIN, text: `Transaksi ${invoiceNo(seq, d)} dibuat. Status Antrian.` }],
    sample: true, ...o,
  })
  const pay = (seq: number, k: number, method: PaymentEntry['method'], amount: number, min: number, sender?: string): PaymentEntry => ({
    id: paymentId(seq, k), method, amount, at: ago(min), by: ADMIN,
    proof: method === 'cash' ? undefined : { sender: sender ?? '', transferAt: ago(min + 3), note: 'Bukti dikirim via WhatsApp' },
  })
  const req = (seq: number, attempt: number, entries: PaymentEntry[], verifier: 'owner' | 'finance', min: number, name: string, result?: VerificationRequest['result']): VerificationRequest => ({
    id: requestId(seq, attempt), verifier, note: '', requestedAt: ago(min), requestedBy: ADMIN, invoice: invoiceNo(seq, d), customer: `${customerCode(seq)} ${name}`,
    entries: entries.map((e) => ({ id: e.id, method: e.method, amount: e.amount, sender: e.proof?.sender, transferAt: e.proof?.transferAt })), result,
  })

  const p15 = pay(15, 1, 'transfer', 150000, 300, 'PELANGGAN A')
  const p16 = pay(16, 1, 'transfer', 150000, 280, 'PELANGGAN B')
  const p17 = pay(17, 1, 'transfer', 85000, 260, 'PELANGGAN C')
  const p18 = pay(18, 1, 'ewallet', 50000, 240, 'PELANGGAN D')
  const p19 = pay(19, 1, 'cash', 120000, 220)
  const p20 = pay(20, 1, 'transfer', 50000, 210, 'PELANGGAN F')

  const transactions: Transaction[] = [
    mk(15, 'Pelanggan A', { payments: [p15] }),
    mk(16, 'Pelanggan B', { payments: [p16], requests: [req(16, 1, [p16], 'owner', 200, 'Pelanggan B')] }),
    mk(17, 'Pelanggan C', {
      service: 'Unyellowing', pairs: 1, bill: 85000, payments: [p17],
      requests: [req(17, 1, [p17], 'owner', 190, 'Pelanggan C', { id: resultId(17, 1), conclusion: 'sesuai', checklist: ALL, note: 'Mutasi masuk Rp85.000.', by: 'owner', byName: 'Pak Bayu', at: ago(150) })],
    }),
    mk(18, 'Pelanggan D', {
      service: 'Fast Clean', pairs: 1, bill: 50000, payments: [p18],
      requests: [req(18, 1, [p18], 'finance', 170, 'Pelanggan D', {
        id: resultId(18, 1), conclusion: 'perlu_klarifikasi', checklist: { identity: true, amount: true, time: false, received: false },
        note: 'Nominal cocok, tetapi waktu transfer belum ditemukan di mutasi.', by: 'finance', byName: 'Sinta', at: ago(120),
      })],
    }),
    mk(19, 'Pelanggan E', { service: 'Repaint', pairs: 1, bill: 120000, payments: [p19] }),
    mk(20, 'Pelanggan F', {
      bill: 75000, pairs: 1, stage: 'diproses', payments: [p20],
      requests: [req(20, 1, [p20], 'owner', 205, 'Pelanggan F', { id: resultId(20, 1), conclusion: 'sesuai', checklist: ALL, note: 'DP masuk Rp50.000.', by: 'owner', byName: 'Pak Bayu', at: ago(180) })],
      changes: [{ id: 'c20', kind: 'stage', from: 'antrian', to: 'diproses', note: '', basis: resultId(20, 1), by: ADMIN, at: ago(170) }],
    }),
  ]
  // riwayat ringkas untuk entri contoh
  for (const t of transactions) {
    for (const p of t.payments) t.history.push({ at: p.at, actor: ADMIN, text: `Pembayaran ${p.id} ${p.method === 'cash' ? 'Cash' : p.method === 'transfer' ? 'Bank Transfer' : 'E-Wallet'} Rp${p.amount.toLocaleString('id-ID')} tercatat.` })
    for (const r of t.requests) {
      t.history.push({ at: r.requestedAt, actor: ADMIN, text: `Permintaan ${r.id} (${r.entries.map((e) => e.id).join(', ')}) dikirim ke ${r.verifier === 'owner' ? 'Owner' : 'Finance'}.` })
      if (r.result) t.history.push({ at: r.result.at, actor: `${r.result.byName} · ${r.result.by === 'owner' ? 'Owner' : 'Finance'}`, text: `Hasil ${r.result.id} untuk ${r.id}: ${r.result.conclusion === 'sesuai' ? 'Sesuai' : 'Perlu klarifikasi'}. Catatan: ${r.result.note}` })
    }
    for (const c of t.changes) t.history.push({ at: c.at, actor: c.by, text: `Status Antrian → Diproses (dasar ${c.basis}).` })
    t.history.sort((a, b) => a.at.localeCompare(b.at))
  }

  return {
    version: 2, seq: 20, role: 'admin',
    names: { admin: 'Ari', owner: 'Pak Bayu', finance: 'Sinta' },
    contacts: [
      { verifier: 'owner', name: 'Pak Bayu', channel: 'WhatsApp 0812-0000-0001 (contoh)', note: 'Pemeriksa utama rekening usaha.' },
      { verifier: 'finance', name: 'Sinta', channel: 'WhatsApp 0812-0000-0002 (contoh)', note: 'Pemeriksa pengganti bila Owner belum merespons.' },
    ],
    transactions,
  }
}

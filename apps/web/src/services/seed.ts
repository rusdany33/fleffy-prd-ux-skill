import type { AppState, Order } from '../domain/types'
import { orderCode, proofId, requestId, resultId } from '../domain/ids'

const ago = (min: number) => new Date(Date.now() - min * 60000).toISOString()
const ALL = { identity: true, amount: true, time: true, received: true }

/** Data contoh fiktif (ditandai `sample`) — mengikuti skenario wireframe Worksheet 12. */
export function seedState(): AppState {
  const mk = (seq: number, o: Partial<Order>): Order => ({
    id: `seed-${seq}`, code: orderCode(seq), seq, customerName: '', whatsapp: '', service: 'Deep Cleaning', pairs: 2, amount: 150000,
    method: 'transfer', note: '', createdAt: ago(400 - seq * 10), updatedAt: ago(400 - seq * 10), requests: [], decisions: [],
    history: [{ at: ago(400 - seq * 10), actor: 'Ari · Admin', text: `Pesanan ${orderCode(seq)} dibuat. Pembayaran Bank Transfer tercatat.` }],
    sample: true, ...o,
  })
  const snap = (seq: number, name: string, amount: number, at: string) => ({
    orderCode: orderCode(seq), customerName: name, amount, method: 'transfer' as const, proofId: proofId(seq), proofAmount: amount, proofAt: at,
  })

  const t15 = ago(300), t16 = ago(280), t17 = ago(260), t18 = ago(240)
  const orders: Order[] = [
    mk(15, {
      customerName: 'Pelanggan A', whatsapp: '081234500015',
      proof: { id: proofId(15), amount: 150000, transferAt: t15, sender: 'PELANGGAN A', note: 'Dikirim via WhatsApp' },
    }),
    mk(16, {
      customerName: 'Pelanggan B', whatsapp: '081234500016',
      proof: { id: proofId(16), amount: 150000, transferAt: t16, sender: 'PELANGGAN B', note: 'Dikirim via WhatsApp' },
      requests: [{ id: requestId(16, 1), verifier: 'owner', note: '', requestedAt: ago(200), requestedBy: 'Ari · Admin', stale: false, snapshot: snap(16, 'Pelanggan B', 150000, t16) }],
      history: [
        { at: ago(390), actor: 'Ari · Admin', text: 'Pesanan PSN-016 dibuat. Pembayaran Bank Transfer tercatat.' },
        { at: ago(200), actor: 'Ari · Admin', text: 'Permintaan PRM-016 dikirim ke Owner.' },
      ],
    }),
    mk(17, {
      customerName: 'Pelanggan C', whatsapp: '081234500017', service: 'Unyellowing', pairs: 1, amount: 85000,
      proof: { id: proofId(17), amount: 85000, transferAt: t17, sender: 'PELANGGAN C', note: '' },
      requests: [{
        id: requestId(17, 1), verifier: 'owner', note: '', requestedAt: ago(190), requestedBy: 'Ari · Admin', stale: false, snapshot: snap(17, 'Pelanggan C', 85000, t17),
        result: { id: resultId(17, 1), conclusion: 'sesuai', checklist: ALL, note: 'Mutasi masuk Rp85.000.', by: 'owner', byName: 'Pak Bayu', at: ago(150) },
      }],
      history: [
        { at: ago(380), actor: 'Ari · Admin', text: 'Pesanan PSN-017 dibuat. Pembayaran Bank Transfer tercatat.' },
        { at: ago(190), actor: 'Ari · Admin', text: 'Permintaan PRM-017 dikirim ke Owner.' },
        { at: ago(150), actor: 'Pak Bayu · Owner', text: 'Hasil HAS-017 untuk PRM-017: Sesuai. Catatan: Mutasi masuk Rp85.000.' },
      ],
    }),
    mk(18, {
      customerName: 'Pelanggan D', whatsapp: '081234500018', service: 'Fast Cleaning', pairs: 1, amount: 50000,
      proof: { id: proofId(18), amount: 50000, transferAt: t18, sender: 'PELANGGAN D', note: '' },
      requests: [{
        id: requestId(18, 1), verifier: 'finance', note: '', requestedAt: ago(170), requestedBy: 'Ari · Admin', stale: false, snapshot: snap(18, 'Pelanggan D', 50000, t18),
        result: {
          id: resultId(18, 1), conclusion: 'perlu_klarifikasi', checklist: { identity: true, amount: true, time: false, received: false },
          note: 'Nominal cocok, tetapi waktu transfer belum ditemukan di mutasi.', by: 'finance', byName: 'Sinta', at: ago(120),
        },
      }],
      history: [
        { at: ago(370), actor: 'Ari · Admin', text: 'Pesanan PSN-018 dibuat. Pembayaran Bank Transfer tercatat.' },
        { at: ago(170), actor: 'Ari · Admin', text: 'Permintaan PRM-018 dikirim ke Finance.' },
        { at: ago(120), actor: 'Sinta · Finance', text: 'Hasil HAS-018 untuk PRM-018: Perlu klarifikasi. Catatan: Nominal cocok, tetapi waktu transfer belum ditemukan di mutasi.' },
      ],
    }),
    mk(19, { customerName: 'Pelanggan E', whatsapp: '081234500019', service: 'Repaint', pairs: 1, amount: 120000, method: 'tunai' }),
  ]

  return {
    version: 1, seq: 19, role: 'admin',
    names: { admin: 'Ari', owner: 'Pak Bayu', finance: 'Sinta' },
    contacts: [
      { verifier: 'owner', name: 'Pak Bayu', channel: 'WhatsApp 0812-0000-0001 (contoh)', note: 'Pemeriksa utama rekening usaha.' },
      { verifier: 'finance', name: 'Sinta', channel: 'WhatsApp 0812-0000-0002 (contoh)', note: 'Pemeriksa pengganti bila Owner belum merespons.' },
    ],
    orders,
  }
}

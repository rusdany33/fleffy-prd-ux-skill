import type { Conclusion, HoldReason, Role, Verifier } from '../domain/types'

export const ROLE_LABEL: Record<Role, string> = { admin: 'Admin', owner: 'Owner', finance: 'Finance' }
export const VERIFIER_LABEL: Record<Verifier, string> = { owner: 'Owner', finance: 'Finance' }
export const CONCLUSION_LABEL: Record<Conclusion, string> = { sesuai: 'Sesuai', perlu_klarifikasi: 'Perlu klarifikasi', tidak_sesuai: 'Tidak sesuai' }
export const HOLD_REASON_LABEL: Record<HoldReason, string> = {
  hasil_belum_tersedia: 'Hasil belum tersedia',
  hasil_belum_memadai: 'Hasil belum memadai / perlu klarifikasi',
  data_perlu_dicek: 'Data pesanan atau bukti perlu dicek',
  lainnya: 'Lainnya',
}
export const SERVICES = ['Deep Cleaning', 'Fast Cleaning', 'Unyellowing', 'Repaint', 'Reglue']

export const rupiah = (n: number) => 'Rp' + Math.round(n).toLocaleString('id-ID')

export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export const date = (iso: string) => new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
export const time = (iso: string) => new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'

export function toLocalInput(iso: string) {
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export const methodLabel = (m: 'transfer' | 'tunai') => (m === 'transfer' ? 'Bank Transfer' : 'Tunai')

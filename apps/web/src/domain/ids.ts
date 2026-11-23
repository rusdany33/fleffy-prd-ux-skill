const pad = (n: number) => String(n).padStart(3, '0')
const suffix = (attempt: number) => (attempt <= 1 ? '' : '-' + String.fromCharCode(64 + attempt)) // 2 → -B

const ymd = (d: Date) => `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`

/** Nota mengikuti Fleffy (INV…) dengan pemisah agar mudah dicocokkan (UX02). */
export const invoiceNo = (seq: number, d = new Date()) => `INV-${ymd(d)}-${pad(seq)}`
export const customerCode = (seq: number) => `K-${seq}`
export const paymentId = (seq: number, k: number) => `BYR-${pad(seq)}-${k}`
export const requestId = (seq: number, attempt: number) => `PRM-${pad(seq)}${suffix(attempt)}`
export const resultId = (seq: number, attempt: number) => `HAS-${pad(seq)}${suffix(attempt)}`

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

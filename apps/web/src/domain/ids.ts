const pad = (n: number) => String(n).padStart(3, '0')
const suffix = (attempt: number) => (attempt <= 1 ? '' : '-' + String.fromCharCode(64 + attempt)) // 2 → -B

export const orderCode = (seq: number) => `PSN-${pad(seq)}`
export const proofId = (seq: number) => `BKT-${pad(seq)}`
export const requestId = (seq: number, attempt: number) => `PRM-${pad(seq)}${suffix(attempt)}`
export const resultId = (seq: number, attempt: number) => `HAS-${pad(seq)}${suffix(attempt)}`

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

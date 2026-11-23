import type { AppState } from '../domain/types'
import { seedState } from './seed'

const KEY = 'fleffy-prd-ux-skill:v2'

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const s = JSON.parse(raw) as AppState
      if (s?.version === 2 && Array.isArray(s.transactions)) return s
    }
  } catch { /* penyimpanan tidak tersedia/rusak → data contoh */ }
  return seedState()
}

/** Mengembalikan false bila penyimpanan gagal (INTERACTION-SPEC §2.3). */
export function saveState(s: AppState): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
    return true
  } catch {
    return false
  }
}

export function storageAvailable(): boolean {
  try {
    const k = KEY + ':probe'
    localStorage.setItem(k, '1')
    localStorage.removeItem(k)
    return true
  } catch {
    return false
  }
}

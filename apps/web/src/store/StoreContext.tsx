import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import type { AppState, Role } from '../domain/types'
import { RuleError } from '../domain/actions'
import { loadState, saveState, storageAvailable } from '../services/storage'
import { seedState } from '../services/seed'
import { ROLE_LABEL } from '../utils/format'

export type ToastTone = 'success' | 'info' | 'warning' | 'danger'
interface Toast { id: number; tone: ToastTone; text: string }

export type CommitResult = { ok: true } | { ok: false; kind: 'rule' | 'storage'; message: string }

interface Store {
  state: AppState
  /** Terapkan aksi domain lalu simpan. Penyimpanan gagal → state tidak berubah (tidak ada klaim sukses). */
  commit: (fn: (s: AppState) => AppState) => CommitResult
  /** Muat ulang dari penyimpanan (dipakai tombol "Periksa permintaan/catatan"). */
  reload: () => void
  setRole: (r: Role) => void
  resetSample: () => void
  toasts: Toast[]
  toast: (tone: ToastTone, text: string) => void
  storageOk: boolean
  /** Keadaan accordion per pesanan selama sesi (INTERACTION-SPEC §4.1). */
  sections: Record<string, Record<string, boolean>>
  setSection: (orderId: string, key: string, open: boolean) => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [storageOk] = useState(storageAvailable)
  const [sections, setSections] = useState<Store['sections']>({})
  const stateRef = useRef(state)

  const toast = useCallback((tone: ToastTone, text: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t.slice(-2), { id, tone, text }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  const commit = useCallback((fn: (s: AppState) => AppState): CommitResult => {
    let next: AppState
    try {
      next = fn(stateRef.current)
    } catch (e) {
      return { ok: false, kind: 'rule', message: e instanceof RuleError ? e.message : 'Terjadi kesalahan. Silakan coba kembali.' }
    }
    if (!saveState(next)) return { ok: false, kind: 'storage', message: 'Penyimpanan gagal.' }
    stateRef.current = next
    setState(next)
    return { ok: true }
  }, [])

  const reload = useCallback(() => { const s = loadState(); stateRef.current = s; setState(s) }, [])

  const setRole = useCallback((r: Role) => {
    const next = { ...stateRef.current, role: r }
    saveState(next)
    stateRef.current = next
    setState(next)
    toast('info', `Masuk sebagai ${next.names[r]} · ${ROLE_LABEL[r]}`)
  }, [toast])

  const resetSample = useCallback(() => {
    const next = { ...seedState(), role: stateRef.current.role }
    saveState(next)
    stateRef.current = next
    setState(next)
    setSections({})
    toast('success', 'Data contoh dimuat ulang.')
  }, [toast])

  const setSection = useCallback((orderId: string, key: string, open: boolean) => {
    setSections((s) => ({ ...s, [orderId]: { ...s[orderId], [key]: open } }))
  }, [])

  return (
    <Ctx.Provider value={{ state, commit, reload, setRole, resetSample, toasts, toast, storageOk, sections, setSection }}>
      {children}
    </Ctx.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('StoreProvider tidak ditemukan')
  return s
}

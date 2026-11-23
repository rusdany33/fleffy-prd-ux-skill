import { useState, type ReactNode } from 'react'
import { useStore } from '../../store/StoreContext'
import { goBack } from '../../hooks/useRoute'
import { ROLE_LABEL } from '../../utils/format'
import type { Role } from '../../domain/types'
import { BottomSheet, Button } from '../common'

const NAV = [
  { key: 'beranda', href: '#/', label: 'Beranda', ico: '⌂' },
  { key: 'pesanan', href: '#/pesanan', label: 'Pesanan', ico: '☰' },
  { key: 'pemeriksaan', href: '#/pemeriksaan', label: 'Pemeriksaan', ico: '✓' },
  { key: 'bantuan', href: '#/bantuan', label: 'Bantuan', ico: '?' },
] as const
export type NavKey = (typeof NAV)[number]['key']

/** Header varian root (L0/L1) atau detail (L2) — DESIGN-SYSTEM §6 AppHeader. */
export type HeaderMode = { kind: 'root' } | { kind: 'detail'; fallback: string; helpHref?: string }

export function AppShell({ nav, header, children }: { nav: NavKey; header: HeaderMode; children: ReactNode }) {
  const { state, setRole, toasts, storageOk } = useStore()
  const [roleOpen, setRoleOpen] = useState(false)

  return (
    <div className="shell">
      <header className="app-header">
        {header.kind === 'root' ? (
          <>
            <a href="#/" className="logo">FLEFFY</a>
            <button className="role-btn" onClick={() => setRoleOpen(true)} aria-haspopup="dialog" aria-label={`Peran: ${state.names[state.role]} · ${ROLE_LABEL[state.role]}. Ganti peran`}>
              {state.names[state.role]} · {ROLE_LABEL[state.role]} ▾
            </button>
          </>
        ) : (
          <>
            <button className="back" onClick={() => goBack(header.fallback)}>‹ Kembali</button>
            <a className="help" href={header.helpHref ?? '#/bantuan'}>Bantuan</a>
          </>
        )}
      </header>
      {!storageOk && <div className="global-banner" role="alert">Penyimpanan perangkat tidak tersedia. Perubahan tidak akan tersimpan.</div>}
      <main className="main">{children}</main>
      <nav className="bottom-nav" aria-label="Navigasi utama">
        {NAV.map((n) => (
          <a key={n.key} href={n.href} aria-current={nav === n.key ? 'page' : undefined}>
            <span className="ico" aria-hidden>{n.ico}</span>{n.label}
          </a>
        ))}
      </nav>
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => <div key={t.id} className={`toast toast-${t.tone}`}>{t.text}</div>)}
      </div>
      {roleOpen && (
        <BottomSheet title="Masuk sebagai" onClose={() => setRoleOpen(false)}>
          <p className="text-secondary">Simulasi peran untuk prototipe. Admin mencatat pesanan dan keputusan; Owner/Finance mencatat hasil pemeriksaan.</p>
          {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
            <Button key={r} variant={state.role === r ? 'primary' : 'secondary'} aria-pressed={state.role === r}
              onClick={() => { setRole(r); setRoleOpen(false) }}>
              {state.names[r]} · {ROLE_LABEL[r]}{r !== 'admin' ? ' (Pemeriksa)' : ''}
            </Button>
          ))}
        </BottomSheet>
      )}
    </div>
  )
}

export function PageHeader({ title, identity, sub }: { title: string; identity?: ReactNode; sub?: ReactNode }) {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      {identity && <div className="identity num">{identity}</div>}
      {sub && <p className="sub">{sub}</p>}
    </div>
  )
}

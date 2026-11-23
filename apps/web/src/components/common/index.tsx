import { useEffect, useId, useRef, type ReactNode } from 'react'

type Tone = 'neutral' | 'info' | 'warning' | 'success' | 'danger'

export function Button({ variant = 'primary', size, loading, children, ...rest }:
  { variant?: 'primary' | 'secondary'; size?: 'sm'; loading?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" {...rest} disabled={rest.disabled || loading} aria-busy={loading || undefined}
      className={`btn btn-${variant}${size === 'sm' ? ' btn-sm' : ''}${rest.className ? ' ' + rest.className : ''}`}>
      {loading ? 'Menyimpan…' : children}
    </button>
  )
}

export function LinkButton({ variant = 'secondary', href, children, size }: { variant?: 'primary' | 'secondary'; href: string; children: ReactNode; size?: 'sm' }) {
  return <a className={`btn btn-${variant}${size === 'sm' ? ' btn-sm' : ''}`} href={href}>{children}</a>
}

export function Card({ title, children, className }: { title?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`card${className ? ' ' + className : ''}`}>{title && <h2>{title}</h2>}{children}</section>
}

export function InfoBox({ tone = 'neutral', title, children, role }: { tone?: Tone; title?: ReactNode; children?: ReactNode; role?: 'status' | 'alert' }) {
  return (
    <div className={`info${tone !== 'neutral' ? ` info-${tone}` : ''}`} role={role}>
      {title && <div className="info-title">{title}</div>}
      {children && <div>{children}</div>}
    </div>
  )
}

export function Chip({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`chip${tone !== 'neutral' ? ` chip-${tone}` : ''}`}>{children}</span>
}

export const SampleTag = () => <span className="sample-tag" title="Data contoh fiktif">Contoh</span>

export function KeyValue({ rows }: { rows: [ReactNode, ReactNode][] }) {
  return <dl className="kv">{rows.map(([k, v], i) => <div key={i}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
}

export function Accordion({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  const id = useId()
  return (
    <section className="acc">
      <button type="button" className="acc-header" aria-expanded={open} aria-controls={id} onClick={onToggle}>
        <span>{title}</span><span className="acc-ico" aria-hidden>{open ? '−' : '+'}</span>
      </button>
      {open && <div className="acc-panel" id={id}>{children}</div>}
    </section>
  )
}

export function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? <span className="error" id={`${id}-err`} role="alert">{error}</span> : hint ? <span className="hint" id={`${id}-hint`}>{hint}</span> : null}
    </div>
  )
}

/** aria props untuk input di dalam Field. */
export const fieldAria = (id: string, error?: string) => ({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': error ? `${id}-err` : `${id}-hint` })

export function BottomSheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    const el = ref.current
    el?.querySelector<HTMLElement>('input, button, select, textarea')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && el) {
        const f = [...el.querySelectorAll<HTMLElement>('input, button, select, textarea, a[href]')].filter((x) => !x.hasAttribute('disabled'))
        if (!f.length) return
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus() }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; prev?.focus() }
  }, [onClose])
  return (
    <div className="scrim" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={ref}>
        <div className="handle" aria-hidden />
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </div>
  )
}

export function EmptyState({ title, text, action }: { title: string; text?: ReactNode; action?: ReactNode }) {
  return (
    <>
      <InfoBox title={title}>{text}</InfoBox>
      {action}
    </>
  )
}

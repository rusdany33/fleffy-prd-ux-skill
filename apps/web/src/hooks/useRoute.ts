import { useEffect, useState } from 'react'

export interface Route { path: string[]; query: URLSearchParams; raw: string }

const current = () => window.location.hash.replace(/^#/, '') || '/'

function parse(): Route {
  const raw = current()
  const [p, q = ''] = raw.split('?')
  return { path: p.split('/').filter(Boolean), query: new URLSearchParams(q), raw }
}

/** Tumpukan navigasi di dalam aplikasi, agar ‹ Kembali tidak keluar dari aplikasi. */
const stack: string[] = [current()]
const pathOf = (raw: string) => raw.split('?')[0]

function track() {
  const raw = current()
  if (stack.length > 1 && pathOf(stack[stack.length - 2]) === pathOf(raw)) stack.pop()
  else if (pathOf(stack[stack.length - 1]) !== pathOf(raw)) stack.push(raw)
  stack[stack.length - 1] = raw
}

export function useRoute(): Route {
  const [r, setR] = useState(parse)
  useEffect(() => {
    const on = () => { track(); setR(parse()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return r
}

export const navigate = (to: string) => { window.location.hash = to }

/** Ganti query tanpa menambah riwayat (filter & pencarian dipertahankan saat kembali). */
export function replaceQuery(to: string) {
  history.replaceState(null, '', '#' + to)
  stack[stack.length - 1] = to
}

/** ‹ Kembali: halaman asal bila ada di dalam aplikasi, selain itu halaman induk (INTERACTION-SPEC §2.1). */
export function goBack(fallback: string) {
  if (stack.length > 1) history.back()
  else navigate(fallback)
}

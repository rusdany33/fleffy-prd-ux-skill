import { AppShell, PageHeader } from '../components/layout/AppShell'
import { LinkButton } from '../components/common'

export function NotFound() {
  return (
    <AppShell nav="beranda" header={{ kind: 'root' }}>
      <PageHeader title="Halaman tidak ditemukan" />
      <LinkButton variant="primary" href="#/">Ke Beranda</LinkButton>
    </AppShell>
  )
}


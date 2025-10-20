import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Giriş Yap | E-Anne'
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

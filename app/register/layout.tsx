import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kayıt Ol | E-Anne'
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-screen overflow-hidden">{children}</div>
}

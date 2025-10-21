'use client'
import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function FooterGate() {
  const pathname = usePathname()
  if (pathname === '/login' || pathname === '/register') return null
  return <Footer />
}

import type { Metadata } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'
import Header from '@/components/Header'
import FooterGate from '@/components/FooterGate'
import PromoStrip from '@/components/PromoStrip'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'E-Anne | Erişte ve Doğal Ürünler',
    template: '%s | E-Anne'
  },
  description: 'Anne eli değmiş gibi taze, doğal ve lezzetli erişte. Hızlı kargo, güvenli alışveriş.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/' 
  },
  openGraph: {
    title: 'E-Anne | Erişte ve Doğal Ürünler',
    description: 'Taze ve doğal erişteyi kapına getiriyoruz. Kampanyalar, hızlı kargo! ',
    url: '/',
    siteName: 'E-Anne',
    images: [
      { url: '/logo/e-anne-logo.png', width: 512, height: 512, alt: 'E-Anne Logo' }
    ],
    locale: 'tr_TR',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'E-Anne | Erişte ve Doğal Ürünler',
    description: 'Taze ve doğal erişteyi kapına getiriyoruz.',
    images: ['/logo/e-anne-logo.png']
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <Providers>
          <Header />
          <PromoStrip />
          {children}
          <FooterGate />
        </Providers>
      </body>
    </html>
  )
}

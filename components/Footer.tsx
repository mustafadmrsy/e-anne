import Link from 'next/link'
import { FacebookIcon, InstagramIcon, TiktokIcon } from './icons'

export default function Footer() {
  return (
    <footer className="mt-12 bg-[var(--footer-bg)] text-slate-200">
      <div className="container-narrow py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <img src="/logo/e-anne-logo.png" alt="E-Anne" className="h-8 w-auto" />
          <p className="mt-3 text-sm text-slate-400">Doğal ve lezzetli ürünler.</p>
        </div>
        <div>
          <div className="font-semibold">Quick Links</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-brand">About</Link></li>
            <li><Link href="/contact" className="hover:text-brand">Contact</Link></li>
            <li><Link href="/privacy" className="hover:text-brand">Privacy</Link></li>
            <li><Link href="/faq" className="hover:text-brand">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold">Bize Ulaşın</div>
          <div className="mt-3 text-sm text-slate-400 space-y-1">
            <div>Tel: 0 (555) 555 55 55</div>
            <div>E-posta: destek@e-anne.com</div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Link href="#" aria-label="Facebook" className="p-2 rounded-lg hover:bg-white/10"><FacebookIcon /></Link>
            <Link href="#" aria-label="Instagram" className="p-2 rounded-lg hover:bg-white/10"><InstagramIcon /></Link>
            <Link href="#" aria-label="TikTok" className="p-2 rounded-lg hover:bg-white/10"><TiktokIcon /></Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-narrow py-4 text-xs text-slate-400">© {new Date().getFullYear()} E-Anne. Tüm hakları saklıdır.</div>
      </div>
    </footer>
  )
}

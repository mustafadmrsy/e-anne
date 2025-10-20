'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { CartIcon, UserIcon, SearchIcon, MenuIcon, CloseIcon } from './icons'
import { categories } from '@/lib/categories'
import { useCart } from './CartProvider'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header() {
  const { count } = useCart()
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const catTimer = useRef<NodeJS.Timeout | null>(null)
  const accountBtnRef = useRef<HTMLButtonElement>(null)
  const accountMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchOpen) {
      const id = setTimeout(() => searchRef.current?.focus(), 150)
      return () => clearTimeout(id)
    }
  }, [searchOpen])

  useEffect(() => {
    if (!accountOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setAccountOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [accountOpen])

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [open])

  useEffect(() => {
    if (!accountOpen) return
    const onDown = (e: MouseEvent) => {
      const btn = accountBtnRef.current
      const menu = accountMenuRef.current
      const target = e.target as Node
      if (menu?.contains(target) || btn?.contains(target)) return
      setAccountOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [accountOpen])

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
      <div className="container-narrow h-16 md:h-20 flex items-center justify-between gap-4">
        {/* Sol: Menü + Logo */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition"
            aria-label="Menüyü aç"
            onClick={() => setOpen(true)}
          >
            <MenuIcon />
          </button>
          <Link href="/" className="flex items-center">
            <img
              src="/logo/e-anne-logo.png"
              alt="E-Anne"
              className="h-14 md:h-16 w-auto transition-transform"
            />
          </Link>
        </div>

        {/* Ortadaki Menü (desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          <div
            onMouseEnter={() => {
              if (catTimer.current) clearTimeout(catTimer.current)
              setCatOpen(true)
            }}
            onMouseLeave={() => {
              if (catTimer.current) clearTimeout(catTimer.current)
              catTimer.current = setTimeout(() => setCatOpen(false), 180)
            }}
            className="relative"
          >
            <Link
              href="/categories"
              className="text-slate-700 hover:text-brand border-b-2 border-transparent hover:border-brand transition"
            >
              Kategoriler
            </Link>
            {catOpen && (
              <div className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-lg p-2">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/category/${c.slug}`}
                    className="block px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link
            href="/campaigns"
            className="text-slate-700 hover:text-brand border-b-2 border-transparent hover:border-brand transition"
          >
            Kampanyalar
          </Link>
          <Link
            href="/about"
            className="text-slate-700 hover:text-brand border-b-2 border-transparent hover:border-brand transition"
          >
            Hakkımızda
          </Link>
        </nav>

        {/* Sağ: Arama, Hesap, Sepet */}
        <div className="flex items-center gap-3">
          <button
            aria-label="Ara"
            className="p-2 rounded-full hover:bg-slate-100 text-slate-600"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <SearchIcon />
          </button>
          <div
            className={`transition-all duration-300 overflow-hidden ${
              searchOpen ? 'w-72 opacity-100' : 'w-0 opacity-0'
            }`}
          >
            <label className="relative block">
              <span className="sr-only">Ara</span>
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <SearchIcon />
              </span>
              <input
                ref={searchRef}
                className="w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand"
                placeholder="Ürün, kategori veya marka ara"
                onBlur={(e) => {
                  if (!e.target.value) setSearchOpen(false)
                }}
              />
            </label>
          </div>

          {/* Hesap */}
          <button
            ref={accountBtnRef}
            aria-label="Hesabım"
            className="p-2 rounded-lg hover:bg-slate-100"
            onClick={() => {
              setAccountOpen((v) => !v)
              setCartOpen(false)
            }}
          >
            <UserIcon />
          </button>
          {accountOpen && !open && (
            <div
              ref={accountMenuRef}
              className="absolute right-4 top-16 z-50 w-64"
            >
              <div className="rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5 p-2">
                <Link
                  href="/account"
                  className="block rounded-lg px-3 py-2 hover:bg-slate-50 text-slate-700"
                >
                  Hesabım
                </Link>
                <Link
                  href="/orders"
                  className="mt-1 block rounded-lg px-3 py-2 hover:bg-slate-50 text-slate-700"
                >
                  Siparişlerim
                </Link>
                <Link
                  href="/login"
                  className="mt-1 block rounded-lg px-3 py-2 hover:bg-slate-50 text-slate-700"
                >
                  Giriş Yap
                </Link>
              </div>
            </div>
          )}

          {/* Sepet */}
          <button
            aria-label="Sepet"
            className="relative p-2 rounded-lg hover:bg-slate-100"
            onClick={() => {
              setCartOpen((v) => !v)
              setAccountOpen(false)
            }}
          >
            <CartIcon />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand text-white text-xs px-1.5 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* --- Mobil Menü --- */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[9999] bg-black/40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-0 z-[10000] bg-white min-h-screen shadow-2xl p-0 flex flex-col overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b bg-white">
                <img
                  src="/logo/e-anne-logo.png"
                  alt="E-Anne"
                  className="h-14 w-auto"
                />
                <div className="flex items-center gap-2">
                  <button
                    aria-label="Hesabım"
                    className="p-2.5 rounded-lg hover:bg-slate-100 active:bg-slate-200"
                    onClick={() => {
                      setAccountOpen((v) => !v)
                      setCartOpen(false)
                    }}
                  >
                    <UserIcon />
                  </button>
                  <button
                    aria-label="Sepet"
                    className="relative p-2.5 rounded-lg hover:bg-slate-100 active:bg-slate-200"
                    onClick={() => {
                      setCartOpen((v) => !v)
                      setAccountOpen(false)
                    }}
                  >
                    <CartIcon />
                    {count > 0 && (
                      <span className="absolute -top-1 -right-1 bg-brand text-white text-xs px-1.5 py-0.5 rounded-full">
                        {count}
                      </span>
                    )}
                  </button>
                  <button
                    className="p-2.5 rounded-lg hover:bg-slate-100 active:bg-slate-200"
                    onClick={() => setOpen(false)}
                    aria-label="Menüyü kapat"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </div>
              <div className="p-4 border-b bg-white">
                <label className="relative block">
                  <span className="sr-only">Ara</span>
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <SearchIcon />
                  </span>
                  <input
                    className="w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand"
                    placeholder="Ürün, kategori veya marka ara"
                  />
                </label>
              </div>
              <nav className="flex flex-col py-2 bg-white">
                <Link
                  href="/categories"
                  className="px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 active:bg-slate-100 text-base"
                  onClick={() => setOpen(false)}
                >
                  Kategoriler
                </Link>
                <Link
                  href="/campaigns"
                  className="px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 active:bg-slate-100 text-base"
                  onClick={() => setOpen(false)}
                >
                  Kampanyalar
                </Link>
                <Link
                  href="/about"
                  className="px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 active:bg-slate-100 text-base"
                  onClick={() => setOpen(false)}
                >
                  Hakkımızda
                </Link>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
  </header>
)

}

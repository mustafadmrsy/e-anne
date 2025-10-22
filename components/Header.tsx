'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { CartIcon, UserIcon, SearchIcon, MenuIcon, CloseIcon } from './icons'
import AccountTrigger from './AccountTrigger'
import AccountMenu from './AccountMenu'
import { categories } from '@/lib/categories'
import { useCart } from './CartProvider'
import { motion, AnimatePresence } from 'framer-motion'
import { auth, db } from '@/lib/firebaseClient'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
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
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [isAuthed, setIsAuthed] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSellerApproved, setIsSellerApproved] = useState(false)

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
    let unsubDoc: (() => void) | null = null
    let unsubAdmin: (() => void) | null = null
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setDisplayName(u?.displayName ?? null)
      setIsAuthed(!!u)
      if (unsubDoc) {
        unsubDoc()
        unsubDoc = null
      }
      if (unsubAdmin) {
        unsubAdmin()
        unsubAdmin = null
      }
      if (u) {
        const ref = doc(db, 'users', u.uid)
        unsubDoc = onSnapshot(ref, (snap) => {
          const data = snap.data() as any
          if (data && typeof data.fullName === 'string' && data.fullName.trim()) {
            setDisplayName(data.fullName)
          }
          const st = (data?.sellerStatus || null)
          setIsSellerApproved(st === 'approved')
        })
        const adminRef = doc(db, 'admins', u.uid)
        unsubAdmin = onSnapshot(adminRef, (snap) => {
          setIsAdmin(snap.exists())
        })
      } else {
        setIsAdmin(false)
        setIsSellerApproved(false)
      }
    })
    return () => {
      unsubAuth()
      if (unsubDoc) unsubDoc()
      if (unsubAdmin) unsubAdmin()
    }
  }, [])

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

  useEffect(() => {
    setOpen(false)
    setAccountOpen(false)
    setCartOpen(false)
    setConfirmOpen(false)
  }, [pathname])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

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

          {/* Hesap (desktop) */}
          <div className="relative hidden md:flex items-center gap-1">
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
            {displayName && (
              <span className="hidden md:block text-sm text-slate-700 ml-1">
                {displayName}
              </span>
            )}
            {accountOpen && (
              <div
                ref={accountMenuRef}
                className="absolute left-1/2 top-full mt-2 -translate-x-1/2 transform z-50 w-72"
              >
                <div className="relative rounded-xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 h-4 w-4 rotate-45 bg-white border border-slate-200 border-b-0 border-r-0"></span>
                  <div className="p-3 flex items-center gap-3 border-b">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <UserIcon />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{displayName ?? 'Misafir'}</p>
                      <p className="text-xs text-slate-500">Hesap menüsü</p>
                    </div>
                  </div>
                  <div className="p-2">
                    {isAuthed ? (
                      <>
                        {isSellerApproved && (
                          <>
                            <Link
                              href="/seller"
                              className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50 text-slate-700"
                            >
                              <span className="text-slate-500">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M3 10h18"/></svg>
                              </span>
                              <span>Satıcı Dashboard</span>
                            </Link>
                            <div className="grid grid-cols-2 gap-1 mb-2 px-3">
                              <Link href="/seller/products" className="text-sm text-slate-700 hover:underline">Ürünler</Link>
                              <Link href="/seller/orders" className="text-sm text-slate-700 hover:underline">Siparişler</Link>
                              <Link href="/seller/notifications" className="text-sm text-slate-700 hover:underline">Bildirimler</Link>
                              <Link href="/seller/profile" className="text-sm text-slate-700 hover:underline">Mağaza Profili</Link>
                            </div>
                          </>
                        )}
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50 text-slate-700"
                          >
                            <span className="text-slate-500">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v4H3z"/><path d="M3 11h18v10H3z"/><path d="M7 11v10"/><path d="M17 11v10"/></svg>
                            </span>
                            <span>Admin Paneli</span>
                          </Link>
                        )}
                        <Link
                          href="/account"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50 text-slate-700"
                        >
                          <span className="text-slate-500"><UserIcon /></span>
                          <span>Hesabım</span>
                        </Link>
                        <Link
                          href="/orders"
                          className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50 text-slate-700"
                        >
                          <span className="text-slate-500"><CartIcon /></span>
                          <span>Siparişlerim</span>
                        </Link>
                        <button
                          className="mt-1 w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-red-600 bg-red-50 hover:bg-red-100"
                          onClick={() => setConfirmOpen(true)}
                        >
                          <span className="text-red-500">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                          </span>
                          <span>Çıkış Yap</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50 text-slate-700"
                        >
                          <span className="text-slate-500">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                          </span>
                          <span>Giriş Yap</span>
                        </Link>
                        <Link
                          href="/register"
                          className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50 text-slate-700"
                        >
                          <span className="text-slate-500">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          </span>
                          <span>Kayıt Ol</span>
                        </Link>
                      </>
                    )}
                  </div>
                  {confirmOpen && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                      <div className="w-full mx-3 max-w-sm rounded-xl border border-slate-200 bg-white shadow-xl p-4">
                        <h3 className="text-base font-semibold text-slate-800">Çıkış yapılsın mı?</h3>
                        <p className="mt-1 text-sm text-slate-600">Hesabınızdan çıkış yapmayı onaylıyor musunuz?</p>
                        <div className="mt-4 flex items-center justify-end gap-2">
                          <button
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                            onClick={() => setConfirmOpen(false)}
                          >
                            İptal
                          </button>
                          <button
                            className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                            onClick={async () => {
                              try { 
                                await signOut(auth) 
                              } finally {
                                setConfirmOpen(false)
                                setAccountOpen(false)
                                setToast('Çıkış yapıldı')
                                setTimeout(() => { 
                                  window.location.href = '/' 
                                }, 900)
                              }
                            }}
                          >
                            Evet, çıkış yap
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <button
            aria-label="Sepet"
            className="relative p-2 rounded-lg hover:bg-slate-100"
            onClick={() => {
              setAccountOpen(false)
              setCartOpen(false)
              router.push('/cart')
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
              onClick={(e) => {
                e.stopPropagation()
              }}
              onPointerDown={(e) => {
                e.stopPropagation()
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
              }}
              onTouchStart={(e) => {
                e.stopPropagation()
              }}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b bg-white">
                <img
                  src="/logo/e-anne-logo.png"
                  alt="E-Anne"
                  className="h-14 w-auto"
                />
                <div className="flex items-center gap-2">
                  <AccountTrigger
                    onClick={() => {
                      setAccountOpen((v) => !v)
                      setCartOpen(false)
                    }}
                    showName
                    displayName={displayName}
                  />
                  <button
                    aria-label="Sepet"
                    className="relative p-2.5 rounded-lg hover:bg-slate-100 active:bg-slate-200"
                    onClick={() => {
                      setAccountOpen(false)
                      setCartOpen(false)
                      setOpen(false)
                      router.push('/cart')
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
              {/* Mobil: Hesap/Cart açılır bölümleri */}
              {accountOpen && (
                <AccountMenu
                  variant="mobile"
                  isAuthed={isAuthed}
                  displayName={displayName}
                  onLogoutClick={() => setConfirmOpen(true)}
                  sellerApproved={isSellerApproved}
                  onNavigate={(href) => {
                    router.push(href)
                    // Fallback for some mobile browsers
                    setTimeout(() => {
                      if (typeof window !== 'undefined' && window.location.pathname !== href) {
                        window.location.href = href
                      }
                    }, 0)
                    setOpen(false)
                    setAccountOpen(false)
                  }}
                />
              )}
              {confirmOpen && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
                  <div className="w-full mx-6 max-w-sm rounded-xl border border-slate-200 bg-white shadow-2xl p-4">
                    <h3 className="text-base font-semibold text-slate-800">Çıkış yapılsın mı?</h3>
                    <p className="mt-1 text-sm text-slate-600">Hesabınızdan çıkış yapmayı onaylıyor musunuz?</p>
                    <div className="mt-4 flex items-center justify-end gap-2">
                      <button
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                        onClick={() => setConfirmOpen(false)}
                      >
                        İptal
                      </button>
                      <button
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                        onClick={async () => {
                          try { 
                            await signOut(auth) 
                          } finally {
                            setConfirmOpen(false)
                            setAccountOpen(false)
                            setToast('Çıkış yapıldı')
                            setTimeout(() => { 
                              window.location.href = '/' 
                            }, 900)
                          }
                        }}
                      >
                        Evet, çıkış yap
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {cartOpen && (
                <div className="md:hidden px-4 py-2 border-b bg-white" onClick={(e) => e.stopPropagation()}>
                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-sm text-slate-700">Sepet özeti</p>
                    {count > 0 ? (
                      <p className="text-xs text-slate-500 mt-1">Sepette {count} ürün var.</p>
                    ) : (
                      <p className="text-xs text-slate-500 mt-1">Sepetiniz boş.</p>
                    )}
                  </div>
                </div>
              )}
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
      {/* Basit toast */}
      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 top-4 z-[10001] px-4 py-2 rounded-lg bg-slate-900 text-white text-sm shadow-lg">
          {toast}
        </div>
      )}
    </header>
  )
}
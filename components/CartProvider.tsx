"use client"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type CartItem = {
  slug: string
  name: string
  price: number
  image: string
  qty: number
}

type CartCtx = {
  items: CartItem[]
  count: number
  total: number
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void
  remove: (slug: string) => void
  setQty: (slug: string, qty: number) => void
  clear: () => void
}

const Ctx = createContext<CartCtx | null>(null)

export function useCart() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

const STORAGE_KEY = 'e-anne:cart'

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items])

  const add: CartCtx['add'] = useCallback((item, qty = 1) => {
    setItems(prev => {
      const f = prev.find(x => x.slug === item.slug)
      if (f) return prev.map(x => x.slug === item.slug ? { ...x, qty: x.qty + qty } : x)
      return [...prev, { ...item, qty }]
    })
  }, [])

  const remove: CartCtx['remove'] = useCallback((slug) => {
    setItems(prev => prev.filter(x => x.slug !== slug))
  }, [])

  const setQty: CartCtx['setQty'] = useCallback((slug, qty) => {
    setItems(prev => prev.map(x => x.slug === slug ? { ...x, qty } : x))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const count = items.reduce((s, i) => s + i.qty, 0)
  const total = items.reduce((s, i) => s + i.qty * i.price, 0)

  const value = useMemo(() => ({ items, count, total, add, remove, setQty, clear }), [items, count, total, add, remove, setQty, clear])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

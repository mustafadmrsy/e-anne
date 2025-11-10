"use client"
import { createContext, useCallback, useContext, useMemo, useState } from "react"

type CartUICtx = {
  open: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

const Ctx = createContext<CartUICtx | null>(null)

export function useCartUI() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useCartUI must be used within CartUIProvider")
  return ctx
}

export default function CartUIProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  const openCart = useCallback(() => setOpen(true), [])
  const closeCart = useCallback(() => setOpen(false), [])
  const toggleCart = useCallback(() => setOpen(v => !v), [])

  const value = useMemo(() => ({ open, openCart, closeCart, toggleCart }), [open, openCart, closeCart, toggleCart])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

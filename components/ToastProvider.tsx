"use client"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type Toast = { id: number; message: string }

type ToastCtx = {
  show: (message: string) => void
}

const Ctx = createContext<ToastCtx | null>(null)

export function useToast() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((message: string) => {
    const id = Date.now()
    setToasts(t => [...t, { id, message }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2000)
  }, [])

  const value = useMemo(() => ({ show }), [show])

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] space-y-2">
        {toasts.map(t => (
          <div key={t.id} className="rounded-lg bg-secondary text-white px-4 py-2 shadow-lg">
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

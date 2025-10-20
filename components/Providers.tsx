"use client"
import CartProvider from './CartProvider'
import ToastProvider from './ToastProvider'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </ToastProvider>
  )
}

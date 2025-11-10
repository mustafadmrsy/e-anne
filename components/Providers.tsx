"use client"
import CartProvider from './CartProvider'
import ToastProvider from './ToastProvider'
import CartUIProvider from './CartUIProvider'
import CartDrawer from './CartDrawer'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <CartProvider>
        <CartUIProvider>
          {children}
          <CartDrawer />
        </CartUIProvider>
      </CartProvider>
    </ToastProvider>
  )
}

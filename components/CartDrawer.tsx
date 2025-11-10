"use client"
import Link from "next/link"
import { useCart } from "./CartProvider"
import { useCartUI } from "./CartUIProvider"

export default function CartDrawer() {
  const { open, closeCart } = useCartUI()
  const { items, setQty, remove, total } = useCart()

  const overlayCls = `fixed inset-0 z-[9998] bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`
  const panelCls = `fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-[9999] flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`

  return (
    <>
      <div className={overlayCls} onClick={closeCart} />
      <aside className={panelCls} aria-hidden={!open}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="text-lg font-bold text-[#2b2b2b] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true"><path d="M16 10a4 4 0 0 1-8 0"></path><path d="M3.103 6.034h17.794"></path><path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z"></path></svg>
            Sepetim ({items.length})
          </div>
          <button className="p-1 hover:bg-gray-100 rounded-full transition-colors" aria-label="Sepeti kapat" onClick={closeCart}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#2b2b2b]" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-sm text-gray-500">Sepetiniz boş.</div>
          ) : (
            <div className="space-y-3">
              {items.map((it) => (
                <div key={it.slug} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <img src={it.image} alt={it.name} className="object-cover rounded-md w-12 h-12" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[#2b2b2b] text-sm truncate">{it.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm font-bold text-teal-600">₺{(it.price).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between h-full items-center py-1">
                    <div className="flex items-center gap-1 bg-white rounded-md border border-gray-200 p-1">
                      <button className="p-1 hover:bg-gray-100 rounded" aria-label="Miktarı azalt" onClick={() => setQty(it.slug, Math.max(1, it.qty - 1))}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-gray-600" aria-hidden="true"><path d="M5 12h14"></path></svg>
                      </button>
                      <span className="w-6 text-center text-sm font-medium text-[#2b2b2b]">{it.qty}</span>
                      <button className="p-1 hover:bg-gray-100 rounded" aria-label="Miktarı artır" onClick={() => setQty(it.slug, Math.min(99, it.qty + 1))}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-gray-600" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                      </button>
                    </div>
                    <button className="mt-2 text-xs text-red-600 hover:underline" onClick={() => remove(it.slug)}>Kaldır</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center text-gray-600">
              <span>Ara Toplam:</span>
              <span>₺{total.toFixed(2)}</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#2b2b2b]">Genel Toplam:</span>
              <span className="text-lg font-bold text-teal-600">₺{total.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <Link
              href="/cart"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-2"
              onClick={closeCart}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true"><path d="M16 10a4 4 0 0 1-8 0"></path><path d="M3.103 6.034h17.794"></path><path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z"></path></svg>
              Sepete Git
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}

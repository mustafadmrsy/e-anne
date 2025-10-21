"use client"

import Link from "next/link"
import { useCart } from "@/components/CartProvider"

export default function CartPage() {
  const { items, total, setQty, remove, clear } = useCart()
  return (
    <main className="container-narrow py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-secondary">Sepetim</h1>
      {items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-slate-200 p-6 text-center bg-white">
          <p className="text-slate-600">Sepetiniz boş.</p>
          <Link href="/" className="inline-block mt-3 px-4 py-2 rounded-lg bg-brand text-white hover:bg-brand/90">Alışverişe Başla</Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {items.map((it) => (
              <div key={it.slug} className="rounded-xl border border-slate-200 bg-white p-3 flex items-center gap-3">
                <img src={it.image} alt={it.name} className="h-16 w-16 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${it.slug}`} className="font-medium text-slate-800 hover:text-brand line-clamp-1">
                    {it.name}
                  </Link>
                  <p className="text-sm text-slate-500 mt-0.5">₺{(it.price * it.qty).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button aria-label="Azalt" className="w-8 h-8 rounded-lg border hover:bg-slate-50" onClick={() => setQty(it.slug, Math.max(1, it.qty - 1))}>-</button>
                  <input aria-label="Adet" value={it.qty} onChange={(e) => {
                    const v = parseInt(e.target.value || "1", 10)
                    if (!Number.isNaN(v) && v > 0) setQty(it.slug, v)
                  }} className="w-12 text-center rounded-lg border py-1" />
                  <button aria-label="Arttır" className="w-8 h-8 rounded-lg border hover:bg-slate-50" onClick={() => setQty(it.slug, it.qty + 1)}>+</button>
                </div>
                <button aria-label="Kaldır" className="ml-2 px-3 py-1.5 rounded-lg border text-slate-600 hover:bg-slate-50" onClick={() => remove(it.slug)}>
                  Kaldır
                </button>
              </div>
            ))}
          </div>
          <aside className="lg:col-span-1">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Ara Toplam</span>
                <span className="font-semibold text-slate-800">₺{total.toFixed(2)}</span>
              </div>
              <button className="mt-4 w-full rounded-lg bg-brand text-white py-2.5 hover:bg-brand/90">Ödemeye Geç</button>
              <button className="mt-2 w-full rounded-lg border py-2.5 hover:bg-slate-50" onClick={() => clear()}>Sepeti Temizle</button>
            </div>
          </aside>
        </div>
      )}
    </main>
  )
}

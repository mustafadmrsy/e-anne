"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { auth, db } from "@/lib/firebaseClient"
import { onAuthStateChanged } from "firebase/auth"
import { collection, getDocs, orderBy, query } from "firebase/firestore"

type Order = { id: string; status: string; createdAt?: any; totals?: { payable: number } }

export default function Page() {
  const [uid, setUid] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [productCount, setProductCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return
      setUid(u.uid)
      try {
        const ocol = collection(db, "sellers", u.uid, "orders")
        const osnap = await getDocs(query(ocol, orderBy("createdAt", "desc")))
        const arr: Order[] = []
        osnap.forEach(d => arr.push({ id: d.id, ...(d.data() as any) }))
        setOrders(arr)

        const pcol = collection(db, "sellers", u.uid, "products")
        const psnap = await getDocs(pcol)
        setProductCount(psnap.size)
      } finally { setLoading(false) }
    })
    return () => unsub()
  }, [])

  const revenue7 = useMemo(() => {
    const now = Date.now()
    const cutoff = now - 7*24*60*60*1000
    return orders.reduce((sum, o) => {
      const ms = o.createdAt?.toMillis ? o.createdAt.toMillis() : 0
      if (ms >= cutoff) return sum + (o.totals?.payable || 0)
      return sum
    }, 0)
  }, [orders])

  const pendingOrders = useMemo(() => orders.filter(o => o.status === 'hazırlanıyor').length, [orders])

  const fmt = (n: number) => `₺${(n||0).toFixed(2)}`

  return (
    <main className="px-1 sm:px-0">
      <h1 className="text-xl sm:text-2xl font-semibold">Satıcı Dashboard</h1>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">Son 7 Gün Kazanç</div>
          <div className="mt-1 text-2xl font-bold">{fmt(revenue7)}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">Bekleyen Sipariş</div>
          <div className="mt-1 text-2xl font-bold">{pendingOrders}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">Ürün Sayısı</div>
          <div className="mt-1 text-2xl font-bold">{productCount}</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/seller/products" className="rounded-2xl border p-5 bg-white hover:border-brand">
          <h2 className="font-semibold text-slate-900">Ürünler</h2>
          <p className="text-sm text-slate-600">Ürün ekleyin, düzenleyin, stok yönetin.</p>
        </Link>
        <Link href="/seller/orders" className="rounded-2xl border p-5 bg-white hover:border-brand">
          <h2 className="font-semibold text-slate-900">Siparişler</h2>
          <p className="text-sm text-slate-600">Siparişleri görüntüleyin ve yönetin.</p>
        </Link>
        <Link href="/seller/payouts" className="rounded-2xl border p-5 bg-white hover:border-brand">
          <h2 className="font-semibold text-slate-900">Kazançlar</h2>
          <p className="text-sm text-slate-600">Ödemeler ve bakiye bilgileri.</p>
        </Link>
        <Link href="/seller/profile" className="rounded-2xl border p-5 bg-white hover:border-brand">
          <h2 className="font-semibold text-slate-900">Mağaza Ayarları</h2>
          <p className="text-sm text-slate-600">Mağaza bilgilerinizi güncelleyin.</p>
        </Link>
      </div>
    </main>
  );
}

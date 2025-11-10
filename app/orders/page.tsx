"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { auth, db } from "@/lib/firebaseClient"
import { onAuthStateChanged } from "firebase/auth"
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore"

type OrderItem = { slug: string; name: string; image: string; price: number; qty: number }
type Order = {
  id: string
  orderNo: string
  status: string
  createdAt?: any
  items: OrderItem[]
  totals?: { subtotal: number; discount: number; shipping: number; payable: number }
  trackingUrl?: string | null
}

export default function OrdersPage() {
  const router = useRouter()
  const [uid, setUid] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [status, setStatus] = useState<string>("all")
  const [range, setRange] = useState<string>("90")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login")
        return
      }
      setUid(u.uid)
      try {
        const snap = await getDocs(collection(db, "users", u.uid, "orders"))
        const list: Order[] = []
        snap.forEach((d) => {
          const data = d.data() as any
          list.push({
            id: d.id,
            orderNo: data.orderNo,
            status: data.status,
            createdAt: data.createdAt,
            items: data.items || [],
            totals: data.totals,
            trackingUrl: data.trackingUrl ?? null
          })
        })
        setOrders(list.sort((a, b) => {
          const ta = (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0) as number
          const tb = (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0) as number
          return tb - ta
        }))
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [router])

  const filtered = useMemo(() => {
    const now = Date.now()
    const days = parseInt(range, 10)
    const cutoff = now - days * 24 * 60 * 60 * 1000
    return orders.filter((o) => {
      const t = o.createdAt?.toMillis ? o.createdAt.toMillis() : 0
      const byDate = isNaN(cutoff) ? true : t >= cutoff
      const byStatus = status === "all" ? true : o.status === status
      return byDate && byStatus
    })
  }, [orders, status, range])

  const fmt = (n: number) => `₺${n.toFixed(2)}`
  const fDate = (ts: any) => {
    try {
      const ms = ts?.toMillis ? ts.toMillis() : (typeof ts === 'number' ? ts : 0)
      if (!ms) return "-"
      const d = new Date(ms)
      return d.toLocaleDateString('tr-TR', { year: 'numeric', month: '2-digit', day: '2-digit' })
    } catch { return '-' }
  }

  const deleteOrder = async (id: string) => {
    if (!uid) return
    try {
      await deleteDoc(doc(collection(db, "users", uid, "orders"), id))
      setOrders((prev) => prev.filter((o) => o.id !== id))
    } catch {}
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-secondary">Siparişlerim</h1>

      <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <select value={status} onChange={(e)=>setStatus(e.target.value)} className="rounded-lg border px-3 py-2">
            <option value="all">Tümü</option>
            <option value="hazırlanıyor">Hazırlanıyor</option>
            <option value="kargoda">Kargoda</option>
            <option value="teslim edildi">Teslim Edildi</option>
            <option value="iptal">İptal</option>
          </select>
          <select value={range} onChange={(e)=>setRange(e.target.value)} className="rounded-lg border px-3 py-2">
            <option value="30">Son 30 gün</option>
            <option value="90">Son 3 ay</option>
            <option value="365">Son 1 yıl</option>
            <option value="10000">Tümü</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 animate-pulse space-y-3">
          <div className="h-20 rounded-xl bg-slate-200" />
          <div className="h-20 rounded-xl bg-slate-200" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 rounded-xl border border-slate-200 p-6 bg-white">
          <p className="text-sm text-slate-600">Kriterlere uygun sipariş bulunamadı.</p>
          <Link href="/" className="inline-block mt-3 px-4 py-2 rounded-lg bg-brand text-white">Alışverişe Başla</Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4">
          {filtered.map((o) => (
            <div key={o.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-slate-600">{fDate(o.createdAt)} • {o.orderNo}</div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    o.status === 'teslim edildi' ? 'bg-emerald-50 text-emerald-700' : (o.status === 'kargoda' || o.status === 'kargolandı') ? 'bg-blue-50 text-blue-700' : o.status === 'iptal' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                  }`}>{o.status}</span>
                  {o.trackingUrl ? (
                    <a href={o.trackingUrl} target="_blank" className="text-sm text-brand underline">Kargoyu Takip Et</a>
                  ) : null}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 overflow-x-auto">
                {o.items.slice(0,6).map((it) => (
                  <Link key={it.slug} href={`/product/${it.slug}`} className="flex items-center gap-2 min-w-[160px]">
                    <img src={it.image} alt={it.name} className="h-12 w-12 rounded-md object-cover" />
                    <span className="text-sm text-slate-700 line-clamp-1">{it.name} × {it.qty}</span>
                  </Link>
                ))}
                {o.items.length > 6 ? <span className="text-sm text-slate-500">+{o.items.length - 6} daha</span> : null}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-slate-800 font-medium">Toplam: {fmt(o.totals?.payable || 0)}</div>
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-lg border px-3 py-1.5">Fatura İndir</button>
                  <button className="rounded-lg border px-3 py-1.5">İade Talebi</button>
                  <button className="rounded-lg border border-red-300 text-red-600 px-3 py-1.5" onClick={()=>deleteOrder(o.id)}>Siparişi Sil</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

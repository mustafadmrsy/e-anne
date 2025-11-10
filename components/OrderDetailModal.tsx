"use client"

import { useEffect, useState } from "react"

type OrderItem = { name: string; image?: string; price: number; qty: number }
export type SellerOrder = {
  id: string
  orderNo: string
  status: string
  createdAt?: any
  totals?: { payable: number }
  items: OrderItem[]
  customerId?: string
  trackingUrl?: string
}

type Props = {
  open: boolean
  order: SellerOrder | null
  onClose: () => void
  onUpdateStatus: (id: string, status: string) => Promise<void> | void
  onSaveTracking: (id: string, url: string) => Promise<void> | void
}

export default function OrderDetailModal({ open, order, onClose, onUpdateStatus, onSaveTracking }: Props) {
  const [track, setTrack] = useState<string>("")
  const [copied, setCopied] = useState(false)

  useEffect(()=>{
    setTrack(order?.trackingUrl || "")
  }, [order])

  if (!open || !order) return null

  const fmt = (n: number) => `₺${(n||0).toFixed(2)}`
  const fDate = (ts: any) => { try { const ms = ts?.toMillis ? ts.toMillis() : 0; if (!ms) return "-"; const d = new Date(ms); return d.toLocaleString('tr-TR') } catch { return '-' } }

  const save = async () => { if (!order) return; await onSaveTracking(order.id, track || "") }
  const copy = async () => {
    try { if (!track) return; await navigator.clipboard.writeText(track); setCopied(true); setTimeout(()=>setCopied(false), 1200) } catch {}
  }

  const statusBtn = (label: string, value: string, color: string, icon: string) => (
    <button onClick={()=>onUpdateStatus(order.id, value)} className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${order.status===value? `${color} text-white border-transparent` : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"}`}>
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-lg">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">Sipariş</div>
            <div className="text-base font-semibold text-slate-800">{order.orderNo}</div>
          </div>
          <button onClick={onClose} className="rounded-lg border px-3 py-1.5">Kapat</button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-500">Tarih</div>
              <div className="text-sm text-slate-800">{fDate(order.createdAt)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Durum</div>
              <div className="text-sm text-slate-800">{order.status}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Toplam</div>
              <div className="text-sm text-slate-800">{fmt(order.totals?.payable || 0)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Müşteri</div>
              <div className="text-sm text-slate-800">{order.customerId || "—"}</div>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-slate-800 mb-2">Ürünler</div>
            <div className="space-y-2">
              {order.items.map((it, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {it.image ? <img src={it.image} className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 rounded bg-slate-100" />}
                    <div className="text-slate-800 text-sm">{it.name}</div>
                  </div>
                  <div className="text-slate-700 text-sm">{it.qty} × {fmt(it.price)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border p-3">
              <div className="text-xs text-slate-500 mb-2">Durumu Güncelle</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button onClick={()=>onUpdateStatus(order.id, "hazırlanıyor")} className={`w-full inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm justify-start ${order.status==="hazırlanıyor"? "bg-amber-500 text-white border-transparent" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"}`}>
                  <span>⏳</span><span>Hazırlanıyor</span>
                </button>
                <button onClick={()=>onUpdateStatus(order.id, "kargolandı")} className={`w-full inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm justify-start ${order.status==="kargolandı"? "bg-sky-600 text-white border-transparent" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"}`}>
                  <span>📦</span><span>Kargolandı</span>
                </button>
                <button onClick={()=>onUpdateStatus(order.id, "teslim edildi")} className={`w-full inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm justify-start ${order.status==="teslim edildi"? "bg-emerald-600 text-white border-transparent" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"}`}>
                  <span>✅</span><span>Teslim</span>
                </button>
                <button onClick={()=>onUpdateStatus(order.id, "iptal")} className={`w-full inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm justify-start ${order.status==="iptal"? "bg-red-600 text-white border-transparent" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"}`}>
                  <span>✖️</span><span>İptal</span>
                </button>
              </div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-slate-500 mb-2">Kargo Takip</div>
              <div className="space-y-2">
                <input value={track} onChange={(e)=>setTrack(e.target.value)} placeholder="https://takip..." className="w-full rounded-lg border px-3 py-2 text-sm" />
                <div className="flex gap-2">
                  <button onClick={save} className="rounded-lg bg-brand text-white px-3 py-2 text-sm">Kaydet</button>
                  <button onClick={copy} className="rounded-lg border px-3 py-2 text-sm">{copied?"Kopyalandı":"Kopyala"}</button>
                </div>
              </div>
              {order.trackingUrl ? <a href={order.trackingUrl} target="_blank" className="text-xs text-brand underline mt-1 inline-block">Mevcut takip bağlantısını aç</a> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { notFound, useRouter } from 'next/navigation'
import { useCart } from '@/components/CartProvider'
import { useCartUI } from '@/components/CartUIProvider'
import { useEffect, useMemo, useState } from 'react'
import { auth } from '@/lib/firebaseClient'
import { onAuthStateChanged, getIdToken } from 'firebase/auth'

export default function ProductPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { add } = useCart()
  const { openCart } = useCartUI()
  const [prod, setProd] = useState<any | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [qty, setQty] = useState<number>(1)
  const inc = () => setQty(v => Math.min(99, v + 1))
  const dec = () => setQty(v => Math.max(1, v - 1))
  const [uid, setUid] = useState<string | null>(null)
  const isOwner = useMemo(()=> uid && prod?.sellerId && uid === prod.sellerId, [uid, prod])
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState<number>(5)
  const [comment, setComment] = useState<string>('')
  const [replyText, setReplyText] = useState<Record<string, string>>({})

  useEffect(() => {
    let alive = true
    fetch(`/api/products?slug=${encodeURIComponent(params.slug)}`).then(r=>r.json()).then(d=>{
      if (!alive) return
      const item = d?.items?.[0] || null
      setProd(item)
      setLoaded(true)
    }).catch(()=>{})
    return () => { alive = false }
  }, [params.slug])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null))
    return () => unsub()
  }, [])

  if (!loaded) {
    return (
      <main className="container-narrow py-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6">Yükleniyor...</div>
      </main>
    )
  }
  if (!prod) return notFound()
  const priceNumber = Number(prod.price || 0)

  return (
    <main className="container py-6 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Görsel / Galeri */}
        <section className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
            <div className="w-full aspect-[4/3] bg-white flex items-center justify-center">
              <img
                src={prod.image}
                alt={prod.name}
                className="max-h-[420px] w-auto object-contain"
              />
            </div>
          </div>

          {/* Yorumlar */}
          <div className="mt-6 sm:mt-8 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800">Değerlendirmeler</h2>
              <div className="text-xs sm:text-sm text-slate-600">{(prod.ratingAvg||0).toFixed(1)} / 5 • {prod.ratingCount || 0} yorum</div>
            </div>
            {/* Yorum formu */}
            {uid ? (
              <form className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-3" onSubmit={async (e)=>{
                e.preventDefault()
                setSubmitting(true)
                try {
                  const token = await getIdToken(auth.currentUser!)
                  const res = await fetch('/api/reviews', {
                    method: 'POST',
                    headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ slug: params.slug, rating, comment })
                  })
                  if (res.ok) {
                    setComment('')
                    // yeniden yükle
                    const d = await fetch(`/api/products?slug=${encodeURIComponent(params.slug)}`).then(r=>r.json())
                    setProd(d?.items?.[0] || prod)
                  }
                } finally { setSubmitting(false) }
              }}>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-600 mb-1">Puan</label>
                  <select value={rating} onChange={(e)=>setRating(parseInt(e.target.value,10))} className="w-full rounded-lg border px-3 py-2 text-sm">
                    {[5,4,3,2,1].map(v=> <option key={v} value={v}>{v} ★</option>)}
                  </select>
                </div>
                <div className="sm:col-span-8">
                  <label className="block text-xs text-slate-600 mb-1">Yorumunuz</label>
                  <input value={comment} onChange={(e)=>setComment(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Ürünü nasıl buldunuz?" />
                </div>
                <div className="sm:col-span-2 flex items-end">
                  <button disabled={submitting || !comment.trim()} className="w-full rounded-lg bg-brand text-white px-4 py-2 text-sm disabled:opacity-50">Gönder</button>
                </div>
                <p className="sm:col-span-12 text-xs text-slate-500">Satıcı veya admin olarak cevap yazarsanız rozet görünecek.</p>
              </form>
            ) : (
              <div className="mt-3 text-sm text-slate-600">Yorum yazmak için giriş yapın.</div>
            )}

            {/* Liste */}
            {Array.isArray(prod.reviews) && prod.reviews.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {prod.reviews.map((r: any, i: number) => (
                  <li key={i} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-slate-800 truncate">{r.userName || 'Kullanıcı'}</div>
                          {r.role && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${r.role==='seller' ? 'border-amber-300 text-amber-700' : r.role==='admin' ? 'border-purple-300 text-purple-700' : 'border-slate-300 text-slate-600'}`}>{r.role==='seller'?'Mağaza':r.role==='admin'?'Admin':'Alıcı'}</span>
                          )}
                        </div>
                        {r.comment && <p className="mt-1 text-sm text-slate-700 break-words">{r.comment}</p>}
                      </div>
                      <div className="text-amber-500 text-base shrink-0">{'★★★★★'.slice(0, Math.floor(r.rating||0))}{'☆☆☆☆☆'.slice(0, 5-Math.floor(r.rating||0))}</div>
                    </div>
                    {/* Replies */}
                    {Array.isArray(r.replies) && r.replies.length > 0 && (
                      <ul className="mt-2 space-y-2">
                        {r.replies.map((rp:any, idx:number) => (
                          <li key={idx} className="ml-4 pl-3 border-l">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-slate-800">{rp.userName || 'Kullanıcı'}</div>
                              {rp.role && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${rp.role==='seller' ? 'border-amber-300 text-amber-700' : rp.role==='admin' ? 'border-purple-300 text-purple-700' : 'border-slate-300 text-slate-600'}`}>{rp.role==='seller'?'Mağaza':rp.role==='admin'?'Admin':'Alıcı'}</span>
                              )}
                            </div>
                            {rp.comment && <p className="mt-0.5 text-sm text-slate-700 break-words">{rp.comment}</p>}
                          </li>
                        ))}
                      </ul>
                    )}
                    {/* Reply form (satıcı veya admin için varsayılan) */}
                    {(uid && (isOwner)) && (
                      <form className="mt-2 flex items-center gap-2" onSubmit={async (e)=>{
                        e.preventDefault()
                        const text = replyText[r.id || String(i)] || ''
                        if (!text.trim()) return
                        try {
                          const token = await getIdToken(auth.currentUser!)
                          const res = await fetch('/api/reviews', {
                            method: 'POST',
                            headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ slug: params.slug, parentId: r.id || prod.reviewsIds?.[i] || null, comment: text })
                          })
                          if (res.ok) {
                            setReplyText(prev=>({ ...prev, [r.id || String(i)]: '' }))
                            const d = await fetch(`/api/products?slug=${encodeURIComponent(params.slug)}`).then(r=>r.json())
                            setProd(d?.items?.[0] || prod)
                          }
                        } catch {}
                      }}>
                        <input value={replyText[r.id || String(i)]||''} onChange={(e)=>setReplyText(prev=>({ ...prev, [r.id || String(i)]: e.target.value }))} className="flex-1 rounded-lg border px-3 py-1.5 text-sm" placeholder="Yanıt yaz..." />
                        <button className="rounded-lg border px-3 py-1.5 text-sm">Yanıtla</button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-3 text-sm text-slate-600">Bu ürün için henüz yorum yok.</div>
            )}
          </div>
        </section>

        {/* Detaylar + Buy Box */}
        <section className="lg:col-span-5 lg:sticky lg:top-24 self-start">
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary">{prod.name}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
            <span className="truncate max-w-[60%]">{prod.sellerName || 'Mağaza'}</span>
            {prod.category && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border border-slate-300 text-slate-600">{prod.category}</span>
            )}
          </div>
          {typeof prod.rating === 'number' && (
            <div className="mt-1 text-amber-500 text-lg">{'★★★★★'.slice(0, Math.floor(prod.rating||0))}{'☆☆☆☆☆'.slice(0, 5-Math.floor(prod.rating||0))}</div>
          )}

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <div className="text-3xl font-extrabold">₺{priceNumber.toFixed(2)}</div>
            {prod.description ? (
              <div className="mt-2 text-slate-700 leading-relaxed whitespace-pre-line text-sm">{prod.description}</div>
            ) : null}
            <div className="mt-4 flex items-stretch gap-3">
              <div className="inline-flex items-center rounded-lg border border-slate-300">
                <button type="button" onClick={dec} className="px-3 py-2 text-slate-700 hover:bg-slate-50">-</button>
                <input
                  value={qty}
                  onChange={(e)=>{
                    const v = parseInt(e.target.value||'1',10)
                    if (!isNaN(v)) setQty(Math.max(1, Math.min(99, v)))
                  }}
                  className="w-14 text-center outline-none py-2 text-sm"
                  inputMode="numeric"
                />
                <button type="button" onClick={inc} className="px-3 py-2 text-slate-700 hover:bg-slate-50">+</button>
              </div>
              <button
                disabled={!!isOwner}
                className="flex-1 rounded-lg bg-brand px-4 py-3 text-white font-semibold hover:opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand/40"
                onClick={() => { if (isOwner) return; add({ slug: prod.slug, name: prod.name, price: priceNumber, image: prod.image }, qty); openCart() }}
              >
                Sepete Ekle
              </button>
              <button
                disabled={!!isOwner}
                className="rounded-lg bg-secondary px-4 py-3 text-white font-semibold hover:bg-[#115e99] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-secondary"
                onClick={() => { if (isOwner) return; add({ slug: prod.slug, name: prod.name, price: priceNumber, image: prod.image }, qty); router.push('/cart') }}
              >
                Hemen Satın Al
              </button>
            </div>
            {isOwner && (
              <div className="mt-2 text-xs text-amber-600">Bu ürün bu mağazaya ait. Satıcı kendi ürününü satın alamaz.</div>
            )}
          </div>

          {/* Ürün Bilgileri */}
          <div className="mt-6 sm:mt-8 rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800">Ürün Bilgileri</h2>
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Mağaza</span>
                <span className="font-medium text-slate-800 truncate max-w-[60%]">{prod.sellerName || 'Mağaza'}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Kategori</span>
                <span className="font-medium text-slate-800">{prod.category || '—'}</span>
              </div>
              {prod.producerName && (
                <div className="flex justify-between gap-3"><span className="text-slate-500">Üretici</span><span className="font-medium text-slate-800">{prod.producerName}</span></div>
              )}
              {prod.origin && (
                <div className="flex justify-between gap-3"><span className="text-slate-500">Menşei</span><span className="font-medium text-slate-800">{prod.origin}</span></div>
              )}
              {prod.ingredients && (
                <div className="sm:col-span-2 flex justify-between gap-3"><span className="text-slate-500">İçindekiler</span><span className="font-medium text-slate-800 text-right">{prod.ingredients}</span></div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}


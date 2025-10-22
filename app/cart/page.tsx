"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/CartProvider"
import { auth, db } from "@/lib/firebaseClient"
import { onAuthStateChanged } from "firebase/auth"
import { collection, getDocs, doc, addDoc, updateDoc, serverTimestamp } from "firebase/firestore"

type Address = { id?: string; title: string; line1: string; city: string; district: string; zip: string; phone?: string }

export default function CartPage() {
  const router = useRouter()
  const { items, total, setQty, remove, clear } = useCart()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [uid, setUid] = useState<string | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const emptyAddress = useMemo(() => ({ title: "", line1: "", city: "", district: "", zip: "", phone: "" }), [])
  const [newAddr, setNewAddr] = useState<Address>(emptyAddress)
  const [selectedAddrId, setSelectedAddrId] = useState<string | null>(null)
  const [shipping, setShipping] = useState<string>("standart")
  const [payment, setPayment] = useState<string>("card")
  const [coupon, setCoupon] = useState<string>("")
  const [agree, setAgree] = useState<boolean>(false)
  const discount = coupon.trim().toUpperCase() === "EANNEX10" ? Math.min(total * 0.1, 100) : 0
  const shippingFee = shipping === "standart" ? 29.9 : shipping === "express" ? 59.9 : 0
  const payable = Math.max(0, total - discount) + (items.length > 0 ? shippingFee : 0)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login")
        return
      }
      setUid(u.uid)
      try {
        const addrCol = collection(db, "users", u.uid, "addresses")
        const snap = await getDocs(addrCol)
        const list: Address[] = []
        snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }))
        setAddresses(list)
        if (list[0]?.id) setSelectedAddrId(list[0].id)
      } catch {}
    })
    return () => unsub()
  }, [router])

  const saveNewAddress = async () => {
    if (!uid) return
    if (!newAddr.title.trim() || !newAddr.line1.trim() || !newAddr.city.trim() || !newAddr.district.trim() || !newAddr.zip.trim()) return
    try {
      const ref = await addDoc(collection(db, "users", uid, "addresses"), {
        title: newAddr.title.trim(),
        line1: newAddr.line1.trim(),
        city: newAddr.city.trim(),
        district: newAddr.district.trim(),
        zip: newAddr.zip.trim(),
        phone: (newAddr.phone || "").trim()
      })
      const created: Address = { ...newAddr, id: ref.id }
      setAddresses((p) => [...p, created])
      setSelectedAddrId(ref.id)
      setNewAddr(emptyAddress)
    } catch {}
  }

  const proceedToPayment = () => {
    if (!selectedAddrId) return
    setStep(2)
  }

  const completeOrder = async () => {
    if (!agree) return
    if (!uid) return
    const addr = addresses.find((a) => a.id === selectedAddrId) || null
    const orderNo = `EA-${Date.now()}`
    try {
      await addDoc(collection(db, "users", uid, "orders"), {
        orderNo,
        status: "hazırlanıyor",
        createdAt: serverTimestamp(),
        items: items.map((it) => ({ slug: it.slug, name: it.name, image: it.image, price: it.price, qty: it.qty })),
        totals: { subtotal: total, discount, shipping: items.length > 0 ? shippingFee : 0, payable },
        shippingMethod: shipping,
        paymentMethod: payment,
        address: addr ? { ...addr } : null,
        coupon: coupon || null,
        trackingUrl: null
      })
      clear()
      router.push("/orders")
    } catch {}
  }

  return (
    <main className="container mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-secondary">Ödeme</h1>
      {items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-slate-200 p-6 text-center bg-white">
          <p className="text-slate-600">Sepetiniz boş.</p>
          <Link href="/" className="inline-block mt-3 px-4 py-2 rounded-lg bg-brand text-white hover:bg-brand/90">Alışverişe Başla</Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-3 gap-2">
              <div className={`h-2 rounded-full ${step >= 1 ? 'bg-brand' : 'bg-slate-200'}`} />
              <div className={`h-2 rounded-full ${step >= 2 ? 'bg-brand' : 'bg-slate-200'}`} />
              <div className={`h-2 rounded-full ${step >= 3 ? 'bg-brand' : 'bg-slate-200'}`} />
            </div>

            {step === 1 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h2 className="text-xl font-semibold">Teslimat Adresi</h2>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((a) => (
                      <label key={a.id} className={`block rounded-xl border p-4 cursor-pointer ${selectedAddrId === a.id ? 'border-brand ring-2 ring-brand/30' : 'border-slate-200'}`}>
                        <input type="radio" name="addr" className="sr-only" checked={selectedAddrId === a.id} onChange={() => setSelectedAddrId(a.id!)} />
                        <div className="font-medium">{a.title}</div>
                        <div className="text-sm text-slate-600 whitespace-pre-line mt-1">{a.line1}\n{a.district} / {a.city} {a.zip}</div>
                        {a.phone ? <div className="text-sm text-slate-600">{a.phone}</div> : null}
                      </label>
                    ))}
                  </div>
                  <div className="mt-5 grid grid-cols-1 gap-3 max-w-xl">
                    <input placeholder="Başlık (Ev, İş...)" value={newAddr.title} onChange={(e)=>setNewAddr({...newAddr, title: e.target.value})} className="rounded-lg border border-slate-300 px-4 py-2.5" />
                    <textarea placeholder="Adres" rows={3} value={newAddr.line1} onChange={(e)=>setNewAddr({...newAddr, line1: e.target.value})} className="rounded-lg border border-slate-300 px-4 py-2.5" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input placeholder="İl" value={newAddr.city} onChange={(e)=>setNewAddr({...newAddr, city: e.target.value})} className="rounded-lg border border-slate-300 px-4 py-2.5" />
                      <input placeholder="İlçe" value={newAddr.district} onChange={(e)=>setNewAddr({...newAddr, district: e.target.value})} className="rounded-lg border border-slate-300 px-4 py-2.5" />
                      <input placeholder="Posta Kodu" value={newAddr.zip} onChange={(e)=>setNewAddr({...newAddr, zip: e.target.value})} className="rounded-lg border border-slate-300 px-4 py-2.5" />
                    </div>
                    <input placeholder="Telefon (opsiyonel)" value={newAddr.phone} onChange={(e)=>setNewAddr({...newAddr, phone: e.target.value})} className="rounded-lg border border-slate-300 px-4 py-2.5" />
                    <div className="flex gap-3">
                      <button onClick={saveNewAddress} className="rounded-lg bg-brand px-4 py-2.5 text-white">Adresi Kaydet</button>
                      <button onClick={proceedToPayment} className="rounded-lg border px-4 py-2.5">Ödeme Adımına Geç</button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h2 className="text-xl font-semibold">Sepet</h2>
                  <div className="mt-3 space-y-3">
                    {items.map((it) => (
                      <div key={it.slug} className="rounded-xl border border-slate-200 p-3 flex items-center gap-3">
                        <img src={it.image} alt={it.name} className="h-16 w-16 rounded-md object-cover" />
                        <div className="min-w-0 flex-1">
                          <Link href={`/product/${it.slug}`} className="font-medium text-slate-800 hover:text-brand line-clamp-1">{it.name}</Link>
                          <p className="text-sm text-slate-500 mt-0.5">₺{(it.price * it.qty).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button aria-label="Azalt" className="w-8 h-8 rounded-lg border hover:bg-slate-50" onClick={() => setQty(it.slug, Math.max(1, it.qty - 1))}>-</button>
                          <input aria-label="Adet" value={it.qty} onChange={(e) => { const v = parseInt(e.target.value || "1", 10); if (!Number.isNaN(v) && v > 0) setQty(it.slug, v) }} className="w-12 text-center rounded-lg border py-1" />
                          <button aria-label="Arttır" className="w-8 h-8 rounded-lg border hover:bg-slate-50" onClick={() => setQty(it.slug, it.qty + 1)}>+</button>
                        </div>
                        <button aria-label="Kaldır" className="ml-2 px-3 py-1.5 rounded-lg border text-slate-600 hover:bg-slate-50" onClick={() => remove(it.slug)}>Kaldır</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h2 className="text-xl font-semibold">Kargo</h2>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`rounded-xl border p-4 cursor-pointer ${shipping === 'standart' ? 'border-brand ring-2 ring-brand/30' : 'border-slate-200'}`}>
                      <input type="radio" name="ship" className="sr-only" checked={shipping==='standart'} onChange={()=>setShipping('standart')} />
                      <div className="font-medium">Standart Kargo</div>
                      <div className="text-sm text-slate-600">2-3 iş günü • ₺29,90</div>
                    </label>
                    <label className={`rounded-xl border p-4 cursor-pointer ${shipping === 'express' ? 'border-brand ring-2 ring-brand/30' : 'border-slate-200'}`}>
                      <input type="radio" name="ship" className="sr-only" checked={shipping==='express'} onChange={()=>setShipping('express')} />
                      <div className="font-medium">Hızlı Kargo</div>
                      <div className="text-sm text-slate-600">Ertesi gün • ₺59,90</div>
                    </label>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h2 className="text-xl font-semibold">Ödeme Yöntemi</h2>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className={`rounded-xl border p-4 cursor-pointer ${payment === 'card' ? 'border-brand ring-2 ring-brand/30' : 'border-slate-200'}`}>
                      <input type="radio" name="pay" className="sr-only" checked={payment==='card'} onChange={()=>setPayment('card')} />
                      <div className="font-medium">Kredi Kartı</div>
                    </label>
                    <label className={`rounded-xl border p-4 cursor-pointer ${payment === 'eft' ? 'border-brand ring-2 ring-brand/30' : 'border-slate-200'}`}>
                      <input type="radio" name="pay" className="sr-only" checked={payment==='eft'} onChange={()=>setPayment('eft')} />
                      <div className="font-medium">Havale/EFT</div>
                    </label>
                    <label className={`rounded-xl border p-4 cursor-pointer ${payment === 'cod' ? 'border-brand ring-2 ring-brand/30' : 'border-slate-200'}`}>
                      <input type="radio" name="pay" className="sr-only" checked={payment==='cod'} onChange={()=>setPayment('cod')} />
                      <div className="font-medium">Kapıda Ödeme</div>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={()=>setStep(1)} className="rounded-lg border px-4 py-2.5">Geri</button>
                  <button onClick={()=>setStep(3)} className="rounded-lg bg-brand px-4 py-2.5 text-white">Devam</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h2 className="text-xl font-semibold">Onay</h2>
                  <div className="mt-3 space-y-4">
                    <div className="flex items-center gap-3">
                      <input id="agree" type="checkbox" checked={agree} onChange={(e)=>setAgree(e.target.checked)} />
                      <label htmlFor="agree" className="text-sm text-slate-700">Mesafeli satış sözleşmesini okudum ve kabul ediyorum</label>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={()=>setStep(2)} className="rounded-lg border px-4 py-2.5">Geri</button>
                      <button onClick={completeOrder} disabled={!agree} className="rounded-lg bg-brand px-4 py-2.5 text-white disabled:opacity-50">Siparişi Tamamla</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-semibold">Sipariş Özeti</h3>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-slate-700">
                  <span>Ara Toplam</span>
                  <span>₺{total.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>Kargo</span>
                  <span>₺{items.length > 0 ? shippingFee.toFixed(2) : '0.00'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>İndirim</span>
                  <span>-₺{discount.toFixed(2)}</span>
                </div>
                <div className="border-t my-2" />
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span>Ödenecek</span>
                  <span>₺{payable.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <input placeholder="Kupon Kodu" value={coupon} onChange={(e)=>setCoupon(e.target.value)} className="flex-1 rounded-lg border border-slate-300 px-3 py-2" />
                <button className="rounded-lg border px-3 py-2">Uygula</button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  )
}

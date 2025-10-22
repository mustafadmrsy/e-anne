"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { auth, db } from "@/lib/firebaseClient"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

export default function SellerDashboardPage() {
  const router = useRouter()
  const [uid, setUid] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [storeName, setStoreName] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push("/login"); return }
      setUid(u.uid)
      try {
        const udoc = await getDoc(doc(db, "users", u.uid))
        const s = (udoc.data() as any)?.sellerStatus || null
        setStatus(s)
        if (s === "approved") {
          const sdoc = await getDoc(doc(db, "sellers", u.uid))
          setStoreName((sdoc.data() as any)?.storeName || "Mağazam")
        }
      } finally { setLoading(false) }
    })
    return () => unsub()
  }, [router])

  if (loading) return <main className="container mx-auto px-4 py-8"><div>Yükleniyor...</div></main>

  if (status !== "approved") {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-secondary">Satıcı Paneli</h1>
        {status === "pending" && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 p-4">Başvurunuz inceleniyor. Onaylandığında bilgilendirileceksiniz.</div>
        )}
        {status === "rejected" && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 text-red-700 p-4">Başvurunuz reddedildi. Gerekli düzenlemeleri yapıp tekrar başvurabilirsiniz.</div>
        )}
        {!status && (
          <div className="mt-4 rounded-xl border p-4">Satıcı başvurusu bulunamadı. <Link href="/register/seller" className="text-brand underline">Satıcı kaydı</Link> oluşturun.</div>
        )}
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-secondary">{storeName}</h1>
      <p className="mt-1 text-slate-600">Satıcı paneline hoş geldiniz.</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="#" className="rounded-2xl border p-5 bg-white hover:border-brand">
          <h2 className="font-semibold text-slate-900">Ürünler</h2>
          <p className="text-sm text-slate-600">Ürün ekleyin, düzenleyin, stok yönetin.</p>
        </Link>
        <Link href="#" className="rounded-2xl border p-5 bg-white hover:border-brand">
          <h2 className="font-semibold text-slate-900">Siparişler</h2>
          <p className="text-sm text-slate-600">Siparişleri görüntüleyin ve yönetin.</p>
        </Link>
        <Link href="#" className="rounded-2xl border p-5 bg-white hover:border-brand">
          <h2 className="font-semibold text-slate-900">Kazançlar</h2>
          <p className="text-sm text-slate-600">Ödemeler ve bakiye bilgileri.</p>
        </Link>
        <Link href="#" className="rounded-2xl border p-5 bg-white hover:border-brand">
          <h2 className="font-semibold text-slate-900">Mağaza Ayarları</h2>
          <p className="text-sm text-slate-600">Mağaza bilgilerinizi güncelleyin.</p>
        </Link>
      </div>
    </main>
  )
}

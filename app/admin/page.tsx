"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { auth, db } from "@/lib/firebaseClient"
import { onAuthStateChanged } from "firebase/auth"
import { collection, collectionGroup, getCountFromServer, query, where, Timestamp, doc, getDoc } from "firebase/firestore"

export default function Page() {
  const [pendingSellers, setPendingSellers] = useState<number | null>(null)
  const [totalUsers, setTotalUsers] = useState<number | null>(null)
  const [todayOrders, setTodayOrders] = useState<number | null>(null)
  const [sellerUsers, setSellerUsers] = useState<number | null>(null)
  const [customerUsers, setCustomerUsers] = useState<number | null>(null)
  const [approvedSellers, setApprovedSellers] = useState<number | null>(null)
  const [rejectedSellers, setRejectedSellers] = useState<number | null>(null)
  const [canQuery, setCanQuery] = useState(false)

  // Auth ve admin doğrulaması hazır olmadan aggregation çağrılarını başlatma
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { setCanQuery(false); return }
      try {
        const adminDoc = await getDoc(doc(db, "admins", u.uid))
        setCanQuery(adminDoc.exists())
      } catch { setCanQuery(false) }
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!canQuery) return
    ;(async () => {
      try {
        const sellersQ = query(collection(db, "sellers"), where("status", "==", "pending"))
        const sellersSnap = await getCountFromServer(sellersQ)
        setPendingSellers(sellersSnap.data().count)
      } catch { setPendingSellers(0) }

      try {
        const usersSnap = await getCountFromServer(collection(db, "users"))
        setTotalUsers(usersSnap.data().count)
      } catch { setTotalUsers(0) }

      try {
        const sellersUsersQ = query(collection(db, "users"), where("role", "==", "seller"))
        const sellersUsersSnap = await getCountFromServer(sellersUsersQ)
        setSellerUsers(sellersUsersSnap.data().count)
      } catch { setSellerUsers(0) }

      try {
        const customersQ = query(collection(db, "users"), where("role", "==", "customer"))
        const customersSnap = await getCountFromServer(customersQ)
        setCustomerUsers(customersSnap.data().count)
      } catch { setCustomerUsers(0) }

      try {
        const approvedQ = query(collection(db, "sellers"), where("status", "==", "approved"))
        const approvedSnap = await getCountFromServer(approvedQ)
        setApprovedSellers(approvedSnap.data().count)
      } catch { setApprovedSellers(0) }

      try {
        const rejectedQ = query(collection(db, "sellers"), where("status", "==", "rejected"))
        const rejectedSnap = await getCountFromServer(rejectedQ)
        setRejectedSellers(rejectedSnap.data().count)
      } catch { setRejectedSellers(0) }

      try {
        const start = startOfToday()
        // orders alt koleksiyonları için collectionGroup kullanıyoruz
        const ordersQ = query(collectionGroup(db, "orders"), where("createdAt", ">=", Timestamp.fromDate(start)))
        const ordersSnap = await getCountFromServer(ordersQ)
        setTodayOrders(ordersSnap.data().count)
      } catch { setTodayOrders(0) }
    })()
  }, [canQuery])

  return (
    <div className="text-slate-100">
      <h1 className="text-xl sm:text-2xl font-semibold">Dashboard</h1>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-black/40 p-4">
          <div className="text-xs text-slate-400">Bekleyen Satıcı Başvurusu</div>
          <div className="mt-1 text-2xl font-bold">{formatNum(pendingSellers)}</div>
          <Link href="/admin/sellers" className="mt-2 inline-block text-blue-300/90 text-sm">Görüntüle →</Link>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-black/40 p-4">
          <div className="text-xs text-slate-400">Toplam Kullanıcı</div>
          <div className="mt-1 text-2xl font-bold">{formatNum(totalUsers)}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-black/40 p-4">
          <div className="text-xs text-slate-400">Bugünkü Sipariş</div>
          <div className="mt-1 text-2xl font-bold">{formatNum(todayOrders)}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-black/40 p-4">
          <div className="text-xs text-slate-400">Kullanıcılar • Müşteri</div>
          <div className="mt-1 text-2xl font-bold">{formatNum(customerUsers)}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-black/40 p-4">
          <div className="text-xs text-slate-400">Kullanıcılar • Satıcı</div>
          <div className="mt-1 text-2xl font-bold">{formatNum(sellerUsers)}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-black/40 p-4">
          <div className="text-xs text-slate-400">Satıcılar • Onaylı</div>
          <div className="mt-1 text-2xl font-bold">{formatNum(approvedSellers)}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-black/40 p-4">
          <div className="text-xs text-slate-400">Satıcılar • Reddedilen</div>
          <div className="mt-1 text-2xl font-bold">{formatNum(rejectedSellers)}</div>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-800 bg-black/20 p-4 text-slate-400">
          <div className="text-xs">Site Yönetimi</div>
          <div className="mt-1 text-sm">Bannerlar, promosyon barı, kampanyalar...</div>
          <Link href="/admin/site" className="mt-2 inline-block text-blue-300/90 text-sm">Yönet →</Link>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-800 bg-black/20 p-4 text-slate-400">
          <div className="text-xs">Ürün Yönetimi</div>
          <div className="mt-1 text-sm">Ürünler, stoklar, kategoriler...</div>
          <Link href="/admin/products" className="mt-2 inline-block text-blue-300/90 text-sm">Yönet →</Link>
        </div>
      </div>
    </div>
  )
}

function formatNum(n: number | null) {
  if (n === null) return "…"
  return new Intl.NumberFormat("tr-TR").format(n)
}

function startOfToday() {
  const d = new Date()
  d.setHours(0,0,0,0)
  return d
}

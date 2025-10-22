"use client"

import { useEffect, useMemo, useState } from "react"
import { auth, db } from "@/lib/firebaseClient"
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore"

type Seller = {
  uid: string
  storeName: string
  companyType?: string
  taxIdOrNationalId?: string
  iban?: string
  bankName?: string
  description?: string
  status: "pending" | "approved" | "rejected"
  createdAt?: any
}

export default function AdminSellersPage() {
  const [items, setItems] = useState<Seller[]>([])
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending")
  const [qtext, setQtext] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const col = collection(db, "sellers")
    // Not: where + orderBy için composite index gerekiyordu. Bunu
    // kaldırmak için filtreliyken orderBy kullanmıyoruz; client-side sıralarız.
    const q = filter === "all"
      ? query(col, orderBy("createdAt", "desc"))
      : query(col, where("status", "==", filter))
    const unsub = onSnapshot(q, (snap) => {
      const arr: Seller[] = []
      snap.forEach((d) => arr.push({ uid: d.id, ...(d.data() as any) }))
      setItems(arr)
      setLoading(false)
    })
    return () => unsub()
  }, [filter])

  const filtered = useMemo(() => {
    const t = qtext.trim().toLowerCase()
    const base = t
      ? items.filter((x) =>
          (x.storeName || "").toLowerCase().includes(t) ||
          (x.taxIdOrNationalId || "").toLowerCase().includes(t) ||
          (x.iban || "").toLowerCase().includes(t)
        )
      : items
    // client-side order by createdAt desc
    return base.slice().sort((a, b) => {
      const av = (a.createdAt?.seconds ?? 0) * 1000 + (a.createdAt?.nanoseconds ?? 0) / 1e6
      const bv = (b.createdAt?.seconds ?? 0) * 1000 + (b.createdAt?.nanoseconds ?? 0) / 1e6
      return bv - av
    })
  }, [items, qtext])

  const approve = async (uid: string) => {
    const adminUid = auth.currentUser?.uid || ""
    await updateDoc(doc(db, "sellers", uid), {
      status: "approved",
      approvedAt: serverTimestamp(),
      approvedBy: adminUid,
    })
    await updateDoc(doc(db, "users", uid), { sellerStatus: "approved", updatedAt: serverTimestamp() })
  }

  const reject = async (uid: string) => {
    const adminUid = auth.currentUser?.uid || ""
    await updateDoc(doc(db, "sellers", uid), {
      status: "rejected",
      approvedAt: serverTimestamp(),
      approvedBy: adminUid,
    })
    await updateDoc(doc(db, "users", uid), { sellerStatus: "rejected", updatedAt: serverTimestamp() })
  }

  return (
    <div className="text-slate-100">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg sm:text-xl font-semibold">Satıcı Başvuruları</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-lg overflow-hidden border border-slate-800 order-2 sm:order-1">
            {([
              { key: "pending", label: "Bekleyen", icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l3 3"/></svg>
              )},
              { key: "approved", label: "Onaylı", icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              )},
              { key: "rejected", label: "Reddedilen", icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              )},
              { key: "all", label: "Tümü", icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              )},
            ] as const).map((f) => (
              <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 py-1.5 text-sm inline-flex items-center gap-1 ${filter===f.key?"bg-blue-400/20 text-blue-200":"bg-black/30 text-slate-300"}`}>
                <span>{f.icon}</span>
                <span className="hidden sm:inline">{f.label}</span>
              </button>
            ))}
          </div>
          <input value={qtext} onChange={(e)=>setQtext(e.target.value)} placeholder="Ara (mağaza adı, vergi no, IBAN)" className="order-1 sm:order-2 w-full sm:w-auto rounded-lg border border-slate-800 bg-black/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500" />
        </div>
      </div>

      {/* Masaüstü Tablo */}
      <div className="mt-4 rounded-2xl border border-slate-800 bg-black/30 overflow-auto hidden sm:block">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-black/40 text-slate-400">
            <tr>
              <th className="text-left px-4 py-2">Mağaza</th>
              <th className="text-left px-4 py-2">Şirket</th>
              <th className="text-left px-4 py-2">Vergi/TCKN</th>
              <th className="text-left px-4 py-2">IBAN</th>
              <th className="text-left px-4 py-2">Durum</th>
              <th className="text-right px-4 py-2">Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Yükleniyor...</td></tr>
            )}
            {!loading && filtered.length===0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Kayıt bulunamadı.</td></tr>
            )}
            {filtered.map((s) => (
              <tr key={s.uid} className="border-t border-slate-800">
                <td className="px-4 py-2">
                  <div className="font-medium text-slate-100">{s.storeName || "—"}</div>
                  <div className="text-xs text-slate-500">{s.uid}</div>
                </td>
                <td className="px-4 py-2 capitalize">{s.companyType || "—"}</td>
                <td className="px-4 py-2">{s.taxIdOrNationalId || (s as any).taxId || "—"}</td>
                <td className="px-4 py-2">{s.iban || "—"}</td>
                <td className="px-4 py-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs border ${s.status==='approved'?"border-emerald-500/40 text-emerald-300":s.status==='rejected'?"border-rose-500/40 text-rose-300":"border-yellow-500/40 text-yellow-300"}`}>
                    {s.status==='approved' ? 'Onaylı' : s.status==='rejected' ? 'Reddedilen' : 'Bekleyen'}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  {s.status === "pending" ? (
                    <div className="inline-flex gap-2">
                      <button onClick={()=>approve(s.uid)} className="rounded-lg bg-emerald-500/20 text-emerald-200 px-3 py-1.5">Onayla</button>
                      <button onClick={()=>reject(s.uid)} className="rounded-lg bg-rose-500/20 text-rose-200 px-3 py-1.5">Reddet</button>
                    </div>
                  ) : (
                    <div className="text-slate-400">—</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobil Kartlar */}
      <div className="sm:hidden space-y-3 mt-4">
        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-black/30 p-4 text-center text-slate-400">Yükleniyor...</div>
        )}
        {!loading && filtered.length===0 && (
          <div className="rounded-2xl border border-slate-800 bg-black/30 p-4 text-center text-slate-400">Kayıt bulunamadı.</div>
        )}
        {filtered.map((s) => (
          <div key={s.uid} className="rounded-2xl border border-slate-800 bg-black/30 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-slate-100">{s.storeName || '—'}</div>
                <div className="text-xs text-slate-500 break-all">{s.uid}</div>
              </div>
              <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs border ${s.status==='approved'?"border-emerald-500/40 text-emerald-300":s.status==='rejected'?"border-rose-500/40 text-rose-300":"border-yellow-500/40 text-yellow-300"}`}>
                {s.status==='approved' ? 'Onaylı' : s.status==='rejected' ? 'Reddedilen' : 'Bekleyen'}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="text-slate-400">Şirket</div>
              <div className="text-right capitalize text-slate-200">{s.companyType || '—'}</div>
              <div className="text-slate-400">Vergi/TCKN</div>
              <div className="text-right text-slate-200">{s.taxIdOrNationalId || (s as any).taxId || '—'}</div>
              <div className="text-slate-400">IBAN</div>
              <div className="text-right text-slate-200 break-all">{s.iban || '—'}</div>
            </div>
            <div className="mt-3 flex items-center justify-end gap-2">
              {s.status === 'pending' ? (
                <>
                  <button onClick={()=>reject(s.uid)} className="rounded-lg bg-rose-500/20 text-rose-200 px-3 py-1.5">Reddet</button>
                  <button onClick={()=>approve(s.uid)} className="rounded-lg bg-emerald-500/20 text-emerald-200 px-3 py-1.5">Onayla</button>
                </>
              ) : (
                <div className="text-slate-400 text-xs">İşlem yok</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

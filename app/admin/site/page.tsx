"use client"

import { useEffect, useState } from "react"
import { auth, db } from "@/lib/firebaseClient"
import { onAuthStateChanged } from "firebase/auth"
import { collection, collectionGroup, doc, getCountFromServer, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, Timestamp, where, addDoc, updateDoc, deleteDoc } from "firebase/firestore"

type Tab = "analytics" | "coupons" | "notifications" | "security" | "site" | "payments" | "logs"

export default function SiteSettingsHub() {
  const [tab, setTab] = useState<Tab>("analytics")
  const [canQuery, setCanQuery] = useState(false)

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async (u)=>{
      if (!u) { setCanQuery(false); return }
      try {
        const a = await getDoc(doc(db, "admins", u.uid))
        setCanQuery(a.exists())
      } catch { setCanQuery(false) }
    })
    return ()=>unsub()
  }, [])

  return (
    <div className="text-slate-100">
      <h1 className="text-lg sm:text-2xl font-semibold">Site Yönetimi</h1>
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        <aside className="lg:col-span-3 rounded-2xl border border-slate-800 bg-black/30 p-3">
          <nav className="space-y-1">
            {[
              { k: "analytics", t: "Site Analitiği" },
              { k: "coupons", t: "Kampanya / Kupon" },
              { k: "notifications", t: "Bildirim Yönetimi" },
              { k: "security", t: "Güvenlik ve Erişim" },
              { k: "site", t: "Site Ayarları" },
              { k: "payments", t: "Ödeme ve Kargo" },
              { k: "logs", t: "Hata / Log" },
            ].map((i:any)=> (
              <button key={i.k} onClick={()=>setTab(i.k)} className={`w-full text-left px-3 py-2 rounded-lg border ${tab===i.k?"border-blue-500/50 bg-blue-500/10":"border-slate-800 hover:bg-slate-800"}`}>
                {i.t}
              </button>
            ))}
          </nav>
        </aside>

        <section className="lg:col-span-9 space-y-4">
          {!canQuery && (
            <div className="rounded-lg border border-amber-600/40 bg-amber-900/10 p-3 text-sm text-amber-200">Admin doğrulaması bekleniyor. Lütfen giriş yapın veya admin yetkisi ekleyin.</div>
          )}
          {tab === "analytics" && <AnalyticsPanel />}
          {tab === "coupons" && <CouponsPanel canQuery={canQuery} />}
          {tab === "notifications" && <NotificationsPanel canQuery={canQuery} />}
          {tab === "security" && <SecurityPanel canQuery={canQuery} />}
          {tab === "site" && <SiteSettingsPanel />}
          {tab === "payments" && <PaymentsPanel />}
          {tab === "logs" && <LogsPanel />}
        </section>
      </div>
    </div>
  )
}

function Card({ title, children, footer }: { title: string; children?: any; footer?: any }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-black/30">
      <div className="px-4 py-2 border-b border-slate-800 text-sm text-slate-300">{title}</div>
      <div className="p-4">{children}</div>
      {footer && <div className="px-4 py-2 border-t border-slate-800">{footer}</div>}
    </div>
  )
}

function AnalyticsPanel() {
  const [dailyOrders, setDailyOrders] = useState<number | null>(null)
  const [monthlyVisitors, setMonthlyVisitors] = useState<number | null>(null)
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [revenueToday, setRevenueToday] = useState<number | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const start = startOfToday()
        const q1 = query(collectionGroup(db, "orders"), where("createdAt", ">=", Timestamp.fromDate(start)))
        const s1 = await getCountFromServer(q1)
        setDailyOrders(s1.data().count)
      } catch { setDailyOrders(0) }

      try {
        // Basit ziyaretçi sayacı: analytics/daily_{YYYYMMDD} toplamı; yoksa 0
        const key = yyyymm(new Date())
        const dref = doc(db as any, "analytics", `monthly_${key}`)
        const snap = await getDoc(dref)
        setMonthlyVisitors((snap.data() as any)?.visitors ?? 0)
      } catch { setMonthlyVisitors(0) }

      try {
        // En çok görüntülenen ürünler: products orderBy views desc
        const qtp = query(collection(db, "products"), orderBy("views", "desc"), limit(5))
        const ps = await getDocs(qtp)
        setTopProducts(ps.docs.map(d=>({ id: d.id, ...(d.data() as any) })))
      } catch { setTopProducts([]) }

      try {
        // Bugünkü gelir: orders sum(total) yerine sadece adet gösteriyoruz; geliri saymak için ayrı alan gerekir
        const start = startOfToday()
        const q2 = query(collectionGroup(db, "orders"), where("createdAt", ">=", Timestamp.fromDate(start)))
        const s2 = await getDocs(q2)
        const sum = s2.docs.reduce((acc, d)=> acc + ((d.data() as any)?.total ?? 0), 0)
        setRevenueToday(sum)
      } catch { setRevenueToday(0) }
    })()
  }, [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card title="Günlük Sipariş Sayısı"><div className="text-2xl font-bold">{fmtNum(dailyOrders)}</div></Card>
      <Card title="Aylık Ziyaretçi (özet)"><div className="text-2xl font-bold">{fmtNum(monthlyVisitors)}</div></Card>
      <Card title="Bugünkü Tahmini Gelir"><div className="text-2xl font-bold">₺ {fmtNum(revenueToday)}</div></Card>
      <Card title="En Çok Görüntülenen Ürünler">
        <div className="space-y-2 text-sm">
          {topProducts.length === 0 && <div className="text-slate-400">Veri yok.</div>}
          {topProducts.map((p)=> (
            <div key={p.id} className="flex items-center justify-between">
              <div className="truncate max-w-[60%]">{p.title || p.name || p.id}</div>
              <div className="text-slate-400">{(p.views ?? 0)} görüntüleme</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function CouponsPanel({ canQuery }: { canQuery: boolean }) {
  const [code, setCode] = useState("")
  const [discount, setDiscount] = useState(10)
  const [startAt, setStartAt] = useState("")
  const [endAt, setEndAt] = useState("")
  const [saving, setSaving] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{ if (!canQuery) return; (async()=>{
    try {
      const ql = query(collection(db, "coupons"), orderBy("createdAt", "desc"), limit(50))
      const s = await getDocs(ql)
      setItems(s.docs.map(d=>({ id: d.id, ...(d.data() as any) })))
    } finally { setLoading(false) }
  })() }, [canQuery])

  const createCoupon = async () => {
    setSaving(true)
    try {
      const ref = await addDoc(collection(db, "coupons"), {
        code: code.trim().toUpperCase(),
        discount: Number(discount),
        startAt: startAt ? Timestamp.fromDate(new Date(startAt)) : null,
        endAt: endAt ? Timestamp.fromDate(new Date(endAt)) : null,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid ?? null,
        active: true,
      })
      setItems(prev=>[{ id: ref.id, code: code.trim().toUpperCase(), discount: Number(discount), startAt: startAt? new Date(startAt): null, endAt: endAt? new Date(endAt): null, active: true }, ...prev])
      setCode("")
    } finally { setSaving(false) }
  }

  const toggleActive = async (id: string, active: boolean) => {
    await updateDoc(doc(db, "coupons", id), { active })
    setItems(prev=>prev.map(x=> x.id===id? { ...x, active }: x))
  }
  const remove = async (id: string) => {
    await deleteDoc(doc(db, "coupons", id))
    setItems(prev=>prev.filter(x=>x.id!==id))
  }

  return (
    <div className="space-y-4">
      <Card title="Yeni Kupon Oluştur">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Input label="Kupon Kodu" value={code} onChange={setCode} placeholder="E-ANNE10" />
          <Input label="İndirim (%)" type="number" value={String(discount)} onChange={(v)=>setDiscount(Number(v))} />
          <Input label="Başlangıç" type="date" value={startAt} onChange={setStartAt} />
          <Input label="Bitiş" type="date" value={endAt} onChange={setEndAt} />
        </div>
        <div className="mt-3">
          <button onClick={createCoupon} disabled={!canQuery || saving || !code.trim()} className="rounded-lg bg-blue-500/20 text-blue-200 px-3 py-2 text-sm border border-blue-500/30">{saving?"Kaydediliyor...":"Kupon Oluştur"}</button>
        </div>
      </Card>
      <Card title="Kuponlar">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="text-left px-2 py-1">Kod</th>
                <th className="text-left px-2 py-1">İndirim</th>
                <th className="text-left px-2 py-1">Tarih</th>
                <th className="text-left px-2 py-1">Durum</th>
                <th className="text-right px-2 py-1">Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              {loading && (<tr><td colSpan={5} className="px-2 py-4 text-center text-slate-500">Yükleniyor...</td></tr>)}
              {!loading && items.length===0 && (<tr><td colSpan={5} className="px-2 py-4 text-center text-slate-500">Kupon yok.</td></tr>)}
              {items.map(c => (
                <tr key={c.id} className="border-t border-slate-800">
                  <td className="px-2 py-1 font-medium">{c.code}</td>
                  <td className="px-2 py-1">%{c.discount}</td>
                  <td className="px-2 py-1 text-xs text-slate-400">{dateRange(c.startAt, c.endAt)}</td>
                  <td className="px-2 py-1">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs border ${c.active?"border-emerald-500/40 text-emerald-300":"border-slate-600 text-slate-300"}`}>{c.active?"Aktif":"Pasif"}</span>
                  </td>
                  <td className="px-2 py-1 text-right">
                    <div className="inline-flex gap-2">
                      <button disabled={!canQuery} onClick={()=>toggleActive(c.id, !c.active)} className="px-2 py-1 rounded bg-slate-700/40 border border-slate-700 text-xs disabled:opacity-50">{c.active?"Pasif Yap":"Aktif Yap"}</button>
                      <button disabled={!canQuery} onClick={()=>remove(c.id)} className="px-2 py-1 rounded bg-rose-600/20 border border-rose-600/40 text-rose-200 text-xs disabled:opacity-50">Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function NotificationsPanel({ canQuery }: { canQuery: boolean }) {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [channel, setChannel] = useState("email")
  const [saving, setSaving] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{ if (!canQuery) return; (async()=>{
    try {
      const ql = query(collection(db, "notifications"), orderBy("createdAt", "desc"), limit(20))
      const s = await getDocs(ql)
      setItems(s.docs.map(d=>({ id: d.id, ...(d.data() as any) })))
    } finally { setLoading(false) }
  })() }, [canQuery])

  const createDraft = async () => {
    setSaving(true)
    try {
      const ref = await addDoc(collection(db, "notifications"), {
        title, body, channel,
        status: "draft",
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid ?? null,
      })
      setItems(prev=>[{ id: ref.id, title, body, channel, status: 'draft', createdAt: new Date() }, ...prev])
      setTitle(""); setBody("")
    } finally { setSaving(false) }
  }

  const schedule = async (id: string) => {
    await updateDoc(doc(db, "notifications", id), { status: "scheduled", scheduledAt: serverTimestamp() })
    setItems(prev=>prev.map(x=> x.id===id? { ...x, status: 'scheduled' }: x))
  }
  const remove = async (id: string) => {
    await deleteDoc(doc(db, "notifications", id))
    setItems(prev=>prev.filter(x=>x.id!==id))
  }

  return (
    <div className="space-y-4">
      <Card title="Bildirim Taslağı">
        <div className="grid grid-cols-1 gap-3">
          <Input label="Konu/Başlık" value={title} onChange={setTitle} />
          <Textarea label="Mesaj" value={body} onChange={setBody} />
          <label className="block">
            <span className="block text-xs text-slate-400 mb-1">Kanal</span>
            <select className="w-full rounded-lg border border-slate-800 bg-black/40 px-3 py-2 text-sm" value={channel} onChange={(e)=>setChannel(e.target.value)}>
              <option value="email">E-posta</option>
              <option value="push">Push</option>
            </select>
          </label>
          <div>
            <button onClick={createDraft} disabled={!canQuery || saving || !title.trim() || !body.trim()} className="rounded-lg bg-blue-500/20 text-blue-200 px-3 py-2 text-sm border border-blue-500/30">{saving?"Kaydediliyor...":"Taslak Oluştur"}</button>
          </div>
          <div className="text-xs text-slate-400">Gönderim altyapısı (Cloud Functions) sonra eklenecek.</div>
        </div>
      </Card>
      <Card title="Bildirimler">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="text-left px-2 py-1">Başlık</th>
                <th className="text-left px-2 py-1">Kanal</th>
                <th className="text-left px-2 py-1">Durum</th>
                <th className="text-right px-2 py-1">Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              {loading && (<tr><td colSpan={4} className="px-2 py-4 text-center text-slate-500">Yükleniyor...</td></tr>)}
              {!loading && items.length===0 && (<tr><td colSpan={4} className="px-2 py-4 text-center text-slate-500">Kayıt yok.</td></tr>)}
              {items.map(n => (
                <tr key={n.id} className="border-t border-slate-800">
                  <td className="px-2 py-1 font-medium truncate max-w-[280px]">{n.title}</td>
                  <td className="px-2 py-1 text-slate-400">{n.channel}</td>
                  <td className="px-2 py-1">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs border ${n.status==='scheduled'?"border-amber-500/40 text-amber-300":n.status==='sent'?"border-emerald-500/40 text-emerald-300":"border-slate-600 text-slate-300"}`}>{n.status || 'draft'}</span>
                  </td>
                  <td className="px-2 py-1 text-right">
                    <div className="inline-flex gap-2">
                      {n.status==='draft' && <button disabled={!canQuery} onClick={()=>schedule(n.id)} className="px-2 py-1 rounded bg-slate-700/40 border border-slate-700 text-xs disabled:opacity-50">Zamanla</button>}
                      <button disabled={!canQuery} onClick={()=>remove(n.id)} className="px-2 py-1 rounded bg-rose-600/20 border border-rose-600/40 text-rose-200 text-xs disabled:opacity-50">Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function SecurityPanel({ canQuery }: { canQuery: boolean }) {
  const [admins, setAdmins] = useState<any[]>([])
  const [blocked, setBlocked] = useState<any[]>([])
  const [newUid, setNewUid] = useState("")
  const [newRole, setNewRole] = useState("admin")
  const [newIp, setNewIp] = useState("")

  const refresh = async () => {
    try {
      const s = await getDocs(collection(db, "admins"))
      setAdmins(s.docs.map(d=>({ id: d.id, ...(d.data() as any) })))
    } catch {}
    try {
      const s = await getDocs(collection(db, "blocked_ips"))
      setBlocked(s.docs.map(d=>({ id: d.id, ...(d.data() as any) })))
    } catch {}
  }
  useEffect(()=>{ if (!canQuery) return; refresh() }, [canQuery])

  const addAdmin = async () => {
    if (!newUid.trim()) return
    await setDoc(doc(db, "admins", newUid.trim()), { role: newRole, createdAt: serverTimestamp() }, { merge: true })
    setNewUid(""); refresh()
  }
  const updateAdminRole = async (id: string, role: string) => {
    await setDoc(doc(db, "admins", id), { role }, { merge: true })
    setAdmins(prev=>prev.map(a=> a.id===id? { ...a, role }: a))
  }
  const blockIp = async () => {
    if (!newIp.trim()) return
    const ref = await addDoc(collection(db, "blocked_ips"), { ip: newIp.trim(), createdAt: serverTimestamp(), createdBy: auth.currentUser?.uid ?? null })
    setBlocked(prev=>[{ id: ref.id, ip: newIp.trim() }, ...prev]); setNewIp("")
  }
  const removeIp = async (id: string) => {
    await deleteDoc(doc(db, "blocked_ips", id))
    setBlocked(prev=>prev.filter(x=>x.id!==id))
  }

  return (
    <div className="space-y-4">
      <Card title="Admin Kullanıcıları">
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input label="Kullanıcı UID" value={newUid} onChange={setNewUid} />
            <label className="block">
              <span className="block text-xs text-slate-400 mb-1">Yetki</span>
              <select className="w-full rounded-lg border border-slate-800 bg-black/40 px-3 py-2 text-sm" value={newRole} onChange={(e)=>setNewRole(e.target.value)}>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </label>
            <div className="flex items-end"><button disabled={!canQuery} onClick={addAdmin} className="w-full rounded-lg bg-blue-500/20 text-blue-200 px-3 py-2 text-sm border border-blue-500/30 disabled:opacity-50">Ekle/Güncelle</button></div>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="text-left px-2 py-1">UID</th>
                  <th className="text-left px-2 py-1">Email/İsim</th>
                  <th className="text-left px-2 py-1">Rol</th>
                </tr>
              </thead>
              <tbody>
                {admins.length===0 && (<tr><td colSpan={3} className="px-2 py-4 text-center text-slate-500">Kayıt yok.</td></tr>)}
                {admins.map(a => (
                  <tr key={a.id} className="border-t border-slate-800">
                    <td className="px-2 py-1 text-xs text-slate-400">{a.id}</td>
                    <td className="px-2 py-1">{a.email || a.name || '—'}</td>
                    <td className="px-2 py-1">
                      <select className="rounded border border-slate-700 bg-black/30 text-sm" value={a.role || 'admin'} onChange={(e)=>updateAdminRole(a.id, e.target.value)}>
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <Card title="IP Engelleme">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Input label="IP" value={newIp} onChange={setNewIp} placeholder="1.2.3.4" />
          <div className="flex items-end"><button disabled={!canQuery} onClick={blockIp} className="w-full rounded-lg bg-blue-500/20 text-blue-200 px-3 py-2 text-sm border border-blue-500/30 disabled:opacity-50">Ekle</button></div>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          {blocked.length===0 && <div className="text-slate-400">Engellenmiş IP yok.</div>}
          {blocked.map(b => (
            <div key={b.id} className="flex items-center justify-between rounded border border-slate-800 px-3 py-1.5">
              <div>{b.ip}</div>
              <button disabled={!canQuery} onClick={()=>removeIp(b.id)} className="px-2 py-1 rounded bg-rose-600/20 border border-rose-600/40 text-rose-200 text-xs disabled:opacity-50">Kaldır</button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function SiteSettingsPanel() {
  const [logoUrl, setLogoUrl] = useState("")
  const [faviconUrl, setFaviconUrl] = useState("")
  const [theme, setTheme] = useState("system")
  const [primaryColor, setPrimaryColor] = useState("#2563eb")
  const [saving, setSaving] = useState(false)

  useEffect(()=>{ (async()=>{
    try {
      const s = await getDoc(doc(db, "site", "settings"))
      const d = s.data() as any
      if (d) {
        setLogoUrl(d.logoUrl || ""); setFaviconUrl(d.faviconUrl || ""); setTheme(d.theme || "system"); setPrimaryColor(d.primaryColor || "#2563eb")
      }
    } catch {}
  })() }, [])

  const save = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, "site", "settings"), {
        logoUrl, faviconUrl, theme, primaryColor,
        updatedAt: serverTimestamp(), updatedBy: auth.currentUser?.uid ?? null,
      }, { merge: true })
    } finally { setSaving(false) }
  }

  return (
    <Card title="Site Ayarları" footer={<button onClick={save} disabled={saving} className="rounded-lg bg-blue-500/20 text-blue-200 px-3 py-1.5 text-sm border border-blue-500/30">{saving?"Kaydediliyor...":"Kaydet"}</button>}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Logo URL" value={logoUrl} onChange={setLogoUrl} />
        <Input label="Favicon URL" value={faviconUrl} onChange={setFaviconUrl} />
        <label className="block">
          <span className="block text-xs text-slate-400 mb-1">Tema Modu</span>
          <select className="w-full rounded-lg border border-slate-800 bg-black/40 px-3 py-2 text-sm" value={theme} onChange={(e)=>setTheme(e.target.value)}>
            <option value="light">Açık</option>
            <option value="dark">Koyu</option>
            <option value="system">Sistem</option>
          </select>
        </label>
        <label className="block">
          <span className="block text-xs text-slate-400 mb-1">Ana Renk</span>
          <input type="color" className="w-full h-10 rounded-lg border border-slate-800 bg-black/40" value={primaryColor} onChange={(e)=>setPrimaryColor(e.target.value)} />
        </label>
      </div>
    </Card>
  )
}

function PaymentsPanel() {
  const [cod, setCod] = useState(true)
  const [card, setCard] = useState(true)
  const [shippingCompany, setShippingCompany] = useState("")
  const [shippingPrice, setShippingPrice] = useState("0")
  const [saving, setSaving] = useState(false)

  useEffect(()=>{ (async()=>{
    try {
      const s = await getDoc(doc(db, "site", "payments"))
      const d = s.data() as any
      if (d) {
        setCod(!!d.cashOnDelivery); setCard(!!d.cardEnabled); setShippingCompany(d.shippingCompany || ""); setShippingPrice(String(d.shippingPrice ?? "0"))
      }
    } catch {}
  })() }, [])

  const save = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, "site", "payments"), {
        cashOnDelivery: cod,
        cardEnabled: card,
        shippingCompany,
        shippingPrice: Number(shippingPrice),
        updatedAt: serverTimestamp(), updatedBy: auth.currentUser?.uid ?? null,
      }, { merge: true })
    } finally { setSaving(false) }
  }

  return (
    <Card title="Ödeme ve Kargo" footer={<button onClick={save} disabled={saving} className="rounded-lg bg-blue-500/20 text-blue-200 px-3 py-1.5 text-sm border border-blue-500/30">{saving?"Kaydediliyor...":"Kaydet"}</button>}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Checkbox label="Kapıda Ödeme" checked={cod} onChange={setCod} />
        <Checkbox label="Kredi Kartı" checked={card} onChange={setCard} />
        <Input label="Kargo Firması" value={shippingCompany} onChange={setShippingCompany} />
        <Input label="Kargo Ücreti (₺)" type="number" value={shippingPrice} onChange={setShippingPrice} />
      </div>
    </Card>
  )
}

function LogsPanel() {
  const [logs, setLogs] = useState<any[]>([])
  useEffect(()=>{ (async()=>{
    try {
      const ql = query(collection(db, "logs"), orderBy("createdAt", "desc"), limit(50))
      const s = await getDocs(ql)
      setLogs(s.docs.map(d=>({ id: d.id, ...(d.data() as any) })))
    } catch {}
  })() }, [])
  return (
    <Card title="Son Hatalar / İşlem Logları">
      <div className="space-y-2 text-sm max-h-[480px] overflow-auto">
        {logs.length===0 && <div className="text-slate-400">Kayıt yok.</div>}
        {logs.map(l => (
          <div key={l.id} className="rounded border border-slate-800 p-2">
            <div className="text-xs text-slate-400">{ts(l.createdAt)}</div>
            <div className="font-medium">{l.level || 'info'} • {l.message || l.id}</div>
            {l.meta && <pre className="mt-1 text-xs text-slate-400 whitespace-pre-wrap">{JSON.stringify(l.meta, null, 2)}</pre>}
          </div>
        ))}
      </div>
    </Card>
  )
}

function Input({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string)=>void; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="block text-xs text-slate-400 mb-1">{label}</span>
      <input type={type} placeholder={placeholder} className="w-full rounded-lg border border-slate-800 bg-black/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500" value={value} onChange={(e)=>onChange(e.target.value)} />
    </label>
  )
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string)=>void }) {
  return (
    <label className="block">
      <span className="block text-xs text-slate-400 mb-1">{label}</span>
      <textarea className="w-full rounded-lg border border-slate-800 bg-black/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 min-h-[120px]" value={value} onChange={(e)=>onChange(e.target.value)} />
    </label>
  )
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean)=>void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" className="h-4 w-4" checked={checked} onChange={(e)=>onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

function fmtNum(n: number | null) { if (n===null) return "…"; return new Intl.NumberFormat('tr-TR').format(n) }
function startOfToday() { const d = new Date(); d.setHours(0,0,0,0); return d }
function yyyymm(d: Date) { return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}` }
function ts(t: any) { try { const d = t?.toDate ? t.toDate() : (typeof t==='number'? new Date(t) : null); return d? d.toLocaleString('tr-TR'): '-' } catch { return '-' } }
function dateRange(a: any, b: any) { try { const ad = a?.toDate? a.toDate(): (a? new Date(a): null); const bd = b?.toDate? b.toDate(): (b? new Date(b): null); if (!ad && !bd) return '—'; const fmt = (d: Date)=> d.toLocaleDateString('tr-TR'); return `${ad?fmt(ad):'—'} ~ ${bd?fmt(bd):'—'}` } catch { return '—' } }

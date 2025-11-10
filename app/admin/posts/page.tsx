"use client"

import { useEffect, useState } from "react"
import { auth, storage } from "@/lib/firebaseClient"
import { onAuthStateChanged, getIdToken } from "firebase/auth"
// B2 presigned upload kullanılacak; Firebase Storage import'u kaldırıldı

export default function AdminPostsPage() {
  const [uid, setUid] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [contentImage, setContentImage] = useState("")
  const [category, setCategory] = useState("")
  const [status, setStatus] = useState<"draft" | "published">("published")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [uploadPctCover, setUploadPctCover] = useState<number>(0)
  const [uploadPctContent, setUploadPctContent] = useState<number>(0)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null))
    return () => unsub()
  }, [])

  useEffect(() => {
    fetch('/api/posts?limit=20').then(r=>r.json()).then(d=>{
      if (d?.ok) setPosts(d.items || [])
    }).catch(()=>{})
  }, [success])

  const onCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f || !uid) return
    setError(null); setUploadPctCover(10)
    ;(async () => {
      try {
        const token = await getIdToken(auth.currentUser!)
        const direct = await fetch('/api/uploads/images', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        }).then(r=>r.json())
        if (!direct?.ok || !direct?.uploadURL) throw new Error('direct')
        const fd = new FormData()
        fd.append('file', f, f.name)
        const uploadToken = direct?.raw?.uploadToken || direct?.uploadToken || null
        const upRes = await fetch(direct.uploadURL, { method: 'POST', body: fd, headers: uploadToken ? { 'Authorization': `Bearer ${uploadToken}` } : undefined })
        const upJson = await upRes.json().catch(()=>({}))
        const imageId = upJson?.result?.id || upJson?.id
        if (!upRes.ok || !imageId) throw new Error('upload')
        setUploadPctCover(100)
        const hash = process.env.NEXT_PUBLIC_CF_IMAGES_HASH as string
        setCoverImage(`https://imagedelivery.net/${hash}/${imageId}/public`)
      } catch {
        setError('Yükleme başarısız')
        setUploadPctCover(0)
      }
    })()
  }

  const onContentFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f || !uid) return
    setError(null); setUploadPctContent(10)
    ;(async () => {
      try {
        const token = await getIdToken(auth.currentUser!)
        const direct = await fetch('/api/uploads/images', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        }).then(r=>r.json())
        if (!direct?.ok || !direct?.uploadURL) throw new Error('direct')
        const fd = new FormData()
        fd.append('file', f, f.name)
        const uploadToken = direct?.raw?.uploadToken || direct?.uploadToken || null
        const upRes = await fetch(direct.uploadURL, { method: 'POST', body: fd, headers: uploadToken ? { 'Authorization': `Bearer ${uploadToken}` } : undefined })
        const upJson = await upRes.json().catch(()=>({}))
        const imageId = upJson?.result?.id || upJson?.id
        if (!upRes.ok || !imageId) throw new Error('upload')
        setUploadPctContent(100)
        const hash = process.env.NEXT_PUBLIC_CF_IMAGES_HASH as string
        setContentImage(`https://imagedelivery.net/${hash}/${imageId}/public`)
      } catch {
        setError('Yükleme başarısız')
        setUploadPctContent(0)
      }
    })()
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null); setSuccess(null)
    if (!uid) { setError("Giriş gerekli"); return }
    if (!title.trim() || !content.trim()) { setError("Başlık ve içerik zorunlu"); return }
    try {
      setSaving(true)
      const token = await getIdToken(auth.currentUser!)
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title, content, coverImage: coverImage.trim() || null, contentImage: contentImage.trim() || null, category: category.trim() || null, status })
      })
      if (!res.ok) {
        const j = await res.json().catch(()=>({}))
        throw new Error(j?.error || 'fail')
      }
      setSuccess("Yazı kaydedildi.")
      setTitle(""); setContent(""); setCoverImage(""); setContentImage(""); setCategory(""); setStatus("published")
    } catch {
      setError("Kaydetme başarısız veya yetki yok (admin)")
    } finally { setSaving(false) }
  }

  return (
    <main className="container-narrow py-8">
      <h1 className="text-2xl font-bold text-slate-800">Blog Yazıları</h1>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Yeni Yazı</h2>
        {error && <div className="mt-2 rounded-lg border border-red-800 bg-red-900/20 text-red-100 px-3 py-2 text-sm">{error}</div>}
        {success && <div className="mt-2 rounded-lg border border-emerald-800 bg-emerald-900/20 text-emerald-100 px-3 py-2 text-sm">{success}</div>}
        <form onSubmit={submit} className="mt-3 grid grid-cols-1 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Başlık</label>
            <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">İçerik</label>
            <textarea value={content} onChange={(e)=>setContent(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm min-h-[140px]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Kapak Görseli</label>
              <div className="mt-1">
                <label className="inline-flex items-center gap-2 rounded-xl border border-dashed border-secondary/40 bg-secondary/5 px-3 py-2 text-sm cursor-pointer hover:bg-secondary/10">
                  <span aria-hidden>📷</span>
                  <span>Görsel Seç</span>
                  <input type="file" accept="image/*" onChange={onCoverFile} className="sr-only" />
                </label>
              </div>
              {uploadPctCover>0 && uploadPctCover<100 && (
                <div className="mt-2 h-2 w-full rounded bg-slate-100">
                  <div className="h-2 rounded bg-secondary" style={{ width: `${uploadPctCover}%` }} />
                </div>
              )}
              {coverImage && (
                <div className="mt-2 rounded-lg overflow-hidden border">
                  <img src={coverImage} alt="Kapak" className="w-full h-28 object-cover" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Kategori</label>
              <input value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Durum</label>
              <select value={status} onChange={(e)=>setStatus(e.target.value as any)} className="w-full rounded-lg border px-3 py-2 text-sm">
                <option value="published">Yayında</option>
                <option value="draft">Taslak</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">İçerik Görseli</label>
            <div className="mt-1">
              <label className="inline-flex items-center gap-2 rounded-xl border border-dashed border-secondary/40 bg-secondary/5 px-3 py-2 text-sm cursor-pointer hover:bg-secondary/10">
                <span aria-hidden>🖼️</span>
                <span>Görsel Seç</span>
                <input type="file" accept="image/*" onChange={onContentFile} className="sr-only" />
              </label>
            </div>
            {uploadPctContent>0 && uploadPctContent<100 && (
              <div className="mt-2 h-2 w-full rounded bg-slate-100">
                <div className="h-2 rounded bg-secondary" style={{ width: `${uploadPctContent}%` }} />
              </div>
            )}
            {contentImage && (
              <div className="mt-2 rounded-lg overflow-hidden border">
                <img src={contentImage} alt="İçerik" className="w-full h-28 object-cover" />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button disabled={saving} className="rounded-lg bg-secondary px-4 py-2 text-white text-sm disabled:opacity-50">Kaydet</button>
          </div>
        </form>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Son Yazılar</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {posts.length === 0 ? (
            <div className="text-slate-500 text-sm">Henüz yazı yok.</div>
          ) : posts.map(p => (
            <article key={p.id} className="rounded-xl border p-3">
              <div className="text-xs text-slate-500">{p.category || 'Genel'} • {p.createdAt?.toDate ? new Date(p.createdAt.toDate()).toLocaleDateString() : ''}</div>
              <h3 className="mt-1 font-semibold text-slate-800">{p.title}</h3>
              <p className="mt-1 text-sm text-slate-600 line-clamp-3">{p.content}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

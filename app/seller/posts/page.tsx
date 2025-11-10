"use client"
import { useEffect, useState } from "react"
import { auth } from "@/lib/firebaseClient"
import { onAuthStateChanged, getIdToken } from "firebase/auth"

export default function SellerPostsPage() {
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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editCoverImage, setEditCoverImage] = useState<string | null>(null)
  const [editContentImage, setEditContentImage] = useState<string | null>(null)
  const [editCategory, setEditCategory] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState<"draft" | "published">("published")
  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editUploadPctCover, setEditUploadPctCover] = useState<number>(0)
  const [editUploadPctContent, setEditUploadPctContent] = useState<number>(0)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null))
    return () => unsub()
  }, [])

  useEffect(() => {
    (async () => {
      try {
        if (!auth.currentUser) return
        const token = await getIdToken(auth.currentUser)
        const res = await fetch('/api/seller/posts', { headers: { 'Authorization': `Bearer ${token}` } })
        const d = await res.json().catch(()=>({}))
        if (res.ok && d?.ok) setPosts(d.items || [])
      } catch {}
    })()
  }, [success, savingEdit, deletingId])

  const onCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f || !uid) return
    setError(null); setUploadPctCover(10)
    ;(async () => {
      try {
        const token = await getIdToken(auth.currentUser!)
        const presign = await fetch('/api/uploads/b2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ filename: f.name, contentType: f.type, folder: 'posts/cover' })
        }).then(r=>r.json())
        if (!presign?.ok) throw new Error('presign')
        await fetch(presign.uploadUrl, { method: 'PUT', headers: { 'Content-Type': f.type }, body: f })
        setUploadPctCover(100)
        setCoverImage(presign.publicUrl)
      } catch {
        setError('Yükleme başarısız')
        setUploadPctCover(0)
      }
    })()
  }

  // --- Edit image uploads ---
  const onEditCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f || !uid) return
    setError(null); setEditUploadPctCover(10)
    ;(async () => {
      try {
        const token = await getIdToken(auth.currentUser!)
        const presign = await fetch('/api/uploads/b2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ filename: f.name, contentType: f.type, folder: 'posts/cover' })
        }).then(r=>r.json())
        if (!presign?.ok) throw new Error('presign')
        await fetch(presign.uploadUrl, { method: 'PUT', headers: { 'Content-Type': f.type }, body: f })
        setEditUploadPctCover(100)
        setEditCoverImage(presign.publicUrl)
      } catch {
        setError('Yükleme başarısız')
        setEditUploadPctCover(0)
      }
    })()
  }

  const onEditContentFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f || !uid) return
    setError(null); setEditUploadPctContent(10)
    ;(async () => {
      try {
        const token = await getIdToken(auth.currentUser!)
        const presign = await fetch('/api/uploads/b2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ filename: f.name, contentType: f.type, folder: 'posts/content' })
        }).then(r=>r.json())
        if (!presign?.ok) throw new Error('presign')
        await fetch(presign.uploadUrl, { method: 'PUT', headers: { 'Content-Type': f.type }, body: f })
        setEditUploadPctContent(100)
        setEditContentImage(presign.publicUrl)
      } catch {
        setError('Yükleme başarısız')
        setEditUploadPctContent(0)
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
        const presign = await fetch('/api/uploads/b2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ filename: f.name, contentType: f.type, folder: 'posts/content' })
        }).then(r=>r.json())
        if (!presign?.ok) throw new Error('presign')
        await fetch(presign.uploadUrl, { method: 'PUT', headers: { 'Content-Type': f.type }, body: f })
        setUploadPctContent(100)
        setContentImage(presign.publicUrl)
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
      const res = await fetch('/api/seller/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title, content, coverImage: coverImage.trim() || null, contentImage: contentImage.trim() || null, category: category.trim() || null, status })
      })
      const j = await res.json().catch(()=>({}))
      if (!res.ok || !j?.ok) throw new Error(j?.error || 'fail')
      setSuccess("Yazı kaydedildi.")
      setTitle(""); setContent(""); setCoverImage(""); setContentImage(""); setCategory(""); setStatus("published")
    } catch (e: any) {
      setError("Kaydetme başarısız veya yetki yok (onaylı satıcı)")
    } finally { setSaving(false) }
  }

  const startEdit = (p: any) => {
    setEditingId(p.id)
    setEditTitle(p.title || "")
    setEditContent(p.content || "")
    setEditCoverImage(p.coverImage || null)
    setEditContentImage(p.contentImage || null)
    setEditCategory(p.category || null)
    setEditStatus(p.status === 'published' ? 'published' : 'draft')
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = async () => {
    if (!editingId) return
    setSavingEdit(true)
    try {
      const token = await getIdToken(auth.currentUser!)
      const res = await fetch(`/api/seller/posts/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: editTitle, content: editContent, coverImage: editCoverImage, contentImage: editContentImage, category: editCategory, status: editStatus })
      })
      const j = await res.json().catch(()=>({}))
      if (!res.ok || !j?.ok) throw new Error(j?.error || 'fail')
      setEditingId(null)
      setSuccess('Yazı güncellendi.')
    } catch {
      setError('Güncelleme başarısız')
    } finally { setSavingEdit(false) }
  }

  const deletePost = async (id: string) => {
    if (!confirm('Bu yazı silinsin mi?')) return
    setDeletingId(id)
    try {
      const token = await getIdToken(auth.currentUser!)
      const res = await fetch(`/api/seller/posts/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
      const j = await res.json().catch(()=>({}))
      if (!res.ok || !j?.ok) throw new Error(j?.error || 'fail')
      setSuccess('Yazı silindi.')
      setPosts(p => p.filter(x => x.id !== id))
    } catch {
      setError('Silme başarısız')
    } finally { setDeletingId(null) }
  }

  return (
    <main className="container-narrow py-8">
      <h1 className="text-2xl font-bold text-slate-800">Satıcı Blog Yazıları</h1>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Yeni Yazı</h2>
        {error && <div className="mt-2 rounded-lg border border-red-800 bg-red-900/10 text-red-800 px-3 py-2 text-sm">{error}</div>}
        {success && <div className="mt-2 rounded-lg border border-emerald-800 bg-emerald-50 text-emerald-900 px-3 py-2 text-sm">{success}</div>}
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
          <div className="flex gap-2 mt-3">
            <button disabled={saving} className="rounded-lg bg-secondary px-4 py-2 text-white text-sm disabled:opacity-50">Kaydet</button>
          </div>
        </form>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Son Yazılar</h2>
        <div className="mt-3 space-y-3">
          {posts.length === 0 ? (
            <div className="text-slate-500 text-sm">Henüz yazı yok.</div>
          ) : posts.map(p => (
            <article key={p.id} className="rounded-xl border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-slate-500">{p.category || 'Genel'} • {p.createdAt?.toDate ? new Date(p.createdAt.toDate()).toLocaleDateString() : ''} • {p.status === 'published' ? 'Yayında' : 'Taslak'}</div>
                  <h3 className="mt-1 font-semibold text-slate-800 truncate">{p.title}</h3>
                </div>
                <div className="shrink-0 flex gap-2">
                  <button className="px-3 py-1.5 rounded-lg border text-sm" onClick={() => startEdit(p)}>Düzenle</button>
                  <button className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm disabled:opacity-50" onClick={() => deletePost(p.id)} disabled={deletingId===p.id}>Sil</button>
                </div>
              </div>
              {editingId === p.id ? (
                <div className="mt-3 grid grid-cols-1 gap-2">
                  <input value={editTitle} onChange={(e)=>setEditTitle(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Başlık" />
                  <textarea value={editContent} onChange={(e)=>setEditContent(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm min-h-[100px]" placeholder="İçerik" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Kapak Görseli</label>
                      <label className="inline-flex items-center gap-2 rounded-xl border border-dashed border-secondary/40 bg-secondary/5 px-3 py-2 text-sm cursor-pointer hover:bg-secondary/10">
                        <span aria-hidden>📷</span>
                        <span>Görsel Seç</span>
                        <input type="file" accept="image/*" onChange={onEditCoverFile} className="sr-only" />
                      </label>
                      {editUploadPctCover>0 && editUploadPctCover<100 && (
                        <div className="mt-2 h-2 w-full rounded bg-slate-100"><div className="h-2 rounded bg-secondary" style={{ width: `${editUploadPctCover}%` }} /></div>
                      )}
                      {editCoverImage && (
                        <div className="mt-2 rounded-lg overflow-hidden border"><img src={editCoverImage} alt="Kapak" className="w-full h-24 object-cover" /></div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">İçerik Görseli</label>
                      <label className="inline-flex items-center gap-2 rounded-xl border border-dashed border-secondary/40 bg-secondary/5 px-3 py-2 text-sm cursor-pointer hover:bg-secondary/10">
                        <span aria-hidden>🖼️</span>
                        <span>Görsel Seç</span>
                        <input type="file" accept="image/*" onChange={onEditContentFile} className="sr-only" />
                      </label>
                      {editUploadPctContent>0 && editUploadPctContent<100 && (
                        <div className="mt-2 h-2 w-full rounded bg-slate-100"><div className="h-2 rounded bg-secondary" style={{ width: `${editUploadPctContent}%` }} /></div>
                      )}
                      {editContentImage && (
                        <div className="mt-2 rounded-lg overflow-hidden border"><img src={editContentImage} alt="İçerik" className="w-full h-24 object-cover" /></div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Kategori</label>
                      <input value={editCategory||''} onChange={(e)=>setEditCategory(e.target.value||null)} className="rounded-lg border px-3 py-2 text-sm" placeholder="Kategori" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={editStatus} onChange={(e)=>setEditStatus(e.target.value as any)} className="rounded-lg border px-3 py-2 text-sm">
                      <option value="published">Yayında</option>
                      <option value="draft">Taslak</option>
                    </select>
                    <div className="ml-auto flex gap-2">
                      <button className="px-3 py-1.5 rounded-lg border text-sm" onClick={cancelEdit} type="button">Vazgeç</button>
                      <button className="px-3 py-1.5 rounded-lg bg-secondary text-white text-sm disabled:opacity-50" onClick={saveEdit} type="button" disabled={savingEdit}>Kaydet</button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-sm text-slate-600 line-clamp-3">{p.content}</p>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

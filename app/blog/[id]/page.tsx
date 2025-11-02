"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function BlogDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [post, setPost] = useState<any | null>(null)
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    let alive = true
    Promise.all([
      fetch(`/api/posts/${id}`).then(r=>r.json()),
      fetch(`/api/posts/${id}/comments`).then(r=>r.json())
    ]).then(([p, c]) => {
      if (!alive) return
      setPost(p?.item || null)
      setComments(c?.items || [])
    }).finally(()=>{ if (alive) setLoading(false) })
    return () => { alive = false }
  }, [id])

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch(`/api/posts/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, content: text })
    })
    const d = await res.json()
    if (d?.ok && d.item) {
      setComments(prev => [d.item, ...prev])
      setText('')
    }
  }

  if (loading) return <main className="container-narrow py-10">Yükleniyor…</main>
  if (!post) return <main className="container-narrow py-10">Yazı bulunamadı.</main>

  return (
    <main className="bg-white">
      <section className="border-b border-slate-200">
        <div
          className="relative"
          style={{
            backgroundImage: `url(${post.coverImage || post.image || ''})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative">
            <div className="container-narrow py-10">
              <Link href="/blog" className="text-sm text-white/90">← Bloga Dön</Link>
              <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-white">{post.title}</h1>
              {post.createdAt && (
                <div className="mt-1 text-sm text-white/80">{new Date(post.createdAt._seconds ? post.createdAt._seconds*1000 : post.createdAt).toLocaleDateString()}</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-narrow grid md:grid-cols-12 gap-8">
          <article className="md:col-span-8">
            {post.contentImage && (
              <div className="mb-5 rounded-2xl overflow-hidden border">
                <img src={post.contentImage} alt={post.title} className="w-full h-auto object-cover" />
              </div>
            )}
            <div className="prose max-w-none">
              {post.content ? <div dangerouslySetInnerHTML={{ __html: post.content }} /> : <p>{post.excerpt || ''}</p>}
            </div>
          </article>
          <aside className="md:col-span-4">
            <div className="rounded-2xl border p-4 bg-white">
              <div className="text-sm text-slate-600">Kategori</div>
              <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-secondary text-white px-2.5 py-1 text-xs font-medium">
                <span aria-hidden>🏷️</span>{post.category || 'Genel'}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="py-10 border-t border-slate-200 bg-white">
        <div className="container-narrow">
          <h2 className="text-xl font-bold">Yorumlar</h2>
          <form onSubmit={submitComment} className="mt-4 rounded-2xl border p-4 bg-white">
            <div className="grid sm:grid-cols-2 gap-3">
              <input value={name} onChange={e=>setName(e.target.value)} className="rounded-lg border px-3 py-2" placeholder="Adınız (opsiyonel)" />
              <input value={text} onChange={e=>setText(e.target.value)} className="rounded-lg border px-3 py-2" placeholder="Yorumunuz" />
            </div>
            <div className="mt-3">
              <button className="rounded-xl bg-secondary px-4 py-2.5 text-white font-semibold hover:opacity-90">Gönder</button>
            </div>
          </form>

          <div className="mt-6 space-y-3">
            {comments.map((c:any) => (
              <div key={c.id} className="rounded-2xl border p-4 bg-white">
                <div className="text-sm font-semibold">{c.name || 'Misafir'}</div>
                <div className="text-sm text-slate-700">{c.content}</div>
                {c.createdAt && <div className="text-xs text-slate-500 mt-1">{new Date(c.createdAt._seconds ? c.createdAt._seconds*1000 : c.createdAt).toLocaleString()}</div>}
              </div>
            ))}
            {comments.length===0 && (
              <div className="text-slate-600 text-sm">İlk yorumu yazan sen ol.</div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

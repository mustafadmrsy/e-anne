"use client"
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

export default function BlogDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [post, setPost] = useState<any | null>(null)
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [name, setName] = useState('')

  // Metin kartı kaydırma kontrolü (görsel ile eşit boy ve oklarla kaydırma)
  const textRef = useRef<HTMLDivElement | null>(null)
  const [canUp, setCanUp] = useState(false)
  const [canDown, setCanDown] = useState(false)
  const updateScrollState = () => {
    const el = textRef.current
    if (!el) return
    setCanUp(el.scrollTop > 0)
    setCanDown(el.scrollTop + el.clientHeight < el.scrollHeight - 1)
  }
  const scrollByStep = (dir: number) => {
    const el = textRef.current
    if (!el) return
    el.scrollBy({ top: dir * Math.max(200, Math.floor(el.clientHeight * 0.8)), behavior: 'smooth' })
  }

  // İçerik geldikten sonra okların aktiflik durumunu hesapla
  useEffect(() => {
    const t = setTimeout(updateScrollState, 0)
    return () => clearTimeout(t)
  }, [post])

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
    <>
    <main className="bg-secondary min-h-screen">
      <section className="border-b border-slate-200">
        <div
          className="relative min-h-[220px] md:min-h-[320px] lg:min-h-[380px]"
          style={{
            backgroundImage: `url(${post.coverImage || post.image || ''})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent" />
          <div className="relative">
            <div className="container-narrow py-12 md:py-16">
              <Link href="/blog" className="text-sm text-white/90">← Bloga Dön</Link>
              <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-white">{post.title}</h1>
              {post.createdAt && (
                <div className="mt-1 text-sm text-white/80">{new Date(post.createdAt._seconds ? post.createdAt._seconds*1000 : post.createdAt).toLocaleDateString()}</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 bg-secondary">
        <div className="container-narrow">
          {post.contentImage ? (
            <div className="md:grid md:grid-cols-12 md:gap-6">
              <div className="md:col-span-6">
                <div className="rounded-3xl border bg-slate-50 p-2">
                  <div className="rounded-2xl overflow-hidden shadow-sm">
                    <div className="aspect-[4/3] w-full">
                      <img src={post.contentImage} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-6">
                <div className="rounded-3xl border border-secondary/30 bg-white/95 backdrop-blur overflow-hidden relative shadow-md">
                  {/* Eşit yükseklik için aynı oran */}
                  <div className="aspect-[4/3] w-full">
                    {/* Scrollable content */}
                    <div
                      ref={textRef}
                      onScroll={updateScrollState}
                      className="h-full w-full overflow-y-auto overflow-x-hidden p-5 sm:p-6"
                    >
                      <div className="prose max-w-none break-all">
                        {post.content ? <div dangerouslySetInnerHTML={{ __html: post.content }} /> : <p>{post.excerpt || ''}</p>}
                      </div>
                    </div>
                    {/* Üst/alt gradient efektleri */}
                    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent" />
                    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
                    {/* Kaydırma okları */}
                    <button
                      type="button"
                      aria-label="Yukarı kaydır"
                      onClick={()=>scrollByStep(-1)}
                      className={`absolute right-3 top-3 h-9 w-9 rounded-full shadow flex items-center justify-center ${canUp? 'bg-secondary text-white' : 'bg-white/70 text-slate-400'}`}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label="Aşağı kaydır"
                      onClick={()=>scrollByStep(1)}
                      className={`absolute right-3 bottom-3 h-9 w-9 rounded-full shadow flex items-center justify-center ${canDown? 'bg-secondary text-white' : 'bg-white/70 text-slate-400'}`}
                    >
                      ↓
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="prose max-w-none">
              {post.content ? <div dangerouslySetInnerHTML={{ __html: post.content }} /> : <p>{post.excerpt || ''}</p>}
            </div>
          )}

          <div className="mt-6 md:mt-8">
            <div className="rounded-2xl border p-4 bg-white inline-flex items-center gap-2">
              <div className="text-sm text-slate-600">Kategori:</div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary text-white px-2.5 py-1 text-xs font-medium">
                <span aria-hidden>🏷️</span>{post.category || 'Genel'}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 bg-secondary">
        <div className="container-narrow">
          <h2 className="text-xl font-bold text-white">Yorumlar</h2>
          <form onSubmit={submitComment} className="mt-4 rounded-2xl border p-4 bg-white">
            <div className="grid sm:grid-cols-2 gap-3">
              <input value={name} onChange={e=>setName(e.target.value)} className="rounded-lg border px-3 py-2" placeholder="Adınız (opsiyonel)" />
              <textarea value={text} onChange={e=>setText(e.target.value)} className="rounded-lg border px-3 py-2 min-h-[90px] sm:col-span-1" placeholder="Yorumunuz" />
            </div>
            <div className="mt-3">
              <button className="rounded-xl bg-secondary px-4 py-2.5 text-white font-semibold hover:opacity-90">Gönder</button>
            </div>
          </form>

          <div className="mt-6 space-y-3">
            {comments.map((c:any) => (
              <div key={c.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                <div className="text-sm font-semibold">{c.name || 'Misafir'}</div>
                <div className="text-sm text-slate-700">{c.content}</div>
                {c.createdAt && <div className="text-xs text-slate-500 mt-1">{new Date(c.createdAt._seconds ? c.createdAt._seconds*1000 : c.createdAt).toLocaleString()}</div>}
              </div>
            ))}
            {comments.length===0 && (
              <div className="text-white/90 text-sm">İlk yorumu yazan sen ol.</div>
            )}
          </div>
        </div>
      </section>
    </main>
    <style jsx global>{`
      footer.mt-12 { margin-top: 0 !important; }
      footer > div.border-t { border-color: transparent !important; }
    `}</style>
    </>
  )
}

"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function BlogListPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    fetch('/api/posts?limit=24').then(r=>r.json()).then(d=>{
      if (!alive) return
      setPosts(d?.items || [])
    }).finally(()=>{ if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  return (
    <main className="bg-white">
      <section className="border-b border-slate-200 bg-gradient-to-r from-secondary/10 to-secondary/5">
        <div className="container-narrow py-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Blog & Tarifler</h1>
          <p className="mt-1 text-slate-600">Mutfaktan haberler, tarifler ve ipuçları.</p>
        </div>
      </section>

      <section className="py-10">
        <div className="container-narrow">
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {Array.from({length:6}).map((_,i)=> (
                <div key={i} className="rounded-2xl border p-4 h-48 bg-white animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {(posts.length>0?posts:[]).map((p:any)=> (
                <article key={p.id} className="group bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-2xl overflow-hidden border border-secondary/30 shadow-sm hover:shadow-md transition">
                  {(() => {
                    const img = p.coverImage || p.image
                    const isUrl = typeof img === 'string' && (/^https?:\/\//i).test(img)
                    if (isUrl) {
                      return (
                        <div className="aspect-video overflow-hidden">
                          <img src={img} alt={p.title} className="w-full h-full object-cover" />
                        </div>
                      )
                    }
                    return (
                      <div className="aspect-video bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center text-5xl">
                        <span>{img || '📝'}</span>
                      </div>
                    )
                  })()}
                  <div className="p-5">
                    <div className="flex items-center gap-3 text-xs text-slate-600 mb-2">
                      {p.category && <span className="px-2 py-0.5 bg-secondary text-white rounded-full">{p.category}</span>}
                      {p.createdAt && <span className="flex items-center gap-1"><span aria-hidden>📅</span>{new Date(p.createdAt._seconds ? p.createdAt._seconds*1000 : p.createdAt).toLocaleDateString()}</span>}
                    </div>
                    <h3 className="font-semibold text-slate-800 line-clamp-2">{p.title}</h3>
                    <div className="mt-3">
                      <Link href={`/blog/${p.id}`} className="text-secondary text-sm inline-flex items-center gap-1">Devamını Oku <span aria-hidden>→</span></Link>
                    </div>
                  </div>
                </article>
              ))}
              {posts.length===0 && (
                <div className="text-slate-600">Henüz yayınlanmış yazı bulunmuyor.</div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

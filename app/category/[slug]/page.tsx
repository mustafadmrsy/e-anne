import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductGrid } from '@/components/ProductGrid'
import Breadcrumbs from '@/components/Breadcrumbs'
import SectionTitle from '@/components/SectionTitle'

type Props = { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `${params.slug} | Kategori` }
}

export default async function CategoryPage({ params }: Props) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ? process.env.NEXT_PUBLIC_SITE_URL : ''
  const catRes = await fetch(`${base}/api/categories`, { cache: 'no-store' }).catch(()=>null as any)
  const catData = await (async()=>{ try { return await catRes?.json() } catch { return null } })()
  const cats: any[] = Array.isArray(catData?.items) ? catData.items : []
  const cat = cats.find(x => x.id === params.slug)
  if (!cat) return notFound()

  const res = await fetch(`${base}/api/products?category=${encodeURIComponent(params.slug)}&limit=48`, { cache: 'no-store' }).catch(()=>null as any)
  const data = await (async()=>{ try { return await res?.json() } catch { return null } })()
  const items: any[] = Array.isArray(data?.items) ? data.items : []
  return (
    <main className="container-narrow py-8">
      <Breadcrumbs items={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Kategoriler', href: '/categories' }, { label: cat.name || params.slug }]} />
      <div className="mt-3">
        <SectionTitle title={cat.name || params.slug} subtitle={cat.description || ''} />
      </div>
      <div className="mt-6">
        {items.length > 0 ? (
          <ProductGrid products={items.map(p => ({
            slug: p.slug,
            name: p.name,
            price: p.price,
            image: p.image,
            sellerName: p.sellerName,
            rating: p.rating,
          }))} />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">Bu kategoride ürün bulunamadı.</div>
        )}
      </div>
    </main>
  )
}

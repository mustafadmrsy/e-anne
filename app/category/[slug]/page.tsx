import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { categories } from '@/lib/categories'
import { products } from '@/lib/products'
import { ProductGrid } from '@/components/ProductGrid'
import Breadcrumbs from '@/components/Breadcrumbs'
import SectionTitle from '@/components/SectionTitle'

type Props = { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = categories.find(c => c.slug === params.slug)
  if (!cat) return { title: 'Kategori' }
  return {
    title: `${cat.name} | Kategori`,
    description: cat.description || `${cat.name} ürünleri.`
  }
}

export default function CategoryPage({ params }: Props) {
  const cat = categories.find(c => c.slug === params.slug)
  if (!cat) return notFound()
  const items = products.filter(p => p.category === cat.slug)

  return (
    <main className="container-narrow py-8">
      <Breadcrumbs items={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Kategoriler', href: '/categories' }, { label: cat.name }]} />
      <div className="mt-3">
        <SectionTitle title={cat.name} subtitle={cat.description} />
      </div>
      <div className="mt-6">
        {items.length > 0 ? (
          <ProductGrid products={items} />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">Bu kategoride ürün bulunamadı.</div>
        )}
      </div>
    </main>
  )
}

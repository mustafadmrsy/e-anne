import type { Metadata } from 'next'
import Link from 'next/link'
import { categories } from '@/lib/categories'
import Breadcrumbs from '@/components/Breadcrumbs'
import SectionTitle from '@/components/SectionTitle'

export const metadata: Metadata = {
  title: 'Kategoriler',
  description: 'E-Anne: Erişte ve doğal ürün kategorilerini keşfedin.'
}

export default function CategoriesPage() {
  return (
    <main className="container-narrow py-8">
      <Breadcrumbs items={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Kategoriler' }]} />
      <div className="mt-3">
        <SectionTitle title="Kategoriler" subtitle="Tüm erişte kategorilerimizi keşfedin" />
      </div>
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map(c => (
          <Link key={c.slug} href={`/category/${c.slug}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-card hover:shadow-cardHover transition">
            <div className="font-semibold text-slate-900">{c.name}</div>
            {c.description && <div className="text-sm text-slate-600 mt-1">{c.description}</div>}
          </Link>
        ))}
      </div>
    </main>
  )
}

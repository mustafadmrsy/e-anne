import type { Metadata } from 'next'
import Breadcrumbs from '@/components/Breadcrumbs'
import SectionTitle from '@/components/SectionTitle'

export const metadata: Metadata = {
  title: 'Kampanyalar',
  description: 'Güncel indirim ve fırsatlar.'
}

export default function CampaignsPage() {
  return (
    <main className="container-narrow py-8">
      <Breadcrumbs items={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Kampanyalar' }]} />
      <div className="mt-3">
        <SectionTitle title="Kampanyalar" subtitle="Güncel indirim ve fırsatları kaçırmayın" />
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3].map(i => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card hover:shadow-cardHover transition">
            <div className="text-lg font-semibold text-slate-900">İlk Alışverişe %10</div>
            <div className="text-sm text-slate-600 mt-1">Kod: ILK10</div>
            <button className="mt-4 rounded-lg bg-brand text-white px-4 py-2 font-medium hover:opacity-90">Kodu Kullan</button>
          </div>
        ))}
      </div>
    </main>
  )
}

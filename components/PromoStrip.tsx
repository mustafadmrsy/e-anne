import Link from 'next/link'

export default function PromoStrip() {
  return (
    <div className="bg-wood/10 border-y border-wood/20">
      <div className="container-narrow py-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-secondary">
        <div className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-brand" /> 200 TL ve üzeri kargo bedava</div>
        <div className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-brand" /> İlk alışverişe %10 indirim <Link href="/kampanyalar" className="underline ml-1">Detay</Link></div>
        <div className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-brand" /> Aynı gün kargo</div>
      </div>
    </div>
  )
}

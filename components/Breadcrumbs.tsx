import Link from 'next/link'

type Crumb = { label: string; href?: string }

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1 text-slate-600">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {item.href ? (
              <Link href={item.href} className="hover:text-brand">{item.label}</Link>
            ) : (
              <span className="text-slate-900 font-medium">{item.label}</span>
            )}
            {i < items.length - 1 && <span className="text-slate-400">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}

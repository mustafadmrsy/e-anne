export default function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-secondary">{title}</h1>
      {subtitle && <p className="mt-2 text-slate-600">{subtitle}</p>}
    </div>
  )
}

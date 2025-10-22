"use client"

import Link from "next/link"

export default function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const items = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/sellers", label: "Satıcı Başvuruları" },
    { href: "/admin/site", label: "Site Yönetimi" },
    { href: "/admin/products", label: "Ürünler" },
  ]
  return (
    <nav className="px-2 space-y-1">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          onClick={onNavigate}
          className="block rounded-lg px-3 py-2 hover:bg-slate-800"
        >
          {i.label}
        </Link>
      ))}
    </nav>
  )
}

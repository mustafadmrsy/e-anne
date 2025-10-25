"use client"
import { ReactNode, useState } from "react"
import Link from "next/link"
import AdminGuard from "@/components/AdminGuard"
import AdminSidebar from "@/components/AdminSidebar"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <style jsx global>{`
        footer { display: none !important; }
        body { background: #0b0c0e; }
        /* Hide public-site promo bar within admin */
        .container-narrow.py-3.grid.grid-cols-1 { display: none !important; }
        /* Make public header dark in admin */
        header.sticky.top-0 { background: rgba(0,0,0,0.6) !important; border-bottom-color: #1f2937 !important; }
        header.sticky.top-0 a, header.sticky.top-0 span, header.sticky.top-0 button { color: #e5e7eb !important; }
      `}</style>
      <div className="min-h-screen grid grid-cols-12 text-slate-100">
        <aside className="hidden lg:block col-span-2 bg-black/60 border-r border-slate-800">
          <div className="p-4 text-xl font-bold tracking-tight">E-Anne Admin</div>
          <AdminSidebar />
        </aside>
        <div className="col-span-12 lg:col-span-10">
          <AdminTopBar />
          <main className="mx-auto max-w-7xl px-4 py-6">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  )
}

function AdminTopBar() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <header className="sticky top-0 z-20 backdrop-blur bg-black/40 border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={()=>setOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-200" aria-label="Menü">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <span className="h-2.5 w-2.5 rounded-full bg-blue-400/80"></span>
            <span className="text-sm text-slate-300">Yönetim Paneli</span>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-30 lg:hidden" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/60" onClick={()=>setOpen(false)}></div>
          <aside className="absolute left-0 top-0 h-full w-72 bg-black/90 border-r border-slate-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-bold">E-Anne Admin</div>
              <button onClick={()=>setOpen(false)} className="p-2 rounded-lg hover:bg-slate-800" aria-label="Kapat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <AdminSidebar onNavigate={()=>setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  )
}

import { ReactNode } from "react";
import Link from "next/link";
import SellerGuard from "@/components/SellerGuard";

export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <SellerGuard>
      <section className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <aside className="md:col-span-3 lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-3">
            <nav className="space-y-1 text-sm">
              <Link href="/seller" className="block rounded-lg px-3 py-2 hover:bg-slate-50">Dashboard</Link>
              <Link href="/seller/products" className="block rounded-lg px-3 py-2 hover:bg-slate-50">Ürünler</Link>
              <Link href="/seller/add-product" className="block rounded-lg px-3 py-2 hover:bg-slate-50">Ürün Ekle</Link>
              <Link href="/seller/orders" className="block rounded-lg px-3 py-2 hover:bg-slate-50">Siparişler</Link>
              <Link href="/seller/notifications" className="block rounded-lg px-3 py-2 hover:bg-slate-50">Bildirimler</Link>
              <Link href="/seller/profile" className="block rounded-lg px-3 py-2 hover:bg-slate-50">Mağaza Profili</Link>
              <Link href="/seller/payouts" className="block rounded-lg px-3 py-2 hover:bg-slate-50">Finans / Ödemeler</Link>
              <Link href="/seller/reviews" className="block rounded-lg px-3 py-2 hover:bg-slate-50">Yorumlar</Link>
              <Link href="/seller/settings" className="block rounded-lg px-3 py-2 hover:bg-slate-50">Ayarlar</Link>
            </nav>
          </aside>
          <main className="md:col-span-9 lg:col-span-10">{children}</main>
        </div>
      </section>
    </SellerGuard>
  );
}

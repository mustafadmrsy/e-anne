"use client"

import { useRouter } from "next/navigation"

export default function RegisterRolePage() {
  const router = useRouter()
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-secondary">Kayıt Türü Seçimi</h1>
      <p className="mt-2 text-slate-600">Devam etmek istediğiniz kayıt türünü seçin.</p>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
        <button
          className="rounded-2xl border border-slate-200 bg-white p-6 text-left hover:border-brand"
          onClick={() => router.push("/register")}
        >
          <h2 className="text-xl font-semibold text-slate-900">Müşteri olarak kayıt ol</h2>
          <p className="mt-1 text-sm text-slate-600">Alışveriş yapmak için standart kullanıcı hesabı oluşturun.</p>
        </button>
        <button
          className="rounded-2xl border border-slate-200 bg-white p-6 text-left hover:border-brand"
          onClick={() => router.push("/register/seller")}
        >
          <h2 className="text-xl font-semibold text-slate-900">Satıcı olarak kayıt ol</h2>
          <p className="mt-1 text-sm text-slate-600">Mağaza açın, ürün ekleyin ve satış yapın.</p>
        </button>
      </div>
    </main>
  )
}

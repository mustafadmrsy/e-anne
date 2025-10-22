"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { auth, db } from "@/lib/firebaseClient"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

export default function SellerGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { setAllowed(false); router.push("/login"); return }
      try {
        const udoc = await getDoc(doc(db, "users", u.uid))
        const status = (udoc.data() as any)?.sellerStatus
        if (status === "approved") {
          setAllowed(true)
        } else {
          setAllowed(false)
          // Satıcı başvuru durum sayfasına yönlendir
          router.push("/seller-dashboard")
        }
      } catch {
        setAllowed(false)
        router.push("/login")
      }
    })
    return () => unsub()
  }, [router, pathname])

  if (allowed === null) return <div className="p-6 text-sm text-slate-600">Yükleniyor...</div>
  if (!allowed) return null
  return <>{children}</>
}

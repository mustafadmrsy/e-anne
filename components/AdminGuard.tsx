"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/lib/firebaseClient"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"

const SUPERADMIN_UID = process.env.NEXT_PUBLIC_SUPERADMIN_UID || "unOn6yl9HyQebMFRBA3znR9mq3I2"

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { setAllowed(false); router.push("/login"); return }
      try {
        // Auto-provision admins doc if missing and user is designated super admin
        const adminRef = doc(db, "admins", u.uid)
        const adm = await getDoc(adminRef)
        if (!adm.exists() && u.uid === SUPERADMIN_UID) {
          await setDoc(adminRef, {
            email: u.email ?? null,
            name: u.displayName ?? null,
            role: "admin",
            createdAt: serverTimestamp(),
          }, { merge: true })
        }
        const finalDoc = adm.exists() ? adm : await getDoc(adminRef)
        setAllowed(finalDoc.exists())
        if (!finalDoc.exists()) router.push("/login")
      } catch {
        setAllowed(false)
        router.push("/login")
      }
    })
    return () => unsub()
  }, [router])

  if (allowed === null) return <div className="p-6 text-sm text-slate-600">Yükleniyor...</div>
  if (!allowed) return null
  return <>{children}</>
}

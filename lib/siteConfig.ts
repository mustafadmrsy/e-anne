import { db } from "@/lib/firebaseClient"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"

export type BlockBase = {
  id: string
  type: "banner" | "products" | "text" | "campaign"
  title?: string
  subtitle?: string
  text?: string
  image?: { url: string; alt?: string }
  cta?: { label: string; href: string }
  variant?: string
}

export type ProductsBlock = BlockBase & {
  type: "products"
  source?: "manual" | "collection" | "query"
  productIds?: string[]
  collectionId?: string
  query?: { field: string; op: "==" | "in" | ">=" | "<="; value: any; limit?: number; orderBy?: string }
}

export type Block = BlockBase | ProductsBlock

export type SitePage = {
  slug: string
  layout: Block[]
  updatedAt?: any
  updatedBy?: string | null
}

export async function getPageConfig(slug: string): Promise<SitePage> {
  const ref = doc(db, "site", `pages_${slug}`)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    return { slug, layout: [] }
  }
  const data = snap.data() as any
  return { slug, layout: (data.layout || []) as Block[], updatedAt: data.updatedAt, updatedBy: data.updatedBy }
}

export async function savePageConfig(slug: string, page: SitePage, userId?: string) {
  const ref = doc(db, "site", `pages_${slug}`)
  await setDoc(ref, {
    slug,
    layout: page.layout,
    updatedAt: serverTimestamp(),
    updatedBy: userId ?? null,
  }, { merge: true })
}

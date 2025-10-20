export type Category = {
  slug: string
  name: string
  description?: string
}

export const categories: Category[] = [
  { slug: 'eriste-klasik', name: 'Klasik Erişte', description: 'Geleneksel tat.' },
  { slug: 'eriste-tam-bugday', name: 'Tam Buğday', description: 'Sağlıklı seçim.' },
  { slug: 'eriste-yumurta', name: 'Yumurtalı', description: 'Zengin lezzet.' },
  { slug: 'eriste-ozel', name: 'Özel Karışımlar', description: 'Farklı aromalar.' }
]

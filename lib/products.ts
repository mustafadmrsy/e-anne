export type Product = {
  slug: string
  name: string
  price: string
  image: string
  description?: string
  stock?: number
  category?: string
}

export const products: Product[] = [
  {
    slug: 'eriste-klasik',
    name: 'Erişte (Klasik)',
    price: '₺79,90',
    image: 'https://images.unsplash.com/photo-1546549039-49a3906ec8b4?q=80&w=1200&auto=format&fit=crop',
    description: 'Doğal malzemelerle hazırlanmış, geleneksel lezzet.',
    stock: 24,
    category: 'eriste-klasik'
  },
  {
    slug: 'eriste-keciboynuzu',
    name: 'Erişte (Keçiboynuzlu)',
    price: '₺89,90',
    image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1200&auto=format&fit=crop',
    description: 'Keçiboynuzu katkılı, lif açısından zengin.',
    stock: 12,
    category: 'eriste-ozel'
  },
  {
    slug: 'eriste-tam-bugday',
    name: 'Erişte (Tam Buğday)',
    price: '₺84,90',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1200&auto=format&fit=crop',
    description: 'Tam buğday unuyla hazırlanmış, sağlıklı seçenek.',
    stock: 8,
    category: 'eriste-tam-bugday'
  },
  {
    slug: 'eriste-yumurta',
    name: 'Erişte (Yumurtalı)',
    price: '₺82,90',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1200&auto=format&fit=crop',
    description: 'Köy yumurtasıyla, zengin lezzet.',
    stock: 0,
    category: 'eriste-yumurta'
  }
]

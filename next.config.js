/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' }
    ]
  },
  async redirects() {
    return [
      { source: '/kategoriler', destination: '/categories', permanent: true },
      { source: '/kategori/:slug', destination: '/category/:slug', permanent: true },
      { source: '/kampanyalar', destination: '/campaigns', permanent: true },
      { source: '/hakkimizda', destination: '/about', permanent: true },
      { source: '/hesabim', destination: '/account', permanent: true },
      { source: '/siparisler', destination: '/orders', permanent: true },
      { source: '/giris', destination: '/login', permanent: true },
      { source: '/sepet', destination: '/cart', permanent: true },
      { source: '/odeme', destination: '/checkout', permanent: true }
    ]
  }
}

module.exports = nextConfig

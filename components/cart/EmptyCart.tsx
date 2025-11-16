/**
 * Empty Cart Component - Shown when cart is empty
 */

'use client';

import Link from 'next/link';

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-32 h-32 mb-6 text-gray-300">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Sepetiniz Boş
      </h2>
      
      <p className="text-gray-600 text-center mb-8 max-w-md">
        Henüz sepetinize ürün eklemediniz. 
        El yapımı ürünlerimize göz atmak için alışverişe başlayın!
      </p>

      <Link
        href="/products"
        className="bg-gray-900 text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors font-medium"
      >
        Ürünleri Keşfet
      </Link>

      {/* Popular Categories */}
      <div className="mt-12 w-full max-w-2xl">
        <h3 className="text-lg font-semibold text-center mb-6">
          Popüler Kategoriler
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/category/eriste"
            className="p-4 border rounded-lg hover:border-gray-400 transition-colors text-center"
          >
            <div className="text-3xl mb-2">🍝</div>
            <span className="text-sm font-medium">Erişte</span>
          </Link>
          
          <Link
            href="/category/tursu"
            className="p-4 border rounded-lg hover:border-gray-400 transition-colors text-center"
          >
            <div className="text-3xl mb-2">🥒</div>
            <span className="text-sm font-medium">Turşu</span>
          </Link>
          
          <Link
            href="/category/recel"
            className="p-4 border rounded-lg hover:border-gray-400 transition-colors text-center"
          >
            <div className="text-3xl mb-2">🍓</div>
            <span className="text-sm font-medium">Reçel</span>
          </Link>
          
          <Link
            href="/category/el-isciligi"
            className="p-4 border rounded-lg hover:border-gray-400 transition-colors text-center"
          >
            <div className="text-3xl mb-2">🧶</div>
            <span className="text-sm font-medium">El İşi</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

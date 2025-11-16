import { Metadata } from 'next';
import { ProductFormComponent } from '@/components/admin/product-form/ProductFormComponent';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Ürün Yönetimi | Admin',
};

export default function AdminProductsPage() {
  // TODO: Auth check - Admin only
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Ürün Yönetimi</h1>
        <p className="text-gray-600">Ürün ekleyin, düzenleyin ve varyasyonlar oluşturun</p>
      </div>

      <ProductFormComponent
        onSave={async (product) => {
          'use server';
          // TODO: Save to Firebase via ProductManager
          console.log('Saving product:', product);
        }}
        onCancel={() => {
          redirect('/admin/products');
        }}
      />
    </div>
  );
}

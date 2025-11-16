'use client';
import { useState } from 'react';
import { Product, ProductVariation, ProductSEO } from '@/lib/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ProductVariationsEditor } from './ProductVariationsEditor';
import { ProductSEOEditor } from './ProductSEOEditor';

interface ProductFormProps {
  product?: Product;
  onSave: (product: Partial<Product>) => Promise<void>;
  onCancel: () => void;
}

export function ProductFormComponent({ product, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>(
    product || {
      name: '',
      slug: '',
      description: '',
      basePrice: 0,
      stockQuantity: 0,
      categoryId: '',
      images: [],
      status: 'draft' as const,
      isFeatured: false,
      seo: { metaTitle: '', metaDescription: '', keywords: [] },
      sku: '',
      currency: 'TRY',
      trackInventory: true,
      sellerId: '',
    }
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Temel Bilgiler</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Ürün Adı *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="slug">URL Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Açıklama</Label>
            <textarea
              id="description"
              className="w-full min-h-[100px] p-2 border rounded-md"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Fiyat (₺) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                required
              />
            </div>

            <div>
              <Label htmlFor="stock">Stok *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Kategori ID *</Label>
            <Input
              id="category"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              />
              <span>Öne Çıkan</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.status === 'published'}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'published' : 'draft' })}
              />
              <span>Yayında</span>
            </label>
          </div>
        </div>
      </Card>

      <ProductVariationsEditor
        variations={formData.variations || []}
        onChange={(variations: ProductVariation[]) => setFormData({ ...formData, variations })}
      />

      <ProductSEOEditor
        seo={formData.seo}
        onChange={(seo: ProductSEO) => setFormData({ ...formData, seo })}
      />

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          İptal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>
    </form>
  );
}

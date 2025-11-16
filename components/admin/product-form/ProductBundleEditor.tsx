'use client';
import { ProductBundle } from '@/lib/models';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProductBundleEditorProps {
  bundle?: ProductBundle;
  onChange: (bundle: ProductBundle | undefined) => void;
}

export function ProductBundleEditor({ bundle, onChange }: ProductBundleEditorProps) {
  const isBundle = !!bundle;

  const toggleBundle = () => {
    if (isBundle) {
      onChange(undefined);
    } else {
      onChange({
        id: `bundle_${Date.now()}`,
        name: '',
        description: '',
        products: [],
        discountType: 'fixed' as const,
        discountValue: 0,
        totalPrice: 0,
        originalPrice: 0,
        isActive: true,
      });
    }
  };

  const addItem = () => {
    if (!bundle) return;
    onChange({
      ...bundle,
      products: [
        ...bundle.products,
        {
          productId: '',
          quantity: 1,
        },
      ],
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    if (!bundle) return;
    const products = [...bundle.products];
    products[index] = { ...products[index], [field]: value };
    onChange({ ...bundle, products });
  };

  const removeItem = (index: number) => {
    if (!bundle) return;
    onChange({
      ...bundle,
      products: bundle.products.filter((_: any, i: number) => i !== index),
    });
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Paket Ürün</h3>
        <Button type="button" size="sm" variant={isBundle ? 'destructive' : 'default'} onClick={toggleBundle}>
          {isBundle ? 'Paketi Kaldır' : 'Paket Oluştur'}
        </Button>
      </div>

      {!isBundle ? (
        <p className="text-sm text-gray-500">Bu ürün için paket tanımlanmadı</p>
      ) : (
        <div className="space-y-4">
          <div>
            <Label htmlFor="bundle-name">Paket Adı</Label>
            <Input
              id="bundle-name"
              value={bundle.name}
              onChange={(e) => onChange({ ...bundle, name: e.target.value })}
              placeholder="Örn: Annelik Paketi"
            />
          </div>

          <div>
            <Label htmlFor="bundle-description">Paket Açıklaması</Label>
            <textarea
              id="bundle-description"
              className="w-full min-h-[60px] p-2 border rounded-md"
              value={bundle.description}
              onChange={(e) => onChange({ ...bundle, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bundle-price">Orijinal Fiyat (₺)</Label>
              <Input
                id="bundle-price"
                type="number"
                step="0.01"
                value={bundle.originalPrice}
                onChange={(e) =>
                  onChange({ ...bundle, originalPrice: parseFloat(e.target.value) })
                }
              />
            </div>

            <div>
              <Label htmlFor="bundle-discount">İndirim Değeri</Label>
              <Input
                id="bundle-discount"
                type="number"
                step="0.01"
                value={bundle.discountValue}
                onChange={(e) =>
                  onChange({ ...bundle, discountValue: parseFloat(e.target.value) })
                }
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Paketteki Ürünler</Label>
              <Button type="button" size="sm" variant="outline" onClick={addItem}>
                + Ürün Ekle
              </Button>
            </div>

            {bundle.products.length === 0 ? (
              <p className="text-sm text-gray-500">Pakete ürün eklenmedi</p>
            ) : (
              <div className="space-y-2">
                {bundle.products.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Ürün ID"
                      value={item.productId}
                      onChange={(e) => updateItem(index, 'productId', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Adet"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, 'quantity', parseInt(e.target.value))
                      }
                      className="w-24"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeItem(index)}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={bundle.isActive}
              onChange={(e) => onChange({ ...bundle, isActive: e.target.checked })}
            />
            <span className="text-sm">Paket Aktif</span>
          </label>
        </div>
      )}
    </Card>
  );
}

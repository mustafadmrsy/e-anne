'use client';
import { ProductVariation, ProductVariationOption } from '@/lib/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProductVariationsEditorProps {
  variations: ProductVariation[];
  onChange: (variations: ProductVariation[]) => void;
}

export function ProductVariationsEditor({ variations, onChange }: ProductVariationsEditorProps) {
  const addVariation = () => {
    onChange([
      ...variations,
      {
        id: `var_${Date.now()}`,
        name: '',
        options: [],
      },
    ]);
  };

  const updateVariation = (index: number, updated: ProductVariation) => {
    const newVariations = [...variations];
    newVariations[index] = updated;
    onChange(newVariations);
  };

  const removeVariation = (index: number) => {
    onChange(variations.filter((_, i) => i !== index));
  };

  const addOption = (varIndex: number) => {
    const variation = variations[varIndex];
    const newOption: ProductVariationOption = {
      id: `opt_${Date.now()}`,
      value: '',
      priceAdjustment: 0,
      stockQuantity: 0,
    };
    updateVariation(varIndex, {
      ...variation,
      options: [...variation.options, newOption],
    });
  };

  const updateOption = (varIndex: number, optIndex: number, updated: ProductVariationOption) => {
    const variation = variations[varIndex];
    const newOptions = [...variation.options];
    newOptions[optIndex] = updated;
    updateVariation(varIndex, { ...variation, options: newOptions });
  };

  const removeOption = (varIndex: number, optIndex: number) => {
    const variation = variations[varIndex];
    updateVariation(varIndex, {
      ...variation,
      options: variation.options.filter((_, i) => i !== optIndex),
    });
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Ürün Varyasyonları</h3>
        <Button type="button" size="sm" onClick={addVariation}>
          + Varyasyon Ekle
        </Button>
      </div>

      {variations.length === 0 ? (
        <p className="text-sm text-gray-500">Varyasyon eklenmedi</p>
      ) : (
        <div className="space-y-4">
          {variations.map((variation, varIndex) => (
            <div key={variation.id} className="border rounded-lg p-4">
              <div className="flex gap-4 mb-3">
                <div className="flex-1">
                  <Label>Varyasyon Adı</Label>
                  <Input
                    value={variation.name}
                    onChange={(e) =>
                      updateVariation(varIndex, { ...variation, name: e.target.value })
                    }
                    placeholder="Örn: Beden, Renk"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => removeVariation(varIndex)}
                  >
                    Kaldır
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm">Seçenekler</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => addOption(varIndex)}
                  >
                    + Seçenek
                  </Button>
                </div>

                {variation.options.map((option, optIndex) => (
                  <div key={option.id} className="flex gap-2">
                    <Input
                      placeholder="Seçenek değeri"
                      value={option.value}
                      onChange={(e) =>
                        updateOption(varIndex, optIndex, { ...option, value: e.target.value })
                      }
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Fiyat (+/-)"
                      value={option.priceAdjustment}
                      onChange={(e) =>
                        updateOption(varIndex, optIndex, {
                          ...option,
                          priceAdjustment: parseFloat(e.target.value) || 0,
                          stockQuantity: option.stockQuantity,
                        })
                      }
                      className="w-32"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeOption(varIndex, optIndex)}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

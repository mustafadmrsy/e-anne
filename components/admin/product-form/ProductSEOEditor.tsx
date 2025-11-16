'use client';
import { ProductSEO } from '@/lib/models';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface ProductSEOEditorProps {
  seo?: ProductSEO;
  onChange: (seo: ProductSEO) => void;
}

export function ProductSEOEditor({ seo, onChange }: ProductSEOEditorProps) {
  const currentSEO: ProductSEO = seo || {
    metaTitle: '',
    metaDescription: '',
    keywords: [],
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">SEO Ayarları</h3>

      <div className="space-y-4">
        <div>
          <Label htmlFor="seo-title">Meta Başlık</Label>
          <Input
            id="seo-title"
            value={currentSEO.metaTitle}
            onChange={(e) => onChange({ ...currentSEO, metaTitle: e.target.value })}
            placeholder="Sayfa başlığı (60 karakter önerilir)"
            maxLength={60}
          />
          <p className="text-xs text-gray-500 mt-1">{(currentSEO.metaTitle || '').length}/60 karakter</p>
        </div>

        <div>
          <Label htmlFor="seo-description">Meta Açıklama</Label>
          <textarea
            id="seo-description"
            className="w-full min-h-[80px] p-2 border rounded-md"
            value={currentSEO.metaDescription}
            onChange={(e) => onChange({ ...currentSEO, metaDescription: e.target.value })}
            placeholder="Sayfa açıklaması (160 karakter önerilir)"
            maxLength={160}
          />
          <p className="text-xs text-gray-500 mt-1">
            {(currentSEO.metaDescription || '').length}/160 karakter
          </p>
        </div>

        <div>
          <Label htmlFor="seo-keywords">Anahtar Kelimeler</Label>
          <Input
            id="seo-keywords"
            value={currentSEO.keywords?.join(', ') || ''}
            onChange={(e) =>
              onChange({
                ...currentSEO,
                keywords: e.target.value.split(',').map((k) => k.trim()),
              })
            }
            placeholder="anahtar kelime 1, anahtar kelime 2, ..."
          />
          <p className="text-xs text-gray-500 mt-1">Virgülle ayırarak yazın</p>
        </div>

        <div>
          <Label htmlFor="seo-canonical">Canonical URL</Label>
          <Input
            id="seo-canonical"
            value={currentSEO.canonicalUrl || ''}
            onChange={(e) => onChange({ ...currentSEO, canonicalUrl: e.target.value })}
            placeholder="https://example.com/product/..."
          />
        </div>
      </div>
    </Card>
  );
}

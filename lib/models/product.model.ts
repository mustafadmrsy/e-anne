/**
 * Product Models - E-commerce Product Type Definitions
 * SOLID: Single Responsibility - Each interface handles one aspect
 */

// SEO Metadata for products
export interface ProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
}

// Product Image with alt text for accessibility and SEO
export interface ProductImage {
  url: string;
  alt: string;
  order: number;
  isPrimary?: boolean;
}

// Product Variation (e.g., size, color, flavor)
export interface ProductVariation {
  id: string;
  name: string;
  options: ProductVariationOption[];
}

export interface ProductVariationOption {
  id: string;
  value: string;
  priceAdjustment?: number; // Price difference from base price
  stockQuantity: number;
  sku?: string;
  isRecommended?: boolean;
  isPopular?: boolean;
  images?: ProductImage[];
}

// Product Bundle for bulk sales
export interface ProductBundle {
  id: string;
  name: string;
  description: string;
  products: BundleProduct[];
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  totalPrice: number;
  originalPrice: number;
  isActive: boolean;
  validUntil?: Date;
}

export interface BundleProduct {
  productId: string;
  variationId?: string;
  quantity: number;
}

// Main Product Type
export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  description: string;
  
  // Pricing
  basePrice: number;
  salePrice?: number;
  currency: string;
  
  // Media
  images: ProductImage[];
  videos?: string[];
  
  // Inventory
  sku: string;
  stockQuantity: number;
  lowStockThreshold?: number;
  trackInventory: boolean;
  
  // Categorization
  categoryId: string;
  categoryName?: string;
  tags?: string[];
  
  // Variations & Bundles
  variations?: ProductVariation[];
  availableBundles?: string[]; // Bundle IDs
  
  // SEO
  seo: ProductSEO;
  
  // Seller Info
  sellerId: string;
  sellerName?: string;
  
  // Stats
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  viewCount?: number;
  
  // Status
  status: 'draft' | 'published' | 'archived';
  isFeatured?: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

// Minimal product for listings
export interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  basePrice: number;
  salePrice?: number;
  primaryImage: ProductImage;
  rating?: number;
  reviewCount?: number;
  stockQuantity: number;
  categoryName?: string;
  sellerName?: string;
  isFeatured?: boolean;
}

// Product creation payload
export interface CreateProductPayload {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  basePrice: number;
  salePrice?: number;
  currency?: string;
  sku: string;
  stockQuantity: number;
  categoryId: string;
  images: Omit<ProductImage, 'order'>[];
  variations?: Omit<ProductVariation, 'id'>[];
  seo?: ProductSEO;
  tags?: string[];
  status?: 'draft' | 'published';
}

// Product update payload
export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  id: string;
}

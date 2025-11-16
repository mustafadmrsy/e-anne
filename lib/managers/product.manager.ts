/**
 * Product Manager - Product-specific Firebase Operations
 * SOLID: Single Responsibility - Only product operations
 * Liskov Substitution: Extends BaseManager correctly
 */

import { BaseManager, QueryOptions } from './base.manager';
import type {
  Product,
  ProductListItem,
  CreateProductPayload,
  UpdateProductPayload,
  ProductImage
} from '@/lib/models';

export class ProductManager extends BaseManager<Product> {
  constructor() {
    super('products');
  }

  /**
   * Create product with auto-generated image alt texts
   */
  async createProduct(
    sellerId: string,
    payload: CreateProductPayload
  ): Promise<Product> {
    const id = `${sellerId}_${payload.slug}_${Date.now()}`;
    
    // Auto-generate alt texts if missing
    const images = this.generateImageAltTexts(
      payload.images as ProductImage[],
      payload.name
    );

    const productData: Omit<Product, 'id'> = {
      slug: payload.slug,
      name: payload.name,
      description: payload.description,
      shortDescription: payload.shortDescription,
      basePrice: payload.basePrice,
      salePrice: payload.salePrice,
      currency: payload.currency || 'TRY',
      images,
      sku: payload.sku,
      stockQuantity: payload.stockQuantity,
      trackInventory: true,
      categoryId: payload.categoryId,
      tags: payload.tags || [],
      variations: payload.variations as any,
      seo: payload.seo || this.generateDefaultSEO(payload),
      sellerId,
      status: payload.status || 'draft',
      rating: 0,
      reviewCount: 0,
      soldCount: 0,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return this.create(id, productData);
  }

  /**
   * Update product
   */
  async updateProduct(payload: UpdateProductPayload): Promise<void> {
    const updateData: any = { ...payload };
    delete updateData.id;

    // Update alt texts if images changed
    if (payload.images) {
      const product = await this.getById(payload.id);
      if (product) {
        updateData.images = this.generateImageAltTexts(
          payload.images as ProductImage[],
          payload.name || product.name
        );
      }
    }

    await this.update(payload.id, updateData);
  }

  /**
   * Get products by seller
   */
  async getProductsBySeller(
    sellerId: string,
    options?: QueryOptions
  ): Promise<Product[]> {
    return this.query({
      ...options,
      filters: [
        ...(options?.filters || []),
        { field: 'sellerId', operator: '==', value: sellerId }
      ]
    });
  }

  /**
   * Get published products
   */
  async getPublishedProducts(options?: QueryOptions): Promise<Product[]> {
    return this.query({
      ...options,
      filters: [
        ...(options?.filters || []),
        { field: 'status', operator: '==', value: 'published' }
      ]
    });
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    categoryId: string,
    options?: QueryOptions
  ): Promise<Product[]> {
    return this.query({
      ...options,
      filters: [
        ...(options?.filters || []),
        { field: 'categoryId', operator: '==', value: categoryId },
        { field: 'status', operator: '==', value: 'published' }
      ]
    });
  }

  /**
   * Get product by slug
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    const results = await this.query({
      filters: [{ field: 'slug', operator: '==', value: slug }],
      limit: 1
    });

    return results.length > 0 ? results[0] : null;
  }

  /**
   * Search products
   */
  async searchProducts(
    searchTerm: string,
    options?: QueryOptions
  ): Promise<Product[]> {
    // Simple search - in production, use Algolia or similar
    const allProducts = await this.getPublishedProducts(options);
    
    const lowerSearch = searchTerm.toLowerCase();
    return allProducts.filter(p =>
      p.name.toLowerCase().includes(lowerSearch) ||
      p.description.toLowerCase().includes(lowerSearch) ||
      p.tags?.some(t => t.toLowerCase().includes(lowerSearch))
    );
  }

  /**
   * Update stock quantity
   */
  async updateStock(productId: string, quantity: number): Promise<void> {
    await this.update(productId, { stockQuantity: quantity });
  }

  /**
   * Decrement stock (for orders)
   */
  async decrementStock(productId: string, amount: number): Promise<void> {
    const product = await this.getById(productId);
    if (!product) throw new Error('Product not found');
    
    const newStock = Math.max(0, product.stockQuantity - amount);
    await this.updateStock(productId, newStock);
  }

  /**
   * Convert to list item format
   */
  toListItem(product: Product): ProductListItem {
    const primaryImage = product.images.find(img => img.isPrimary) 
      || product.images[0];

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      basePrice: product.basePrice,
      salePrice: product.salePrice,
      primaryImage,
      rating: product.rating,
      reviewCount: product.reviewCount,
      stockQuantity: product.stockQuantity,
      categoryName: product.categoryName,
      sellerName: product.sellerName,
      isFeatured: product.isFeatured
    };
  }

  /**
   * Generate alt texts for images
   */
  private generateImageAltTexts(
    images: ProductImage[],
    productName: string
  ): ProductImage[] {
    return images.map((img, index) => ({
      ...img,
      alt: img.alt || `${productName} - Görsel ${index + 1}`,
      order: index,
      isPrimary: index === 0 && img.isPrimary !== false
    }));
  }

  /**
   * Generate default SEO metadata
   */
  private generateDefaultSEO(payload: CreateProductPayload) {
    return {
      metaTitle: payload.name,
      metaDescription: payload.shortDescription || 
        payload.description.substring(0, 160),
      keywords: payload.tags || []
    };
  }
}

// Singleton instance
let productManagerInstance: ProductManager | null = null;

export function getProductManager(): ProductManager {
  if (!productManagerInstance) {
    productManagerInstance = new ProductManager();
  }
  return productManagerInstance;
}

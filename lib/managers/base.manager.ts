/**
 * Base Manager - Generic Firebase Operations
 * SOLID: Open/Closed - Open for extension, closed for modification
 * DRY: Reusable base class for all Firebase managers
 */

import { getAdminDB } from '@/lib/firebaseAdmin';
import type { 
  DocumentData, 
  Query, 
  WhereFilterOp,
  OrderByDirection 
} from 'firebase-admin/firestore';

export interface QueryFilter {
  field: string;
  operator: WhereFilterOp;
  value: any;
}

export interface QueryOptions {
  filters?: QueryFilter[];
  orderBy?: {
    field: string;
    direction?: OrderByDirection;
  };
  limit?: number;
  offset?: number;
}

/**
 * Base class for all Firebase managers
 * Provides CRUD operations and common query patterns
 */
export abstract class BaseManager<T extends { id: string }> {
  protected db: FirebaseFirestore.Firestore;
  protected collectionName: string;

  constructor(collectionName: string) {
    this.db = getAdminDB();
    this.collectionName = collectionName;
  }

  /**
   * Get collection reference
   */
  protected getCollection() {
    return this.db.collection(this.collectionName);
  }

  /**
   * Create a new document
   */
  async create(id: string, data: Omit<T, 'id'>): Promise<T> {
    const docRef = this.getCollection().doc(id);
    const fullData = {
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await docRef.set(fullData);
    return fullData as unknown as T;
  }

  /**
   * Get document by ID
   */
  async getById(id: string): Promise<T | null> {
    const doc = await this.getCollection().doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return this.mapDocToData(doc);
  }

  /**
   * Update document
   */
  async update(id: string, data: Partial<Omit<T, 'id'>>): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    
    await this.getCollection().doc(id).update(updateData);
  }

  /**
   * Delete document
   */
  async delete(id: string): Promise<void> {
    await this.getCollection().doc(id).delete();
  }

  /**
   * Query documents with filters
   */
  async query(options: QueryOptions = {}): Promise<T[]> {
    let query: Query = this.getCollection();

    // Apply filters
    if (options.filters) {
      for (const filter of options.filters) {
        query = query.where(filter.field, filter.operator, filter.value);
      }
    }

    // Apply ordering
    if (options.orderBy) {
      query = query.orderBy(
        options.orderBy.field, 
        options.orderBy.direction || 'asc'
      );
    }

    // Apply pagination
    if (options.offset) {
      query = query.offset(options.offset);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => this.mapDocToData(doc));
  }

  /**
   * Get all documents
   */
  async getAll(limit?: number): Promise<T[]> {
    return this.query({ limit });
  }

  /**
   * Check if document exists
   */
  async exists(id: string): Promise<boolean> {
    const doc = await this.getCollection().doc(id).get();
    return doc.exists;
  }

  /**
   * Count documents
   */
  async count(filters?: QueryFilter[]): Promise<number> {
    const results = await this.query({ filters });
    return results.length;
  }

  /**
   * Batch create documents
   */
  async batchCreate(items: Array<Omit<T, 'id'> & { id: string }>): Promise<void> {
    const batch = this.db.batch();
    
    for (const item of items) {
      const docRef = this.getCollection().doc(item.id);
      const fullData = {
        ...item,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      batch.set(docRef, fullData);
    }
    
    await batch.commit();
  }

  /**
   * Map Firestore document to typed data
   */
  protected mapDocToData(doc: FirebaseFirestore.DocumentSnapshot): T {
    const data = doc.data() as DocumentData;
    
    // Convert Firestore Timestamps to Dates
    const result: any = { ...data };
    
    for (const key in result) {
      if (result[key]?.toDate) {
        result[key] = result[key].toDate();
      }
    }
    
    return result as T;
  }

  /**
   * Transaction support
   */
  async runTransaction<R>(
    updateFunction: (transaction: FirebaseFirestore.Transaction) => Promise<R>
  ): Promise<R> {
    return this.db.runTransaction(updateFunction);
  }
}

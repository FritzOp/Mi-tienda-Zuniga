import * as Crypto from 'expo-crypto';
import { desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/db/client';
import { products, type Product } from '@/db/schema';

export type ProductInput = { name: string; quantity: number; price: number };

/** Un producto está pendiente si nunca se subió o se modificó después de la última subida. */
export function isPending(p: Pick<Product, 'syncedAt' | 'updatedAt'>): boolean {
  return p.syncedAt == null || p.syncedAt.getTime() < p.updatedAt.getTime();
}

export const productsRepo = {
  /** Consulta para useLiveQuery (lista reactiva). */
  listQuery() {
    return db.select().from(products).orderBy(desc(products.updatedAt));
  },

  async list(): Promise<Product[]> {
    return db.select().from(products).orderBy(desc(products.updatedAt));
  },

  async getById(id: number): Promise<Product | undefined> {
    const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return rows[0];
  },

  async create(input: ProductInput): Promise<void> {
    await db.insert(products).values({
      clientId: Crypto.randomUUID(),
      name: input.name.trim(),
      quantity: input.quantity,
      price: input.price,
      updatedAt: new Date(),
      syncedAt: null,
    });
  },

  async update(id: number, input: ProductInput): Promise<void> {
    await db
      .update(products)
      .set({
        name: input.name.trim(),
        quantity: input.quantity,
        price: input.price,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));
  },

  async remove(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  },

  async pending(): Promise<Product[]> {
    const all = await db.select().from(products);
    return all.filter(isPending);
  },

  async clientIds(): Promise<Set<string>> {
    const rows = await db.select({ clientId: products.clientId }).from(products);
    return new Set(rows.map((r) => r.clientId));
  },

  /** Inserta productos bajados de la nube, ya marcados como sincronizados. */
  async insertFromCloud(
    rows: { clientId: string; name: string; quantity: number; price: number; updatedAt: Date }[]
  ): Promise<void> {
    if (rows.length === 0) return;
    await db.insert(products).values(rows.map((r) => ({ ...r, syncedAt: r.updatedAt })));
  },

  /** Marca como sincronizado con el updatedAt exacto que se subió. */
  async markSynced(items: { clientId: string; updatedAt: Date }[]): Promise<void> {
    for (const item of items) {
      await db
        .update(products)
        .set({ syncedAt: item.updatedAt })
        .where(eq(products.clientId, item.clientId));
    }
  },

  async removeMany(ids: number[]): Promise<void> {
    if (ids.length) await db.delete(products).where(inArray(products.id, ids));
  },
};

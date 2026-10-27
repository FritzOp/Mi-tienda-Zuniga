import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Importante: este archivo lo lee drizzle-kit con Node, no importar paquetes de Expo aquí.
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clientId: text('client_id').notNull().unique(),
  name: text('name').notNull(),
  quantity: integer('quantity').notNull(),
  price: integer('price').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  syncedAt: integer('synced_at', { mode: 'timestamp_ms' }),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

import { useMemo } from 'react';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { isPending, productsRepo } from '@/db/repositories/products';

/** Lista reactiva de productos con totales; las pantallas no importan Drizzle directamente. */
export function useProducts() {
  const { data, error } = useLiveQuery(productsRepo.listQuery());

  const stats = useMemo(
    () => ({
      totalUnits: data.reduce((sum, p) => sum + p.quantity, 0),
      totalValue: data.reduce((sum, p) => sum + p.quantity * p.price, 0),
      pendingCount: data.filter(isPending).length,
    }),
    [data]
  );

  return { products: data, error, ...stats };
}

import { supabase } from '@/lib/supabase';
import { productsRepo } from '@/db/repositories/products';

export type SyncResult = { uploaded: number; downloaded: number };

type CloudRow = {
  client_id: string;
  name: string;
  quantity: number;
  price: number;
  updated_at: string;
};

/**
 * Sincroniza en dos pasos, en este orden:
 * 1. Bajar: inserta en SQLite los productos de la nube que no existen localmente (por client_id).
 * 2. Subir: upsert por client_id de los pendientes y los marca con syncedAt = updatedAt subido.
 */
export async function syncProducts(userId: string): Promise<SyncResult> {
  // 1. Bajar
  const { data, error } = await supabase
    .from('products')
    .select('client_id, name, quantity, price, updated_at')
    .eq('user_id', userId);
  if (error) throw new Error(error.message);

  const local = await productsRepo.clientIds();
  const missing = ((data ?? []) as CloudRow[])
    .filter((row) => !local.has(row.client_id))
    .map((row) => ({
      clientId: row.client_id,
      name: row.name,
      quantity: row.quantity,
      price: row.price,
      updatedAt: new Date(row.updated_at),
    }));
  await productsRepo.insertFromCloud(missing);

  // 2. Subir
  const pending = await productsRepo.pending();
  if (pending.length > 0) {
    const { error: upError } = await supabase.from('products').upsert(
      pending.map((p) => ({
        client_id: p.clientId,
        name: p.name,
        quantity: p.quantity,
        price: p.price,
        updated_at: p.updatedAt.toISOString(),
      })),
      { onConflict: 'client_id' }
    );
    if (upError) throw new Error(upError.message);
    await productsRepo.markSynced(
      pending.map((p) => ({ clientId: p.clientId, updatedAt: p.updatedAt }))
    );
  }

  return { uploaded: pending.length, downloaded: missing.length };
}

export function describeSync(result: SyncResult): string {
  const { uploaded, downloaded } = result;
  if (uploaded === 0 && downloaded === 0) return 'Todo está al día.';
  const up = `${uploaded} ${uploaded === 1 ? 'subido' : 'subidos'}`;
  const down = `${downloaded} ${downloaded === 1 ? 'bajado' : 'bajados'}`;
  return `${up}, ${down}`;
}

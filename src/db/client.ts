import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

// enableChangeListener es necesario para que useLiveQuery reaccione a los cambios.
export const expoDb = openDatabaseSync('mitienda.db', { enableChangeListener: true });

export const db = drizzle(expoDb, { schema });

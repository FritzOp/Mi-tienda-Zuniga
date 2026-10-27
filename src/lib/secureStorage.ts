import * as SecureStore from 'expo-secure-store';

// SecureStore tiene límite práctico de ~2 KB por valor y la sesión de Supabase lo supera,
// así que cada valor se parte en fragmentos: <key>.count, <key>.0, <key>.1, ...
const CHUNK_SIZE = 1800;

const countKey = (key: string) => `${key}.count`;
const chunkKey = (key: string, i: number) => `${key}.${i}`;

async function removeItem(key: string): Promise<void> {
  const count = Number(await SecureStore.getItemAsync(countKey(key)));
  if (Number.isFinite(count)) {
    for (let i = 0; i < count; i++) await SecureStore.deleteItemAsync(chunkKey(key, i));
  }
  await SecureStore.deleteItemAsync(countKey(key));
}

async function getItem(key: string): Promise<string | null> {
  const rawCount = await SecureStore.getItemAsync(countKey(key));
  if (rawCount == null) return null;
  const count = Number(rawCount);
  let value = '';
  for (let i = 0; i < count; i++) {
    const part = await SecureStore.getItemAsync(chunkKey(key, i));
    if (part == null) return null; // sesión corrupta: se trata como inexistente
    value += part;
  }
  return value;
}

async function setItem(key: string, value: string): Promise<void> {
  await removeItem(key);
  const chunks = value.match(new RegExp(`[\s\S]{1,${CHUNK_SIZE}}`, 'g')) ?? [];
  for (let i = 0; i < chunks.length; i++) {
    await SecureStore.setItemAsync(chunkKey(key, i), chunks[i]);
  }
  await SecureStore.setItemAsync(countKey(key), String(chunks.length));
}

/** Adaptador compatible con la opción auth.storage de supabase-js. */
export const secureStorage = { getItem, setItem, removeItem };

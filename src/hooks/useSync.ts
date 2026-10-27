import { useCallback, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { describeSync, syncProducts } from '@/services/sync';

export type SyncMessage = { kind: 'ok' | 'error'; text: string };

export function useSync() {
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<SyncMessage | null>(null);

  const sync = useCallback(async () => {
    if (!user || syncing) return;
    setSyncing(true);
    setMessage(null);
    try {
      const result = await syncProducts(user.id);
      setMessage({ kind: 'ok', text: describeSync(result) });
    } catch (e) {
      const raw = e instanceof Error ? e.message : String(e);
      const offline = /network|fetch|internet|timeout/i.test(raw);
      setMessage({
        kind: 'error',
        text: offline
          ? 'Sin conexión: tus productos siguen guardados en el teléfono.'
          : `Error: ${raw}`,
      });
    } finally {
      setSyncing(false);
    }
  }, [user, syncing]);

  return { sync, syncing, message };
}

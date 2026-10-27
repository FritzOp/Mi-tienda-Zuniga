import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { secureStorage } from '@/lib/secureStorage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

export const isSupabaseConfigured = url.startsWith('https://') && publishableKey.length > 20;

export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  publishableKey || 'placeholder-publishable-key',
  {
    auth: {
      // SecureStore no existe en web: allí se usa el localStorage por defecto.
      storage: Platform.OS === 'web' ? undefined : secureStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_ID = 'gmutpgntebhguedpoanh';
export const SUPABASE_REGION = 'ap-southeast-1';
export const DEFAULT_SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;

const STORAGE_KEY_ANON_KEY = 'jee2027_supabase_anon_key';
const STORAGE_KEY_CUSTOM_URL = 'jee2027_supabase_custom_url';

export function getStoredSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  let localKey = '';
  let localUrl = '';

  try {
    localKey = localStorage.getItem(STORAGE_KEY_ANON_KEY) || '';
    localUrl = localStorage.getItem(STORAGE_KEY_CUSTOM_URL) || '';
  } catch {}

  const url = localUrl || envUrl || DEFAULT_SUPABASE_URL;
  const anonKey = localKey || envKey || '';

  return { url, anonKey };
}

export function saveStoredSupabaseKey(key: string, url?: string) {
  try {
    if (key) {
      localStorage.setItem(STORAGE_KEY_ANON_KEY, key.trim());
    }
    if (url) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_URL, url.trim());
    }
  } catch {}
}

let cachedClient: SupabaseClient | null = null;
let lastUsedKey = '';
let lastUsedUrl = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getStoredSupabaseConfig();
  if (!anonKey) return null;

  if (cachedClient && lastUsedKey === anonKey && lastUsedUrl === url) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    lastUsedKey = anonKey;
    lastUsedUrl = url;
    return cachedClient;
  } catch (err) {
    console.warn('Failed to create Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  const { url, anonKey } = getStoredSupabaseConfig();

  if (!client || !anonKey) {
    return {
      success: false,
      message: 'Supabase Anon API key is required to establish live synchronization with project ' + SUPABASE_PROJECT_ID,
    };
  }

  try {
    // Check if auth service responds
    const { data, error } = await client.auth.getSession();
    if (error && error.message.includes('API key')) {
      return { success: false, message: error.message };
    }
    return {
      success: true,
      message: `Connected successfully to Supabase project "${SUPABASE_PROJECT_ID}" (${SUPABASE_REGION})`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Network connection failed to ' + url,
    };
  }
}

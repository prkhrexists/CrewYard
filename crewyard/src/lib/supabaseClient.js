import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const forceGuest = typeof window !== 'undefined' && localStorage.getItem('forceGuestMode') === 'true';

/**
 * True when Supabase credentials are missing OR user explicitly chose guest mode.
 * using mock data so it remains fully interactive without a backend.
 */
export const isDemoMode = forceGuest || !supabaseUrl || !supabaseKey;

if (isDemoMode) {
  console.warn(
    "[CrewYard] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set. " +
    "Running in DEMO MODE with mock data."
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseKey || "placeholder-anon-key"
);

/**
 * Supabase Client — ReTruck MVP
 * Single shared client instance for all services
 */

import { createClient } from '@supabase/supabase-js';

var SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
var SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

var supabase = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
} else {
  console.warn('Supabase URL or Anon Key is missing. The application will render an environment configuration instruction page.');
}

export { supabase, SUPABASE_URL, SUPABASE_ANON_KEY };
export default supabase;


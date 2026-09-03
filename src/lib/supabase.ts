import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client
// Uses the anon key — safe to expose in the browser
// Used for reading public data only
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

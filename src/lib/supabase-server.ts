import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client
// Uses the service_role key — bypasses RLS, full database access
// ONLY use this in API routes (server-side), never in browser code
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

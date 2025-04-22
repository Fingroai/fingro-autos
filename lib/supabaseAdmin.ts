import { createClient } from '@supabase/supabase-js'

// Cliente de servicio para el backend (server-side)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseServiceKey) console.warn('Warning: SUPABASE_SERVICE_ROLE_KEY is not set. Falling back to anon key, limited permissions may apply.');
const supabaseAdminKey = supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseAdminKey
);

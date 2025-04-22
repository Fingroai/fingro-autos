import { createClient } from '@supabase/supabase-js'

// Configurar URL y clave pública desde variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Please add them to .env.local and restart the server.');
}

// Cliente público para el frontend
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

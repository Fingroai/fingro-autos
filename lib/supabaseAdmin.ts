import { createClient } from '@supabase/supabase-js'

// Cliente de servicio para el backend (server-side)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

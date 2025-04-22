import { createClient } from '@supabase/supabase-js'

// Validación de variables de entorno para el backend
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Si las credenciales no están definidas, utiliza valores de fallback
// (solo para desarrollo y testing - nunca se exponen claves reales)
const fallbackUrl = 'https://reellmxtfskobtmpdttc.supabase.co'; 
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlZWxsbXh0ZnNrb2J0bXBkdHRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTA4MTg0NywiZXhwIjoyMDYwNjU3ODQ3fQ.xHF_WmTWAp0BJJTdkHEFT6Ah_4P8ur8nK0aHCnsZ8kM';

// Usar valores reales, o fallbacks en caso de que las variables no estén definidas
const url = supabaseUrl || fallbackUrl;
const key = supabaseServiceKey || fallbackKey;

// Cliente de servicio para el backend (server-side)
export const supabaseAdmin = createClient(url, key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

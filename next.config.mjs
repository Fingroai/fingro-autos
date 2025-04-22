/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Configuración simplificada para deploy efectivo
  output: 'standalone',  // Optimizado para producción
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['images.unsplash.com', 'reellmxtfskobtmpdttc.supabase.co'],
  },
  // Se eliminó la sección experimental para evitar advertencias
  poweredByHeader: false, // Mejora de seguridad
};

export default nextConfig;

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Configuración simplificada al máximo para despliegue en Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['images.unsplash.com', 'reellmxtfskobtmpdttc.supabase.co'],
    unoptimized: true, // Simplifica manejo de imágenes
  },
  // Se eliminó 'output: standalone' para mayor compatibilidad
  poweredByHeader: false, // Mejora de seguridad
};

export default nextConfig;

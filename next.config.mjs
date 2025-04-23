/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Configuración optimizada para Next.js app con API routes en Vercel
  // No usamos 'export' porque rompería las APIs y autenticación server-side
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['images.unsplash.com', 'reellmxtfskobtmpdttc.supabase.co'],
  },
  poweredByHeader: false,
  swcMinify: true,     // Minificación optimizada
  reactStrictMode: true, // Mejores prácticas de React
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Configuración de rewrites para redirigir todas las llamadas al backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://contractor-report-system.onrender.com/api/:path*',
      },
      // Redirigir rutas sin /api a /api (solución para tu caso específico)
      {
        source: '/:path(^(?!api|_next|static|favicon.ico).*)',
        destination: 'https://contractor-report-system.onrender.com/api/:path',
      },
      // Específicamente para auth
      {
        source: '/auth/:path*',
        destination: 'https://contractor-report-system.onrender.com/api/auth/:path*',
      },
    ];
  },
  // Headers CORS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: 'https://contractor-report-system.vercel.app' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
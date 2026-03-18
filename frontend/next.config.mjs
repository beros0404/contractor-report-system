/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Agregar rewrites para redirigir las llamadas al backend
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'https://contractor-report-system.onrender.com/api/:path*',
      },
      {
        source: '/auth/:path*',
        destination: 'https://contractor-report-system.onrender.com/api/auth/:path*',
      },
      // Específicamente para google auth
      {
        source: '/api/auth/google/:path*',
        destination: 'https://contractor-report-system.onrender.com/api/auth/google/:path*',
      },
    ];
  },
  // Headers CORS adicionales si es necesario
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
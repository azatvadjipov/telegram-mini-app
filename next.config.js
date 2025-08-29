/** @type {import('next').NextConfig} */
const nextConfig = {
  // Оптимизации для production
  compress: true,

  // Отключаем ESLint во время сборки для production
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Оптимизации изображений
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: false,
  },

  // Отключаем экспериментальные функции для стабильности
  experimental: {
    scrollRestoration: true,
  },

  // Output для Vercel
  output: 'standalone',

  // Headers для безопасности и производительности
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Оптимизации для статических файлов
  async rewrites() {
    return [
      {
        source: '/health',
        destination: '/api/health',
      },
    ]
  },

  // Webpack оптимизации
  webpack: (config, { dev, isServer }) => {
    // Оптимизации для production
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all'
    }

    return config
  },
}

module.exports = nextConfig

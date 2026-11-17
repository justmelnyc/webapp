import type { NextConfig } from 'next'

const nextConfig = {
  reactStrictMode: true,
  // Images come from the mock API, pravatar and picsum; components pass `unoptimized`.
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '7770' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
} satisfies NextConfig

export default nextConfig

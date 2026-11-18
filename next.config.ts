import type { NextConfig } from 'next'
import { legacyRedirects } from './lib/legacy-redirects'

const nextConfig = {
  reactStrictMode: true,
  // Images come from the mock API, pravatar and picsum; components pass `unoptimized`.
  redirects: async () => legacyRedirects(),
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '7770' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
} satisfies NextConfig

export default nextConfig

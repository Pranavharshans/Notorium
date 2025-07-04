import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        // Apply CORS headers to all API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' 
              ? 'https://www.notorium.app' 
              : 'http://localhost:3000', // SECURITY FIX: Specific origins only
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
      {
        // Cache optimized favicon files for 1 year
        source: '/favicon-:size(16x16|32x32).png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache Apple touch icon for 1 year
        source: '/apple-touch-icon.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache optimized logo files for 1 year
        source: '/logo-:size(small|medium).png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Handle node: protocol imports
    config.resolve.alias = {
      ...config.resolve.alias,
      'node:process': 'process/browser',
      'node:buffer': 'buffer',
      'node:util': 'util',
      'node:stream': 'stream-browserify',
      'node:url': 'url',
      'node:path': 'path-browserify'
    };

    config.resolve.fallback = {
      ...config.resolve.fallback,
      process: require.resolve('process/browser'),
      buffer: require.resolve('buffer/'),
      util: require.resolve('util/'),
      stream: require.resolve('stream-browserify'),
      url: require.resolve('url/'),
      path: require.resolve('path-browserify')
    };

    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

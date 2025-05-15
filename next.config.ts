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
            value: '*', // In production, you should replace this with specific origins
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

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
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

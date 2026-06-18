import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(currentDirectory, '../..'),
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ['@michelin/api-client', '@michelin/contracts'],
  images: {
    remotePatterns: [
      { hostname: '*.cloudfront.net' },
      { hostname: 'dgalywyr863whv.cloudfront.net' },
    ],
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@learnops/schema'],
  async rewrites() {
    return [
      {
        source: '/media/:path*',
        destination: 'http://localhost:4000/media/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
    ];
  },
};

export default nextConfig;


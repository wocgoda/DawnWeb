/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    serverActions: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/deepseek/:path*',
        destination: 'https://api.deepseek.com/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
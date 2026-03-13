/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000', 'base66.fr', 'www.base66.fr'] },
    workerThreads: false,
    cpus: 1,
  },
}

module.exports = nextConfig
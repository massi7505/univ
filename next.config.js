/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000'] },
    workerThreads: false,
    cpus: 1,
  },
}

module.exports = nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@upstash/vector', '@upstash/redis'],
  env: {
    UPSTASH_VECTOR_REST_URL: process.env.UPSTASH_VECTOR_REST_URL,
    UPSTASH_VECTOR_REST_TOKEN: process.env.UPSTASH_VECTOR_REST_TOKEN,
  },
}

module.exports = nextConfig
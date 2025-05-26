/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow external images if needed
  images: {
    domains: [],
  },
  // Environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5189',
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'https', hostname: 'cdn.uploadthing.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' }
    ]
  }
}
module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; img-src 'self' data: blob:; style-src 'self' https: 'unsafe-inline'; script-src 'self'; connect-src 'self'"
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig 
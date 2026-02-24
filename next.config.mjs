/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const notebookUi = process.env.OPEN_NOTEBOOK_URL || 'http://localhost:8502'
    const notebookApi = process.env.OPEN_NOTEBOOK_API_URL || 'http://localhost:5055'

    return [
      {
        source: '/open-notebook/:path*',
        destination: `${notebookUi}/:path*`,
      },
      {
        source: '/open-notebook-api/:path*',
        destination: `${notebookApi}/:path*`,
      },
    ]
  },
}

export default nextConfig

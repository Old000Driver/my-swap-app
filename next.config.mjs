/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.shareicon.net',
      },
      {
        protocol: 'https',
        hostname: 'cdn.moralis.io',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'token-icons.s3.amazonaws.com',
      },
      
    ],
  },
};

export default nextConfig;

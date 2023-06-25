/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: [
      "nix-tag-images.s3.amazonaws.com",
      "d2eawub7utcl6.cloudfront.net",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nix-tag-images.s3.amazonaws.com",
        pathname: "*",
      },
    ],
  },
};

module.exports = nextConfig;

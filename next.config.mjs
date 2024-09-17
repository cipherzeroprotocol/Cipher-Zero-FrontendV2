/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cryptologos.cc",
        port: "",
        pathname: "/logos/**",
      },
    ],
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    RPC_BASE_URL: process.env.NEXT_PUBLIC_RPC_BASE_URL,
    RPC_API_KEY: process.env.NEXT_PUBLIC_RPC_API_KEY,
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Other Next.js configurations...

  webpack: (config, { isServer }) => {
    // Only apply this for the server-side build (API routes, getServerSideProps, etc.)
    // pdf-parse is a Node.js library and should not be bundled for the client.
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('pdf-parse'); // Mark pdf-parse as external
    }

    // Return the modified config
    return config;
  },
};

export default nextConfig;
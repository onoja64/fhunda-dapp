/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 14 automatically detects the source directory
  // No need for srcDir configuration

  // Configure image domains for IPFS gateways
  swcMinify: true,
  transpilePackages: ["@coinbase/wallet-sdk", "@zama-fhe/relayer-sdk"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
        port: "",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
        port: "",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "cloudflare-ipfs.com",
        port: "",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "dweb.link",
        port: "",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "nft.storage",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "w3s.link",
        port: "",
        pathname: "/ipfs/**",
      },
    ],
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Configure Terser/Minifier to exclude problematic modules
      if (config.optimization && config.optimization.minimizer) {
        config.optimization.minimizer.forEach((minimizer) => {
          if (minimizer && minimizer.options) {
            const pattern = /coinbase|HeartbeatWorker|relayer-sdk/;
            const existing = minimizer.options.exclude;

            if (!existing) {
              minimizer.options.exclude = pattern;
            } else if (existing instanceof RegExp) {
              minimizer.options.exclude = new RegExp(
                existing.source + "|" + pattern.source
              );
            } else if (Array.isArray(existing)) {
              minimizer.options.exclude = [...existing, pattern];
            } else {
              minimizer.options.exclude = [existing, pattern];
            }
          }
        });
      }
    }
    return config;
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 14 automatically detects the source directory
  // No need for srcDir configuration

  // Configure image domains for IPFS gateways
  swcMinify: true,
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
    console.log("Webpack config called. isServer:", isServer);
    if (config.optimization) {
      console.log("Minimizers present:", config.optimization.minimizer?.length);
    }

    if (!isServer) {
      // Configure Terser to exclude coinbase SDK modules and HeartbeatWorker
      if (config.optimization.minimizer) {
        config.optimization.minimizer.forEach((minimizer) => {
          if (minimizer && minimizer.options) {
            const pattern = /coinbase|HeartbeatWorker/;
            const existing = minimizer.options.exclude;

            if (!existing) {
              minimizer.options.exclude = pattern;
            } else if (existing instanceof RegExp) {
              // Combine regex
              minimizer.options.exclude = new RegExp(
                existing.source + "|" + pattern.source
              );
            } else if (Array.isArray(existing)) {
              minimizer.options.exclude = [...existing, pattern];
            } else {
              // Fallback if it's a string or other
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

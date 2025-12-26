/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 14 automatically detects the source directory
  // No need for srcDir configuration

  // Configure image domains for IPFS gateways
  swcMinify: false,
  transpilePackages: ["@zama-fhe/relayer-sdk"],
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
    // Resolve pino-pretty issues for both server and client
    config.resolve.alias = {
      ...config.resolve.alias,
      "pino-pretty": false,
    };

    config.resolve.fallback = {
      ...config.resolve.fallback,
      "pino-pretty": false,
    };

    if (!isServer) {
      config.output.globalObject = "self";

      // Disable worker-loader to prevent issues with wagmi's HeartbeatWorker
      config.module.rules.push({
        test: /\.worker\.(js|ts)$/,
        type: "asset/resource",
      });

      // Exclude all worker files from Terser minification by filtering webpack entry
      if (config.optimization && config.optimization.minimizer) {
        config.optimization.minimizer = config.optimization.minimizer.map(
          (minimizer) => {
            if (minimizer && minimizer.constructor.name === "TerserPlugin") {
              minimizer.options = {
                ...minimizer.options,
                exclude: /\.worker\.js$/,
              };
            }
            return minimizer;
          }
        );
      }
    }
    return config;
  },
};

export default nextConfig;

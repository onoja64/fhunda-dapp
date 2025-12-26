"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden py-24 md:py-36 bg-[#0B0B0B]">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-primary-500/10 rounded-full blur-[120px] animate-pulse-subtle" />
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-yellow-500/5 rounded-full blur-[100px] animate-pulse-subtle" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 bg-primary-500/10 px-4 py-2 rounded-full mb-8 backdrop-blur-md border border-primary-500/20 shadow-[0_0_15px_rgba(239,203,0,0.1)]"
        >
          <span className="text-sm font-bold text-primary-400 tracking-wider">
            🔒 PRIVACY-FIRST CRYPTO CROWDFUNDING
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-[1.1] tracking-tight"
        >
          The Future of Funding is{" "}
          <span className="text-primary-500 bg-clip-text">Encrypted</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Launch private campaigns and contribute anonymously. Fhunda leverages
          Fully Homomorphic Encryption (FHE) to keep your contribution amounts
          100% private.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-5 justify-center mb-20"
        >
          <Link href="/campaigns">
            <Button
              variant="primary"
              size="xl"
              className="group h-16 px-10 text-lg shadow-[0_0_30px_rgba(239,203,0,0.3)] hover:shadow-[0_0_50px_rgba(239,203,0,0.5)]"
            >
              Discover Campaigns
              <span className="ml-2 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Button>
          </Link>
          <Link href="/create">
            <Button
              variant="outline"
              size="xl"
              className="h-16 px-10 text-lg border-white/20 text-white hover:bg-white/5 hover:border-white/40"
            >
              Start a Campaign
            </Button>
          </Link>
        </motion.div>

        {/* Feature Highlights with Staggered Entry */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/10 pt-16">
          <motion.div variants={itemVariants} className="group">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto group-hover:bg-primary-500/20 group-hover:scale-110 transition-all duration-300">
              🔐
            </div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-wide">
              E2E Encrypted
            </h3>
            <p className="text-gray-500 leading-relaxed">
              Contribution handles are fully encrypted on-chain. Zero data
              leaks, zero privacy compromises.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="group">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto group-hover:bg-primary-500/20 group-hover:scale-110 transition-all duration-300">
              👤
            </div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-wide">
              Complete Anonymity
            </h3>
            <p className="text-gray-500 leading-relaxed">
              Donate with peace of mind. Only the smart contract logic knows the
              specific amounts you fund.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="group">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto group-hover:bg-primary-500/20 group-hover:scale-110 transition-all duration-300">
              ⚡
            </div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-wide">
              FHE Powered
            </h3>
            <p className="text-gray-500 leading-relaxed">
              Powered by Zama&apos;s FHEVM for secure, confidential, and
              trustless aggregate calculations.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Decorative Shimmer Line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent shadow-[0_0_20px_rgba(239,203,0,0.5)]" />
    </section>
  );
};

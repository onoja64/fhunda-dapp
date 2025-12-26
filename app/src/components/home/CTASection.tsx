"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";

export const CTASection: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
      >
        <div className="bg-[#141414] border border-white/5 rounded-[3rem] p-12 md:p-20 shadow-2xl relative overflow-hidden group">
          {/* Subtle animated border gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight leading-[1.1]">
            Ready to Start Your{" "}
            <span className="text-primary-500">Campaign?</span>
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join the future of private crowdfunding. Launch your campaign today
            and connect with backer who value their privacy.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link href="/create">
              <Button
                size="xl"
                variant="primary"
                className="h-16 px-10 text-lg shadow-[0_0_20px_rgba(239,203,0,0.2)] hover:shadow-[0_0_40px_rgba(239,203,0,0.4)]"
              >
                Create Campaign Today
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button
                size="xl"
                variant="outline"
                className="h-16 px-10 text-lg border-white/10 text-white hover:bg-white/5"
              >
                Browse Campaigns
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-2 text-primary-500/60 font-medium">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            <span>Join 12,000+ creators and backers</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

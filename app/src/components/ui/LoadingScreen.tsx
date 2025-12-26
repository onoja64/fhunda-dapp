"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../images/logo.png";

import { useLoading } from "@/providers/LoadingProvider";

interface LoadingScreenProps {
  isLoading?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  isLoading: propLoading,
}) => {
  const { isLoading: contextLoading } = useLoading();
  const isLoading = propLoading !== undefined ? propLoading : contextLoading;
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
        >
          <div className="relative flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              className="relative w-32 h-32 md:w-48 md:h-48 mb-8"
            >
              <Image
                src={logo}
                alt="Fhunda Logo"
                fill
                className="object-contain"
                priority
              />
            </motion.div>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "200px" }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="h-1 bg-primary rounded-full overflow-hidden"
            >
              <div className="h-full w-full bg-primary-300 animate-shimmer" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-gray-500 font-medium tracking-widest text-sm uppercase"
            >
              Initializing Privacy Engine
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

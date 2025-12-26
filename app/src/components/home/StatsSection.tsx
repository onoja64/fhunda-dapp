"use client";

import React from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { BarChart3, Lock, Users, CheckCircle2 } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export const StatsSection: React.FC = () => {
  const stats = [
    {
      label: "Active Campaigns",
      value: "1,247",
      icon: <BarChart3 className="text-primary-500" size={32} />,
    },
    {
      label: "Total Funded",
      value: "12.5M",
      subtext: "fheUSDT • Encrypted",
      icon: <Lock className="text-primary-500" size={32} />,
    },
    {
      label: "Contributors",
      value: "45.2K",
      icon: <Users className="text-primary-500" size={32} />,
    },
    {
      label: "Success Rate",
      value: "78%",
      icon: <CheckCircle2 className="text-primary-500" size={32} />,
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        {stats.map((stat, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card className="border-white/5 bg-white/5 backdrop-blur-sm group hover:border-primary-500/30 transition-all duration-300">
              <CardBody className="text-center py-10 px-6 relative overflow-hidden">
                {/* Subtle Hover Glow */}
                <div className="absolute inset-0 bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 mb-6 group-hover:bg-primary-500/10 group-hover:scale-110 transition-all duration-300">
                  {stat.icon}
                </div>

                <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-2">
                  {stat.label}
                </p>
                <p className="text-4xl font-black text-white group-hover:text-primary-500 transition-colors duration-300">
                  {stat.value}
                </p>

                {stat.subtext && (
                  <p className="text-xs font-bold text-primary-400/80 mt-3 tracking-wide">
                    {stat.subtext}
                  </p>
                )}
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

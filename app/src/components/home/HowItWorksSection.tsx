"use client";

import React from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { Edit3, Wallet, ShieldCheck, CheckCircle } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5 },
  },
};

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: "01",
      title: "Create Campaign",
      description:
        "Define your project goals, set milestones, and launch your private crowdfunding campaign in minutes.",
      icon: <Edit3 className="text-primary-500" size={32} />,
    },
    {
      number: "02",
      title: "Contribute Privately",
      description:
        "Backers contribute using fheUSDT. Contribution amounts remain encrypted and hidden from third parties.",
      icon: <Wallet className="text-primary-500" size={32} />,
    },
    {
      number: "03",
      title: "Funds Protected",
      description:
        "All assets are secured by FHE-powered smart contracts, ensuring trustless and private distribution.",
      icon: <ShieldCheck className="text-primary-500" size={32} />,
    },
    {
      number: "04",
      title: "Secure Settlement",
      description:
        "Funds are only released if goals are met. Automated, encrypted payouts ensure everyone is protected.",
      icon: <CheckCircle className="text-primary-500" size={32} />,
    },
  ];

  return (
    <section className="py-24 bg-[#0F0F0F] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            How <span className="text-primary-500">Fhunda</span> Works
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Experience the power of private crowdfunding through our simple,
            secure process.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative group"
            >
              <Card className="h-full border-white/5 bg-white/5 hover:border-primary-500/40 transition-all duration-500 group-hover:-translate-y-2">
                <CardBody className="p-8 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </div>
                    <span className="text-4xl font-black text-white/10 group-hover:text-primary-500/20 transition-colors duration-300">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4 tracking-wide group-hover:text-primary-500 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

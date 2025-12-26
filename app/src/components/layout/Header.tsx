"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ConnectWallet } from "@/components/wallet/ConnectWallet";
import { User } from "lucide-react";
import logo from "../../images/logo.png";

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 overflow-hidden rounded-xl bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors">
              <Image
                src={logo}
                alt="Fhunda Logo"
                fill
                className="object-contain p-1.5"
                priority
              />
            </div>
            <span className="text-2xl font-black text-gray-900 hidden sm:inline tracking-tight">
              Fhunda
            </span>
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-primary-600 transition-colors font-semibold"
            >
              Home
            </Link>
            <Link
              href="/campaigns"
              className="text-gray-700 hover:text-primary-600 transition-colors font-semibold"
            >
              Explore
            </Link>
            <Link
              href="/create"
              className="text-gray-700 hover:text-primary-600 transition-colors font-semibold"
            >
              Create
            </Link>
            <Link
              href="/profile"
              className="text-gray-700 hover:text-primary-600 transition-colors font-semibold"
            >
              Profile
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <ConnectWallet />
            <Link href="/profile">
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-black font-bold cursor-pointer hover:shadow-lg transition-all hover:scale-105 active:scale-95 border-2 border-primary-600/20">
                <User size={20} />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

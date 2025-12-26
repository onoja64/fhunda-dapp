"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "../../images/logo.png";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="relative w-8 h-8 overflow-hidden rounded-lg bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors">
                <Image
                  src={logo}
                  alt="Fhunda Logo"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Fhunda
              </span>
            </Link>
            <p className="text-sm">
              Privacy-first crowdfunding with encrypted donations.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-primary-500">
              Product
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/features"
                  className="hover:text-primary-400 transition"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="hover:text-primary-400 transition"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/security"
                  className="hover:text-primary-400 transition"
                >
                  Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-primary-500">
              Resources
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/blog"
                  className="hover:text-primary-400 transition"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="hover:text-primary-400 transition"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary-400 transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-primary-500">
              Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-primary-400 transition"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-primary-400 transition"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary-400 transition"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>&copy; {currentYear} Fhunda. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-400 transition"
            >
              Twitter
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-400 transition"
            >
              Discord
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-400 transition"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

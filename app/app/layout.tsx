import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GlobalPolyfill } from "@/components/GlobalPolyfill";
import { ErrorSuppressor } from "@/components/ErrorSuppressor";
import { WalletProvider } from "@/components/WalletProvider";
import Script from "next/script";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Fhunda - Privacy-First Crowdfunding",
  description:
    "Fund ideas while keeping your contributions private with encrypted donations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Load FHEVM relayer SDK UMD bundle (v0.3.0-5) so it exposes globals on window */}
        <Script
          src="https://cdn.zama.org/relayer-sdk-js/0.3.0-5/relayer-sdk-js.umd.cjs"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WalletProvider>
          <ErrorSuppressor />
          <GlobalPolyfill />
          <Header />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}

"use client";

import React from "react";
import { LoadingProvider } from "./LoadingProvider";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const Providers: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <LoadingProvider>
      <LoadingScreen />
      <Header />
      <main className="min-h-[calc(100vh-64px)]">{children}</main>
      <Footer />
    </LoadingProvider>
  );
};

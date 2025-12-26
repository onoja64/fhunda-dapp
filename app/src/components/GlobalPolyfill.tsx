"use client";

// This component runs immediately on mount to set up global polyfills
// before any other client-side code executes
import { useEffect } from "react";

export function GlobalPolyfill() {
  useEffect(() => {
    // Polyfill global for FHEVM library compatibility
    if (typeof global === "undefined") {
      (globalThis as typeof globalThis & { global: typeof globalThis }).global =
        globalThis;
    }
  }, []);

  return null; // This component doesn't render anything
}

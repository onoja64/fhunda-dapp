'use client';

/**
 * Suppress known wallet connector errors from console
 * This helps clean up console errors from wallet providers like Sender
 */
export function ErrorSuppressor() {
  if (typeof window !== 'undefined') {
    const originalError = console.error;
    
    console.error = function(...args: unknown[]) {
      const errorMessage = String(args[0] || '').toLowerCase();
      
      // Suppress Sender wallet provider errors - they don't affect functionality
      if (errorMessage.includes('sender') && errorMessage.includes('failed to get initial state')) {
        return;
      }
      
      // Suppress other known harmless wallet connector errors
      if (errorMessage.includes('failed to get provider state')) {
        return;
      }
      
      // Call original error for other messages
      originalError.apply(console, args);
    };
  }
  
  return null;
}

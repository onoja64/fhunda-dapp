"use client";

import React, { createContext, useCallback, useState } from "react";
import { Toast } from "./Toast";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (message: Omit<ToastMessage, "id">) => string;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...message, id };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="mb-2 pointer-events-auto">
            <Toast
              type={toast.type}
              title={toast.title}
              description={toast.description}
              onClose={() => removeToast(toast.id)}
              duration={toast.duration}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

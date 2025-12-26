"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

export type ToastType = "success" | "error" | "warning" | "info" | "loading";

interface ToastProps {
  title?: string;
  description: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const toastIcons: Record<ToastType, string> = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
  loading: "⏳",
};

const toastStyles: Record<ToastType, string> = {
  success: "bg-green-50 border-green-200 text-green-900",
  error: "bg-red-50 border-red-200 text-red-900",
  warning: "bg-amber-50 border-amber-200 text-amber-900",
  info: "bg-blue-50 border-blue-200 text-blue-900",
  loading: "bg-purple-50 border-purple-200 text-purple-900",
};

export const Toast: React.FC<ToastProps> = ({
  title,
  description,
  type = "info",
  duration = 5000,
  onClose,
  action,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (type === "loading") return; // Don't auto-close loading toasts

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, type, handleClose]);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  }, [onClose]);

  if (!isVisible) return null;

  const toastContent = (
    <div
      className={`fixed bottom-4 right-4 z-50 max-w-md w-full transform transition-all duration-300 ${
        isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
      }`}
    >
      <div
        className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg ${toastStyles[type]}`}
      >
        <span className="text-xl flex-shrink-0">
          {type === "loading" ? (
            <span className="inline-block animate-spin">⏳</span>
          ) : (
            toastIcons[type]
          )}
        </span>
        <div className="flex-1 min-w-0">
          {title && <p className="font-semibold text-sm mb-1">{title}</p>}
          <p className="text-sm">{description}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-sm font-medium underline hover:no-underline"
            >
              {action.label}
            </button>
          )}
        </div>
        {type !== "loading" && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;

  return createPortal(toastContent, document.body);
};

// Toast container for multiple toasts
interface ToastItem extends ToastProps {
  id: string;
}

interface ToastContextValue {
  showToast: (props: Omit<ToastProps, "onClose">) => string;
  hideToast: (id: string) => void;
  updateToast: (id: string, props: Partial<ToastProps>) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (props: Omit<ToastProps, "onClose">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...props, id }]);
    return id;
  };

  const hideToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateToast = (id: string, props: Partial<ToastProps>) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...props } : t))
    );
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast, updateToast }}>
      {children}
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ bottom: `${(index + 1) * 80}px` }}
          className="fixed right-4 z-50"
        >
          <Toast {...toast} onClose={() => hideToast(toast.id)} />
        </div>
      ))}
    </ToastContext.Provider>
  );
};

export default Toast;

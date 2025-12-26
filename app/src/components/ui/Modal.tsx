"use client";

import React, { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-4xl",
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  isLoading = false,
  loadingText = "Processing...",
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEscape && !isLoading) {
        onClose();
      }
    },
    [closeOnEscape, onClose, isLoading]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick && !isLoading) {
      onClose();
    }
  };

  if (!shouldRender) return null;

  const modalContent = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isAnimating ? "bg-black/50" : "bg-black/0"
      }`}
      onClick={handleOverlayClick}
    >
      <div
        className={`relative w-full ${
          sizeClasses[size]
        } bg-white rounded-xl shadow-2xl transform transition-all duration-300 ${
          isAnimating
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl z-10 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            <p className="text-purple-900 font-medium">{loadingText}</p>
          </div>
        )}

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-6 border-b border-gray-100">
            <div>
              {title && (
                <h2
                  id="modal-title"
                  className="text-xl font-bold text-gray-900"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-500">{description}</p>
              )}
            </div>
            {showCloseButton && !isLoading && (
              <button
                onClick={onClose}
                className="p-2 -m-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;

  return createPortal(modalContent, document.body);
};

// Confirmation Modal Component
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
  isLoading = false,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
    }
  };

  const variantStyles = {
    danger: "bg-red-600 hover:bg-red-700",
    warning: "bg-amber-600 hover:bg-amber-700",
    info: "bg-purple-600 hover:bg-purple-700",
  };

  const variantIcons = {
    danger: "⚠️",
    warning: "⚡",
    info: "ℹ️",
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      isLoading={isLoading || isProcessing}
      loadingText="Processing..."
    >
      <div className="text-center">
        <div className="text-4xl mb-4">{variantIcons[variant]}</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 ${variantStyles[variant]}`}
          >
            {isProcessing ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Transaction Modal Component
interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  status:
    | "pending"
    | "encrypting"
    | "signing"
    | "confirming"
    | "success"
    | "error";
  title?: string;
  txHash?: string;
  errorMessage?: string;
  onRetry?: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  status,
  // title is intentionally unused - config.title is used instead
  txHash,
  errorMessage,
  onRetry,
}) => {
  const statusConfig = {
    pending: {
      icon: "⏳",
      title: "Preparing Transaction",
      description: "Please wait while we prepare your transaction...",
      showSpinner: true,
    },
    encrypting: {
      icon: "🔒",
      title: "Encrypting Data",
      description: "Your data is being encrypted using FHE for privacy...",
      showSpinner: true,
    },
    decrypting: {
      icon: "🔑",
      title: "Decrypting Balance",
      description:
        "Please sign the request to decrypt your confidential balance...",
      showSpinner: true,
    },
    signing: {
      icon: "✍️",
      title: "Awaiting Signature",
      description: "Please sign the transaction in your wallet...",
      showSpinner: true,
    },
    confirming: {
      icon: "⛓️",
      title: "Confirming Transaction",
      description: "Waiting for blockchain confirmation...",
      showSpinner: true,
    },
    success: {
      icon: "✅",
      title: "Transaction Successful",
      description: "Your transaction has been confirmed!",
      showSpinner: false,
    },
    error: {
      icon: "❌",
      title: "Transaction Failed",
      description: errorMessage || "Something went wrong. Please try again.",
      showSpinner: false,
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={status === "success" || status === "error" ? onClose : () => {}}
      size="sm"
      closeOnOverlayClick={status === "success" || status === "error"}
      closeOnEscape={status === "success" || status === "error"}
      showCloseButton={status === "success" || status === "error"}
    >
      <div className="text-center py-4">
        <div className="text-5xl mb-4">
          {config.showSpinner ? (
            <span className="inline-block animate-bounce">{config.icon}</span>
          ) : (
            config.icon
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{config.title}</h3>
        <p className="text-gray-600 mb-4">{config.description}</p>

        {config.showSpinner && (
          <div className="flex justify-center mb-4">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        )}

        {txHash && status === "success" && (
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            View on Etherscan
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        )}

        {status === "error" && onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        )}

        {status === "success" && (
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        )}
      </div>
    </Modal>
  );
};

export default Modal;

"use client";

import React from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-500 hover:bg-primary-600 text-black shadow-sm hover:shadow-md active:bg-primary-700 active:scale-[0.98]",
  secondary:
    "bg-gray-100 hover:bg-gray-200 text-gray-900 active:bg-gray-300 active:scale-[0.98]",
  outline:
    "border-2 border-primary-500 text-primary-600 hover:bg-primary-50 active:bg-primary-100 active:scale-[0.98]",
  ghost:
    "text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 active:scale-[0.98]",
  danger:
    "bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md active:bg-red-800 active:scale-[0.98]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
  xl: "px-8 py-4 text-lg",
};

const LoadingSpinner: React.FC<{ size: ButtonSize }> = ({ size }) => {
  const spinnerSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
    xl: "w-6 h-6",
  };

  return (
    <svg
      className={`animate-spin ${spinnerSizes[size]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  disabled,
  className = "",
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        font-semibold rounded-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size={size} />
          {loadingText || children}
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

// Icon Button variant
interface IconButtonProps
  extends Omit<ButtonProps, "children" | "leftIcon" | "rightIcon"> {
  icon: React.ReactNode;
  "aria-label": string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = "md",
  ...props
}) => {
  const iconSizeStyles: Record<ButtonSize, string> = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3",
    xl: "p-4",
  };

  return (
    <Button
      size={size}
      className={`!px-0 !py-0 ${iconSizeStyles[size]}`}
      {...props}
    >
      {icon}
    </Button>
  );
};

// Button Group
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`inline-flex rounded-lg overflow-hidden shadow-sm ${className}`}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement<ButtonProps>, {
          className: `${
            (child as React.ReactElement<ButtonProps>).props.className || ""
          } rounded-none ${index === 0 ? "rounded-l-lg" : ""} ${
            index === React.Children.count(children) - 1 ? "rounded-r-lg" : ""
          } border-r-0 last:border-r`,
        });
      })}
    </div>
  );
};

export default Button;

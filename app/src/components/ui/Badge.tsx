import React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "secondary";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-purple-100 text-purple-800",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
  secondary: "bg-gray-100 text-gray-800",
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        "px-3 py-1 rounded-full text-sm font-semibold inline-block",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

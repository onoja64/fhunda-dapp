import React from "react";
import { cn } from "@/lib/utils";
import { getFundingPercentageColor } from "@/lib/utils";

interface ProgressBarProps {
  percentage: number;
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  showLabel = true,
  className,
}) => {
  const colorClass = getFundingPercentageColor(percentage);
  const colorMap = {
    yellow: "bg-yellow-400",
    green: "bg-green-500",
    "dark-green": "bg-green-700",
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner relative">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out relative group",
            colorMap[colorClass] || "bg-primary-500",
            "animate-glow"
          )}
          style={{ width: `${Math.min(100, percentage)}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />

          {/* Glassy reflection */}
          <div className="absolute inset-x-0 top-0 h-[30%] bg-white/20 rounded-full" />
        </div>
      </div>
      {showLabel && (
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm font-semibold text-gray-700">
            {percentage}% Funded
          </span>
          {percentage >= 100 && (
            <span className="text-green-600 text-sm font-bold">
              ✓ Goal Reached
            </span>
          )}
        </div>
      )}
    </div>
  );
};

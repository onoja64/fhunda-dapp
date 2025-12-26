import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  animated?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  animated = true,
}) => {
  return (
    <div
      className={cn(
        "bg-gray-200 rounded-md",
        animated && "animate-pulse",
        className
      )}
    />
  );
};

export const CampaignCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-full" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded" />
      </div>
    </div>
  );
};

export const CampaignDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <Skeleton className="h-96 w-full rounded-lg" />
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
};

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex gap-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded" />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded" />
        ))}
      </div>
    </div>
  );
};

export const GridSkeleton: React.FC<{ columns?: number; count?: number }> = ({
  columns = 4,
  count = 4,
}) => {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <CampaignCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b">
        <div className="flex">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="flex-1 p-4 border-r last:border-r-0">
              <Skeleton className="h-4" />
            </div>
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b last:border-b-0">
          <div className="flex">
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j} className="flex-1 p-4 border-r last:border-r-0">
                <Skeleton className="h-4" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

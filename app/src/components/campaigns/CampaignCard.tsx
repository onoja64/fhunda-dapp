"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card, CardBody } from "@/components/ui/Card";
import { formatCurrency, calculateFundingPercentage } from "@/lib/utils";
import { Campaign } from "@/types";
import Link from "next/link";

interface CampaignCardProps {
  campaign: Campaign;
  onViewProgress?: (id: string) => void;
  isDecrypting?: boolean;
  decryptedAmount?: number;
}

// IPFS Image component with fallback handling
const IPFSImage: React.FC<{
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
}> = ({ src, alt, fill = false, className = "", sizes }) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [hasError, setHasError] = useState(false);

  // Convert IPFS hash to gateway URL immediately
  const getGatewayUrl = (ipfsSrc: string): string => {
    if (ipfsSrc.startsWith("ipfs://")) {
      const hash = ipfsSrc.replace(/^ipfs:\/\//, "");
      return `https://gateway.pinata.cloud/ipfs/${hash}`;
    }
    // If it's already a full URL, return as-is
    if (ipfsSrc.startsWith("http://") || ipfsSrc.startsWith("https://")) {
      return ipfsSrc;
    }
    // If it's just a hash (Qm... or bafy...), assume IPFS
    if (ipfsSrc.startsWith("Qm") || ipfsSrc.startsWith("bafy")) {
      return `https://gateway.pinata.cloud/ipfs/${ipfsSrc}`;
    }
    // If it's an invalid path (like "/campaigns/..."), don't try to process it
    if (ipfsSrc.startsWith("/")) {
      throw new Error("Invalid IPFS URL");
    }
    // For anything else, assume it's an IPFS hash
    return `https://gateway.pinata.cloud/ipfs/${ipfsSrc}`;
  };

  React.useEffect(() => {
    if (src) {
      try {
        setImageSrc(getGatewayUrl(src));
        setHasError(false);
      } catch {
        setHasError(true);
      }
    } else {
      setHasError(true);
    }
  }, [src]);

  const handleImageError = () => {
    if (src.startsWith("ipfs://") || !src.includes("http")) {
      const hash = src
        .replace(/^ipfs:\/\//, "")
        .replace(/^https?:\/\/.*\/ipfs\//, "");
      const currentGateway = imageSrc.split("/ipfs/")[0];
      const gateways = [
        `https://gateway.pinata.cloud/ipfs/${hash}`,
        `https://ipfs.io/ipfs/${hash}`,
        `https://cloudflare-ipfs.com/ipfs/${hash}`,
      ];

      const currentIndex = gateways.findIndex((g) =>
        g.startsWith(currentGateway)
      );
      if (currentIndex < gateways.length - 1) {
        // Try next gateway
        setImageSrc(gateways[currentIndex + 1]);
      } else {
        // All gateways failed, show fallback
        setHasError(true);
      }
    } else {
      setHasError(true);
    }
  };

  if (hasError || !imageSrc) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-purple-400 to-purple-600 ${
          fill ? "absolute inset-0" : "h-full w-full"
        } ${className}`}
      >
        <span className="text-5xl opacity-20">{alt[0]?.toUpperCase()}</span>
      </div>
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      onError={handleImageError}
      priority={false}
    />
  );
};
export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onViewProgress,
  isDecrypting = false,
  decryptedAmount,
}) => {
  const isEncrypted =
    isNaN(campaign.currentAmount) && decryptedAmount === undefined;
  const currentAmount = decryptedAmount ?? campaign.currentAmount;

  const fundingPercentage = isEncrypted
    ? 0
    : calculateFundingPercentage(currentAmount, campaign.targetAmount);
  const urgencyColor =
    campaign.daysLeft > 7
      ? "success"
      : campaign.daysLeft > 1
      ? "warning"
      : "danger";

  const statusColorMap = {
    Active: "default",
    Successful: "success",
    Failed: "secondary",
    Closed: "danger",
    Withdrawn: "info",
  } as const;

  return (
    <Card
      hover
      className="overflow-hidden flex flex-col h-full group transition-all-smooth"
    >
      {/* Campaign Image */}
      <div className="relative h-48 bg-gradient-to-br from-purple-400 to-purple-600 overflow-hidden">
        {campaign.imageUrl ? (
          <IPFSImage
            src={campaign.imageUrl}
            alt={campaign.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
            <span className="text-5xl opacity-20">{campaign.category[0]}</span>
          </div>
        )}
        <Badge
          variant={statusColorMap[campaign.status]}
          className="absolute top-3 right-3 z-10 scale-in"
        >
          {campaign.status}
        </Badge>
      </div>

      <CardBody className="flex-1 flex flex-col">
        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
          {campaign.title}
        </h3>

        {/* Creator Info */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold group-hover:shadow-md transition-shadow">
            {campaign.creatorName[0]}
          </div>
          <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
            {campaign.creatorName}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {campaign.description?.length > 100
            ? campaign.description.slice(0, 100) + "..."
            : campaign.description}
        </p>

        {/* Progress Bar - Hidden if encrypted */}
        {!isEncrypted && (
          <ProgressBar
            percentage={fundingPercentage}
            showLabel={false}
            className="mb-3"
          />
        )}

        {/* Funding Info */}
        <div className="flex justify-between items-center text-sm mb-4">
          <span className="font-semibold text-gray-900">
            {isEncrypted ? "Funding Private" : `${fundingPercentage}% Funded`}
          </span>
          {isEncrypted && onViewProgress && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 py-0"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onViewProgress(campaign.id);
              }}
              isLoading={isDecrypting}
            >
              View Progress
            </Button>
          )}
          {!isEncrypted && (
            <span className="text-gray-600">
              {campaign.contributors} backers
            </span>
          )}
        </div>

        {/* Amount and Time */}
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Raised</p>
            <p className="font-bold text-lg text-gray-900">
              {isEncrypted ? "🔒 Private" : formatCurrency(currentAmount)}
            </p>
          </div>
          <Badge variant={urgencyColor} className="text-xs scale-in">
            {campaign.daysLeft} days left
          </Badge>
        </div>

        {/* Category */}
        <Badge
          variant="secondary"
          className="mb-4 inline-block group-hover:bg-purple-100 group-hover:text-purple-800 transition-colors"
        >
          {campaign.category}
        </Badge>

        {/* Action Button */}
        <Link href={`/campaign/${campaign.id}`} className="w-full">
          <Button
            variant="primary"
            size="md"
            className="w-full group-hover:shadow-lg transition-shadow"
          >
            View Campaign
          </Button>
        </Link>
      </CardBody>
    </Card>
  );
};

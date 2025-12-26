"use client";

import React, { useEffect, useState } from "react";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { CampaignFilterBar } from "@/components/campaigns/CampaignFilterBar";
import { CampaignFilters, Campaign, CampaignStatus } from "@/types";
import { useCampaigns } from "@/hooks";
import type { CampaignData } from "@/lib/contracts/fhunda";

function mapStatusToUiStatus(status: string): CampaignStatus {
  const normalized = status.toLowerCase();
  switch (normalized) {
    case "active":
      return "Active";
    case "successful":
      return "Successful";
    case "failed":
      return "Failed";
    case "closed":
      return "Closed";
    case "withdrawn":
      return "Withdrawn";
    default:
      return "Active";
  }
}

function mapCampaignDataToCampaign(c: CampaignData): Campaign {
  const nowSec = Date.now() / 1000;
  const secondsLeft = Math.max(0, c.deadline - nowSec);
  const daysLeft = Math.ceil(secondsLeft / 86400);

  // Use IPFS gateway URL if image is an IPFS hash, otherwise use as-is
  let imageUrl = c.image;
  if (c.image && !c.image.startsWith("http")) {
    // Assume it's an IPFS hash
    imageUrl = `https://gateway.pinata.cloud/ipfs/${c.image}`;
  }

  return {
    id: String(c.id),
    title: c.title,
    description: c.description,
    shortDescription:
      c.description.slice(0, 160) + (c.description.length > 160 ? "..." : ""),
    category: c.category || "Technology",
    creatorId: c.creator,
    creatorName: c.creator,
    creatorAvatar: undefined,
    targetAmount: Number.parseFloat(c.targetAmount),
    currentAmount: Number.parseFloat(c.totalFunded),
    contributors: 0,
    imageUrl,
    daysLeft,
    status: mapStatusToUiStatus(c.status),
    createdAt: new Date(),
    endsAt: new Date(c.deadline * 1000),
    risksChallenges: undefined,
  };
}

export const DiscoverPage: React.FC = () => {
  const { campaigns: onchainCampaigns } = useCampaigns();
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    if (!onchainCampaigns) return;
    const mapped = onchainCampaigns.map(mapCampaignDataToCampaign);
    setAllCampaigns(mapped);
    setCampaigns(mapped);
  }, [onchainCampaigns]);

  const handleFilterChange = (newFilters: CampaignFilters) => {
    let filtered = [...allCampaigns];

    if (newFilters.category) {
      filtered = filtered.filter((c) => c.category === newFilters.category);
    }

    if (newFilters.status) {
      filtered = filtered.filter((c) => c.status === newFilters.status);
    }

    if (newFilters.sortBy === "trending") {
      filtered.sort((a, b) => b.contributors - a.contributors);
    } else if (newFilters.sortBy === "recent") {
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (newFilters.sortBy === "funded") {
      filtered.sort((a, b) => b.currentAmount - a.currentAmount);
    } else if (newFilters.sortBy === "ending") {
      filtered.sort((a, b) => a.daysLeft - b.daysLeft);
    }

    setCampaigns(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Discover Campaigns
          </h1>
          <p className="text-lg text-gray-600">
            Find inspiring campaigns to support
          </p>
        </div>

        {/* Filter Bar */}
        <div className="mb-8">
          <CampaignFilterBar onFilterChange={handleFilterChange} />
        </div>

        {/* Campaigns Grid */}
        {campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No campaigns found
            </h2>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or create your own campaign
            </p>
            <button className="text-purple-600 hover:text-purple-700 font-semibold">
              Clear filters →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardBody } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { useWallet } from "@/hooks/useWallet";
import { useCampaigns, useBrowserProvider } from "@/hooks/useContract";
import { useRelayer } from "@/hooks/useRelayer";
import {
  getCampaignTotalFunded,
  getTotalPlatformRaised,
} from "@/lib/contracts/fhunda";
import Link from "next/link";
import type { CampaignData } from "@/lib/contracts/fhunda";
import { calculateFundingPercentage } from "@/lib/utils";

type FilterStatus = "all" | "ACTIVE" | "SUCCESSFUL" | "FAILED" | "CLOSED";
type SortBy = "recent" | "funded" | "ending";

export function ExplorePage() {
  const { campaigns: allCampaigns, isLoading, error } = useCampaigns();
  const [filteredCampaigns, setFilteredCampaigns] = useState<CampaignData[]>(
    []
  );
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [searchQuery, setSearchQuery] = useState("");

  const { isConnected } = useWallet();
  const relayer = useRelayer();
  const provider = useBrowserProvider();

  const [decryptedAmounts, setDecryptedAmounts] = useState<
    Record<number, number>
  >({});
  const [isDecrypting, setIsDecrypting] = useState<Record<number, boolean>>({});
  const [decryptedTotal, setDecryptedTotal] = useState<number | null>(null);
  const [isDecryptingTotal, setIsDecryptingTotal] = useState(false);

  useEffect(() => {
    if (!allCampaigns) return;

    let filtered = [...allCampaigns];

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortBy === "recent") {
      filtered.sort((a, b) => b.id - a.id);
      filtered.sort((a, b) => {
        const valA = parseFloat(a.totalFunded);
        const valB = parseFloat(b.totalFunded);
        return (isNaN(valB) ? 0 : valB) - (isNaN(valA) ? 0 : valA);
      });
    } else if (sortBy === "ending") {
      filtered.sort((a, b) => a.deadline - b.deadline);
    }

    setFilteredCampaigns(filtered);
  }, [allCampaigns, filterStatus, sortBy, searchQuery]);

  const getDaysLeft = (deadline: number) => {
    const now = Date.now();
    const deadlineMs = deadline * 1000;
    const diff = deadlineMs - now;
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="default">Active</Badge>;
      case "SUCCESSFUL":
        return <Badge variant="success">Successful</Badge>;
      case "FAILED":
        return <Badge variant="secondary">Failed</Badge>;
      case "CLOSED":
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleViewProgress = async (campaignId: number) => {
    console.log("handleViewProgress trace:", {
      isConnected,
      hasRelayer: !!relayer.instance,
      isRelayerInitialized: relayer.isInitialized,
      hasProvider: !!provider,
    });

    if (!isConnected) {
      alert("Please connect your wallet to view campaign progress.");
      return;
    }

    if (!relayer.instance || !provider) {
      const msg = !provider
        ? "Wallet provider not ready. Please ensure your wallet is connected."
        : "Initialing decryption engine (FHE Relayer). Please wait a few seconds and try again.";
      alert(msg);
      return;
    }

    try {
      setIsDecrypting((prev: Record<number, boolean>) => ({
        ...prev,
        [campaignId]: true,
      }));
      const amount = await getCampaignTotalFunded(
        provider,
        campaignId,
        relayer.instance
      );
      setDecryptedAmounts((prev: Record<number, number>) => ({
        ...prev,
        [campaignId]: parseFloat(amount),
      }));
    } catch (err: any) {
      console.error("Decryption failed:", err);
      alert(`Decryption failed: ${(err as Error)?.message || String(err)}`);
    } finally {
      setIsDecrypting((prev: Record<number, boolean>) => ({
        ...prev,
        [campaignId]: false,
      }));
    }
  };

  const handleDecryptTotal = async () => {
    console.log("handleDecryptTotal trace:", {
      isConnected,
      hasRelayer: !!relayer.instance,
      isRelayerInitialized: relayer.isInitialized,
      hasProvider: !!provider,
    });

    if (!isConnected) {
      alert("Please connect your wallet to view platform stats.");
      return;
    }

    if (!relayer.instance || !provider) {
      const msg = !provider
        ? "Wallet provider not ready. Please ensure your wallet is connected."
        : "Initialing decryption engine (FHE Relayer). Please wait a few seconds and try again.";
      alert(msg);
      return;
    }

    try {
      setIsDecryptingTotal(true);
      console.log("Starting total platform raised decryption...");
      const total = await getTotalPlatformRaised(provider, relayer.instance);
      console.log("Total platform raised decrypted:", total);
      setDecryptedTotal(parseFloat(total));
    } catch (err: any) {
      console.error("Total decryption failed:", err);
      alert(
        `Total decryption failed: ${(err as Error)?.message || String(err)}`
      );
    } finally {
      setIsDecryptingTotal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Explore Campaigns
          </h1>
          <p className="text-lg text-gray-600">
            Discover and support innovative projects with privacy-preserving
            contributions
          </p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardBody>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(e.target.value as FilterStatus)
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SUCCESSFUL">Successful</option>
                  <option value="FAILED">Failed</option>
                  <option value="CLOSED">Closed</option>
                </select>

                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="recent">Most Recent</option>
                  <option value="funded">Most Funded</option>
                  <option value="ending">Ending Soon</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600 mb-1">Total Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">
                {allCampaigns?.length || 0}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600 mb-1">Active Campaigns</p>
              <p className="text-2xl font-bold text-green-600">
                {allCampaigns?.filter((c) => c.status === "ACTIVE").length || 0}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600 mb-1">Successful</p>
              <p className="text-2xl font-bold text-purple-600">
                {allCampaigns?.filter((c) => c.status === "SUCCESSFUL")
                  .length || 0}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex justify-between items-start mb-1">
                <p className="text-sm text-gray-600">Total Raised</p>
                {allCampaigns &&
                  allCampaigns.length > 0 &&
                  decryptedTotal === null && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] px-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                      onClick={handleDecryptTotal}
                      isLoading={isDecryptingTotal}
                      disabled={!isConnected}
                      title={!isConnected ? "Connect wallet to view total" : ""}
                    >
                      View All
                    </Button>
                  )}
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {decryptedTotal !== null
                  ? `${decryptedTotal.toFixed(2)} fheUSDT`
                  : allCampaigns && allCampaigns.length > 0
                  ? allCampaigns.every(
                      (c) =>
                        c.totalFunded === "🔒 Private" &&
                        decryptedAmounts[c.id] === undefined
                    )
                    ? "🔒 Private"
                    : `${allCampaigns
                        ?.reduce((sum, c) => {
                          const amount =
                            decryptedAmounts[c.id] ?? parseFloat(c.totalFunded);
                          return sum + (isNaN(amount) ? 0 : amount);
                        }, 0)
                        .toFixed(2)} fheUSDT`
                  : "0.00 fheUSDT"}
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Campaigns Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardBody>
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <Skeleton className="h-2 w-full mb-4" />
                  <Skeleton className="h-8 w-full" />
                </CardBody>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardBody className="text-center py-12">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Error Loading Campaigns
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </CardBody>
          </Card>
        ) : filteredCampaigns.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Campaigns Found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filterStatus !== "all"
                  ? "Try adjusting your filters or search query"
                  : "Be the first to create a campaign!"}
              </p>
              {(searchQuery || filterStatus !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStatus("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <Card key={campaign.id} hover className="flex flex-col">
                <CardBody className="flex flex-col h-full">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                        {campaign.title}
                      </h3>
                      {getStatusBadge(campaign.status)}
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {campaign.description}
                    </p>

                    <div className="mb-4">
                      {campaign.totalFunded === "🔒 Private" &&
                      decryptedAmounts[campaign.id] === undefined ? (
                        <div className="flex justify-between items-center text-sm mb-2">
                          <div>
                            <span className="text-gray-600 block">
                              Funding Private
                            </span>
                            <span className="font-bold text-gray-900">
                              🔒 Private
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 py-0"
                            onClick={() => handleViewProgress(campaign.id)}
                            isLoading={isDecrypting[campaign.id]}
                            disabled={!isConnected}
                            title={
                              !isConnected
                                ? "Connect wallet to view progress"
                                : ""
                            }
                          >
                            View Progress
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-bold text-gray-900">
                              {calculateFundingPercentage(
                                decryptedAmounts[campaign.id] ??
                                  parseFloat(campaign.totalFunded),
                                parseFloat(campaign.targetAmount)
                              )}
                              %
                            </span>
                          </div>
                          <ProgressBar
                            percentage={calculateFundingPercentage(
                              decryptedAmounts[campaign.id] ??
                                parseFloat(campaign.totalFunded),
                              parseFloat(campaign.targetAmount)
                            )}
                            showLabel={false}
                          />
                        </>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600">Raised</p>
                        <p className="font-bold text-gray-900">
                          {decryptedAmounts[campaign.id] !== undefined
                            ? `${decryptedAmounts[campaign.id].toFixed(
                                4
                              )} fheUSDT`
                            : campaign.totalFunded === "🔒 Private"
                            ? "🔒 Private"
                            : `${parseFloat(campaign.totalFunded).toFixed(
                                4
                              )} fheUSDT`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Target</p>
                        <p className="font-bold text-gray-900">
                          {parseFloat(campaign.targetAmount).toFixed(4)} fheUSDT
                        </p>
                      </div>
                    </div>

                    {campaign.status === "ACTIVE" && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <span>⏰</span>
                        <span>{getDaysLeft(campaign.deadline)} days left</span>
                      </div>
                    )}
                  </div>

                  <Link href={`/campaign/${campaign.id}`} className="mt-auto">
                    <Button variant="primary" className="w-full">
                      View Campaign
                    </Button>
                  </Link>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Create Campaign CTA */}
        {!isLoading && filteredCampaigns.length > 0 && (
          <Card className="mt-12">
            <CardBody className="text-center py-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Have a Project in Mind?
              </h3>
              <p className="text-gray-600 mb-6">
                Create your own campaign and start raising funds with
                privacy-preserving technology
              </p>
              <Link href="/create">
                <Button variant="primary" size="lg">
                  Create Campaign
                </Button>
              </Link>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

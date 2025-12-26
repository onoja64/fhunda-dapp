"use client";

import { useState, useEffect } from "react";
import { Card, CardBody } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useWallet } from "@/hooks/useWallet";
import {
  useCampaignsByCreator,
  useWithdrawFunds,
  useCloseCampaign,
  useMintFheUSDT,
  useFheUsdtBalance,
  useBrowserProvider,
} from "@/hooks/useContract";
import { getCampaignTotalFunded } from "@/lib/contracts/fhunda";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { calculateFundingPercentage, truncateWords } from "@/lib/utils";
import { useRelayer } from "@/hooks/useRelayer";
import { User } from "lucide-react";

export default function ProfilePage() {
  const { address, isConnected } = useWallet();
  const {
    campaigns: userCampaigns,
    isLoading,
    refetch,
  } = useCampaignsByCreator(isConnected && address ? address : null);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalRaised: "0",
    successfulCampaigns: 0,
  });

  const [decryptedAmounts, setDecryptedAmounts] = useState<
    Record<number, number>
  >({});
  const [isDecryptingCampaign, setIsDecryptingCampaign] = useState<
    Record<number, boolean>
  >({});
  const [isDecryptingAll, setIsDecryptingAll] = useState(false);
  const [isTotalDecrypted, setIsTotalDecrypted] = useState(false);

  // Local action state for user actions on campaigns
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>(
    {}
  );

  const { withdrawFunds } = useWithdrawFunds();
  const { closeCampaign } = useCloseCampaign();
  const {
    balance: fheUsdtBalance,
    refetch: refetchBalance,
    isDecrypting,
    isDecrypted,
  } = useFheUsdtBalance();
  const [mintAmount, setMintAmount] = useState("100");
  const { mintTokens, isLoading: isMinting } = useMintFheUSDT();
  const relayer = useRelayer();
  const provider = useBrowserProvider();

  useEffect(() => {
    if (isConnected && userCampaigns && userCampaigns.length > 0) {
      // Calculate stats
      const totalRaisedNum = userCampaigns.reduce((sum, c) => {
        const amount = decryptedAmounts[c.id] ?? parseFloat(c.totalFunded);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

      const isAnyPrivate = userCampaigns.some(
        (c) =>
          c.totalFunded === "🔒 Private" && decryptedAmounts[c.id] === undefined
      );

      const successful = userCampaigns.filter(
        (c) => c.status === "SUCCESSFUL"
      ).length;

      setStats({
        totalCampaigns: userCampaigns.length,
        totalRaised:
          isAnyPrivate && !isTotalDecrypted
            ? "🔒 Private"
            : totalRaisedNum.toFixed(4),
        successfulCampaigns: successful,
      });
    }
  }, [isConnected, userCampaigns, decryptedAmounts, isTotalDecrypted]);

  const handleDecryptBalance = async () => {
    if (!relayer.isInitialized) return;
    try {
      await refetchBalance(relayer.instance);
    } catch (err) {
      console.error("Failed to decrypt balance:", err);
    }
  };

  const handleDecryptCampaign = async (campaignId: number) => {
    if (!isConnected || !relayer.instance || !provider) return;

    try {
      setIsDecryptingCampaign((prev) => ({ ...prev, [campaignId]: true }));
      const amount = await getCampaignTotalFunded(
        provider,
        campaignId,
        relayer.instance
      );
      setDecryptedAmounts((prev) => ({
        ...prev,
        [campaignId]: parseFloat(amount),
      }));
    } catch (err) {
      console.error(`Failed to decrypt campaign ${campaignId}:`, err);
      alert(
        "Decryption failed. Please ensure you are the campaign owner or authorized."
      );
    } finally {
      setIsDecryptingCampaign((prev) => ({ ...prev, [campaignId]: false }));
    }
  };

  const handleDecryptTotalRaised = async () => {
    if (!isConnected || !relayer.instance || !provider || !userCampaigns)
      return;

    try {
      setIsDecryptingAll(true);

      // Decrypt each campaign that is still private
      for (const campaign of userCampaigns) {
        if (
          campaign.totalFunded === "🔒 Private" &&
          decryptedAmounts[campaign.id] === undefined
        ) {
          try {
            const amount = await getCampaignTotalFunded(
              provider,
              campaign.id,
              relayer.instance
            );
            setDecryptedAmounts((prev) => ({
              ...prev,
              [campaign.id]: parseFloat(amount),
            }));
          } catch (err) {
            console.error(
              `Failed to decrypt campaign ${campaign.id} during bulk decrypt:`,
              err
            );
          }
        }
      }
      setIsTotalDecrypted(true);
    } catch (err) {
      console.error("Failed to decrypt total raised:", err);
    } finally {
      setIsDecryptingAll(false);
    }
  };

  const formatDeadline = (deadline: number) => {
    const date = new Date(deadline * 1000);
    return date.toLocaleDateString();
  };

  const getDaysLeft = (deadline: number) => {
    const now = Date.now();
    const deadlineMs = deadline * 1000;
    const diff = deadlineMs - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
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

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardBody className="text-center py-12">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600 mb-6">
                Please connect your wallet to view your profile
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardBody>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-primary-500 flex items-center justify-center text-black border-4 border-primary-600/30 shadow-lg">
                  <User size={48} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Your Profile
                  </h1>
                  <p className="text-gray-600 mt-1 font-mono text-sm">
                    {address
                      ? `${address.slice(0, 6)}...${address.slice(-4)}`
                      : "Not connected"}
                  </p>
                  <div className="flex gap-2 mt-3 items-center">
                    <Badge variant="success">Wallet Connected</Badge>
                    {!isDecrypted && !isDecrypting ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-6 px-2 py-0"
                        onClick={handleDecryptBalance}
                        disabled={!relayer.isInitialized}
                      >
                        View Balance (requires signature)
                      </Button>
                    ) : (
                      <Badge variant="secondary">
                        {isDecrypting
                          ? "Decrypting..."
                          : `${fheUsdtBalance} fheUSDT`}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-600 mb-1">Campaigns Created</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalCampaigns}
                </p>
              </div>
              <div>
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm text-gray-600">Total Raised</p>
                  {stats.totalRaised === "🔒 Private" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] px-2 text-primary-700 hover:text-primary-800 hover:bg-primary-50"
                      onClick={handleDecryptTotalRaised}
                      isLoading={isDecryptingAll}
                    >
                      View All
                    </Button>
                  )}
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {stats.totalRaised === "🔒 Private"
                    ? "🔒 Private"
                    : `${stats.totalRaised} fheUSDT`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Successful Campaigns
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.successfulCampaigns}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Mint Test Tokens (Testnet Feature) */}
        <Card className="mb-8 border-purple-200 bg-purple-50">
          <CardBody>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">💰</span> Mint Test Tokens
                </h3>
                <p className="text-gray-600 mt-1">
                  Get free FHE-USDT tokens to test campaign contributions on
                  Sepolia.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  onClick={async () => {
                    try {
                      if (!relayer.isInitialized) {
                        throw new Error(
                          "FHE relayer not initialized. Please wait a moment."
                        );
                      }
                      await mintTokens(
                        BigInt(Number(mintAmount) * 1e6),
                        relayer.instance
                      );
                      alert(
                        `Successfully minted ${mintAmount} FHE-USDT! Check your wallet.`
                      );
                    } catch (err) {
                      console.error(err);
                      alert((err as Error)?.message || "Failed to mint tokens");
                    }
                  }}
                  disabled={isMinting}
                >
                  {isMinting ? "Minting..." : `Mint ${mintAmount} FHE-USDT`}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* My Campaigns */}
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Campaigns</h2>
            <Link href="/create">
              <Button variant="primary">+ Create Campaign</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardBody>
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : userCampaigns.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No Campaigns Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first campaign to get started
                </p>
                <Link href="/create">
                  <Button variant="primary">Create Campaign</Button>
                </Link>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-4">
              {userCampaigns.map((campaign) => (
                <Card key={campaign.id} hover>
                  <CardBody>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {campaign.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {truncateWords(campaign.description, 20)}
                        </p>
                        <div className="mt-2">
                          {getStatusBadge(campaign.status)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {campaign.status === "ACTIVE"
                            ? `${getDaysLeft(campaign.deadline)} days left`
                            : `Ended ${formatDeadline(campaign.deadline)}`}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {campaign.totalFunded === "🔒 Private" &&
                          decryptedAmounts[campaign.id] === undefined ? (
                            <span className="text-sm font-normal text-gray-500 italic">
                              Private
                            </span>
                          ) : (
                            `${calculateFundingPercentage(
                              decryptedAmounts[campaign.id] ??
                                parseFloat(campaign.totalFunded),
                              parseFloat(campaign.targetAmount)
                            )}%`
                          )}
                        </p>
                      </div>
                    </div>

                    <ProgressBar
                      percentage={
                        campaign.totalFunded === "🔒 Private" &&
                        decryptedAmounts[campaign.id] === undefined
                          ? 0
                          : calculateFundingPercentage(
                              decryptedAmounts[campaign.id] ??
                                parseFloat(campaign.totalFunded),
                              parseFloat(campaign.targetAmount)
                            )
                      }
                      showLabel={false}
                      className="mb-4"
                    />

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600 flex justify-between">
                          Raised
                          {campaign.totalFunded === "🔒 Private" &&
                            decryptedAmounts[campaign.id] === undefined && (
                              <button
                                onClick={() =>
                                  handleDecryptCampaign(campaign.id)
                                }
                                className="text-[10px] text-primary-600 hover:underline"
                                disabled={isDecryptingCampaign[campaign.id]}
                              >
                                {isDecryptingCampaign[campaign.id]
                                  ? "..."
                                  : "Unlock"}
                              </button>
                            )}
                        </p>
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
                      <div>
                        <p className="text-xs text-gray-600">Deadline</p>
                        <p className="font-bold text-gray-900">
                          {formatDeadline(campaign.deadline)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <Link href={`/campaign/${campaign.id}`}>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </Link>
                      {campaign.status === "SUCCESSFUL" &&
                        !campaign.withdrawn && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={async () => {
                              if (
                                !confirm("Withdraw funds from this campaign?")
                              )
                                return;
                              setActionLoading((s) => ({
                                ...s,
                                [campaign.id]: true,
                              }));
                              try {
                                await withdrawFunds(Number(campaign.id));
                                // Refetch campaigns after withdrawal
                                await refetch();
                                setStats((prev) => ({
                                  ...prev,
                                }));
                                // subtle success hint
                                alert(
                                  "Withdraw succeeded — check your wallet for confirmation."
                                );
                              } catch (err) {
                                console.error(err);
                                alert(
                                  (err as Error)?.message || "Withdraw failed"
                                );
                              } finally {
                                setActionLoading((s) => ({
                                  ...s,
                                  [campaign.id]: false,
                                }));
                              }
                            }}
                            disabled={!!actionLoading[campaign.id]}
                          >
                            {actionLoading[campaign.id]
                              ? "Withdrawing…"
                              : "Withdraw Funds"}
                          </Button>
                        )}
                      {campaign.status === "ACTIVE" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            if (
                              !confirm(
                                "Close this campaign now? This will mark it closed on-chain."
                              )
                            )
                              return;
                            setActionLoading((s) => ({
                              ...s,
                              [campaign.id]: true,
                            }));
                            try {
                              await closeCampaign(Number(campaign.id));
                              // Refetch campaigns after closing
                              await refetch();
                              alert("Campaign closed successfully.");
                            } catch (err) {
                              console.error(err);
                              alert(
                                (err as Error)?.message ||
                                  "Failed to close campaign"
                              );
                            } finally {
                              setActionLoading((s) => ({
                                ...s,
                                [campaign.id]: false,
                              }));
                            }
                          }}
                          disabled={!!actionLoading[campaign.id]}
                        >
                          {actionLoading[campaign.id]
                            ? "Closing…"
                            : "Close Campaign"}
                        </Button>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

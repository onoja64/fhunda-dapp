"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal, TransactionModal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import {
  formatNumber,
  calculateFundingPercentage,
  formatDateWithTime,
} from "@/lib/utils";
import { Campaign, CampaignStatus, CampaignCategory } from "@/types";
import { useAccount } from "wagmi";
import { useBrowserProvider, useFheUsdtBalance } from "@/hooks/useContract";
import { useRelayer } from "@/hooks/useRelayer";
import { useCampaign } from "@/hooks";
import type { CampaignData } from "@/lib/contracts/fhunda";
import { contribute, getCampaignTotalFunded } from "@/lib/contracts/fhunda";
import { runFullDiagnostics } from "@/lib/contracts/relayerDiagnostics";
import { Toast } from "@/components/ui/Toast";

interface CampaignDetailPageProps {
  campaignId: string;
}

type TransactionStatus =
  | "pending"
  | "encrypting"
  | "decrypting"
  | "signing"
  | "confirming"
  | "success"
  | "error";

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

// IPFS Image component with fallback handling
const IPFSImage: React.FC<{
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
}> = ({ src, alt, fill = false, className = "", sizes, priority = false }) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [hasError, setHasError] = useState(false);

  const getGatewayUrl = (ipfsSrc: string): string => {
    if (ipfsSrc.startsWith("ipfs://")) {
      const hash = ipfsSrc.replace(/^ipfs:\/\//, "");
      return `https://gateway.pinata.cloud/ipfs/${hash}`;
    }
    if (ipfsSrc.startsWith("http://") || ipfsSrc.startsWith("https://")) {
      return ipfsSrc;
    }
    return `https://gateway.pinata.cloud/ipfs/${ipfsSrc}`;
  };

  React.useEffect(() => {
    if (src) {
      setImageSrc(getGatewayUrl(src));
      setHasError(false);
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
        setImageSrc(gateways[currentIndex + 1]);
      } else {
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
      priority={priority}
    />
  );
};

function mapCampaignDataToCampaign(data: CampaignData): Campaign {
  const validCategories: Record<string, CampaignCategory> = {
    Technology: "Technology",
    Arts: "Arts",
    "Social Cause": "Social Cause",
    Education: "Education",
    Health: "Health",
    Other: "Other",
  };

  const category = (validCategories[data.category || "Other"] ||
    "Other") as CampaignCategory;

  const creatorAddress = data.creator || "";
  const creatorName = creatorAddress
    ? `${creatorAddress.slice(0, 6)}...${creatorAddress.slice(-4)}`
    : "Anonymous";

  return {
    id: data.id?.toString() || "0",
    title: data.title || "",
    description: data.description || "",
    shortDescription: data.description || "",
    category,
    creatorId: creatorAddress,
    creatorName,
    targetAmount: parseInt(data.targetAmount?.toString() || "0"),
    currentAmount: parseInt(data.totalFunded?.toString() || "0"),
    contributors: 0,
    imageUrl: data.image || "",
    daysLeft: Math.max(
      0,
      Math.floor((data.deadline - Math.floor(Date.now() / 1000)) / 86400)
    ),
    status: mapStatusToUiStatus(
      data.active ? "Active" : data.withdrawn ? "Withdrawn" : "Failed"
    ),
    createdAt: new Date(),
    endsAt: new Date(data.deadline * 1000),
    risksChallenges: undefined,
  };
}

// Loading Skeleton Component
const CampaignSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
    <div className="h-8 w-32 bg-gray-200 rounded mb-8"></div>
    <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="h-12 bg-gray-200 rounded w-3/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
      <div className="h-96 bg-gray-200 rounded"></div>
    </div>
  </div>
);

export const CampaignDetailPage: React.FC<CampaignDetailPageProps> = ({
  campaignId,
}) => {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const provider = useBrowserProvider();
  const relayer = useRelayer();
  const {
    campaign: onchainCampaign,
    isLoading,
    refetch,
  } = useCampaign(parseInt(campaignId));

  const {
    balance: fheUsdtBalance,
    refetch: refetchBalance,
    isDecrypting,
    isDecrypted,
  } = useFheUsdtBalance();
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [contributionAmount, setContributionAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | undefined>();

  const handleDecryptBalance = async () => {
    if (!relayer.isInitialized) return;
    try {
      await refetchBalance(relayer.instance);
    } catch (err) {
      console.error("Failed to decrypt balance:", err);
    }
  };

  // Transaction modal state
  const [showTxModal, setShowTxModal] = useState(false);
  const [txStatus, setTxStatus] = useState<TransactionStatus>("pending");

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );

  // Progress visibility state
  const [showProgress, setShowProgress] = useState(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [actualCampaignTotal, setActualCampaignTotal] = useState<string | null>(
    null
  );

  if (isLoading) {
    return <CampaignSkeleton />;
  }

  if (!onchainCampaign) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Campaign Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The campaign you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Button onClick={() => router.push("/explore")}>
          Browse Campaigns
        </Button>
      </div>
    );
  }

  const campaign = mapCampaignDataToCampaign(onchainCampaign);

  // Use actual campaign total if fetched, otherwise use campaign.currentAmount
  const currentAmount =
    actualCampaignTotal && !isNaN(parseFloat(actualCampaignTotal))
      ? parseFloat(actualCampaignTotal)
      : campaign.currentAmount;

  const fundingPercentage = calculateFundingPercentage(
    currentAmount,
    campaign.targetAmount
  );

  const handleViewProgress = async () => {
    if (!address || !provider) {
      setToastMessage("Please connect your wallet first");
      setToastType("error");
      setShowToast(true);
      return;
    }

    if (!relayer.isInitialized) {
      setToastMessage("FHE relayer not initialized. Please refresh the page.");
      setToastType("error");
      setShowToast(true);
      return;
    }

    if (!relayer.instance) {
      setToastMessage("FHE relayer instance not available.");
      setToastType("error");
      setShowToast(true);
      return;
    }

    try {
      setIsLoadingProgress(true);

      console.log("Starting campaign progress loading...");

      // This will call the write function which requires a user signature
      // The user will be prompted to sign the transaction to decrypt the total
      const total = await getCampaignTotalFunded(
        provider,
        parseInt(campaignId),
        relayer.instance
      );

      console.log("Campaign total fetched:", total);

      // Store the fetched total
      setActualCampaignTotal(total);

      // If successful, show the progress
      setShowProgress(true);
      setToastMessage("Campaign progress loaded");
      setToastType("success");
      setShowToast(true);
    } catch (err: unknown) {
      console.error("Failed to load progress:", err);
      setToastMessage(
        (err as Error)?.message ||
          "Failed to load campaign progress. Please try again."
      );
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  const handleContribute = async () => {
    if (!address || !provider) {
      setToastMessage("Please connect your wallet first");
      setToastType("error");
      setShowToast(true);
      return;
    }

    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      setToastMessage("Please enter a valid contribution amount");
      setToastType("error");
      setShowToast(true);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Check relayer
      if (!relayer.isInitialized) {
        throw new Error(
          "FHE relayer not initialized. Please refresh the page."
        );
      }

      const signer = await provider.getSigner();
      if (!signer) {
        throw new Error("Unable to get signer from provider");
      }

      // Step 1: Force Decryption if needed
      let currentBalance: string = fheUsdtBalance || "0.00";
      if (!isDecrypted) {
        setIsContributionModalOpen(false);
        setShowTxModal(true);
        setTxStatus("decrypting");
        try {
          currentBalance = await refetchBalance(relayer.instance);
        } catch {
          // _decryptionErr - intentionally unused
          throw new Error(
            "Balance decryption required to proceed. Please sign the request in your wallet."
          );
        }
      } else {
        setIsContributionModalOpen(false);
        setShowTxModal(true);
      }

      // Re-validate balance after decryption
      const balanceFloat = parseFloat(currentBalance);
      const amountFloat = parseFloat(contributionAmount);

      if (amountFloat > balanceFloat) {
        throw new Error(
          `Insufficient funds. You have ${currentBalance} fheUSDT but tried to contribute ${contributionAmount}.`
        );
      }

      // Prepare for transaction
      setTxStatus("encrypting");

      const idNumber = Number(campaign.id);

      // Run diagnostics before attempting contribution
      console.log("📋 Running pre-contribution diagnostics...");
      const diagnostics = await runFullDiagnostics(
        relayer.instance,
        provider,
        signer,
        address,
        idNumber,
        contributionAmount
      );
      console.log("📊 Diagnostics results:", diagnostics);

      if (!diagnostics.relayer.canEncrypt) {
        throw new Error(
          "Relayer encryption not working. " +
            (diagnostics.relayer.testEncryption?.error || "Unknown error")
        );
      }

      if (!diagnostics.contract.contractExists) {
        throw new Error(
          "Contract not found at expected address. Check network connection."
        );
      }

      if (!diagnostics.encryption.success) {
        throw new Error(
          "Encryption test failed. " +
            (diagnostics.encryption.error || "Unknown error")
        );
      }

      console.log("✅ Diagnostics passed. Proceeding with contribution...");

      // Step 1: Contributing
      const result = await contribute(
        signer,
        relayer.instance,
        idNumber,
        contributionAmount
      );

      // Step 2: Success (Optimization: contribute function waits for tx)
      setTxStatus("success");
      setTxHash(result.txHash);
      setContributionAmount("");

      // Refresh campaign data
      setTimeout(() => {
        refetch();
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message.includes("missing revert data") ||
            err.message.includes("CALL_EXCEPTION")
            ? `Transaction failed (${err.message.slice(
                0,
                50
              )}...). Ensure you have enough fheUSDT and gas.`
            : err.message
          : "Contribution failed";

      console.error("Contribution error:", err);
      setError(errorMessage);
      setTxStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setShowTxModal(false);
    setTxStatus("pending");
    setError(null);
    setIsContributionModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          leftIcon={
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          }
        >
          Back
        </Button>
      </div>

      {/* Hero Image */}
      <div className="relative h-96 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg overflow-hidden mb-8">
        {onchainCampaign?.image ? (
          <IPFSImage
            src={onchainCampaign.image}
            alt={onchainCampaign.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <span className="text-8xl opacity-30">{campaign.category[0]}</span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              campaign.status === "Active"
                ? "bg-green-100 text-green-800"
                : campaign.status === "Successful"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {campaign.status}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2">
          {/* Title & Creator */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {campaign.title}
            </h1>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {campaign.creatorName[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {campaign.creatorName}
                </p>
                <p className="text-sm text-gray-600">Campaign Creator</p>
              </div>
            </div>
          </div>

          {/* Key Details */}
          <Card className="mb-8">
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Target Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(campaign.targetAmount)} fheUSDT
                  </p>
                </div>
                {!showProgress ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Current Funding
                    </p>
                    <p className="text-2xl font-bold text-gray-500">
                      🔒 Private
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Current Funding
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatNumber(currentAmount)} fheUSDT
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Days Left</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {campaign.daysLeft}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Contributors</p>
                  <p className="text-2xl font-bold text-gray-900">🔒 Private</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Progress Section */}
          <Card className="mb-8">
            <CardBody>
              <h3 className="font-bold text-lg text-gray-900 mb-4">
                Funding Progress
              </h3>

              {!showProgress ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-6">
                    Campaign progress is encrypted for privacy. Click below to
                    view the current funding status.
                  </p>
                  <Button
                    onClick={handleViewProgress}
                    disabled={isLoadingProgress || !isConnected}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isLoadingProgress ? "Loading..." : "View Progress"}
                  </Button>
                </div>
              ) : (
                <>
                  <ProgressBar
                    percentage={fundingPercentage}
                    showLabel={true}
                    className="mb-6"
                  />

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="border-r border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Funded</p>
                      <p className="font-bold text-gray-900">
                        {formatNumber(currentAmount)} fheUSDT
                      </p>
                    </div>
                    <div className="border-r border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Target</p>
                      <p className="font-bold text-gray-900">
                        {formatNumber(campaign.targetAmount)} fheUSDT
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Remaining</p>
                      <p className="font-bold text-gray-900">
                        {formatNumber(
                          Math.max(0, campaign.targetAmount - currentAmount)
                        )}{" "}
                        fheUSDT
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Ends:</span>{" "}
                      {formatDateWithTime(campaign.endsAt)}
                    </p>
                  </div>
                </>
              )}
            </CardBody>
          </Card>

          {/* Campaign Story */}
          <Card className="mb-8">
            <CardBody>
              <h3 className="font-bold text-lg text-gray-900 mb-4">
                Campaign Story
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {campaign.description}
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Contribution Panel */}
        <div>
          <Card className="sticky top-24">
            <CardBody className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Contribute</h2>

              {!isConnected && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <span className="font-semibold">⚠️ Connect Wallet</span>
                    <br />
                    Please connect your wallet to contribute to this campaign.
                  </p>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Amount to Contribute
                  </label>
                  {isConnected && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Balance:</span>
                      {!isDecrypted && !isDecrypting ? (
                        <button
                          type="button"
                          className="text-xs text-purple-600 hover:text-purple-700 underline"
                          onClick={handleDecryptBalance}
                          disabled={!relayer.isInitialized}
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-gray-700">
                          {isDecrypting ? "..." : `${fheUsdtBalance} fheUSDT`}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    className="flex-1"
                    min="0"
                    step="0.001"
                    disabled={!isConnected}
                  />
                  <span className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                    fheUSDT
                  </span>
                </div>
              </div>

              {/* Privacy Badge */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex gap-2 items-start">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <p className="font-semibold text-purple-900">
                      Your Amount is Encrypted
                    </p>
                    <p className="text-sm text-purple-700 mt-1">
                      Using Fully Homomorphic Encryption, your contribution
                      amount is encrypted and only visible to you.
                    </p>
                  </div>
                </div>
              </div>

              {/* Fees */}
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-medium">
                    {contributionAmount || "0.00"} fheUSDT
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Gas Fee (est.)</span>
                  <span className="font-medium">~0.001 ETH</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900">
                    {contributionAmount || "0.00"} fheUSDT + Gas
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => setIsContributionModalOpen(true)}
                disabled={
                  !contributionAmount ||
                  !isConnected ||
                  campaign.status !== "Active" ||
                  parseFloat(contributionAmount) <= 0
                }
                isLoading={isSubmitting}
                loadingText="Processing..."
              >
                {!isConnected
                  ? "Connect Wallet"
                  : campaign.status !== "Active"
                  ? "Campaign Not Active"
                  : !contributionAmount
                  ? "Enter Amount"
                  : fheUsdtBalance === "0.00" && !isDecrypting
                  ? "View Balance First"
                  : isDecrypting
                  ? "Decrypting..."
                  : "Contribute Now"}
              </Button>

              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setToastMessage("Link copied to clipboard!");
                  setToastType("success");
                  setShowToast(true);
                }}
              >
                Share Campaign
              </Button>

              {/* Terms */}
              <p className="text-xs text-gray-500 text-center">
                By contributing, you agree to our{" "}
                <a href="#" className="text-purple-600 hover:underline">
                  Terms
                </a>{" "}
                &{" "}
                <a href="#" className="text-purple-600 hover:underline">
                  Privacy Policy
                </a>
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Contribution Confirmation Modal */}
      <Modal
        isOpen={isContributionModalOpen}
        onClose={() => setIsContributionModalOpen(false)}
        title="Confirm Contribution"
        size="md"
      >
        <div className="space-y-6">
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Campaign:</span> {campaign.title}
            </p>
            <p className="text-sm text-gray-700 mt-2">
              <span className="font-semibold">Amount:</span>{" "}
              {contributionAmount} fheUSDT
            </p>
            <p className="text-sm text-gray-700 mt-2">
              <span className="font-semibold">Privacy:</span>{" "}
              {relayer.isInitialized
                ? "🔒 Encrypted & Private"
                : "⏳ Initializing encryption..."}
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">⚠️ Review your wallet</span> - You
              will be prompted to sign this transaction in your wallet.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleContribute}
              isLoading={isSubmitting}
              loadingText="Processing..."
              disabled={
                !contributionAmount || !address || !relayer.isInitialized
              }
            >
              {!relayer.isInitialized
                ? "Initializing Encryption..."
                : "Confirm Contribution"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={() => setIsContributionModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Transaction Status Modal */}
      <TransactionModal
        isOpen={showTxModal}
        onClose={() => setShowTxModal(false)}
        status={txStatus}
        title="Contribution"
        txHash={txHash}
        errorMessage={error || undefined}
        onRetry={handleRetry}
      />

      {/* Toast Notification */}
      {showToast && (
        <Toast
          title={
            toastType === "error"
              ? "Error"
              : toastType === "success"
              ? "Success"
              : "Info"
          }
          description={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default CampaignDetailPage;

"use client";

/**
 * Example Campaign Card Component
 * Demonstrates how to use wallet and contract hooks together
 */

import { useState } from "react";
import { useWallet, useContribute, useWithdrawFunds, useRefund } from "@/hooks";
import { Button } from "@/components/ui/Button";
import type { CampaignData } from "@/lib/contracts/fhunda";

interface CampaignCardExampleProps {
  campaign: CampaignData;
  onUpdate?: () => void;
}

export function CampaignCardExample({
  campaign,
  onUpdate,
}: CampaignCardExampleProps) {
  const { address, isConnected } = useWallet();
  const { contribute, isLoading: isContributing } = useContribute();
  const { withdrawFunds, isLoading: isWithdrawing } = useWithdrawFunds();
  const { refund, isLoading: isRefunding } = useRefund();

  const [amount, setAmount] = useState("");
  const [showContributeForm, setShowContributeForm] = useState(false);

  const isCreator = address?.toLowerCase() === campaign.creator.toLowerCase();
  const canWithdraw =
    isCreator && campaign.status === "SUCCESSFUL" && !campaign.withdrawn;
  const canRefund = !isCreator && campaign.status === "FAILED";
  const canContribute = campaign.active && campaign.status === "ACTIVE";

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      await contribute(campaign.id, amount);
      alert("Contribution successful!");
      setAmount("");
      setShowContributeForm(false);
      onUpdate?.();
    } catch (error) {
      console.error("Contribution failed:", error);
      alert("Contribution failed. Please try again.");
    }
  };

  const handleWithdraw = async () => {
    if (!window.confirm("Withdraw all funds from this campaign?")) return;

    try {
      await withdrawFunds(campaign.id);
      alert("Funds withdrawn successfully!");
      onUpdate?.();
    } catch (error) {
      console.error("Withdrawal failed:", error);
      alert("Withdrawal failed. Please try again.");
    }
  };

  const handleRefund = async () => {
    if (!window.confirm("Request refund for your contribution?")) return;

    try {
      await refund(campaign.id);
      alert("Refund processed successfully!");
      onUpdate?.();
    } catch (error) {
      console.error("Refund failed:", error);
      alert("Refund failed. Please try again.");
    }
  };

  const deadlineDate = new Date(campaign.deadline * 1000);
  const progress =
    (parseFloat(campaign.totalFunded) / parseFloat(campaign.targetAmount)) *
    100;

  return (
    <div className="border border-gray-700 rounded-lg p-6 bg-gray-800">
      {/* Campaign Info */}
      <div className="mb-4">
        <h3 className="text-xl font-bold mb-2">{campaign.title}</h3>
        <p className="text-gray-300 mb-4">{campaign.description}</p>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Target:</span>
            <span className="font-semibold">
              {campaign.targetAmount} fheUSDT
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Raised:</span>
            <span className="font-semibold text-blue-400">
              {campaign.totalFunded} fheUSDT
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Deadline:</span>
            <span>{deadlineDate.toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Status:</span>
            <span
              className={`font-semibold ${
                campaign.status === "ACTIVE"
                  ? "text-green-400"
                  : campaign.status === "SUCCESSFUL"
                  ? "text-blue-400"
                  : "text-red-400"
              }`}
            >
              {campaign.status}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {progress.toFixed(1)}% funded
          </p>
        </div>
      </div>

      {/* Actions */}
      {!isConnected ? (
        <p className="text-sm text-gray-400">Connect wallet to interact</p>
      ) : (
        <div className="space-y-3">
          {/* Contribute */}
          {canContribute && !isCreator && (
            <div>
              {!showContributeForm ? (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => setShowContributeForm(true)}
                >
                  Contribute
                </Button>
              ) : (
                <form onSubmit={handleContribute} className="space-y-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount in fheUSDT"
                    step="0.01"
                    min="0.01"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isContributing}
                      className="flex-1"
                    >
                      {isContributing ? "Contributing..." : "Confirm"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowContributeForm(false);
                        setAmount("");
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Withdraw (Creator only) */}
          {canWithdraw && (
            <Button
              variant="primary"
              className="w-full"
              onClick={handleWithdraw}
              disabled={isWithdrawing}
            >
              {isWithdrawing ? "Withdrawing..." : "Withdraw Funds"}
            </Button>
          )}

          {/* Refund (Contributors only) */}
          {canRefund && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleRefund}
              disabled={isRefunding}
            >
              {isRefunding ? "Processing..." : "Request Refund"}
            </Button>
          )}

          {/* Info Messages */}
          {isCreator && campaign.active && (
            <p className="text-sm text-blue-400">
              You are the creator of this campaign
            </p>
          )}
          {campaign.withdrawn && (
            <p className="text-sm text-gray-400">Funds have been withdrawn</p>
          )}
        </div>
      )}
    </div>
  );
}

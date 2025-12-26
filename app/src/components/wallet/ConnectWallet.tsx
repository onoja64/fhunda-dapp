"use client";

import React, { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect, useBalance } from "wagmi";
import { useWalletConnection } from "@/components/WalletProvider";

interface ConnectWalletProps {
  showBalance?: boolean;
  showNetwork?: boolean;
  compact?: boolean;
}

export function ConnectWallet({
  showBalance = true,
  showNetwork = true,
  compact = false,
}: ConnectWalletProps) {
  const { address, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectionError, setConnectionError } = useWalletConnection();
  const [showDropdown, setShowDropdown] = useState(false);

  // Get balance
  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address: address,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".wallet-dropdown")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Clear error after 5 seconds
  useEffect(() => {
    if (connectionError) {
      const timer = setTimeout(() => setConnectionError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [connectionError, setConnectionError]);

  return (
    <div className="relative wallet-dropdown">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== "loading";
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus || authenticationStatus === "authenticated");

          return (
            <div
              {...(!ready && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
            >
              {(() => {
                // Not connected state
                if (!connected) {
                  return (
                    <button
                      onClick={openConnectModal}
                      type="button"
                      disabled={isConnecting}
                      className={`
                        inline-flex items-center gap-2
                        px-4 py-2 rounded-lg font-medium
                        transition-all duration-200
                        bg-primary-500 hover:bg-primary-600 text-black
                        disabled:opacity-50 disabled:cursor-not-allowed
                        shadow-sm hover:shadow-md
                        ${compact ? "text-sm px-3 py-1.5" : ""}
                      `}
                    >
                      {isConnecting ? (
                        <>
                          <svg
                            className="animate-spin w-4 h-4"
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
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Connecting...
                        </>
                      ) : (
                        <>
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
                              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          Connect Wallet
                        </>
                      )}
                    </button>
                  );
                }

                // Wrong network state
                if (chain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      type="button"
                      className={`
                        inline-flex items-center gap-2
                        px-4 py-2 rounded-lg font-medium
                        transition-all duration-200
                        bg-red-600 hover:bg-red-700 text-white
                        shadow-sm hover:shadow-md
                        ${compact ? "text-sm px-3 py-1.5" : ""}
                      `}
                    >
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
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      Wrong Network
                    </button>
                  );
                }

                // Connected state
                return (
                  <div className="flex items-center gap-2">
                    {/* Network Button */}
                    {showNetwork && (
                      <button
                        onClick={openChainModal}
                        type="button"
                        className={`
                          inline-flex items-center gap-2
                          px-3 py-2 rounded-lg font-medium
                          transition-all duration-200
                          bg-gray-100 hover:bg-gray-200 text-gray-800
                          ${compact ? "text-sm px-2 py-1.5" : ""}
                        `}
                      >
                        {chain.hasIcon && chain.iconUrl && (
                          <img
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            className="w-4 h-4 rounded-full"
                          />
                        )}
                        {!compact && (
                          <span className="hidden sm:inline">{chain.name}</span>
                        )}
                      </button>
                    )}

                    {/* Account Button */}
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      type="button"
                      className={`
                        inline-flex items-center gap-2
                        px-4 py-2 rounded-lg font-medium
                        transition-all duration-200
                        bg-primary-500 hover:bg-primary-600 text-black
                        shadow-sm hover:shadow-md
                        ${compact ? "text-sm px-3 py-1.5" : ""}
                      `}
                    >
                      <div className="w-5 h-5 rounded-full bg-primary-400 flex items-center justify-center text-xs">
                        {account.displayName[0]}
                      </div>
                      <span>{account.displayName}</span>
                      {showBalance && account.displayBalance && !compact && (
                        <span className="hidden sm:inline text-black/60">
                          ({account.displayBalance})
                        </span>
                      )}
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          showDropdown ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                        {/* Balance */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Balance</p>
                          <p className="font-bold text-gray-900">
                            {isBalanceLoading
                              ? "Loading..."
                              : balance
                              ? `${parseFloat(balance.formatted).toFixed(4)} ${
                                  balance.symbol
                                }`
                              : "0.0000 ETH"}
                          </p>
                        </div>

                        {/* Address */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Address</p>
                          <p className="font-mono text-sm text-gray-900 truncate">
                            {address}
                          </p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(address || "");
                              // Could add toast notification here
                            }}
                            className="mt-2 text-xs text-primary-700 hover:text-primary-800"
                          >
                            Copy Address
                          </button>
                        </div>

                        {/* Actions */}
                        <div className="px-2 py-2">
                          <button
                            onClick={openAccountModal}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            View Account
                          </button>
                          <button
                            onClick={openChainModal}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            Switch Network
                          </button>
                          <button
                            onClick={() => {
                              disconnect();
                              setShowDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Disconnect
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>

      {/* Connection Error Toast */}
      {connectionError && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-red-50 border border-red-200 rounded-lg p-3 z-50">
          <p className="text-sm text-red-800">{connectionError}</p>
        </div>
      )}
    </div>
  );
}

export default ConnectWallet;

// Campaign types
export interface Campaign {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  category: CampaignCategory;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  targetAmount: number;
  currentAmount: number;
  contributors: number;
  imageUrl: string;
  daysLeft: number;
  status?: CampaignStatus;
  createdAt: Date;
  endsAt: Date;
  risksChallenges?: string;
}

export type CampaignCategory =
  | "Technology"
  | "Arts"
  | "Social Cause"
  | "Education"
  | "Health"
  | "Other";
export type CampaignStatus =
  | "Active"
  | "Successful"
  | "Failed"
  | "Closed"
  | "Withdrawn";

// Contribution types
export interface Contribution {
  id: string;
  campaignId: string;
  contributorId: string;
  amount: number;
  isEncrypted: boolean;
  transactionHash: string;
  createdAt: Date;
  status: "Pending" | "Confirmed" | "Failed";
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  walletAddress: string;
  createdAt: Date;
  isPublicContributor: boolean;
}

// Filter types
export interface CampaignFilters {
  category?: CampaignCategory;
  status?: CampaignStatus;
  fundingRange?: "low" | "medium" | "high" | "complete";
  timeLeft?: "today" | "week" | "month" | "ending";
  sortBy?: "trending" | "recent" | "funded" | "ending";
}

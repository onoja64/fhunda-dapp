"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { CampaignFilters, CampaignCategory, CampaignStatus } from "@/types";

interface CampaignFilterBarProps {
  onFilterChange: (filters: CampaignFilters) => void;
}

export const CampaignFilterBar: React.FC<CampaignFilterBarProps> = ({
  onFilterChange,
}) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("trending");

  const handleFilterChange = () => {
    const filters: CampaignFilters = {};
    if (category) filters.category = category as CampaignCategory;
    if (status) filters.status = status as CampaignStatus;
    if (sortBy)
      filters.sortBy = sortBy as "trending" | "recent" | "funded" | "ending";
    onFilterChange(filters);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 space-y-4 md:space-y-0 md:flex gap-4">
      {/* Search */}
      <Input
        placeholder="🔍 Search campaigns..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1"
      />

      {/* Category Filter */}
      <Select
        options={[
          { value: "", label: "All Categories" },
          { value: "Technology", label: "Technology" },
          { value: "Arts", label: "Arts" },
          { value: "Social Cause", label: "Social Cause" },
          { value: "Education", label: "Education" },
          { value: "Health", label: "Health" },
        ]}
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
          handleFilterChange();
        }}
        className="w-full md:w-40"
      />

      {/* Status Filter */}
      <Select
        options={[
          { value: "", label: "All Status" },
          { value: "Active", label: "Active" },
          { value: "Successful", label: "Successful" },
          { value: "Failed", label: "Failed" },
        ]}
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          handleFilterChange();
        }}
        className="w-full md:w-40"
      />

      {/* Sort */}
      <Select
        options={[
          { value: "trending", label: "Trending" },
          { value: "recent", label: "Recently Created" },
          { value: "funded", label: "Most Funded" },
          { value: "ending", label: "Ending Soon" },
        ]}
        value={sortBy}
        onChange={(e) => {
          setSortBy(e.target.value);
          handleFilterChange();
        }}
        className="w-full md:w-40"
      />

      {/* Clear Filters */}
      <Button
        variant="ghost"
        onClick={() => {
          setSearch("");
          setCategory("");
          setStatus("");
          setSortBy("trending");
          onFilterChange({});
        }}
      >
        Clear
      </Button>
    </div>
  );
};

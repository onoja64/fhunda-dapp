export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatDateWithTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function calculateDaysLeft(endDate: Date): number {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function calculateFundingPercentage(
  current: number,
  target: number
): number {
  return Math.min(100, Math.round((current / target) * 100));
}

export function truncateAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatNumber(num: number, decimals = 2): string {
  return num.toFixed(decimals);
}

export function getUrgencyColor(daysLeft: number): "green" | "yellow" | "red" {
  if (daysLeft > 7) return "green";
  if (daysLeft > 1) return "yellow";
  return "red";
}

export function getFundingPercentageColor(
  percentage: number
): "yellow" | "green" | "dark-green" {
  if (percentage < 34) return "yellow";
  if (percentage < 100) return "green";
  return "dark-green";
}

export function truncateWords(text: string, maxWords: number): string {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
}

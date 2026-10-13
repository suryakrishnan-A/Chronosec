import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function getSeverityColor(severity: string): string {
  switch (severity?.toUpperCase()) {
    case "CRITICAL": return "text-red-400";
    case "HIGH": return "text-orange-400";
    case "MEDIUM": return "text-yellow-400";
    case "LOW": return "text-green-400";
    default: return "text-muted-foreground";
  }
}

export function getSeverityBadgeClass(severity: string): string {
  switch (severity?.toUpperCase()) {
    case "CRITICAL": return "badge-critical";
    case "HIGH": return "badge-high";
    case "MEDIUM": return "badge-medium";
    case "LOW": return "badge-low";
    default: return "badge-low";
  }
}

export function getStatusBadgeClass(status: string): string {
  switch (status?.toUpperCase()) {
    case "ACTIVE": return "badge-active";
    case "RESOLVED": return "badge-resolved";
    case "INVESTIGATING": return "badge-investigating";
    case "FALSE_POSITIVE": return "badge-medium";
    default: return "badge-low";
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

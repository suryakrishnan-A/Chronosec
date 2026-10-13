export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: "USER" | "ADMIN";
  avatar?: string;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  provider?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Threat {
  id: string;
  title: string;
  source: string;
  type: string;
  status: "ACTIVE" | "INVESTIGATING" | "RESOLVED" | "FALSE_POSITIVE";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  ipAddress?: string;
  country?: string;
  timestamp: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface SecurityLog {
  id: string;
  eventType: string;
  severity: string;
  description: string;
  ipAddress?: string;
  userId?: string;
  timestamp: string;
  user?: { name: string; email: string };
}

export interface DashboardStats {
  totalThreats: number;
  activeThreats: number;
  resolvedThreats: number;
  criticalThreats: number;
  totalUsers: number;
  threatsByDay: { date: string; count: number }[];
  threatsBySeverity: { severity: string; count: number }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type SeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ThreatStatus = "ACTIVE" | "INVESTIGATING" | "RESOLVED" | "FALSE_POSITIVE";

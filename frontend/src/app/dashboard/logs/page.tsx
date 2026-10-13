"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Search, RefreshCw, Shield, LogIn, LogOut, Key, User, AlertTriangle, Scan, CheckCircle } from "lucide-react";
import { threatsApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { SecurityLog } from "@/types";

const DEMO_LOGS: SecurityLog[] = [
  { id: "1", eventType: "THREAT_DETECTED", severity: "HIGH", description: "Critical threat detected: SQL injection from 203.0.113.52", ipAddress: "203.0.113.52", timestamp: new Date(Date.now() - 60000).toISOString(), user: { name: "System", email: "system@cybershield.ai" } },
  { id: "2", eventType: "SCAN_COMPLETED", severity: "LOW", description: "Automated security scan completed. Found 2 medium-severity issues.", timestamp: new Date(Date.now() - 180000).toISOString() },
  { id: "3", eventType: "LOGIN_SUCCESS", severity: "LOW", description: "Admin user logged in successfully from 192.168.1.1", ipAddress: "192.168.1.1", timestamp: new Date(Date.now() - 300000).toISOString(), user: { name: "Admin User", email: "admin@company.com" } },
  { id: "4", eventType: "THREAT_RESOLVED", severity: "MEDIUM", description: "Brute force attack resolved. Source IP blocked for 24 hours.", timestamp: new Date(Date.now() - 600000).toISOString() },
  { id: "5", eventType: "LOGIN_FAILED", severity: "MEDIUM", description: "Multiple failed login attempts detected for user@company.com", ipAddress: "45.33.32.156", timestamp: new Date(Date.now() - 900000).toISOString() },
  { id: "6", eventType: "PASSWORD_CHANGE", severity: "LOW", description: "User password changed successfully", timestamp: new Date(Date.now() - 1800000).toISOString(), user: { name: "John Doe", email: "john@company.com" } },
  { id: "7", eventType: "SCAN_STARTED", severity: "LOW", description: "Manual security scan initiated by admin", timestamp: new Date(Date.now() - 3600000).toISOString(), user: { name: "Admin User", email: "admin@company.com" } },
  { id: "8", eventType: "USER_CREATED", severity: "LOW", description: "New user account created: jane@company.com", timestamp: new Date(Date.now() - 7200000).toISOString(), user: { name: "Admin User", email: "admin@company.com" } },
  { id: "9", eventType: "ROLE_CHANGE", severity: "HIGH", description: "User role elevated to ADMIN: john@company.com", timestamp: new Date(Date.now() - 10800000).toISOString(), user: { name: "Admin User", email: "admin@company.com" } },
  { id: "10", eventType: "OTP_VERIFIED", severity: "LOW", description: "Two-factor authentication verified for user@company.com", ipAddress: "10.0.0.5", timestamp: new Date(Date.now() - 14400000).toISOString() },
];

const EVENT_ICONS: Record<string, React.ElementType> = {
  LOGIN_SUCCESS: LogIn,
  LOGIN_FAILED: AlertTriangle,
  LOGOUT: LogOut,
  PASSWORD_CHANGE: Key,
  ROLE_CHANGE: Shield,
  THREAT_DETECTED: AlertTriangle,
  THREAT_RESOLVED: CheckCircle,
  SCAN_STARTED: Scan,
  SCAN_COMPLETED: CheckCircle,
  USER_CREATED: User,
  USER_SUSPENDED: User,
  OTP_GENERATED: Key,
  OTP_VERIFIED: Key,
};

const EVENT_COLORS: Record<string, string> = {
  LOGIN_SUCCESS: "text-green-400 bg-green-500/10",
  LOGIN_FAILED: "text-red-400 bg-red-500/10",
  LOGOUT: "text-muted-foreground bg-secondary/50",
  PASSWORD_CHANGE: "text-blue-400 bg-blue-500/10",
  ROLE_CHANGE: "text-purple-400 bg-purple-500/10",
  THREAT_DETECTED: "text-red-400 bg-red-500/10",
  THREAT_RESOLVED: "text-green-400 bg-green-500/10",
  SCAN_STARTED: "text-cyan-400 bg-cyan-500/10",
  SCAN_COMPLETED: "text-cyan-400 bg-cyan-500/10",
  USER_CREATED: "text-blue-400 bg-blue-500/10",
  USER_SUSPENDED: "text-orange-400 bg-orange-500/10",
  OTP_GENERATED: "text-yellow-400 bg-yellow-500/10",
  OTP_VERIFIED: "text-green-400 bg-green-500/10",
};

export default function LogsPage() {
  const [logs, setLogs] = useState<SecurityLog[]>(DEMO_LOGS);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await threatsApi.getLogs({ page: 1, limit: 50 });
      setLogs(data.data.logs);
    } catch {
      // Use demo logs
      setLogs(DEMO_LOGS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const filtered = logs.filter(log =>
    !search ||
    log.description.toLowerCase().includes(search.toLowerCase()) ||
    log.eventType.toLowerCase().includes(search.toLowerCase())
  );

  const severitySummary = logs.reduce((acc, log) => {
    acc[log.severity] = (acc[log.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Security Logs</h1>
          <p className="text-muted-foreground text-sm">Audit trail of all security events</p>
        </div>
        <button
          onClick={loadLogs}
          className="flex items-center gap-2 px-4 py-2 border border-border/50 rounded-lg text-sm hover:border-primary/50 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Events", value: logs.length, color: "text-foreground" },
          { label: "High Severity", value: severitySummary["HIGH"] || 0, color: "text-red-400" },
          { label: "Medium", value: severitySummary["MEDIUM"] || 0, color: "text-yellow-400" },
          { label: "Low", value: severitySummary["LOW"] || 0, color: "text-green-400" },
        ].map((item) => (
          <div key={item.label} className="glass-card p-4 text-center border border-border/50">
            <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search events, descriptions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-cyber pl-10"
        />
      </div>

      {/* Timeline */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="font-bold">Event Timeline</h3>
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} events</span>
        </div>

        <div className="space-y-1">
          <AnimatePresence>
            {filtered.map((log, i) => {
              const Icon = EVENT_ICONS[log.eventType] || Shield;
              const colorClass = EVENT_COLORS[log.eventType] || "text-muted-foreground bg-secondary/50";

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/20 transition-colors group"
                >
                  <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${colorClass}`}>
                        {log.eventType.replace(/_/g, " ")}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full border ${
                        log.severity === "HIGH" || log.severity === "CRITICAL" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        log.severity === "MEDIUM" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                        "bg-green-500/10 text-green-400 border-green-500/20"
                      }`}>{log.severity}</span>
                    </div>
                    <p className="text-sm mt-1">{log.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{formatDate(log.timestamp)}</span>
                      {log.ipAddress && <span className="font-mono">IP: {log.ipAddress}</span>}
                      {log.user && <span>by {log.user.name}</span>}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No logs match your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

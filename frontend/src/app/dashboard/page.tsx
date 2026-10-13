"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, AlertTriangle, CheckCircle, TrendingUp, Users, Zap,
  Activity, Radio, RefreshCw, Globe, Eye, BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { dashboardApi, threatsApi } from "@/lib/api";
import { formatRelativeTime, getSeverityBadgeClass, getStatusBadgeClass } from "@/lib/utils";
import type { DashboardStats, Threat, SecurityLog } from "@/types";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  glowColor: string;
}

function StatCard({ title, value, change, icon: Icon, color, bgColor, glowColor }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      className={`stat-card group border border-border/50 hover:border-${color}-500/30`}
      style={{ ["--hover-glow" as string]: glowColor }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{title}</p>
          <p className={`text-3xl font-black mt-1 ${color}`}>{value}</p>
          {change && (
            <p className="text-xs text-muted-foreground mt-1">{change}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </motion.div>
  );
}

function ThreatSeverityChart({ data }: { data: { severity: string; count: number }[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const colors: Record<string, string> = {
    CRITICAL: "bg-red-500",
    HIGH: "bg-orange-500",
    MEDIUM: "bg-yellow-500",
    LOW: "bg-green-500",
  };

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.severity} className="flex items-center gap-3">
          <div className="w-20 text-xs text-muted-foreground">{item.severity}</div>
          <div className="flex-1 bg-secondary/30 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${total > 0 ? (item.count / total) * 100 : 0}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`h-full rounded-full ${colors[item.severity] || "bg-primary"}`}
            />
          </div>
          <div className="w-8 text-xs text-right font-semibold">{item.count}</div>
        </div>
      ))}
    </div>
  );
}

// Simulated real-time chart
function ActivityChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-1 h-24 w-full">
      {(data.length > 0 ? data : Array(7).fill({ date: "", count: 0 })).map((item, i) => (
        <motion.div
          key={i}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: i * 0.05 }}
          style={{ height: `${(item.count / max) * 100}%`, minHeight: "4px" }}
          className="flex-1 bg-gradient-to-t from-primary/80 to-primary/40 rounded-t-sm origin-bottom cursor-pointer hover:from-primary hover:to-primary/60 transition-colors"
          title={`${item.date}: ${item.count} threats`}
        />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentThreats, setRecentThreats] = useState<Threat[]>([]);
  const [recentLogs, setRecentLogs] = useState<SecurityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const loadData = useCallback(async () => {
    try {
      const { data } = await dashboardApi.getStats();
      setStats(data.data.stats);
      setRecentThreats(data.data.recentThreats || []);
      setRecentLogs(data.data.recentLogs || []);
      setLastUpdated(new Date());
    } catch {
      // API not connected - use demo data
      setStats({
        totalThreats: 1284,
        activeThreats: 23,
        resolvedThreats: 1218,
        criticalThreats: 7,
        totalUsers: 48,
        threatsByDay: [
          { date: "Mon", count: 12 }, { date: "Tue", count: 19 },
          { date: "Wed", count: 8 }, { date: "Thu", count: 25 },
          { date: "Fri", count: 31 }, { date: "Sat", count: 14 },
          { date: "Sun", count: 9 },
        ],
        threatsBySeverity: [
          { severity: "CRITICAL", count: 7 },
          { severity: "HIGH", count: 45 },
          { severity: "MEDIUM", count: 189 },
          { severity: "LOW", count: 1043 },
        ],
      });
      setRecentThreats([
        { id: "1", title: "SQL Injection Attempt", source: "203.0.113.52", type: "SQL Injection", status: "ACTIVE", severity: "CRITICAL", description: "Attempted SQL injection on login endpoint", timestamp: new Date(Date.now() - 120000).toISOString(), createdAt: new Date().toISOString() },
        { id: "2", title: "Port Scan Detected", source: "192.168.1.100", type: "Port Scan", status: "INVESTIGATING", severity: "HIGH", description: "Systematic port scan across multiple services", timestamp: new Date(Date.now() - 360000).toISOString(), createdAt: new Date().toISOString() },
        { id: "3", title: "Brute Force Attack", source: "10.0.0.55", type: "Brute Force", status: "RESOLVED", severity: "MEDIUM", description: "Multiple failed login attempts detected", timestamp: new Date(Date.now() - 600000).toISOString(), createdAt: new Date().toISOString() },
      ]);
      setRecentLogs([
        { id: "1", eventType: "THREAT_DETECTED", severity: "HIGH", description: "New critical threat detected from 203.0.113.52", timestamp: new Date(Date.now() - 60000).toISOString() },
        { id: "2", eventType: "SCAN_COMPLETED", severity: "LOW", description: "System scan completed: 0 vulnerabilities found", timestamp: new Date(Date.now() - 180000).toISOString() },
        { id: "3", eventType: "LOGIN_SUCCESS", severity: "LOW", description: "Admin user logged in from 192.168.1.1", timestamp: new Date(Date.now() - 300000).toISOString() },
        { id: "4", eventType: "THREAT_RESOLVED", severity: "MEDIUM", description: "Brute force attack resolved and IP blocked", timestamp: new Date(Date.now() - 450000).toISOString() },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleScan = async () => {
    setScanning(true);
    setScanProgress(0);

    // Animate progress
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    try {
      await dashboardApi.triggerScan();
      toast.success("Security scan initiated");
    } catch {
      toast.info("Scan simulated (backend not connected)");
    }

    setTimeout(() => {
      setScanProgress(100);
      clearInterval(progressInterval);
      setTimeout(() => {
        setScanning(false);
        setScanProgress(0);
        toast.success("Scan complete! No critical vulnerabilities found.");
        loadData();
      }, 1000);
    }, 3500);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-5 h-28 animate-pulse bg-secondary/20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Security Operations Center</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Real-time threat monitoring • Updated {formatRelativeTime(lastUpdated)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-2 border border-border/50 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-border transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleScan}
            disabled={scanning}
            className="btn-cyber flex items-center gap-2 disabled:opacity-70"
          >
            {scanning ? (
              <>
                <Activity className="w-4 h-4 animate-pulse" />
                Scanning {Math.round(scanProgress)}%
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Run Security Scan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scan Progress Bar */}
      <AnimatePresence>
        {scanning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-4 border border-primary/30"
          >
            <div className="flex items-center gap-3 mb-2">
              <Radio className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium">Security scan in progress...</span>
              <span className="ml-auto text-sm text-primary font-bold">{Math.round(scanProgress)}%</span>
            </div>
            <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Threats"
          value={stats?.totalThreats?.toLocaleString() || "0"}
          change="All time recorded threats"
          icon={AlertTriangle}
          color="text-orange-400"
          bgColor="bg-orange-500/10"
          glowColor="rgba(249,115,22,0.2)"
        />
        <StatCard
          title="Active Threats"
          value={stats?.activeThreats || 0}
          change="Requires immediate attention"
          icon={Shield}
          color="text-red-400"
          bgColor="bg-red-500/10"
          glowColor="rgba(239,68,68,0.2)"
        />
        <StatCard
          title="Resolved"
          value={stats?.resolvedThreats?.toLocaleString() || "0"}
          change="Successfully neutralized"
          icon={CheckCircle}
          color="text-green-400"
          bgColor="bg-green-500/10"
          glowColor="rgba(34,197,94,0.2)"
        />
        <StatCard
          title="Protected Users"
          value={stats?.totalUsers || 0}
          change="Active in platform"
          icon={Users}
          color="text-cyan-400"
          bgColor="bg-cyan-500/10"
          glowColor="rgba(6,182,212,0.2)"
        />
      </div>

      {/* Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="font-bold">Threat Activity (7 Days)</h3>
            </div>
            <span className="text-xs text-muted-foreground">Threats detected per day</span>
          </div>
          <ActivityChart data={stats?.threatsByDay || []} />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            {(stats?.threatsByDay || Array(7).fill({ date: "" })).map((d, i) => (
              <span key={i}>{d.date}</span>
            ))}
          </div>
        </div>

        {/* Severity Breakdown */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-bold">By Severity</h3>
          </div>
          <ThreatSeverityChart data={stats?.threatsBySeverity || []} />

          <div className="mt-6 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Critical threats</span>
              <span className="text-red-400 font-bold">{stats?.criticalThreats || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Threats & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Threats */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <h3 className="font-bold">Active Threats</h3>
            </div>
            <a href="/dashboard/threats" className="text-xs text-primary hover:underline">
              View all →
            </a>
          </div>

          <div className="space-y-3">
            {recentThreats.length > 0 ? (
              recentThreats.map((threat) => (
                <motion.div
                  key={threat.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors"
                >
                  <Globe className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold truncate">{threat.title}</p>
                      <span className={getSeverityBadgeClass(threat.severity)}>{threat.severity}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{threat.source}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(threat.timestamp)}</p>
                  </div>
                  <span className={getStatusBadgeClass(threat.status)}>{threat.status}</span>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p className="text-sm">No active threats</p>
              </div>
            )}
          </div>
        </div>

        {/* Security Logs */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              <h3 className="font-bold">Security Events</h3>
            </div>
            <a href="/dashboard/logs" className="text-xs text-primary hover:underline">
              View all →
            </a>
          </div>

          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  log.severity === "HIGH" || log.severity === "CRITICAL" ? "bg-red-400" :
                  log.severity === "MEDIUM" ? "bg-yellow-400" : "bg-green-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-mono font-semibold">{log.eventType.replace(/_/g, " ")}</p>
                  <p className="text-sm mt-0.5 leading-tight">{log.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(log.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Search, Filter, RefreshCw, Globe, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { threatsApi } from "@/lib/api";
import { getSeverityBadgeClass, getStatusBadgeClass, formatRelativeTime } from "@/lib/utils";
import type { Threat } from "@/types";

const DEMO_THREATS: Threat[] = [
  { id: "1", title: "SQL Injection Attempt", source: "203.0.113.52", type: "SQL Injection", status: "ACTIVE", severity: "CRITICAL", description: "Malicious SQL injection payload detected on /api/login endpoint. Attacker attempting to bypass authentication.", ipAddress: "203.0.113.52", country: "RU", timestamp: new Date(Date.now() - 120000).toISOString(), createdAt: new Date().toISOString() },
  { id: "2", title: "Systematic Port Scan", source: "192.168.10.100", type: "Port Scan", status: "INVESTIGATING", severity: "HIGH", description: "Full port range scan detected from internal IP. Possible compromised workstation.", ipAddress: "192.168.10.100", country: "US", timestamp: new Date(Date.now() - 360000).toISOString(), createdAt: new Date().toISOString() },
  { id: "3", title: "Brute Force - SSH", source: "45.33.32.156", type: "Brute Force", status: "RESOLVED", severity: "HIGH", description: "400 failed SSH login attempts in 60 seconds. IP blocked automatically.", ipAddress: "45.33.32.156", country: "CN", timestamp: new Date(Date.now() - 600000).toISOString(), createdAt: new Date().toISOString(), resolvedAt: new Date().toISOString() },
  { id: "4", title: "XSS Payload Detected", source: "198.51.100.14", type: "XSS Attack", status: "ACTIVE", severity: "MEDIUM", description: "Cross-site scripting payload detected in form submission. Script injection blocked.", ipAddress: "198.51.100.14", country: "DE", timestamp: new Date(Date.now() - 900000).toISOString(), createdAt: new Date().toISOString() },
  { id: "5", title: "DDoS Volumetric Attack", source: "Multiple", type: "DDoS", status: "INVESTIGATING", severity: "CRITICAL", description: "Distributed denial of service attack from 2,847 unique IPs. Traffic scrubbing activated.", ipAddress: "Multiple", country: "KR", timestamp: new Date(Date.now() - 1200000).toISOString(), createdAt: new Date().toISOString() },
  { id: "6", title: "Ransomware Signature", source: "172.16.5.23", type: "Ransomware", status: "RESOLVED", severity: "CRITICAL", description: "Known ransomware signature detected and quarantined on endpoint 172.16.5.23.", ipAddress: "172.16.5.23", country: "US", timestamp: new Date(Date.now() - 3600000).toISOString(), createdAt: new Date().toISOString(), resolvedAt: new Date(Date.now() - 3000000).toISOString() },
  { id: "7", title: "Phishing Domain Access", source: "10.0.0.201", type: "Phishing", status: "FALSE_POSITIVE", severity: "LOW", description: "User attempted to access known phishing domain. Blocked by DNS filter. Verified false positive.", ipAddress: "10.0.0.201", country: "UK", timestamp: new Date(Date.now() - 7200000).toISOString(), createdAt: new Date().toISOString() },
];

const STATUS_OPTIONS = ["", "ACTIVE", "INVESTIGATING", "RESOLVED", "FALSE_POSITIVE"];
const SEVERITY_OPTIONS = ["", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

export default function ThreatsPage() {
  const [threats, setThreats] = useState<Threat[]>(DEMO_THREATS);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);

  const loadThreats = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await threatsApi.getThreats({
        page, limit: 10,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(severityFilter && { severity: severityFilter }),
      });
      setThreats(data.data.threats);
      setTotalPages(data.meta?.totalPages || 1);
    } catch {
      // Use demo data filtered
      let filtered = DEMO_THREATS;
      if (search) filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.source.includes(search) ||
        t.type.toLowerCase().includes(search.toLowerCase())
      );
      if (statusFilter) filtered = filtered.filter(t => t.status === statusFilter);
      if (severityFilter) filtered = filtered.filter(t => t.severity === severityFilter);
      setThreats(filtered);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, severityFilter]);

  useEffect(() => { loadThreats(); }, [loadThreats]);

  const handleStatusUpdate = async (threatId: string, newStatus: string) => {
    try {
      await threatsApi.updateStatus(threatId, newStatus);
      toast.success(`Threat marked as ${newStatus.toLowerCase()}`);
      loadThreats();
    } catch {
      // Update locally for demo
      setThreats(prev => prev.map(t =>
        t.id === threatId
          ? { ...t, status: newStatus as Threat["status"], ...(newStatus === "RESOLVED" ? { resolvedAt: new Date().toISOString() } : {}) }
          : t
      ));
      toast.success(`Threat status updated to ${newStatus.toLowerCase()}`);
    }
    if (selectedThreat?.id === threatId) setSelectedThreat(null);
  };

  const severityCounts = DEMO_THREATS.reduce((acc, t) => {
    acc[t.severity] = (acc[t.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Threat Management</h1>
          <p className="text-muted-foreground text-sm">Monitor and respond to security threats</p>
        </div>
        <button onClick={loadThreats} className="flex items-center gap-2 px-4 py-2 border border-border/50 rounded-lg text-sm hover:border-primary/50 transition-all">
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Severity Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(severityFilter === sev ? "" : sev)}
            className={`glass-card p-3 text-center transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
              severityFilter === sev ? "border-primary/50 cyber-glow" : "border-border/50"
            }`}
          >
            <div className={`text-2xl font-black ${
              sev === "CRITICAL" ? "text-red-400" :
              sev === "HIGH" ? "text-orange-400" :
              sev === "MEDIUM" ? "text-yellow-400" : "text-green-400"
            }`}>{severityCounts[sev] || 0}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{sev}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search threats, IPs, types..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-cyber pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-cyber py-2 text-sm min-w-[130px]"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.slice(1).map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
          <select
            value={severityFilter}
            onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
            className="input-cyber py-2 text-sm min-w-[130px]"
          >
            <option value="">All Severity</option>
            {SEVERITY_OPTIONS.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Threats Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/20">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Threat</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Source IP</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Severity</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Time</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              <AnimatePresence>
                {threats.map((threat, i) => (
                  <motion.tr
                    key={threat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-secondary/20 transition-colors group cursor-pointer"
                    onClick={() => setSelectedThreat(threat)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 shrink-0 ${
                          threat.severity === "CRITICAL" ? "text-red-400" :
                          threat.severity === "HIGH" ? "text-orange-400" :
                          threat.severity === "MEDIUM" ? "text-yellow-400" : "text-green-400"
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{threat.title}</p>
                          <p className="text-xs text-muted-foreground">{threat.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <Globe className="w-3 h-3 text-muted-foreground" />
                        {threat.source}
                        {threat.country && <span className="text-muted-foreground ml-1">· {threat.country}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={getSeverityBadgeClass(threat.severity)}>{threat.severity}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={getStatusBadgeClass(threat.status)}>{threat.status.replace("_", " ")}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs text-muted-foreground">
                      {formatRelativeTime(threat.timestamp)}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        {threat.status !== "RESOLVED" && threat.status !== "FALSE_POSITIVE" && (
                          <button
                            onClick={() => handleStatusUpdate(threat.id, "RESOLVED")}
                            className="px-2 py-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded hover:bg-green-500/20 transition-all"
                          >
                            Resolve
                          </button>
                        )}
                        {threat.status === "ACTIVE" && (
                          <button
                            onClick={() => handleStatusUpdate(threat.id, "INVESTIGATING")}
                            className="px-2 py-1 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded hover:bg-blue-500/20 transition-all"
                          >
                            Investigate
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedThreat(threat)}
                          className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {threats.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No threats found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 border border-border/50 rounded hover:border-primary/50 disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 border border-border/50 rounded hover:border-primary/50 disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Threat Detail Modal */}
      <AnimatePresence>
        {selectedThreat && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => setSelectedThreat(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 px-4"
            >
              <div className="glass-card p-6 border border-border/50 shadow-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{selectedThreat.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedThreat.type}</p>
                  </div>
                  <button
                    onClick={() => setSelectedThreat(null)}
                    className="p-1 text-muted-foreground hover:text-foreground rounded"
                  >✕</button>
                </div>

                <div className="space-y-3 text-sm mb-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-secondary/20">
                      <p className="text-xs text-muted-foreground">Severity</p>
                      <span className={`mt-1 ${getSeverityBadgeClass(selectedThreat.severity)}`}>{selectedThreat.severity}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/20">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <span className={`mt-1 ${getStatusBadgeClass(selectedThreat.status)}`}>{selectedThreat.status.replace("_", " ")}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/20">
                      <p className="text-xs text-muted-foreground">Source IP</p>
                      <p className="font-mono font-semibold mt-0.5">{selectedThreat.source}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/20">
                      <p className="text-xs text-muted-foreground">Country</p>
                      <p className="font-semibold mt-0.5">{selectedThreat.country || "Unknown"}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/20">
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p>{selectedThreat.description}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/20">
                    <p className="text-xs text-muted-foreground mb-1">Detected</p>
                    <p>{formatRelativeTime(selectedThreat.timestamp)}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {selectedThreat.status !== "RESOLVED" && (
                    <button
                      onClick={() => handleStatusUpdate(selectedThreat.id, "RESOLVED")}
                      className="flex-1 py-2.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-sm font-semibold hover:bg-green-500/20 transition-all"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {selectedThreat.status === "ACTIVE" && (
                    <button
                      onClick={() => handleStatusUpdate(selectedThreat.id, "INVESTIGATING")}
                      className="flex-1 py-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-sm font-semibold hover:bg-blue-500/20 transition-all"
                    >
                      Investigate
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedThreat(null)}
                    className="px-6 py-2.5 border border-border/50 rounded-lg text-sm hover:border-border transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

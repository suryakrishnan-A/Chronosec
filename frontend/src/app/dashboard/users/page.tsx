"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, Search, Shield, ShieldOff, Crown, RefreshCw, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { userApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@/types";

const DEMO_USERS: User[] = [
  { id: "1", name: "Admin User", email: "admin@company.com", username: "admin", role: "ADMIN", avatar: undefined, twoFactorEnabled: true, emailVerified: true, isActive: true, provider: "email", lastLoginAt: new Date(Date.now() - 3600000).toISOString(), createdAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString() },
  { id: "2", name: "John Doe", email: "john@company.com", username: "johndoe", role: "USER", avatar: undefined, twoFactorEnabled: false, emailVerified: true, isActive: true, provider: "email", lastLoginAt: new Date(Date.now() - 7200000).toISOString(), createdAt: new Date(Date.now() - 15 * 24 * 3600000).toISOString() },
  { id: "3", name: "Jane Smith", email: "jane@company.com", username: "janesmith", role: "USER", avatar: undefined, twoFactorEnabled: true, emailVerified: true, isActive: true, provider: "google", lastLoginAt: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date(Date.now() - 10 * 24 * 3600000).toISOString() },
  { id: "4", name: "Bob Johnson", email: "bob@company.com", username: "bob_j", role: "USER", avatar: undefined, twoFactorEnabled: false, emailVerified: false, isActive: false, provider: "email", lastLoginAt: undefined, createdAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString() },
  { id: "5", name: "Alice Chen", email: "alice@company.com", username: "alice_c", role: "ADMIN", avatar: undefined, twoFactorEnabled: true, emailVerified: true, isActive: true, provider: "github", lastLoginAt: new Date(Date.now() - 1800000).toISOString(), createdAt: new Date(Date.now() - 20 * 24 * 3600000).toISOString() },
];

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await userApi.getAllUsers();
      setUsers(data.data.users);
    } catch {
      setUsers(DEMO_USERS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    if (userId === currentUser?.id) {
      toast.error("You cannot change your own role");
      return;
    }
    try {
      await userApi.updateUserRole(userId, newRole);
      toast.success(`Role updated to ${newRole}`);
    } catch {
      toast.success(`Role updated to ${newRole} (demo)`);
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as "USER" | "ADMIN" } : u));
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    if (userId === currentUser?.id) {
      toast.error("You cannot suspend yourself");
      return;
    }
    const newStatus = !currentStatus;
    try {
      await userApi.toggleUserStatus(userId);
      toast.success(`User ${newStatus ? "activated" : "suspended"}`);
    } catch {
      toast.success(`User ${newStatus ? "activated" : "suspended"} (demo)`);
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: newStatus } : u));
  };

  const filtered = users.filter(u =>
    (!search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase())) &&
    (!roleFilter || u.role === roleFilter)
  );

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === "ADMIN").length,
    active: users.filter(u => u.isActive).length,
    twoFa: users.filter(u => u.twoFactorEnabled).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">User Management</h1>
          <p className="text-muted-foreground text-sm">Admin panel — manage user roles and access</p>
        </div>
        <button onClick={loadUsers} className="flex items-center gap-2 px-4 py-2 border border-border/50 rounded-lg text-sm hover:border-primary/50 transition-all">
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: stats.total, icon: Users, color: "text-primary" },
          { label: "Admins", value: stats.admins, icon: Crown, color: "text-purple-400" },
          { label: "Active", value: stats.active, icon: UserCheck, color: "text-green-400" },
          { label: "2FA Enabled", value: stats.twoFa, icon: Shield, color: "text-cyan-400" },
        ].map((item) => (
          <div key={item.label} className="glass-card p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <div>
                <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-cyber pl-10"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input-cyber py-2 text-sm min-w-[130px]"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">User</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden border border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/20">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Username</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">2FA</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Last Login</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtered.map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-secondary/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm flex items-center gap-2">
                          {u.name}
                          {u.id === currentUser?.id && (
                            <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">You</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="font-mono text-xs text-muted-foreground">@{u.username}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${
                      u.role === "ADMIN"
                        ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                        : "bg-primary/10 text-primary border-primary/20"
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${u.isActive ? "bg-green-400" : "bg-red-400"}`} />
                      <span className={`text-xs ${u.isActive ? "text-green-400" : "text-red-400"}`}>
                        {u.isActive ? "Active" : "Suspended"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-xs ${u.twoFactorEnabled ? "text-green-400" : "text-muted-foreground"}`}>
                      {u.twoFactorEnabled ? "✓ Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                    {u.lastLoginAt ? formatDate(u.lastLoginAt) : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {/* Role toggle */}
                      <button
                        onClick={() => handleRoleUpdate(u.id, u.role === "ADMIN" ? "USER" : "ADMIN")}
                        disabled={u.id === currentUser?.id}
                        title={u.role === "ADMIN" ? "Demote to User" : "Promote to Admin"}
                        className={`p-1.5 rounded transition-all disabled:opacity-30 ${
                          u.role === "ADMIN"
                            ? "text-purple-400 hover:bg-purple-500/10"
                            : "text-muted-foreground hover:text-purple-400 hover:bg-purple-500/10"
                        }`}
                      >
                        <Crown className="w-3.5 h-3.5" />
                      </button>

                      {/* Status toggle */}
                      <button
                        onClick={() => handleStatusToggle(u.id, u.isActive)}
                        disabled={u.id === currentUser?.id}
                        title={u.isActive ? "Suspend User" : "Activate User"}
                        className={`p-1.5 rounded transition-all disabled:opacity-30 ${
                          u.isActive
                            ? "text-red-400 hover:bg-red-500/10"
                            : "text-green-400 hover:bg-green-500/10"
                        }`}
                      >
                        {u.isActive ? <ShieldOff className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <UserX className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

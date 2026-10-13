"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, AtSign, Camera, Shield, ShieldCheck, Save, Key, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { userApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingTwoFa, setIsTogglingTwoFa] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    username: user?.username || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { data } = await userApi.updateProfile(form);
      updateUser(data.data.user);
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to update profile";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle2FA = async () => {
    setIsTogglingTwoFa(true);
    try {
      const { data } = await userApi.toggleTwoFactor();
      updateUser({ twoFactorEnabled: data.data.twoFactorEnabled });
      toast.success(`Two-factor authentication ${data.data.twoFactorEnabled ? "enabled" : "disabled"}`);
    } catch {
      // Demo mode
      const newState = !user?.twoFactorEnabled;
      updateUser({ twoFactorEnabled: newState });
      toast.success(`2FA ${newState ? "enabled" : "disabled"} (demo)`);
    } finally {
      setIsTogglingTwoFa(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setChangingPassword(true);
    try {
      await userApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to change password";
      toast.error(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black">Profile</h1>
        <p className="text-muted-foreground text-sm">Manage your personal information and security</p>
      </div>

      {/* Profile Card */}
      <div className="glass-card p-6 border border-border/50">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-4xl font-black shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <button className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </button>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-muted-foreground">@{user.username}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${
                    user.role === "ADMIN"
                      ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                      : "bg-primary/10 text-primary border-primary/20"
                  }`}>{user.role}</span>
                  {user.emailVerified && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                      Verified
                    </span>
                  )}
                  {user.twoFactorEnabled && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      2FA Active
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 border border-border/50 rounded-lg text-sm hover:border-primary/50 hover:text-primary transition-all"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                {user.email}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <AtSign className="w-4 h-4" />
                {user.username}
              </div>
              {user.lastLoginAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  Last login: {formatDate(user.lastLoginAt)}
                </div>
              )}
              {user.provider && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  Auth: {user.provider.charAt(0).toUpperCase() + user.provider.slice(1)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-6 pt-6 border-t border-border/50 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="input-cyber pl-10"
                    placeholder="Your name"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Username</label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value }))}
                    className="input-cyber pl-10"
                    placeholder="username"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="btn-cyber flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Security Settings */}
      <div className="glass-card p-6 border border-border/50">
        <h3 className="font-bold mb-5 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Security Settings
        </h3>

        <div className="space-y-4">
          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-xl">
            <div className="flex items-start gap-3">
              <ShieldCheck className={`w-5 h-5 mt-0.5 ${user.twoFactorEnabled ? "text-green-400" : "text-muted-foreground"}`} />
              <div>
                <p className="font-semibold text-sm">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add an extra layer of security with OTP verification on every login
                </p>
              </div>
            </div>
            <button
              onClick={handleToggle2FA}
              disabled={isTogglingTwoFa}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none disabled:opacity-50 ${
                user.twoFactorEnabled ? "bg-green-500" : "bg-secondary"
              }`}
            >
              <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 shadow transition-all duration-300 ${
                user.twoFactorEnabled ? "left-6" : "left-0.5"
              }`} />
            </button>
          </div>

          {/* Change Password */}
          {user.provider === "email" || !user.provider ? (
            <div className="p-4 bg-secondary/20 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Key className="w-5 h-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold text-sm">Change Password</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Update your password regularly for better security</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="px-3 py-1.5 border border-border/50 rounded-lg text-xs hover:border-primary/50 transition-all"
                >
                  {showPasswordForm ? "Cancel" : "Change"}
                </button>
              </div>

              {showPasswordForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  onSubmit={handleChangePassword}
                  className="mt-4 space-y-3"
                >
                  {["currentPassword", "newPassword", "confirmPassword"].map((field) => (
                    <div key={field} className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        {field === "currentPassword" ? "Current Password" :
                         field === "newPassword" ? "New Password" : "Confirm New Password"}
                      </label>
                      <input
                        type="password"
                        value={passwordForm[field as keyof typeof passwordForm]}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, [field]: e.target.value }))}
                        className="input-cyber text-sm"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  ))}
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="btn-cyber flex items-center gap-2 text-sm disabled:opacity-50"
                  >
                    {changingPassword ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Key className="w-4 h-4" />
                    )}
                    Update Password
                  </button>
                </motion.form>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-xl">
              <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
              <p className="text-sm text-muted-foreground">
                Password changes are not available for {user.provider} accounts.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Account Info */}
      <div className="glass-card p-6 border border-border/50">
        <h3 className="font-bold mb-4">Account Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {[
            { label: "Account ID", value: user.id },
            { label: "Email", value: user.email },
            { label: "Role", value: user.role },
            { label: "Auth Provider", value: (user.provider || "email").charAt(0).toUpperCase() + (user.provider || "email").slice(1) },
            { label: "Email Verified", value: user.emailVerified ? "Yes" : "No" },
            { label: "Member Since", value: user.createdAt ? formatDate(user.createdAt) : "N/A" },
          ].map((item) => (
            <div key={item.label} className="p-3 bg-secondary/20 rounded-lg">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="font-medium mt-0.5 truncate font-mono text-xs">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

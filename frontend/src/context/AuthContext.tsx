"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi, userApi } from "@/lib/api";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ requiresOtp?: boolean; email?: string; otp?: string }>;
  register: (data: { name: string; email: string; username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  oauthLogin: (provider: string, data: { email: string; name?: string; avatar?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        // Refresh from server
        const { data } = await userApi.getProfile();
        const freshUser = data.data.user;
        setUser(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser));
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    const result = data.data;

    if (result.requiresOtp) {
      return { requiresOtp: true, email: result.email, otp: result.otp };
    }

    localStorage.setItem("accessToken", result.accessToken);
    localStorage.setItem("refreshToken", result.refreshToken);
    localStorage.setItem("user", JSON.stringify(result.user));
    setUser(result.user);
    return {};
  };

  const register = async (formData: { name: string; email: string; username: string; password: string }) => {
    const { data } = await authApi.register(formData);
    const result = data.data;
    localStorage.setItem("accessToken", result.accessToken);
    localStorage.setItem("refreshToken", result.refreshToken);
    localStorage.setItem("user", JSON.stringify(result.user));
    setUser(result.user);
  };

  const verifyOtp = async (email: string, otp: string) => {
    const { data } = await authApi.verifyOtp({ email, otp });
    const result = data.data;
    localStorage.setItem("accessToken", result.accessToken);
    localStorage.setItem("refreshToken", result.refreshToken);
    localStorage.setItem("user", JSON.stringify(result.user));
    setUser(result.user);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch { /* ignore */ }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
    }
  };

  const oauthLogin = async (provider: string, oauthData: { email: string; name?: string; avatar?: string }) => {
    const { data } = await authApi.oauthCallback({ provider, ...oauthData });
    const result = data.data;
    localStorage.setItem("accessToken", result.accessToken);
    localStorage.setItem("refreshToken", result.refreshToken);
    localStorage.setItem("user", JSON.stringify(result.user));
    setUser(result.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        verifyOtp,
        updateUser,
        oauthLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

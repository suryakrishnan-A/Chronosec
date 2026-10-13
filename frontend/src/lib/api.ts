import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// Request interceptor - attach access token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/api/auth/refresh`, {
            refreshToken,
          });
          const { accessToken, refreshToken: newRefreshToken } = data.data;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/auth/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { name: string; email: string; username: string; password: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) => api.post("/auth/login", data),
  logout: (refreshToken: string) => api.post("/auth/logout", { refreshToken }),
  verifyOtp: (data: { email: string; otp: string }) => api.post("/auth/otp/verify", data),
  sendOtp: (email: string) => api.post("/auth/otp/send", { email }),
  refreshToken: (refreshToken: string) => api.post("/auth/refresh", { refreshToken }),
  oauthCallback: (data: {
    provider: string;
    providerId?: string;
    email: string;
    name?: string;
    avatar?: string;
  }) => api.post("/auth/oauth/callback", data),
};

// User API
export const userApi = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data: { name?: string; username?: string; avatar?: string }) =>
    api.put("/users/profile", data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put("/users/password", data),
  toggleTwoFactor: () => api.put("/users/2fa/toggle"),
  getAllUsers: (params?: { page?: number; limit?: number }) =>
    api.get("/users", { params }),
  updateUserRole: (userId: string, role: string) =>
    api.put(`/users/${userId}/role`, { role }),
  toggleUserStatus: (userId: string) => api.put(`/users/${userId}/status`),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => api.get("/dashboard/stats"),
  triggerScan: () => api.post("/dashboard/scan"),
};

// Threats API
export const threatsApi = {
  getThreats: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    severity?: string;
    search?: string;
  }) => api.get("/threats", { params }),
  getThreat: (id: string) => api.get(`/threats/${id}`),
  updateStatus: (id: string, status: string) =>
    api.put(`/threats/${id}/status`, { status }),
  createThreat: (data: {
    title: string;
    source: string;
    type: string;
    severity: string;
    description: string;
    ipAddress?: string;
    country?: string;
  }) => api.post("/threats", data),
  getLogs: (params?: { page?: number; limit?: number }) =>
    api.get("/threats/logs", { params }),
};

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, Github, Chrome, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, oauthLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.requiresOtp) {
        toast.info("OTP sent to your email");
        router.push(`/auth/otp?email=${encodeURIComponent(result.email || email)}&otp=${result.otp || ""}`);
        return;
      }

      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Invalid email or password";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: string) => {
    setOauthLoading(provider);
    // Simulate OAuth - in production connect to real OAuth providers
    const mockData = {
      google: { email: "demo@gmail.com", name: "Demo User", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo" },
      github: { email: "demo@github.com", name: "GitHub User", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=github" },
    };
    try {
      const data = mockData[provider as keyof typeof mockData];
      await oauthLogin(provider, data);
      toast.success(`Signed in with ${provider}`);
      router.push("/dashboard");
    } catch {
      toast.error(`Failed to sign in with ${provider}`);
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background cyber-grid-bg flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black text-gradient-cyber">CyberShield AI</span>
            </Link>
            <h1 className="text-3xl font-black text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your security dashboard</p>
          </div>

          <div className="glass-card p-8 border border-border/50">
            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                id="google-oauth-btn"
                onClick={() => handleOAuth("google")}
                disabled={!!oauthLoading || isLoading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 text-sm font-medium disabled:opacity-50"
              >
                {oauthLoading === "google" ? (
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                ) : (
                  <Chrome className="w-4 h-4 text-[#4285F4]" />
                )}
                Google
              </button>
              <button
                id="github-oauth-btn"
                onClick={() => handleOAuth("github")}
                disabled={!!oauthLoading || isLoading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 text-sm font-medium disabled:opacity-50"
              >
                {oauthLoading === "github" ? (
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                ) : (
                  <Github className="w-4 h-4" />
                )}
                GitHub
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground">or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-center gap-3 p-3 bg-destructive/10 border border-destructive/30 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </motion.div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground" htmlFor="email">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="input-cyber pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground" htmlFor="password">Password</label>
                  <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input-cyber pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="btn-cyber w-full flex items-center justify-center gap-2 py-3 text-base mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* OTP Login */}
            <div className="mt-4 pt-4 border-t border-border/50">
              <Link
                href="/auth/otp"
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-border/50 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all duration-200"
              >
                Sign in with OTP instead
              </Link>
            </div>
          </div>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-primary font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

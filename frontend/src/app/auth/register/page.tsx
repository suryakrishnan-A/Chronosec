"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, User, AtSign, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const PASSWORD_REQUIREMENTS = [
  { label: "At least 8 characters", check: (p: string) => p.length >= 8 },
  { label: "Contains uppercase letter", check: (p: string) => /[A-Z]/.test(p) },
  { label: "Contains number", check: (p: string) => /\d/.test(p) },
  { label: "Contains special character", check: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError("Please agree to the terms and conditions");
      return;
    }

    const failedReqs = PASSWORD_REQUIREMENTS.filter((r) => !r.check(form.password));
    if (failedReqs.length > 0) {
      setError(`Password must: ${failedReqs.map((r) => r.label.toLowerCase()).join(", ")}`);
      return;
    }

    setIsLoading(true);
    try {
      await register(form);
      toast.success("Account created! Welcome to CyberShield AI 🛡️");
      router.push("/dashboard");
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to create account";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const strengthScore = PASSWORD_REQUIREMENTS.filter((r) => r.check(form.password)).length;
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

  return (
    <div className="min-h-screen bg-background cyber-grid-bg flex items-center justify-center p-4 py-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black text-gradient-cyber">CyberShield AI</span>
            </Link>
            <h1 className="text-3xl font-black text-foreground mb-2">Create Account</h1>
            <p className="text-muted-foreground">Join thousands of security professionals</p>
          </div>

          <div className="glass-card p-8 border border-border/50">
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="name">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange("name")}
                    placeholder="John Doe"
                    required
                    className="input-cyber pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="reg-email">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="reg-email"
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    placeholder="you@company.com"
                    required
                    className="input-cyber pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="username">Username</label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="username"
                    type="text"
                    value={form.username}
                    onChange={handleChange("username")}
                    placeholder="johndoe"
                    required
                    pattern="[a-zA-Z0-9_]+"
                    className="input-cyber pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="reg-password">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange("password")}
                    placeholder="••••••••"
                    required
                    className="input-cyber pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength */}
                {form.password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i < strengthScore ? strengthColors[strengthScore - 1] : "bg-border"
                          }`}
                        />
                      ))}
                    </div>
                    {strengthScore > 0 && (
                      <p className={`text-xs font-medium ${strengthColors[strengthScore - 1].replace("bg-", "text-")}`}>
                        {strengthLabels[strengthScore - 1]} password
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-1">
                      {PASSWORD_REQUIREMENTS.map((req) => (
                        <div key={req.label} className="flex items-center gap-1.5">
                          <Check className={`w-3 h-3 ${req.check(form.password) ? "text-green-400" : "text-border"}`} />
                          <span className={`text-xs ${req.check(form.password) ? "text-green-400" : "text-muted-foreground"}`}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 accent-primary"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </label>
              </div>

              <button
                id="register-submit-btn"
                type="submit"
                disabled={isLoading || !agreed}
                className="btn-cyber w-full flex items-center justify-center gap-2 py-3 text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

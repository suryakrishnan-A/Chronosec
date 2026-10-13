"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, KeyRound, ArrowRight, RefreshCw, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api";

function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOtp } = useAuth();

  const emailFromParams = searchParams.get("email") || "";
  const otpFromParams = searchParams.get("otp") || "";

  const [email, setEmail] = useState(emailFromParams);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Show dev OTP hint
  useEffect(() => {
    if (otpFromParams) {
      toast.info(`Dev mode - OTP: ${otpFromParams}`, { duration: 10000 });
    }
  }, [otpFromParams]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, "").slice(0, 6);
      const newOtp = [...otp];
      digits.split("").forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(index + digits.length, 5)]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, "");
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      await verifyOtp(email, otpCode);
      toast.success("OTP verified! Welcome back!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Invalid OTP code";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || !email) return;
    setIsResending(true);
    try {
      await authApi.sendOtp(email);
      setCountdown(60);
      toast.success("New OTP sent to your email");
    } catch {
      toast.error("Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  return (
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
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4">
          <KeyRound className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-black text-foreground mb-2">Enter OTP</h1>
        <p className="text-muted-foreground text-sm">
          We sent a 6-digit code to
        </p>
        {email && (
          <p className="text-primary font-semibold text-sm mt-1 flex items-center justify-center gap-1.5">
            <Mail className="w-4 h-4" /> {email}
          </p>
        )}
      </div>

      <div className="glass-card p-8 border border-border/50">
        {!emailFromParams && (
          <div className="mb-6 space-y-1">
            <label className="text-sm font-medium" htmlFor="otp-email">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="otp-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="input-cyber pl-10"
              />
            </div>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-center block">Verification Code</label>
            <div className="flex gap-3 justify-center">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-secondary/30 
                    focus:outline-none focus:border-primary transition-all duration-200
                    ${digit ? "border-primary/50 text-primary" : "border-border/50"}`}
                />
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <button
            id="otp-verify-btn"
            type="submit"
            disabled={isLoading || otp.join("").length < 6}
            className="btn-cyber w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Verify OTP <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || isResending || !email}
              className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCw className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`} />
              {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
            </button>
          </div>
        </form>
      </div>

      <p className="text-center mt-6 text-sm text-muted-foreground">
        <Link href="/auth/login" className="text-primary hover:underline">
          ← Back to Login
        </Link>
      </p>
    </motion.div>
  );
}

export default function OtpPage() {
  return (
    <div className="min-h-screen bg-background cyber-grid-bg flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <Suspense fallback={<div className="text-center text-muted-foreground">Loading...</div>}>
          <OtpForm />
        </Suspense>
      </div>
    </div>
  );
}

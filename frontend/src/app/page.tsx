"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Shield, Zap, Lock, Eye, Activity, Globe, ChevronRight,
  ArrowRight, Check, Star, Menu, X, TrendingUp, AlertTriangle,
  Cpu, Database, Network, Radio
} from "lucide-react";

const THREATS = [
  { ip: "192.168.1.45", type: "SQL Injection", severity: "CRITICAL", country: "🇷🇺" },
  { ip: "10.0.0.127", type: "Port Scan", severity: "HIGH", country: "🇨🇳" },
  { ip: "172.16.0.88", type: "Brute Force", severity: "MEDIUM", country: "🇩🇪" },
  { ip: "203.0.113.52", type: "DDoS Attack", severity: "CRITICAL", country: "🇰🇷" },
  { ip: "198.51.100.14", type: "XSS Attack", severity: "HIGH", country: "🇺🇸" },
  { ip: "185.220.101.9", type: "Ransomware", severity: "CRITICAL", country: "🇧🇷" },
];

const FEATURES = [
  {
    icon: Zap,
    title: "AI-Powered Detection",
    description: "Machine learning algorithms detect zero-day threats in real-time before they cause damage.",
    color: "from-yellow-500/20 to-orange-500/20",
    iconColor: "text-yellow-400",
    border: "border-yellow-500/20",
  },
  {
    icon: Shield,
    title: "Zero Trust Architecture",
    description: "Never trust, always verify. Our platform implements strict access controls at every layer.",
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-cyan-400",
    border: "border-cyan-500/20",
  },
  {
    icon: Globe,
    title: "Global Threat Intelligence",
    description: "Real-time threat feeds from 190+ countries, updated every 30 seconds.",
    color: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-400",
    border: "border-purple-500/20",
  },
  {
    icon: Activity,
    title: "24/7 SOC Monitoring",
    description: "Your dedicated Security Operations Center with automated incident response.",
    color: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-400",
    border: "border-green-500/20",
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "Military-grade AES-256 encryption protecting all your data in transit and at rest.",
    color: "from-red-500/20 to-rose-500/20",
    iconColor: "text-red-400",
    border: "border-red-500/20",
  },
  {
    icon: Eye,
    title: "Behavioral Analytics",
    description: "Deep user and entity behavior analysis to detect insider threats and anomalies.",
    color: "from-teal-500/20 to-cyan-500/20",
    iconColor: "text-teal-400",
    border: "border-teal-500/20",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "Perfect for small teams getting started with security",
    features: ["Up to 5 users", "Basic threat detection", "Email alerts", "7-day log retention", "Community support"],
    cta: "Start Free Trial",
    popular: false,
    color: "border-border",
  },
  {
    name: "Professional",
    price: "$149",
    period: "/month",
    description: "Advanced protection for growing organizations",
    features: ["Up to 50 users", "AI-powered detection", "Real-time alerts", "90-day log retention", "Priority support", "2FA enforcement", "API access"],
    cta: "Start Free Trial",
    popular: true,
    color: "border-primary",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Full-scale security for large enterprises",
    features: ["Unlimited users", "Custom AI models", "Dedicated SOC team", "Unlimited retention", "24/7 phone support", "SLA guarantee", "On-premise option"],
    cta: "Contact Sales",
    popular: false,
    color: "border-border",
  },
];

const STATS = [
  { value: "99.99%", label: "Uptime SLA", icon: TrendingUp },
  { value: "< 2ms", label: "Detection Speed", icon: Zap },
  { value: "10M+", label: "Threats Blocked", icon: Shield },
  { value: "190+", label: "Countries Covered", icon: Globe },
];

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-lg" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
            </div>
            <span className="text-lg font-bold">
              <span className="text-gradient-cyber">CyberShield</span>{" "}
              <span className="text-foreground">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {["Features", "Pricing", "Docs", "Blog"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm text-muted-foreground hover:text-foreground px-4 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="btn-cyber text-sm flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 px-4 pb-4"
          >
            {["Features", "Pricing", "Docs", "Blog"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="block py-2.5 text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                {item}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-4">
              <Link href="/auth/login" className="text-center py-2.5 text-muted-foreground border border-border rounded-lg">
                Sign In
              </Link>
              <Link href="/auth/register" className="btn-cyber text-center">
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function LiveThreatFeed() {
  const [threats, setThreats] = useState(THREATS.slice(0, 3));
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % THREATS.length);
      setThreats((prev) => {
        const next = [...prev.slice(1), THREATS[(currentIdx + 3) % THREATS.length]];
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [currentIdx]);

  return (
    <div className="glass-card p-4 space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Radio className="w-4 h-4 text-red-400 animate-pulse" />
        <span className="text-xs font-semibold text-red-400 uppercase tracking-widest">Live Threat Feed</span>
      </div>
      <AnimatePresence mode="popLayout">
        {threats.map((threat) => (
          <motion.div
            key={`${threat.ip}-${threat.type}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-secondary/30 text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-muted-foreground">{threat.ip}</span>
              <span className="text-foreground/70">{threat.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{threat.country}</span>
              <span className={`font-semibold ${
                threat.severity === "CRITICAL" ? "text-red-400" :
                threat.severity === "HIGH" ? "text-orange-400" : "text-yellow-400"
              }`}>{threat.severity}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <div className="min-h-screen bg-background dark cyber-grid-bg">
      <NavBar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
          >
            <Zap className="w-4 h-4" />
            Powered by Advanced AI • Next-Gen Threat Detection
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-7xl font-black leading-none mb-6"
          >
            <span className="text-foreground">Defend Your</span>
            <br />
            <span className="text-gradient-cyber neon-text">Digital Fortress</span>
            <br />
            <span className="text-foreground">with AI Precision</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            CyberShield AI monitors, detects, and neutralizes threats in real-time using
            military-grade AI. Protect your infrastructure before attackers even know they&apos;ve
            been spotted.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link href="/auth/register" className="btn-cyber text-base px-8 py-3.5 flex items-center gap-2 w-full sm:w-auto justify-center">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="px-8 py-3.5 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-all duration-200 w-full sm:w-auto text-center text-base"
            >
              Explore Features
            </Link>
          </motion.div>

          {/* Live Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12"
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="glass-card p-4 text-center hover:cyber-glow transition-all duration-300">
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="text-2xl font-black text-gradient-cyber">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Live Threat Feed Widget */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="max-w-lg mx-auto"
          >
            <LiveThreatFeed />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">Capabilities</span>
            <h2 className="text-4xl sm:text-5xl font-black mt-3 mb-5">
              Enterprise Security,{" "}
              <span className="text-gradient-cyber">Simplified</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to protect your organization from sophisticated modern threats.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className={`glass-card p-6 border ${feature.border} hover:cyber-glow transition-all duration-300 group`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-24 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-primary text-sm font-semibold uppercase tracking-widest">Architecture</span>
              <h2 className="text-4xl font-black mt-3 mb-6">
                Built for the{" "}
                <span className="text-gradient-cyber">Modern Threat Landscape</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Our multi-layered defense architecture combines behavioral analytics, threat intelligence,
                and automated response to create an impenetrable security perimeter.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Cpu, title: "AI/ML Engine", desc: "Real-time pattern recognition and anomaly detection" },
                  { icon: Database, title: "Threat Intelligence DB", desc: "10B+ threat signatures updated in real-time" },
                  { icon: Network, title: "Network Analysis", desc: "Deep packet inspection across all protocols" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4 p-4 glass-card">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{item.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 scan-overlay"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-semibold">Security Operations Center</span>
                </div>
                <span className="text-xs text-green-400 font-mono">● LIVE</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: "Threats Blocked", value: "10,482", color: "text-red-400" },
                  { label: "Systems Protected", value: "2,847", color: "text-green-400" },
                  { label: "Active Scans", value: "14", color: "text-yellow-400" },
                  { label: "Threat Level", value: "LOW", color: "text-green-400" },
                ].map((s) => (
                  <div key={s.label} className="bg-secondary/30 rounded-lg p-3 text-center">
                    <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground font-mono mb-3">// Recent Activity</div>
                {[
                  { time: "00:00:01", msg: "Threat neutralized: SQL injection from 45.12.33.201", type: "success" },
                  { time: "00:00:03", msg: "Port scan detected: 192.168.1.100 → blocked", type: "warning" },
                  { time: "00:00:07", msg: "AI model updated: v4.2.1 deployed", type: "info" },
                  { time: "00:00:12", msg: "System scan completed: 0 vulnerabilities found", type: "success" },
                ].map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.3 }}
                    className="flex gap-3 text-xs font-mono"
                  >
                    <span className="text-muted-foreground shrink-0">{log.time}</span>
                    <span className={
                      log.type === "success" ? "text-green-400" :
                      log.type === "warning" ? "text-yellow-400" : "text-blue-400"
                    }>{log.msg}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">Pricing</span>
            <h2 className="text-4xl sm:text-5xl font-black mt-3 mb-5">
              Simple, <span className="text-gradient-cyber">Transparent</span> Pricing
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              No hidden fees. Start free, scale as you grow. Cancel anytime.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className={`relative glass-card p-8 border-2 ${plan.color} ${
                  plan.popular ? "cyber-glow scale-105 shadow-2xl shadow-primary/20" : ""
                } transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" /> Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-end gap-1 mb-3">
                    <span className="text-4xl font-black text-gradient-cyber">{plan.price}</span>
                    <span className="text-muted-foreground mb-1">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-green-400 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register"
                  className={`w-full text-center py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    plan.popular
                      ? "btn-cyber"
                      : "border border-border hover:border-primary hover:text-primary"
                  }`}
                >
                  {plan.cta} <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <AlertTriangle className="w-16 h-16 text-primary mx-auto mb-6 animate-pulse" />
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              Your Network is Being{" "}
              <span className="neon-text-red text-gradient-red">Attacked Right Now</span>
            </h2>
            <p className="text-muted-foreground text-xl mb-10">
              Every second without proper security is an open invitation. Start your free trial today
              and deploy enterprise-grade protection in under 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="btn-cyber text-base px-10 py-4 flex items-center gap-2 justify-center">
                Start Free 14-Day Trial <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/auth/login" className="px-10 py-4 border border-border rounded-lg hover:border-primary hover:text-primary transition-all duration-200">
                Sign In to Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gradient-cyber">CyberShield AI</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              {["Privacy", "Terms", "Security", "Docs", "Status"].map((item) => (
                <Link key={item} href="#" className="hover:text-foreground transition-colors">
                  {item}
                </Link>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 CyberShield AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

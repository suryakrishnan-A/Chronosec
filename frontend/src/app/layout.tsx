import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/Toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CyberShield AI — Advanced Cybersecurity Platform",
    template: "%s | CyberShield AI",
  },
  description:
    "CyberShield AI is an enterprise-grade cybersecurity SaaS platform powered by artificial intelligence. Real-time threat detection, automated response, and comprehensive security monitoring.",
  keywords: [
    "cybersecurity",
    "AI security",
    "threat detection",
    "SIEM",
    "security monitoring",
    "CyberShield",
  ],
  authors: [{ name: "CyberShield AI Team" }],
  creator: "CyberShield AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cybershield.ai",
    title: "CyberShield AI — Advanced Cybersecurity Platform",
    description: "Enterprise-grade AI-powered cybersecurity platform",
    siteName: "CyberShield AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "CyberShield AI",
    description: "Enterprise-grade AI-powered cybersecurity platform",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

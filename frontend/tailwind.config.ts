import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        cyber: {
          50: "#f0feff",
          100: "#cbfcff",
          200: "#96f7ff",
          300: "#4aeefd",
          400: "#00d9f4",
          500: "#00b8d4",
          600: "#0292af",
          700: "#09748e",
          800: "#105d73",
          900: "#114e62",
          950: "#033344",
        },
        neon: {
          green: "#00ff88",
          blue: "#00d4ff",
          purple: "#b400ff",
          red: "#ff0044",
          yellow: "#ffcc00",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        pulse_glow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(0,212,255,0.3), 0 0 10px rgba(0,212,255,0.2)" },
          "50%": { boxShadow: "0 0 20px rgba(0,212,255,0.8), 0 0 40px rgba(0,212,255,0.4)" },
        },
        scan_line: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        flicker: {
          "0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%": { opacity: "1" },
          "20%, 24%, 55%": { opacity: "0.4" },
        },
        "border-beam": {
          "100%": { "offset-distance": "100%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        pulse_glow: "pulse_glow 2s ease-in-out infinite",
        scan_line: "scan_line 3s linear infinite",
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        flicker: "flicker 3s linear infinite",
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
      },
      backgroundImage: {
        "cyber-grid": "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
        "hero-gradient": "radial-gradient(ellipse at center, rgba(0,180,255,0.15) 0%, rgba(0,0,30,0) 70%)",
        "card-gradient": "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        "glow-gradient": "linear-gradient(135deg, rgba(0,212,255,0.2) 0%, rgba(180,0,255,0.2) 100%)",
      },
      backgroundSize: {
        "cyber-grid": "40px 40px",
      },
    },
  },
  plugins: [],
};
export default config;

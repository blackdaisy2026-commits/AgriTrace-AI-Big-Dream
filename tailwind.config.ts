import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
        inter:  ["Inter",  "sans-serif"],
        mono:   ["JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        // Brand
        brand: {
          green:      "#16a34a",
          "green-lt": "#22c55e",
          "green-dk": "#15803d",
        },
        // Enterprise palette
        accent:  "#2563eb",
        success: "#22c55e",
        warning: "#f59e0b",
        danger:  "#ef4444",
        // Dark mode surfaces
        dark: {
          bg:       "#09090b",
          "bg-2":   "#111113",
          card:     "#18181b",
          "card-2": "#1f1f23",
          border:   "#27272a",
          "border-2":"#1e1e21",
          text:     "#fafafa",
          "text-2": "#a1a1aa",
          muted:    "#71717a",
        },
        // Light mode surfaces
        light: {
          bg:       "#ffffff",
          "bg-2":   "#f8fafc",
          card:     "#ffffff",
          "card-2": "#f1f5f9",
          border:   "#e5e7eb",
          "border-2":"#f3f4f6",
          text:     "#111827",
          "text-2": "#6b7280",
          muted:    "#9ca3af",
        },
        // Legacy agri tokens (keep for backward compat)
        agri: {
          green: "#16a34a",
          dark:  "#09090b",
          card:  "#18181b",
        },
      },
      spacing: {
        // 8px scale extras
        "4.5": "18px",
        "13":  "52px",
        "15":  "60px",
        "18":  "72px",
        "22":  "88px",
        "26":  "104px",
        "30":  "120px",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "24px",
      },
      maxWidth: {
        "8xl": "88rem",  // 1408px
        "9xl": "96rem",  // 1536px
        container: "1280px",
      },
      boxShadow: {
        xs:  "0 1px 2px rgba(0,0,0,0.3)",
        sm:  "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.2)",
        md:  "0 4px 6px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)",
        lg:  "0 10px 15px rgba(0,0,0,0.4), 0 4px 6px rgba(0,0,0,0.2)",
        xl:  "0 20px 25px rgba(0,0,0,0.5), 0 10px 10px rgba(0,0,0,0.2)",
        "2xl":"0 25px 50px rgba(0,0,0,0.6)",
        // Glow shadows
        "green-sm": "0 0 12px rgba(22,163,74,0.25)",
        "green-md": "0 0 24px rgba(22,163,74,0.3)",
        "blue-sm":  "0 0 12px rgba(37,99,235,0.25)",
        "blue-md":  "0 0 24px rgba(37,99,235,0.3)",
      },
      animation: {
        // Existing
        "gradient-x":   "gradient-x 6s ease infinite",
        "float":        "float 4s ease-in-out infinite",
        "scan":         "scan 2s ease-in-out infinite",
        // New
        "fade-in":      "fade-in 0.2s ease-out",
        "slide-up":     "slide-up 0.25s ease-out",
        "slide-down":   "slide-down 0.25s ease-out",
        "scale-in":     "scale-in 0.2s ease-out",
        "shimmer":      "shimmer 1.5s ease-in-out infinite",
        "pulse-brand":  "pulse-brand 2s ease-in-out infinite",
        "spin-slow":    "spin 3s linear infinite",
        "glow-pulse":   "glow-pulse 2.5s ease-in-out infinite",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%":       { "background-position": "100% 50%" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":       { transform: "translateY(-8px)" },
        },
        "scan": {
          "0%":   { transform: "translateY(0)",   opacity: "1" },
          "50%":  { transform: "translateY(200px)", opacity: "0.5" },
          "100%": { transform: "translateY(0)",   opacity: "1" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%":   { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%":   { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "shimmer": {
          "0%":   { "background-position": "-800px 0" },
          "100%": { "background-position": "800px 0" },
        },
        "pulse-brand": {
          "0%, 100%": { "box-shadow": "0 0 0 0 rgba(22, 163, 74, 0.3)" },
          "50%":       { "box-shadow": "0 0 0 8px rgba(22, 163, 74, 0)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.6" },
          "50%":       { opacity: "1" },
        },
      },
      backgroundImage: {
        "grid-dark": "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        "grid-light": "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
        "radial-green": "radial-gradient(circle at 50% 0%, rgba(22,163,74,0.12) 0%, transparent 70%)",
        "radial-blue": "radial-gradient(circle at 50% 0%, rgba(37,99,235,0.08) 0%, transparent 70%)",
      },
    },
  },
  plugins: [],
};

export default config;

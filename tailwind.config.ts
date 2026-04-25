import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        agri: {
          green: "#16a34a",
          dark: "#0a0f0d",
          card: "#111916",
        },
      },
      animation: {
        "gradient-x": "gradient-x 4s ease infinite",
        "float": "float 6s ease-in-out infinite",
        "scan": "scan 2s ease-in-out infinite",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "scan": {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "50%": { transform: "translateY(200px)", opacity: "0.5" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      backgroundImage: {
        "circuit": "radial-gradient(circle at 25px 25px, rgba(34,197,94,0.04) 2px, transparent 0), radial-gradient(circle at 75px 75px, rgba(59,130,246,0.04) 2px, transparent 0)",
      },
    },
  },
  plugins: [],
};

export default config;

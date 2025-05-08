import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B82F6",
          dark: "#2563EB",
          light: "#60A5FA",
        },
        accent: {
          green: "#10B981",
          red: "#EF4444",
          blue: "#3B82F6",
          yellow: "#F59E0B",
        },
        dark: {
          DEFAULT: "#0F172A",
          background: "#0F172A",
          card: "#1E293B",
          border: "#334155",
        },
        "dark-text": {
          DEFAULT: "#F8FAFC",
          muted: "#94A3B8",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "card-gradient":
          "linear-gradient(145deg, rgba(255,107,44,0.1) 0%, rgba(255,107,44,0.05) 100%)",
        "orange-gradient":
          "linear-gradient(145deg, rgba(255,107,44,0.25) 0%, rgba(255,107,44,0.15) 50%, rgba(255,107,44,0.05) 100%)",
        "glass-gradient":
          "linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.01) 100%)",
        "glass-shine":
          "linear-gradient(145deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%)",
        "dark-gradient":
          "linear-gradient(145deg, rgba(26,26,26,0.9) 0%, rgba(26,26,26,0.8) 100%)",
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "fade-in": "fade-in 0.3s ease-in-out",
        shine: "shine 2s ease-in-out infinite",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shine: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "card-hover":
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        glass:
          "0 8px 32px 0 rgba(0, 0, 0, 0.36), inset 0 0 0 1px rgba(255, 255, 255, 0.05)",
        "glass-sm":
          "0 2px 8px 0 rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.05)",
        "glass-hover":
          "0 12px 36px 0 rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.08)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;

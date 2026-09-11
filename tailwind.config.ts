import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B1220",
          soft: "#1B2333"
        },
        paper: "#F4F2EC",
        canvas: "#FFFFFF",
        // Primary — Ashoka / government blue
        brand: {
          DEFAULT: "#0B2E6F",
          dark: "#082151",
          soft: "#E8EDF7"
        },
        // Accent — "verified" emerald
        accent: {
          DEFAULT: "#0E7A4B",
          dark: "#0A5C38",
          soft: "#E4F1EA"
        },
        success: "#0F9D58",
        warning: "#E37400",
        danger: "#D14343",
        // National tricolour (used for the hairline + emblem only)
        saffron: "#FF9933",
        india: "#138808",
        border: "#E3E0D4"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"]
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,18,32,0.04), 0 4px 16px rgba(11,18,32,0.06)",
        band: "0 10px 30px -12px rgba(11,46,111,0.45)"
      }
    }
  },
  plugins: []
};

export default config;

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
        paper: "#F7F5EF",
        canvas: "#FFFFFF",
        brand: {
          DEFAULT: "#0B5FFF",
          dark: "#0745B8",
          soft: "#E6EEFF"
        },
        accent: {
          DEFAULT: "#F5C400",
          dark: "#C79A00"
        },
        success: "#0F9D58",
        warning: "#E37400",
        danger: "#D14343",
        border: "#E4E1D6"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Playfair Display", "ui-serif", "Georgia", "serif"]
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,18,32,0.04), 0 4px 16px rgba(11,18,32,0.06)"
      }
    }
  },
  plugins: []
};

export default config;

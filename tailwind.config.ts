import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        "fade-in": "fadeIn 1s ease-out", // Defines the custom animation
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" }, // Percentage keys as strings
          "100%": { opacity: "1" }, // Percentage keys as strings
        },
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      backgroundImage: {
        hero: "url('/bg.jpg')", // Custom class for the background image
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};

export default config;

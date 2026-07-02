import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#f7f0e3",
        parchment: "#fffaf0",
        navy: "#112748",
        "navy-soft": "#203a62",
        gold: "#c9972e",
        "gold-soft": "#f2d28a",
        civicred: "#9e3e34",
        ink: "#172033",
      },
      boxShadow: {
        luxe: "0 28px 80px rgba(17, 39, 72, 0.16)",
        card: "0 16px 50px rgba(17, 39, 72, 0.11)",
        glow: "0 0 45px rgba(242, 210, 138, 0.56)",
      },
      fontFamily: {
        display: ["Georgia", "Times New Roman", "serif"],
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;

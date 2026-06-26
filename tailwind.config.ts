import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#e8eef7",
          100: "#c5d4e9",
          200: "#9db8d9",
          300: "#739bc9",
          400: "#5185be",
          500: "#2e6fb3",
          600: "#2660a0",
          700: "#1c4e88",
          800: "#123c70",
          900: "#003366",
          950: "#00224a",
        },
        brand: {
          orange: "#CC5500",
          navy: "#003366",
        },
      },
      fontFamily: {
        sans: ["Public Sans", "system-ui", "sans-serif"],
        heading: ["Public Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;

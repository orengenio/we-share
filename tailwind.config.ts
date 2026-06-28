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
          50:  "#e5edf5",
          100: "#b8cfe2",
          200: "#8ab1cf",
          300: "#5c93bc",
          400: "#3878a8",
          500: "#1a5e94",
          600: "#0e4a7e",
          700: "#063868",
          800: "#012852",
          900: "#00254B",
          950: "#001530",
        },
        brand: {
          orange: "#CC5500",
          navy:   "#00254B",
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

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
        // Dark-premium brand system (mirrors the --ws-* tokens in globals.css)
        ws: {
          bg:      "#05070d",
          bg2:     "#0a1120",
          panel:   "#0c1728",
          orange:  "#CC5500",
          "orange-bright": "#E8762B",
          text:    "#f2f6fc",
          muted:   "rgba(210,225,245,0.66)",
          standard:"#3b82f6",
          pro:     "#22c55e",
        },
      },
      fontFamily: {
        sans: ["var(--font-public-sans)", "system-ui", "sans-serif"],
        heading: ["var(--font-public-sans)", "system-ui", "sans-serif"],
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

import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        "blur-in": {
          "0%": { filter: "blur(100px)", opacity: "0" },
          "100%": { filter: "blur(0)", opacity: "1" },
        },
        "blur-in-up": {
          "0%": {
            filter: "blur(100px)",
            opacity: "0",
            transform: "translateY(-50px)",
          },
          "100%": {
            filter: "blur(0)",
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "blur-in-down": {
          "0%": {
            filter: "blur(100px)",
            opacity: "0",
            transform: "translateY(50px)",
          },
          "100%": {
            filter: "blur(0)",
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        typewriter: {
          "0%": {
            width: "0%",
          },
          "100%": {
            maxWidth: "fit-content",
            width: "90%",
          },
        },
        blink: {
          "50%": {
            borderColor: "transparent",
          },
        },
      },
      animation: {
        "blur-in": "blur-in 0.5s ease-out forwards",
        "blur-in-up": "blur-in-up 0.6s ease-out forwards",
        "blur-in-down": "blur-in-down 0.6s ease-out forwards",
        typewriter: "typewriter 3s steps(40) forwards",
        blink: "blink 2s steps(1) infinite",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};

module.exports = config;

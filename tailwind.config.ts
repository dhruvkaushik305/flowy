import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Inter"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
        pacifico: ["Pacifico", "serif"],
        abril: ["Abril Fatface", "serif"],
        roboto: ["Roboto", "serif"],
        poppins: ["Poppins", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;

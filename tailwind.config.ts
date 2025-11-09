import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
        },
        success: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          600: '#10B981',
        },
        warning: {
          DEFAULT: '#F59E0B',
          50: '#FFFBEB',
          600: '#F59E0B',
        },
        danger: {
          DEFAULT: '#EF4444',
          50: '#FEF2F2',
          600: '#EF4444',
        },
        purple: {
          500: '#A855F7',
          600: '#9333EA',
        },
        pink: {
          500: '#EC4899',
        },
      },
    },
  },
  plugins: [],
};

export default config;

// /tailwind.config.ts
// Themed Tailwind config (as generated in omniagency_theme_setup)

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // Using class strategy
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0a0a0a',
        'dark-card': '#1a1a1a',
        'dark-border': '#333333',
        'dark-text-primary': '#e0e0e0',
        'dark-text-secondary': '#a0a0a0',
        primary: {
          DEFAULT: '#4f46e5', // Indigo 600
          hover: '#6366f1',   // Indigo 500
          glow: 'rgba(79, 70, 229, 0.6)',
        },
        secondary: {
          DEFAULT: '#22d3ee', // Cyan 400
          hover: '#67e8f9',   // Cyan 300
          glow: 'rgba(34, 211, 238, 0.6)',
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'glow-primary': '0 0 15px 2px rgba(79, 70, 229, 0.5)',
        'glow-secondary': '0 0 15px 2px rgba(34, 211, 238, 0.5)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      },
      transitionProperty: {
        'all': 'all', 'shadow': 'box-shadow', 'bg': 'background-color', 'transform': 'transform',
      },
      transitionDuration: { '300': '300ms' },
      transitionTimingFunction: { 'ease-in-out': 'ease-in-out' }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    function ({ addUtilities }: { addUtilities: Function }) {
      addUtilities({
        '.glassmorphism': {
          'background': 'rgba(26, 26, 26, 0.6)', // dark-card with opacity
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(51, 51, 51, 0.5)', // dark-border with opacity
          '@apply dark:bg-dark-card/60 dark:border-dark-border/50': {},
        },
        '.glassmorphism-light': {
          'background': 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        }
      })
    }
  ],
};
export default config; 
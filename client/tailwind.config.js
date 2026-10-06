/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e0edfe',
          200: '#bad7fd',
          300: '#7cb5fb',
          400: '#388cf6',
          500: '#106ae8',
          600: '#064ec6',
          700: '#073ea0',
          800: '#0a3582',
          900: '#0e2e6c',
          950: '#091c45',
        },
        dark: {
          bg: '#0B0F19',
          surface: '#111827',
          card: '#1F2937',
          border: '#374151',
          hover: '#283548',
        }
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave': 'wave 1.5s ease-in-out infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(0.5)' },
          '50%': { transform: 'scaleY(1.3)' },
        }
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#141729',
          light: '#1D2138',
          dark: '#0D0F1A',
        },
        secondary: {
          DEFAULT: '#475569',
          light: '#64748B',
          dark: '#334155',
        },
        accent: {
          DEFAULT: '#E21A22',
          light: '#F24B52',
          dark: '#B8151B',
        },
        neutral: {
          DEFAULT: '#F5F5F5',
          dark: '#E0E0E0',
        },
        text: {
          DEFAULT: '#333333',
          light: '#666666',
          dark: '#1A1A1A',
        },
        border: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'hover': '0 10px 30px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      height: {
        'banner': '600px',
        'banner-mobile': '400px',
      },
    },
  },
  plugins: [],
}

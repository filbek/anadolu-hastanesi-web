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
          DEFAULT: '#1E5F74',
          light: '#2A7D99',
          dark: '#184D5F',
        },
        secondary: {
          DEFAULT: '#4BA3C3',
          light: '#6BBAD9',
          dark: '#3A8CA8',
        },
        accent: {
          DEFAULT: '#F0A500',
          light: '#FFB824',
          dark: '#D99000',
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

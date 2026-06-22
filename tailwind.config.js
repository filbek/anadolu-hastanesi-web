/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // === PRIMARY ===
        primary: {
          50:  '#E8EDF3',
          100: '#D1DBE7',
          200: '#A3B7CF',
          300: '#7593B7',
          400: '#476F9F',
          500: '#1A4B87',
          600: '#0F1F3A',
          700: '#0C1930',
          800: '#091326',
          900: '#060D1C',
          DEFAULT: '#0F1F3A',
          light:   '#1A4B87',
          dark:    '#060D1C',
        },
        // === SECONDARY (Ocean) ===
        ocean: {
          50:  '#E6F2F4',
          100: '#CCE5EA',
          200: '#99CCD5',
          300: '#66B2C0',
          400: '#3399AB',
          500: '#0A6B7D',
          600: '#085664',
          700: '#06404B',
          800: '#042B32',
          900: '#021519',
          DEFAULT: '#0A6B7D',
          light:   '#3399AB',
          dark:    '#06404B',
        },
        // === ACCENT (Amber) ===
        amber: {
          50:  '#FCF6EB',
          100: '#F9EDD6',
          200: '#F3DBAD',
          300: '#EDC984',
          400: '#E7B75B',
          500: '#D4953A',
          600: '#AA772E',
          700: '#805923',
          800: '#553C17',
          900: '#2B1E0C',
          DEFAULT: '#D4953A',
          light:   '#E7B75B',
          dark:    '#AA772E',
        },
        // === CTA (Coral) — Logo Red ===
        coral: {
          50:  '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#E30613',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
          DEFAULT: '#E30613',
          light:   '#F87171',
          dark:    '#DC2626',
        },
        // === SUCCESS ===
        success: {
          50:  '#E8F5EE',
          100: '#D1EBDD',
          200: '#A3D7BB',
          300: '#75C399',
          400: '#47AF77',
          500: '#2D8A5E',
          600: '#246E4B',
          700: '#1B5338',
          800: '#123726',
          900: '#091C13',
          DEFAULT: '#2D8A5E',
          light:   '#47AF77',
          dark:    '#246E4B',
        },
        // === SURFACE & NEUTRALS ===
        surface: {
          DEFAULT: '#F7F9FB',
          light:   '#FAFBFD',
          dark:    '#EDF1F5',
        },
        neutral: {
          25:  '#FAFBFC',
          50:  '#F7F9FB',
          100: '#EDF1F5',
          200: '#D5DDE4',
          300: '#B5C0CA',
          400: '#8A97A3',
          500: '#6B7884',
          600: '#4D5862',
          700: '#3A4249',
          800: '#262C31',
          900: '#1A1D23',
          950: '#0D0F12',
          DEFAULT: '#F7F9FB',
          dark:    '#EDF1F5',
        },
        // === TEXT COLORS ===
        text: {
          DEFAULT: '#1A1D23',
          light:   '#4D5862',
          muted:   '#6B7884',
          dark:    '#0D0F12',
        },
        // === BORDER ===
        border: '#D5DDE4',
      },

      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        body:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },

      fontSize: {
        'xs':   ['12px',  { lineHeight: '1.4' }],
        'sm':   ['14px',  { lineHeight: '1.5' }],
        'base': ['16px',  { lineHeight: '1.6' }],
        'lg':   ['18px',  { lineHeight: '1.65' }],
        'xl':   ['20px',  { lineHeight: '1.5' }],
        '2xl':  ['24px',  { lineHeight: '1.35' }],
        '3xl':  ['28px',  { lineHeight: '1.2' }],
        '4xl':  ['36px',  { lineHeight: '1.15' }],
        '5xl':  ['48px',  { lineHeight: '1.1' }],
        '6xl':  ['64px',  { lineHeight: '1.05' }],
      },

      letterSpacing: {
        'tighter': '-0.04em',
        'tight':   '-0.02em',
        'normal':  '0',
        'wide':    '0.04em',
        'wider':   '0.08em',
        'widest':  '0.12em',
      },

      boxShadow: {
        'soft':     '0 2px 15px rgba(15, 31, 58, 0.05)',
        'card':     '0 4px 24px rgba(15, 31, 58, 0.07)',
        'hover':    '0 8px 32px rgba(15, 31, 58, 0.10)',
        'elevated': '0 12px 48px rgba(15, 31, 58, 0.12)',
        'focus':    '0 0 0 3px rgba(227, 6, 19, 0.15)',
        'glass':    '0 8px 32px rgba(15, 31, 58, 0.08)',
        'coral':    '0 4px 20px rgba(227, 6, 19, 0.25)',
        'ocean':    '0 4px 20px rgba(10, 107, 125, 0.20)',
      },

      borderRadius: {
        'xl':  '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },

      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },

      maxWidth: {
        'container': '1280px',
        'prose':     '65ch',
      },

      animation: {
        'fade-up':    'fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in':    'fadeIn 0.4s ease-out forwards',
        'slide-up':   'slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'scale-in':   'scaleIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'shimmer':    'shimmer 2s infinite linear',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':      'float 6s ease-in-out infinite',
      },

      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
      },

      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'bounce':  'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}

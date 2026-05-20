/** @type {import('tailwindcss').Config} */
// AqaarGate brand palette — VERBATIM from web's
// aqaarGate-FE/public/scss/abstracts/_variable.scss `:root` block.
// Always prefer these tokens over raw tailwind colors.
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand
        primary: {
          DEFAULT: '#f1913d',
          50: '#fef7f1', // --Sub-primary-1
          100: '#fdefe2', // --Color-6
          200: 'rgba(241, 145, 61, 0.2)',
          300: 'rgba(241, 145, 61, 0.3)',
          soft: 'rgba(241, 145, 61, 0.15)', // --Sub-primary-2
          softer: 'rgba(241, 145, 61, 0.10)', // --Sub-primary-3
          glow: 'rgba(241, 145, 61, 0.12)', // --shadown
        },
        secondary: '#2c2e33', // --Secondary / --Heading
        heading: '#2c2e33',
        text: '#5c5e61', // --Text
        note: '#a8abae', // --Note
        note2: '#8e8e93', // --Note-2
        line: '#ececec', // --Line
        cream: '#fef7f1', // bright bg

        // Status / semantic
        success: '#06a788', // --Color-1
        danger: '#f2695c', // --Color-2
        gold: '#c79e34', // --Color-3
        info: '#7695ff', // --Color-4
        infoStrong: '#1563df', // --Color-5
        successAlt: '#25c55b', // --Color-7
        warning: '#ffa920', // --Color-8

        // Legacy aliases used by existing components — kept pointing at brand
        // so we don't have to touch every className when we renamed the tokens.
        brand: {
          DEFAULT: '#2c2e33', // dark heading/hero bg
          accent: '#f1913d', // brand primary
        },
      },
      fontFamily: {
        // Latin (English) — Lexend, matches web's $font-main
        lexend: ['Lexend_400Regular'],
        'lexend-medium': ['Lexend_500Medium'],
        'lexend-semibold': ['Lexend_600SemiBold'],
        'lexend-bold': ['Lexend_700Bold'],
        'lexend-extrabold': ['Lexend_800ExtraBold'],
        // Arabic — Tajawal, matches web's $font-tajawal
        tajawal: ['Tajawal_400Regular'],
        'tajawal-medium': ['Tajawal_500Medium'],
        'tajawal-bold': ['Tajawal_700Bold'],
      },
    },
  },
  plugins: [],
};

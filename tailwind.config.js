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
        // Headings / emphasis — Cairo (Arabic + Latin)
        cairo: ['Cairo_600SemiBold'],
        'cairo-bold': ['Cairo_700Bold'],
        'cairo-extrabold': ['Cairo_800ExtraBold'],
        // Body — IBM Plex Sans Arabic (Arabic + Latin)
        plex: ['IBMPlexSansArabic_400Regular'],
        'plex-medium': ['IBMPlexSansArabic_500Medium'],
        // Back-compat aliases (old token names → new fonts) so any stray
        // className keeps resolving after the Lexend/Tajawal → Cairo/Plex swap.
        lexend: ['IBMPlexSansArabic_400Regular'],
        'lexend-medium': ['IBMPlexSansArabic_500Medium'],
        'lexend-semibold': ['Cairo_600SemiBold'],
        'lexend-bold': ['Cairo_700Bold'],
        'lexend-extrabold': ['Cairo_800ExtraBold'],
        tajawal: ['IBMPlexSansArabic_400Regular'],
        'tajawal-medium': ['IBMPlexSansArabic_500Medium'],
        'tajawal-bold': ['Cairo_700Bold'],
      },
    },
  },
  plugins: [],
};

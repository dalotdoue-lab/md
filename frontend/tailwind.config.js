/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // --- Editorial earth palette ---------------------------------
        // Warm near-black for structure & dark sections.
        ink: {
          DEFAULT: '#262320',
          soft: '#54504A',
          muted: '#857F76',
        },
        // Warm neutral surfaces.
        bone: '#F2EDE3',
        paper: '#FBF8F2',
        line: '#E6DECF',
        // Muted olive — the "growth" accent.
        olive: {
          DEFAULT: '#5C6B4A',
          deep: '#46522F',
        },
        // Restrained clay — used sparingly for warmth/highlights.
        clay: {
          DEFAULT: '#A85C3C',
          deep: '#8A4A30',
        },

        // --- Legacy aliases ------------------------------------------
        // Existing pages reference `let-*`; remap them onto the new
        // palette so the whole site re-skins without touching every file.
        let: {
          DEFAULT: '#262320',
          blue: '#262320',
          green: '#5C6B4A',
          light: '#F2EDE3',
          white: '#FBF8F2',
          accent: '#46522F',
        },
        Let: {
          blue: '#262320',
          accent: '#46522F',
        },
      },
      fontFamily: {
        heading: ['Fraunces', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        label: '0.18em',
      },
      boxShadow: {
        card: '0 1px 2px rgba(38, 35, 32, 0.04), 0 8px 24px -16px rgba(38, 35, 32, 0.25)',
        lift: '0 2px 4px rgba(38, 35, 32, 0.05), 0 18px 40px -22px rgba(38, 35, 32, 0.35)',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
        },
      },
    },
  },
  plugins: [],
}

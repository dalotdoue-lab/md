/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        let: {
          DEFAULT: '#0D3B66',
          blue: '#0D3B66',
          green: '#117A65',
          light: '#F0F1F6',
          white: '#FFFFFF',
          accent: '#1E5F8A',
        },
        Let: {
          blue: '#0D3B66',
          accent: '#1E5F8A',
        }
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
        body: ['Open Sans', 'sans-serif'],
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



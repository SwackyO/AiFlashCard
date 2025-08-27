/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // 👈 manual toggle via a .dark class on <html> or <body>
  content: ['./index.html','./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface:  { DEFAULT: '#0b1220',  fg: '#cbd5e1' }, // page bg + text
        panel:    { DEFAULT: '#0f172a',  ring: '#1f2a44' }, // cards
        brand:    { DEFAULT: '#6366f1',  hover: '#5458e8' },
        subtle:   { DEFAULT: '#94a3b8' }
      },
      boxShadow: {
        card: '0 8px 30px rgba(0,0,0,.25)'
      },
      borderRadius: {
        xl2: '1rem'
      }
    }
  },
  plugins: [],
}


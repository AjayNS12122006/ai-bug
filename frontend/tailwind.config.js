/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(148,163,184,.15), 0 12px 35px rgba(15,23,42,.45)'
      },
      colors: {
        surface: '#0f172a',
        panel: '#111827',
        accent: '#7c3aed',
        mint: '#22c55e'
      }
    }
  },
  plugins: []
};

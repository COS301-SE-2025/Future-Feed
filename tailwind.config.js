/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./frontend/index.html', './frontend/src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [
    require('./tailwind-future-feed') // Add this line
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  safelist: [
    {
      pattern: /future-feed:.*/,
    },
  ],
}
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./frontend/index.html', './frontend/src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {
     colors: {
      ffgrey: '#F7F8FB'

     },
  } },
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
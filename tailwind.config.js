/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/app/**/*.{js,jsx,ts,tsx}",
      "./src/components/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          // this creates the `font-playfair` utility
          playfair: ['"Playfair Display"', 'serif'],
        },
      },
    },
    plugins: [],
  }
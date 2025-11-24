/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f7f0',
          100: '#ccefdc',
          200: '#99dfb9',
          300: '#66cf96',
          400: '#33bf73',
          500: '#00af50',
          600: '#008c40',
          700: '#006930',
          800: '#004620',
          900: '#002310',
        },
        secondary: {
          50: '#fff7e6',
          100: '#ffefcc',
          200: '#ffdf99',
          300: '#ffcf66',
          400: '#ffbf33',
          500: '#ffaf00',
          600: '#cc8c00',
          700: '#996900',
          800: '#664600',
          900: '#332300',
        }
      }
    },
  },
  plugins: [],
}

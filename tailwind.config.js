/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#10182B',
          900: '#1E2A45',
          700: '#2E3E63',
          500: '#4C5E8A',
        },
        parchment: {
          50: '#FBFAF7',
          100: '#F7F6F2',
          200: '#EFECE3',
        },
        amber: {
          600: '#C08A2E',
          700: '#A5731F',
        },
        sage: {
          600: '#3F7A5C',
          700: '#2F5F45',
        },
        rust: {
          600: '#B5543C',
          700: '#96412D',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

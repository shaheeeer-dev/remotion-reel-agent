/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        learnops: {
          primary: '#6F41EC',
          primaryHover: '#825CF0',
          secondary: '#C4B5FD',
          orange: '#6F41EC',
          orangeHover: '#825CF0',
          dark: '#0B0F17',
          card: '#151D2A',
          cardBorder: '#233044',
          cyan: '#00E5FF',
        },
      },
    },
  },
  plugins: [],
};


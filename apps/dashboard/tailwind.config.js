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
        brand: {
          peach: '#F29F67',
          peachLight: '#FDEEE3',
          peachHover: '#E28E54',
          navy: '#1E1E2C',
          navyCard: '#272738',
          navyBorder: '#36364D',
          blue: '#3B8FF3',
          teal: '#34B1AA',
          yellow: '#E0B50F',
          canvas: '#F4F5F7',
          surface: '#FFFFFF',
          border: '#E2E8F0',
          muted: '#64748B',
          subtle: '#94A3B8',
        },
      },
    },
  },
  plugins: [],
};


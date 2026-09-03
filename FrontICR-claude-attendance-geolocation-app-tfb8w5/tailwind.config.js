/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'icr-navy': '#00004c',
        'icr-blue': '#000073',
        'icr-cyan': '#00b7c2',
        'icr-mint': '#00ffc2',
      },
      fontFamily: {
        black: ['Gotham-Black', 'system-ui', 'sans-serif'],
        bold: ['Gotham-Bold', 'system-ui', 'sans-serif'],
        medium: ['Gotham-Medium', 'system-ui', 'sans-serif'],
        book: ['Gotham-Book', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'icr-gradient': 'linear-gradient(135deg, #00004c 0%, #000073 55%, #00b7c2 100%)',
        'icr-gradient-soft': 'linear-gradient(135deg, #000073 0%, #00b7c2 100%)',
      },
      boxShadow: {
        card: '0 10px 30px -12px rgba(0, 0, 76, 0.35)',
      },
    },
  },
  plugins: [],
}

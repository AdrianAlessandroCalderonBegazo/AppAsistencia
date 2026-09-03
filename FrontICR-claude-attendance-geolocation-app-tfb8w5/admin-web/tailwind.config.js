/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
      colors: {
        // semantic scales — each has a soft "bg" for pills and a darker
        // "text" tone for the label of the same hue, plus a solid tone
        // for buttons/icons/borders.
        success: {
          bg: '#e6f6ec',
          text: '#166534',
          solid: '#16a34a',
          border: '#bbe8c9',
          darkBg: '#123321',
          darkText: '#86efac',
        },
        warning: {
          bg: '#fef7e0',
          text: '#92650a',
          solid: '#eab308',
          border: '#fbe6a6',
          darkBg: '#3a2f0d',
          darkText: '#fde68a',
        },
        danger: {
          bg: '#fdecec',
          text: '#991b1b',
          solid: '#dc2626',
          border: '#f7c6c6',
          darkBg: '#3a1414',
          darkText: '#fca5a5',
        },
        accent: {
          bg: '#e8f0fe',
          text: '#1d4ed8',
          solid: '#2563eb',
          border: '#c3d9fb',
          darkBg: '#122542',
          darkText: '#93c5fd',
        },
        neutral: {
          bg: '#f4f4f5',
          text: '#52525b',
          solid: '#71717a',
          border: '#e4e4e7',
          darkBg: '#27272a',
          darkText: '#d4d4d8',
        },
      },
    },
  },
  plugins: [],
}

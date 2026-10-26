/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f1f4f9', 100: '#dfe5f0', 200: '#bcc8de', 300: '#92a4c6', 400: '#6179a8',
          500: '#41588a', 600: '#2f4372', 700: '#243560', 800: '#182549', 900: '#0f1a36',
        },
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'system-ui', '-apple-system', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

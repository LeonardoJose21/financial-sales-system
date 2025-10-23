/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // files Tailwind should scan
    "./public/index.html"          // include public HTML too
  ],
  theme: {
    extend: {
      colors: {
        primary: '#222831', // dark gray
        secondary: '#393E46', // medium gray
        accent: '#00ADB5', // light green
        light:"#EEEEEE"
      }
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        darkPurple: "#240b36",
        redOrange: "#c31432",
        grayishGreen: "#334d50",
        beige: "#cbcaa5",
        darkPurple: "#1F1C2C",
        lightGrayPurple: "#928DAB",
        darkMagenta: "#61045F",
        brightMagenta: "#AA076B",
        darkTeal: "#0F2027",
        teal: "#2C5364",
        blueGray: "#203A43",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-10deg)" },
          "50%": { transform: "rotate(10deg)" },
        },
        updown: {
          "0%, 100%": { top: "180px" },
          "50%": { top: "200px" },
        },
      },
      animation: {
        updown: "updown 3s ease-in-out infinite",
        wiggle: "wiggle 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

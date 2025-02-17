/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts,css}"],
  theme: {
    extend: {
      colors: {
        lightGreen: "#12C16F",
        deepGreen: "#0A8754",
        textGrey:"#9B9B9B",
        textBlack: "#0F0F0F",
        textLight:"#333333",
        shadeLight:"#7A7A7A",
        borderColor:{
          default: "#BCBCBC",
        }
      },
      backgroundImage: {
        "button-gradient": "linear-gradient(to right, #12C16F, #0A8754)",
      },
    },
  },
  plugins: [],
};


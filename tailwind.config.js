/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta "Guadua": tonos de tallo de bambú, musgo y tierra húmeda de bosque andino.
        // Deliberadamente evita el cream+terracota y el negro+acento-neón por defecto.
        guadua: {
          50: "#f4f7f0",
          100: "#e4ecda",
          200: "#c9d9b6",
          300: "#a6bf87",
          400: "#84a561",
          500: "#658843",
          600: "#4e6b33",
          700: "#3d5329",
          800: "#324323",
          900: "#2a381f",
          950: "#151d0f",
        },
        musgo: {
          50: "#f2f5f0",
          800: "#28331f",
          900: "#1b2314",
        },
        rio: "#3f6b6d",
        bruma: "#f6f5ef",
        tinta: "#20281a",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        organico: "1.75rem 0.5rem 1.75rem 0.5rem",
      },
    },
  },
  plugins: [],
};

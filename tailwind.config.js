/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'court': '#1E293B',
        'court-light': '#334155',
        'neon-orange': '#FF5D00',
        'neon-blue': '#00C2FF',
        'neon-pink': '#FF00AA',
        'neon-green': '#00FF85',
        'asphalt': '#121212',
        'asphalt-light': '#232323',
      },
      fontFamily: {
        'graffiti': ['Impact', 'Arial Black', 'sans-serif'],
        'street': ['"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      backgroundImage: {
        'court-texture': 'linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.7)), url("https://images.pexels.com/photos/5739366/pexels-photo-5739366.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260")',
        'fence-pattern': 'linear-gradient(45deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.85)), url("https://images.pexels.com/photos/4006576/pexels-photo-4006576.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260")',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-fast': 'pulse 2s infinite',
      },
      boxShadow: {
        'neon': '0 0 5px theme("colors.neon-orange"), 0 0 20px rgba(255, 93, 0, 0.3)',
        'neon-blue': '0 0 5px theme("colors.neon-blue"), 0 0 20px rgba(0, 194, 255, 0.3)',
        'neon-pink': '0 0 5px theme("colors.neon-pink"), 0 0 20px rgba(255, 0, 170, 0.3)',
      },
    },
  },
  plugins: [],
};
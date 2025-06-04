/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'court': '#1E293B',
        'court-light': '#334155',
        'neon-orange': '#26C4F8',
        'neon-blue': '#26C4F8',
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
        'court-texture': 'linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), url("/c3cc4fe4d712e94b0990d0d81f63e2b1 copy.jpg")',
        'fence-pattern': 'linear-gradient(45deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.85)), url("https://images.pexels.com/photos/4006576/pexels-photo-4006576.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260")',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-fast': 'pulse 2s infinite',
      },
      boxShadow: {
        'neon': '0 0 5px theme("colors.neon-blue"), 0 0 20px rgba(38, 196, 248, 0.3)',
        'neon-blue': '0 0 5px theme("colors.neon-blue"), 0 0 20px rgba(38, 196, 248, 0.3)',
        'neon-pink': '0 0 5px theme("colors.neon-pink"), 0 0 20px rgba(255, 0, 170, 0.3)',
      },
    },
  },
  plugins: [],
};
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mafalia: {
          bg: '#0D1117',
          sidebar: '#161B22',
          card: '#1C2333',
          input: '#21262D',
          border: '#30363D',
          accent: '#FF6B35',
          'accent-hover': '#FF8C5A',
          text: '#E6EDF3',
          'text-dim': '#8B949E',
          user: '#1F3A5F',
          ai: '#1A2332',
          success: '#3FB950',
          warning: '#D29922',
          error: '#F85149',
        },
        agent: {
          zara: '#FF6B35',
          kofi: '#2E86AB',
          amara: '#A23B72',
          idris: '#1B998B',
          nala: '#F77F00',
          tariq: '#6C5B7B',
          sana: '#2D6A4F',
          ravi: '#E63946',
          luna: '#9B5DE5',
          omar: '#06D6A0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}

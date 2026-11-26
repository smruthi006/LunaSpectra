/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        lunar: {
          bg: '#080c16',
          surface: '#0f1626',
          panel: '#151e31',
          panelHover: '#1c2740',
          border: '#25314d',
          text: '#f1f5f9',
          muted: '#94a3b8',
          subtle: '#64748b',
          accent: '#6366f1',
          accentHover: '#818cf8',
          cyan: '#22d3ee',
          amber: '#f59e0b',
          red: '#ef4444',
          emerald: '#10b981',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
};

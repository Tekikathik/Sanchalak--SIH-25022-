/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        panel: 'var(--panel-bg)',
        panel2: 'var(--panel2-bg)',
        edge: 'var(--edge-color)',
        ink: 'var(--ink-color)',
        muted: 'var(--muted-color)',
        signal: {
          green: 'var(--signal-green)',
          amber: 'var(--signal-amber)',
          red: 'var(--signal-red)',
          blue: 'var(--signal-blue)',
        },
      },
      fontFamily: {
        sans: ['"Fira Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Fira Code"', 'ui-monospace', 'Menlo', 'Consolas', 'monospace'],
      },
      keyframes: {
        pulse2: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.35' } },
        sweep: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        pulse2: 'pulse2 1.1s ease-in-out infinite',
        sweep: 'sweep 2.2s linear infinite',
      },
    },
  },
  plugins: [],
}

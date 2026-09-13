import type { Config } from 'tailwindcss'

// ETICO brand palette
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: '#3A4429',
          deep: '#2C3420',
          ink: '#1E2116',
        },
        gold: {
          DEFAULT: '#DAA92F',
          deep: '#C0921F',
          soft: '#F8EFD6',
        },
        cream: {
          DEFAULT: '#FDFCFA',
          muted: '#F4F1EA',
          sand: '#ECE8DD',
        },
        ink: '#2C3420',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 40px -12px rgba(44,52,32,0.18)',
        soft: '0 2px 10px -4px rgba(44,52,32,0.14)',
        panel: '0 40px 80px -32px rgba(30,33,22,0.55)',
      },
      letterSpacing: {
        tightest: '-0.045em',
      },
    },
  },
  plugins: [],
}
export default config

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#061326',
        'brand-darker': '#040C18',
        'sidebar': '#07152B',
        'card': '#0D2243',
        'card-hover': '#122A4A',
        'border': '#1D3B67',
        'primary': '#3564FF',
        'primary-hover': '#4A73FF',
        'cyan': '#22D3EE',
        'text-primary': '#F4F7FF',
        'text-secondary': '#9BB1D1',
        'text-muted': '#6B8BC1',
        'success': '#10B981',
        'warning': '#F59E0B',
        'danger': '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 32px rgba(53, 100, 255, 0.15)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #3564FF 0%, #7C3AED 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(53, 100, 255, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)',
      }
    },
  },
  plugins: [],
}

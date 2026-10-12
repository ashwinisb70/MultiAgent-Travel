export const THEME = {
  colors: {
    bg: {
      primary: '#061326',
      secondary: '#07152B',
      tertiary: '#0D2243',
    },
    border: '#1D3B67',
    primary: '#3564FF',
    cyan: '#22D3EE',
    text: {
      primary: '#F4F7FF',
      secondary: '#9BB1D1',
      muted: '#6B8BC1',
    },
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      info: '#3564FF',
    },
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
  borderRadius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
  },
  shadows: {
    card: '0 4px 20px rgba(0, 0, 0, 0.3)',
    cardHover: '0 8px 32px rgba(53, 100, 255, 0.15)',
    sm: '0 2px 8px rgba(0, 0, 0, 0.2)',
  },
  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },
} as const

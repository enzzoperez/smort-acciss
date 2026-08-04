export const theme = {
  colors: {
    // Brand
    primary: '#2ACA79',
    primaryLight: '#86E1B3',
    primaryLighter: '#C7F1DC',
    grayText: '#4B5563',
    blue: '#2563EB',

    // Neutrals
    black: '#000000',
    white: '#FFFFFF',
    gray100: '#F5F5F5',
    gray200: '#DCE1E8',
    gray400: '#7A7A7A',
    gray600: '#333333',

    // Semantic
    success: {
      background: '#DCEFE3',
      border: '#2E7D32',
      text: '#1B5E20',
    },
    error: {
      background: '#F4E1DF',
      border: '#A13328',
      text: '#8B1E16',
      primary: '#FF6858',
    },

    // UI
    link: '#0a7ea4',
    activityIndicator: '#0000ff',
    surfaceMuted: '#00000008',
    disabled: 'gray',
  },

  typography: {
    fonts: {
      regular: 'UenoLogicalBook',
      bold: 'UenoLogicalBold',
    },
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 28,
      xxxl: 32,
    },
    lineHeights: {
      sm: 18,
      md: 24,
      lg: 30,
    },
  },
} as const;

export type Theme = typeof theme;

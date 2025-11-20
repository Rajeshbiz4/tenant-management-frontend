import { createTheme } from '@mui/material/styles';

const palette = {
  navy: '#1f3a63',
  blue: '#2b6cb0',
  accent: '#f7a727',
  background: '#eef2f7',
  surface: '#ffffff',
  border: '#e1e6ef',
  textPrimary: '#1f2a37',
  textMuted: '#6b7280',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: palette.blue,
      light: '#4c82c5',
      dark: '#1f4f85',
    },
    secondary: {
      main: palette.accent,
      light: '#fac870',
      dark: '#d68510',
    },
    background: {
      default: palette.background,
      paper: palette.surface,
    },
    text: {
      primary: palette.textPrimary,
      secondary: palette.textMuted,
    },
    success: {
      main: '#2f9e44',
      contrastText: '#fff',
    },
    warning: {
      main: '#f08c00',
      contrastText: '#fff',
    },
    info: {
      main: '#3bb2f6',
    },
    divider: palette.border,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.4px',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.2px',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle2: {
      color: palette.textMuted,
      fontWeight: 500,
    },
    body2: {
      color: palette.textMuted,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: palette.background,
          color: palette.textPrimary,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${palette.border}`,
          boxShadow: '0 6px 18px rgba(15, 23, 42, 0.05)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${palette.border}`,
          boxShadow: '0 8px 22px rgba(31, 58, 99, 0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 32,
          fontWeight: 600,
          letterSpacing: 0,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginInline: 12,
          '&.Mui-selected': {
            backgroundColor: 'rgba(37, 85, 166, 0.12)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
  },
});

export default theme;

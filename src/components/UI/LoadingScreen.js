import React from 'react';
import {
  Box,
  CircularProgress,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Home as PropertyIcon } from '@mui/icons-material';

function LoadingScreen({ message = 'Loading...', fullScreen = false }) {
  const theme = useTheme();

  const content = (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={3}
      sx={{
        minHeight: fullScreen ? '100vh' : '400px',
        background: fullScreen 
          ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
          : 'transparent',
        color: fullScreen ? 'white' : 'inherit',
      }}
    >
      {/* App Icon */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress
          size={80}
          thickness={3}
          sx={{
            color: fullScreen ? 'rgba(255,255,255,0.8)' : 'primary.main',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
          }}
        >
          <PropertyIcon
            sx={{
              fontSize: 32,
              color: fullScreen ? 'white' : 'primary.main',
            }}
          />
        </Box>
      </Box>

      {/* Loading Text */}
      <Stack alignItems="center" spacing={1}>
        <Typography
          variant="h6"
          fontWeight="medium"
          sx={{
            color: fullScreen ? 'white' : 'text.primary',
          }}
        >
          {message}
        </Typography>
        {fullScreen && (
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              textAlign: 'center',
            }}
          >
            Tenant Management System
          </Typography>
        )}
      </Stack>

      {/* Loading dots animation */}
      <Box
        sx={{
          display: 'flex',
          gap: 0.5,
          '& > div': {
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: fullScreen ? 'rgba(255,255,255,0.6)' : 'primary.main',
            animation: 'loadingDots 1.4s ease-in-out infinite both',
          },
          '& > div:nth-of-type(1)': { animationDelay: '-0.32s' },
          '& > div:nth-of-type(2)': { animationDelay: '-0.16s' },
          '@keyframes loadingDots': {
            '0%, 80%, 100%': {
              transform: 'scale(0)',
            },
            '40%': {
              transform: 'scale(1)',
            },
          },
        }}
      >
        <div />
        <div />
        <div />
      </Box>
    </Stack>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
}

export default LoadingScreen;
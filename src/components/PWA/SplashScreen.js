import React, { useEffect, useState } from 'react';
import {
  Box,
  Fade,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Home as PropertyIcon } from '@mui/icons-material';

function SplashScreen({ onComplete }) {
  const [show, setShow] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 300); // Wait for fade out
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <Fade in={show} timeout={300}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <Stack alignItems="center" spacing={4}>
          {/* App Icon with Animation */}
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%': {
                  transform: 'scale(1)',
                  boxShadow: '0 0 0 0 rgba(255,255,255,0.4)',
                },
                '70%': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 0 0 20px rgba(255,255,255,0)',
                },
                '100%': {
                  transform: 'scale(1)',
                  boxShadow: '0 0 0 0 rgba(255,255,255,0)',
                },
              },
            }}
          >
            <PropertyIcon sx={{ fontSize: 48, color: 'white' }} />
          </Box>

          {/* App Title */}
          <Stack alignItems="center" spacing={1}>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                background: 'linear-gradient(45deg, #ffffff 30%, rgba(255,255,255,0.8) 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center',
              }}
            >
              Tenant Management
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                textAlign: 'center',
                fontWeight: 500,
              }}
            >
              Property • Tenants • Payments
            </Typography>
          </Stack>

          {/* Loading Animation */}
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              mt: 2,
              '& > div': {
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.8)',
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
      </Box>
    </Fade>
  );
}

export default SplashScreen;
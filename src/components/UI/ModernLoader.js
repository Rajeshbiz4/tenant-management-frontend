import React, { forwardRef } from 'react';
import { Box, CircularProgress, Typography, keyframes } from '@mui/material';

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ModernLoader = forwardRef(({ 
  size = 40, 
  message = 'Loading...', 
  variant = 'circular',
  fullScreen = false 
}, ref) => {
  const LoaderContent = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        animation: `${fadeIn} 0.5s ease-out`,
      }}
    >
      {variant === 'circular' && (
        <CircularProgress
          size={size}
          thickness={4}
          sx={{
            color: 'primary.main',
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
        />
      )}
      
      {variant === 'dots' && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {[0, 1, 2].map((index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                animation: `${pulse} 1.4s ease-in-out infinite`,
                animationDelay: `${index * 0.16}s`,
              }}
            />
          ))}
        </Box>
      )}
      
      {variant === 'skeleton' && (
        <Box sx={{ width: '100%', maxWidth: 300 }}>
          {[...Array(3)].map((_, index) => (
            <Box
              key={index}
              sx={{
                height: 20,
                backgroundColor: 'grey.200',
                borderRadius: 1,
                mb: 1,
                animation: `${pulse} 1.5s ease-in-out infinite`,
                animationDelay: `${index * 0.2}s`,
                width: `${100 - index * 20}%`,
              }}
            />
          ))}
        </Box>
      )}
      
      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontWeight: 500,
            textAlign: 'center',
            animation: `${fadeIn} 0.5s ease-out 0.3s both`,
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        ref={ref}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(248, 250, 252, 0.8)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
        }}
      >
        <LoaderContent />
      </Box>
    );
  }

  return (
    <Box
      ref={ref}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
      }}
    >
      <LoaderContent />
    </Box>
  );
});

ModernLoader.displayName = 'ModernLoader';

export default ModernLoader;
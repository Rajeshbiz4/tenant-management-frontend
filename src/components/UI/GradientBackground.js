import React, { forwardRef } from 'react';
import { Box } from '@mui/material';

const GradientBackground = forwardRef(({ 
  children, 
  variant = 'primary',
  opacity = 0.05,
  ...props 
}, ref) => {
  const gradients = {
    primary: `linear-gradient(135deg, 
      rgba(59, 130, 246, ${opacity}) 0%, 
      rgba(37, 99, 235, ${opacity}) 50%, 
      rgba(29, 78, 216, ${opacity}) 100%)`,
    secondary: `linear-gradient(135deg, 
      rgba(16, 185, 129, ${opacity}) 0%, 
      rgba(5, 150, 105, ${opacity}) 50%, 
      rgba(4, 120, 87, ${opacity}) 100%)`,
    success: `linear-gradient(135deg, 
      rgba(34, 197, 94, ${opacity}) 0%, 
      rgba(22, 163, 74, ${opacity}) 50%, 
      rgba(21, 128, 61, ${opacity}) 100%)`,
    warning: `linear-gradient(135deg, 
      rgba(245, 158, 11, ${opacity}) 0%, 
      rgba(217, 119, 6, ${opacity}) 50%, 
      rgba(180, 83, 9, ${opacity}) 100%)`,
    error: `linear-gradient(135deg, 
      rgba(239, 68, 68, ${opacity}) 0%, 
      rgba(220, 38, 38, ${opacity}) 50%, 
      rgba(185, 28, 28, ${opacity}) 100%)`,
    neutral: `linear-gradient(135deg, 
      rgba(148, 163, 184, ${opacity}) 0%, 
      rgba(100, 116, 139, ${opacity}) 50%, 
      rgba(71, 85, 105, ${opacity}) 100%)`,
  };

  return (
    <Box
      ref={ref}
      sx={{
        background: gradients[variant] || gradients.primary,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 80%, 
            rgba(120, 119, 198, ${opacity * 0.3}) 0%, 
            transparent 50%), 
            radial-gradient(circle at 80% 20%, 
            rgba(255, 119, 198, ${opacity * 0.3}) 0%, 
            transparent 50%)`,
          pointerEvents: 'none',
        },
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
});

GradientBackground.displayName = 'GradientBackground';

export default GradientBackground;
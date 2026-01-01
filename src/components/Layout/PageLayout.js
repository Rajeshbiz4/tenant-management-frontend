import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';

function PageLayout({
  title,
  subtitle,
  primaryAction,
  secondaryActions = [],
  filters,
  children,
  ...props
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }} {...props}>
      {/* Page Header */}
      <Box 
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 3,
          mb: 4,
          paddingLeft: 2,
        }}
      >
        {/* Title Section */}
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              mb: 1,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.875rem', md: '1rem' },
                lineHeight: 1.6,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Actions Section */}
        {(primaryAction || secondaryActions.length > 0) && (
          <Stack 
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{
              width: { xs: '100%', md: 'auto' },
              alignItems: { xs: 'stretch', sm: 'center' },
            }}
          >
            {/* Secondary Actions */}
            {secondaryActions.map((action, index) => (
              <Button
                key={index}
                variant="outlined"
                size={isMobile ? "medium" : "large"}
                sx={{
                  minWidth: { xs: 'auto', sm: 120 },
                  whiteSpace: 'nowrap',
                }}
                {...action.props}
              >
                {action.label}
              </Button>
            ))}
            
            {/* Primary Action */}
            {primaryAction && (
              <Button
                variant="contained"
                size={isMobile ? "medium" : "large"}
                sx={{
                  minWidth: { xs: 'auto', sm: 140 },
                  whiteSpace: 'nowrap',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                  },
                }}
                {...primaryAction.props}
              >
                {primaryAction.label}
              </Button>
            )}
          </Stack>
        )}
      </Box>

      {/* Filters Section */}
      {filters && (
        <Box sx={{ mb: 4 }}>
          {filters}
        </Box>
      )}

      {/* Main Content */}
      <Box>
        {children}
      </Box>
    </Box>
  );
}

export default PageLayout;
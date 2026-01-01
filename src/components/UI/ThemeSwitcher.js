import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Palette as PaletteIcon,
  Close as CloseIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

const themePresets = {
  professional: {
    name: 'Professional',
    description: 'Clean and trustworthy',
    primary: '#2563eb',
    secondary: '#f7a727',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #f7a727 100%)',
  },
  cool: {
    name: 'Cool',
    description: 'Modern and fresh',
    primary: '#0891b2',
    secondary: '#06b6d4',
    gradient: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
  },
  vibrant: {
    name: 'Vibrant',
    description: 'Creative and energetic',
    primary: '#7c3aed',
    secondary: '#10b981',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #10b981 100%)',
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Corporate and sophisticated',
    primary: '#475569',
    secondary: '#ec4899',
    gradient: 'linear-gradient(135deg, #475569 0%, #ec4899 100%)',
  },
  modern: {
    name: 'Modern',
    description: 'Contemporary and stylish',
    primary: '#6366f1',
    secondary: '#f43f5e',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #f43f5e 100%)',
  },
};

function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const currentTheme = 'professional'; // This would come from context in a real app

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleThemeChange = (themeKey) => {
    // In a real app, this would update the theme context
    console.log('Theme changed to:', themeKey);
    alert(`To change theme, update ACTIVE_THEME in src/theme/theme.js to '${themeKey}' and restart the app.`);
    handleClose();
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main',
            bgcolor: 'primary.light',
          },
        }}
      >
        <PaletteIcon />
      </IconButton>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '80vh',
          },
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <PaletteIcon color="primary" />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Choose Theme
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Select a color scheme for your app
                </Typography>
              </Box>
            </Stack>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            {Object.entries(themePresets).map(([key, preset]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: currentTheme === key ? 2 : 1,
                    borderColor: currentTheme === key ? 'primary.main' : 'divider',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => handleThemeChange(key)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      {/* Color Preview */}
                      <Box
                        sx={{
                          height: 80,
                          borderRadius: 2,
                          background: preset.gradient,
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {currentTheme === key && (
                          <CheckIcon
                            sx={{
                              color: 'white',
                              fontSize: 32,
                              bgcolor: 'rgba(0,0,0,0.2)',
                              borderRadius: '50%',
                              p: 0.5,
                            }}
                          />
                        )}
                      </Box>

                      {/* Theme Info */}
                      <Stack spacing={1}>
                        <Typography variant="h6" fontWeight="bold">
                          {preset.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {preset.description}
                        </Typography>
                      </Stack>

                      {/* Color Swatches */}
                      <Stack direction="row" spacing={1}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: 1,
                            bgcolor: preset.primary,
                            border: '2px solid white',
                            boxShadow: 1,
                          }}
                        />
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: 1,
                            bgcolor: preset.secondary,
                            border: '2px solid white',
                            boxShadow: 1,
                          }}
                        />
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              <strong>Note:</strong> To change themes, update the <code>ACTIVE_THEME</code> constant 
              in <code>src/theme/theme.js</code> and restart the development server.
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ThemeSwitcher;
import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Slide,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  GetApp as InstallIcon,
  Close as CloseIcon,
  PhoneAndroid as AndroidIcon,
  PhoneIphone as IosIcon,
  Computer as DesktopIcon,
} from '@mui/icons-material';

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState('unknown');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    if (/android/.test(userAgent)) {
      setPlatform('android');
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else {
      setPlatform('desktop');
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after 3 seconds if not dismissed before
      const timer = setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed) {
          setShowPrompt(true);
        }
      }, 3000);

      return () => clearTimeout(timer);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.removeItem('pwa-install-dismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const getInstallInstructions = () => {
    switch (platform) {
      case 'android':
        return {
          icon: <AndroidIcon />,
          title: 'Install Tenant Management App',
          steps: [
            'Tap the menu (⋮) in your browser',
            'Select "Install app" or "Add to Home screen"',
            'Tap "Install" to confirm'
          ]
        };
      case 'ios':
        return {
          icon: <IosIcon />,
          title: 'Add to Home Screen',
          steps: [
            'Tap the Share button (↗️) in Safari',
            'Scroll down and tap "Add to Home Screen"',
            'Tap "Add" to confirm'
          ]
        };
      default:
        return {
          icon: <DesktopIcon />,
          title: 'Install Desktop App',
          steps: [
            'Click the install icon in your address bar',
            'Or use browser menu → "Install app"',
            'Click "Install" to confirm'
          ]
        };
    }
  };

  if (isInstalled || !showPrompt) return null;

  const instructions = getInstallInstructions();

  return (
    <Slide direction="up" in={showPrompt} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          bottom: isMobile ? 16 : 24,
          left: isMobile ? 16 : 24,
          right: isMobile ? 16 : 'auto',
          maxWidth: isMobile ? 'auto' : 400,
          zIndex: 1300,
        }}
      >
        <Card
          elevation={8}
          sx={{
            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
            color: 'white',
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ pb: 2 }}>
            <Stack direction="row" alignItems="flex-start" spacing={2}>
              <Box sx={{ color: 'white', mt: 0.5 }}>
                {instructions.icon}
              </Box>
              <Box flex={1}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {instructions.title}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={handleDismiss}
                    sx={{ color: 'white', ml: 1 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>
                
                <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                  Get faster access and work offline!
                </Typography>

                {deferredPrompt ? (
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<InstallIcon />}
                    onClick={handleInstall}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.3)',
                      },
                    }}
                  >
                    Install Now
                  </Button>
                ) : (
                  <Alert
                    severity="info"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      '& .MuiAlert-icon': { color: 'white' },
                    }}
                  >
                    <AlertTitle sx={{ color: 'white', fontSize: '0.875rem' }}>
                      Manual Installation:
                    </AlertTitle>
                    <Box component="ol" sx={{ pl: 2, m: 0 }}>
                      {instructions.steps.map((step, index) => (
                        <Typography
                          key={index}
                          component="li"
                          variant="body2"
                          sx={{ mb: 0.5 }}
                        >
                          {step}
                        </Typography>
                      ))}
                    </Box>
                  </Alert>
                )}
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Slide>
  );
}

export default InstallPrompt;
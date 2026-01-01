import React, { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Collapse,
  IconButton,
  Snackbar,
  Typography,
} from '@mui/material';
import {
  CloudOff as OfflineIcon,
  Cloud as OnlineIcon,
  Close as CloseIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
} from '@mui/icons-material';

function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('offline');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNotificationType('online');
      setShowNotification(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setNotificationType('offline');
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleClose = () => {
    setShowNotification(false);
  };

  return (
    <>
      {/* Persistent offline banner */}
      <Collapse in={!isOnline}>
        <Alert
          severity="warning"
          icon={<WifiOffIcon />}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1400,
            borderRadius: 0,
            bgcolor: 'warning.main',
            color: 'white',
            '& .MuiAlert-icon': { color: 'white' },
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
            <Typography variant="body2" fontWeight="medium">
              You're offline. Some features may be limited.
            </Typography>
            <Typography variant="caption">
              Data will sync when reconnected
            </Typography>
          </Box>
        </Alert>
      </Collapse>

      {/* Connection status notifications */}
      <Snackbar
        open={showNotification}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: !isOnline ? 7 : 1 }}
      >
        <Alert
          onClose={handleClose}
          severity={notificationType === 'online' ? 'success' : 'warning'}
          icon={notificationType === 'online' ? <WifiIcon /> : <WifiOffIcon />}
          sx={{
            width: '100%',
            bgcolor: notificationType === 'online' ? 'success.main' : 'warning.main',
            color: 'white',
            '& .MuiAlert-icon': { color: 'white' },
          }}
        >
          <Typography variant="body2" fontWeight="medium">
            {notificationType === 'online' 
              ? "You're back online! All features available."
              : "Connection lost. Working in offline mode."
            }
          </Typography>
        </Alert>
      </Snackbar>
    </>
  );
}

export default OfflineIndicator;
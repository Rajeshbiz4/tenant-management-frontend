import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  InputAdornment,
  Grid,
  Snackbar,
} from '@mui/material';
import { forgotPassword, clearError } from '../../store/slices/authSlice';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import OfflineIcon from '@mui/icons-material/CloudOff';
import OnlineIcon from '@mui/icons-material/CloudDone';

const STORAGE_KEY = 'forgotPassword_form';

function ForgotPassword() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { loading, error } = useSelector((state) => state.auth);
  const [success, setSuccess] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineAlert, setOfflineAlert] = useState(false);

  useEffect(() => {
    // Handle online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      setOfflineAlert(false);
      console.log('App is online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setOfflineAlert(true);
      console.log('App is offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      dispatch(clearError());
      setSuccess(false);
    };
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      email: localStorage.getItem(STORAGE_KEY) || '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Email is required'),
    }),
    onSubmit: async (values) => {
      if (!isOnline) {
        // Save form data for later sync
        localStorage.setItem(STORAGE_KEY, values.email);
        setOfflineAlert(true);
        return;
      }

      const result = await dispatch(forgotPassword(values.email));
      if (forgotPassword.fulfilled.match(result)) {
        setSuccess(true);
        localStorage.removeItem(STORAGE_KEY);
        formik.resetForm();
      }
    },
  });

  // Auto-save form to local storage
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formik.values.email) {
        localStorage.setItem(STORAGE_KEY, formik.values.email);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formik.values.email]);

  return (
    <Grid
      container
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        background: isMobile ? 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)' : '#f8fafc',
      }}
    >
      {/* Offline/Online Status Indicator */}
      <Snackbar
        open={offlineAlert}
        autoHideDuration={6000}
        onClose={() => setOfflineAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={isOnline ? 'success' : 'warning'}
          icon={isOnline ? <OnlineIcon /> : <OfflineIcon />}
          sx={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          {isOnline
            ? '✓ You are back online. Form data is ready to submit.'
            : '⚠ You are offline. Form data will be saved locally.'}
        </Alert>
      </Snackbar>

      {/* LEFT SECTION - FORM */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 3, md: 4, lg: 8 },
          background: { xs: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)', md: '#f8fafc' },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4, md: 5, lg: 6 },
            width: '100%',
            maxWidth: 440,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
            background: isMobile ? 'rgba(255, 255, 255, 0.95)' : '#ffffff',
            animation: 'slideIn 0.5s ease-out',
            '@keyframes slideIn': {
              from: {
                opacity: 0,
                transform: 'translateX(20px)',
              },
              to: {
                opacity: 1,
                transform: 'translateX(0)',
              },
            },
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <LockOpenIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
              }}
            >
              Reset Password
            </Typography>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            mb={3}
            sx={{
              fontSize: '0.95rem',
            }}
          >
            Enter your email address and we'll send you a link to reset your password.
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                animation: 'slideDown 0.3s ease-out',
              }}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert
              severity="success"
              sx={{
                mb: 3,
                animation: 'slideDown 0.3s ease-out',
              }}
            >
              ✓ Check your email for a password reset link. Please check your spam folder if you don't see it.
            </Alert>
          )}

          {!isOnline && (
            <Alert
              severity="info"
              sx={{
                mb: 3,
              }}
            >
              📱 You're offline. Your form data will be saved locally and you can submit when you're back online.
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email address"
              type="email"
              autoComplete="email"
              margin="normal"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.2s ease',
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || success}
              sx={{
                mt: 4,
                mb: 2,
                py: 1.5,
                fontWeight: 600,
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                boxShadow: `0 4px 12px ${theme.palette.primary.main}26`,
                '&:hover:not(:disabled)': {
                  boxShadow: `0 8px 20px ${theme.palette.primary.main}40`,
                  transform: 'translateY(-2px)',
                },
                '&:disabled': {
                  backgroundColor: theme.palette.action.disabledBackground,
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : success ? (
                'Link Sent ✓'
              ) : (
                'Send Reset Link'
              )}
            </Button>

            <Button
              fullWidth
              component={Link}
              to="/login"
              variant="outlined"
              size="large"
              startIcon={<ArrowBackIcon />}
              sx={{
                py: 1.5,
                fontWeight: 600,
                borderColor: theme.palette.divider,
                color: theme.palette.text.secondary,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  backgroundColor: `${theme.palette.primary.main}04`,
                },
              }}
            >
              Back to Login
            </Button>
          </form>
        </Paper>
      </Grid>

      {/* RIGHT SECTION - HERO */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 4, md: 6, lg: 8 },
          textAlign: { xs: 'center', md: 'left' },
          minHeight: { xs: '40vh', md: '100vh' },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
            top: '-100px',
            right: '-100px',
            pointerEvents: 'none',
          },
        }}
      >
        <Box maxWidth={500} position="relative" zIndex={1}>
          <Box
            sx={{
              width: { xs: 60, md: 72 },
              height: { xs: 60, md: 72 },
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 4,
              mx: { xs: 'auto', md: '0' },
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(255,255,255,0.2)',
                transform: 'translateY(-4px)',
              },
            }}
          >
            <LockOpenIcon sx={{ fontSize: { xs: 32, md: 38 } }} />
          </Box>

          <Typography
            variant="h3"
            fontWeight={700}
            gutterBottom
            sx={{
              fontSize: { xs: '1.75rem', md: '2.2rem' },
              lineHeight: 1.2,
            }}
          >
            Secure Your Account
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{
              opacity: 0.85,
              mb: 3,
              fontSize: { xs: '0.95rem', md: '1.1rem' },
            }}
          >
            We'll help you regain access to your account quickly and securely.
          </Typography>

          <Typography
            variant="body2"
            sx={{
              opacity: 0.9,
              fontSize: { xs: '0.9rem', md: '1rem' },
              lineHeight: 1.6,
            }}
          >
            Just enter your email address and we'll send you a password reset link within minutes.
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}

export default ForgotPassword;


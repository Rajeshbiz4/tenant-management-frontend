import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { login, clearError } from '../../store/slices/authSlice';
import HomeIcon from '@mui/icons-material/Home';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = React.useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: (values) => dispatch(login(values)),
  });

  return (
    <Grid
      container
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        background: isMobile ? 'linear-gradient(135deg, #2563eb 0%, #0891b2 100%)' : '#f8fafc',
      }}
    >
      {/* LEFT SECTION - HERO */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          background: {
            xs: 'linear-gradient(135deg, #2563eb 0%, #0891b2 100%)',
            md: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
          },
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, sm: 4, md: 6, lg: 8 },
          textAlign: { xs: "center", md: "left" },
          minHeight: { xs: "40vh", md: "100vh" },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
            borderRadius: '50%',
            top: '-100px',
            right: '-100px',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)',
            borderRadius: '50%',
            bottom: '-50px',
            left: '-50px',
            pointerEvents: 'none',
          },
        }}
      >
        <Box maxWidth={500} position="relative" zIndex={1}>
          <Box
            sx={{
              width: { xs: 60, md: 72 },
              height: { xs: 60, md: 72 },
              borderRadius: 3,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 4,
              mx: { xs: "auto", md: "0" },
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(255,255,255,0.2)',
                transform: 'translateY(-4px)',
              },
            }}
          >
            <HomeIcon sx={{ fontSize: { xs: 32, md: 38 } }} />
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
            Manage Your Tenants Effortlessly
          </Typography>
          
          <Typography 
            variant="subtitle1" 
            sx={{ 
              opacity: 0.85, 
              mb: 3,
              fontSize: { xs: '0.95rem', md: '1.1rem' },
            }}
          >
            Stay on top of rent collection, utilities, and upcoming dues for every shop.
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              opacity: 0.9,
              fontSize: { xs: '0.9rem', md: '1rem' },
              lineHeight: 1.6,
            }}
          >
            Monitor all shops and tenants at a glance with real-time status indicators and due date tracking.
          </Typography>
        </Box>
      </Grid>

      {/* RIGHT SECTION - LOGIN FORM */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 3, md: 4, lg: 8 },
          background: { xs: '#f8fafc', md: '#f8fafc' },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4, md: 5, lg: 6 },
            width: "100%",
            maxWidth: 440,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
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
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 1,
            }}
          >
            Welcome Back
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            mb={3}
            sx={{
              fontSize: '0.95rem',
            }}
          >
            Sign in with your email and password to access your dashboard.
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 1.5,
                animation: 'slideDown 0.3s ease-out',
                '@keyframes slideDown': {
                  from: {
                    opacity: 0,
                    transform: 'translateY(-10px)',
                  },
                  to: {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email address"
              type="email"
              margin="normal"
              autoComplete="email"
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
                  borderRadius: 1.5,
                  transition: 'all 0.2s ease',
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />

            <TextField
              fullWidth
              id="password"
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              margin="normal"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      edge="end"
                      size="small"
                      sx={{
                        color: theme.palette.text.secondary,
                        '&:hover': {
                          backgroundColor: 'transparent',
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  transition: 'all 0.2s ease',
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />

            <Box 
              display="flex" 
              justifyContent="space-between" 
              mt={2}
              gap={1}
              sx={{
                fontSize: { xs: '0.8rem', sm: '0.85rem' },
              }}
            >
              <Link 
                to="/forgot-password" 
                style={{ 
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                Forgot Password?
              </Link>
              <Link 
                to="/register" 
                style={{ 
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                Create account
              </Link>
            </Box>

            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              size="large"
              disabled={loading}
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
              ) : (
                "Sign In"
              )}
            </Button>

            <Button 
              fullWidth 
              variant="outlined"
              size="large"
              disabled
              sx={{ 
                py: 1.5,
                fontWeight: 600,
                borderRadius: 1.5,
                borderColor: theme.palette.divider,
                color: theme.palette.text.secondary,
              }}
            >
              Continue as Guest (Coming Soon)
            </Button>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Login;

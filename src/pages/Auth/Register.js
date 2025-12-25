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
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { register, clearError } from '../../store/slices/authSlice';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import HomeIcon from '@mui/icons-material/Home';
import BuildIcon from '@mui/icons-material/Build';

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      mobile: '',
      email: '',
      userType: 'owner',
      password: '',
      confirmPassword: '',
      propertyName: '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('First Name is required'),
      lastName: Yup.string().required('Last Name is required'),
      mobile: Yup.string()
        .matches(/^[0-9]{10}$/, 'Enter a valid 10 digit number')
        .required('Mobile number is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      userType: Yup.string().oneOf(['owner', 'tenant', 'admin']).required('User type is required'),
      password: Yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
      propertyName: Yup.string().required('Property Name is required'),
    }),
    onSubmit: (values) => {
      const { confirmPassword, ...rest } = values;
      const payload = {
        ...rest,
        name: `${values.firstName} ${values.lastName}`.trim(),
      };
      dispatch(register(payload));
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Grid
      container
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column-reverse', md: 'row' },
        background: isMobile ? 'linear-gradient(135deg, #f97316 0%, #facc15 100%)' : '#f8fafc',
      }}
    >
      {/* RIGHT SECTION - HERO */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          background: 'linear-gradient(135deg, #f97316 0%, #facc15 100%)',
          color: '#0f172a',
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
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
            borderRadius: '50%',
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
              borderRadius: 3,
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 4,
              mx: { xs: 'auto', md: '0' },
              border: '1px solid rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(255,255,255,0.3)',
                transform: 'translateY(-4px)',
              },
            }}
          >
            <HomeIcon sx={{ fontSize: { xs: 32, md: 38 }, color: '#0f172a' }} />
          </Box>

          <Typography
            variant="h3"
            fontWeight={700}
            gutterBottom
            sx={{
              fontSize: { xs: '1.75rem', md: '2.2rem' },
              lineHeight: 1.2,
              color: '#0f172a',
            }}
          >
            Bring Clarity to Rent Cycles
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{
              opacity: 0.85,
              mb: 3,
              fontSize: { xs: '0.95rem', md: '1.1rem' },
              color: '#0f172a',
            }}
          >
            Track upcoming due dates, payment history, and pending utilities for every shop—all in one place.
          </Typography>

          <Typography
            variant="body2"
            sx={{
              opacity: 0.8,
              fontSize: { xs: '0.9rem', md: '1rem' },
              lineHeight: 1.6,
              color: '#0f172a',
            }}
          >
            Manage properties, tenants, and payments with ease using our comprehensive tenant management system.
          </Typography>
        </Box>
      </Grid>

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
          background: { xs: 'linear-gradient(135deg, #f97316 0%, #facc15 100%)', md: '#f8fafc' },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4, md: 5, lg: 6 },
            width: '100%',
            maxWidth: 520,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
            background: isMobile ? 'rgba(255, 255, 255, 0.95)' : '#ffffff',
            animation: 'slideIn 0.5s ease-out',
            '@keyframes slideIn': {
              from: {
                opacity: 0,
                transform: 'translateX(-20px)',
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
            Create Account
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            mb={3}
            sx={{
              fontSize: '0.95rem',
            }}
          >
            Set up your workspace to track shops, tenants, and due cycles.
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 1.5,
                animation: 'slideDown 0.3s ease-out',
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            {/* First + Last Name */}
            <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
              <TextField
                fullWidth
                id="firstName"
                name="firstName"
                label="First Name"
                autoComplete="given-name"
                margin="normal"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: theme.palette.text.secondary, mr: 1 }} />
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
                id="lastName"
                name="lastName"
                label="Last Name"
                autoComplete="family-name"
                margin="normal"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: theme.palette.text.secondary, mr: 1 }} />
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
            </Box>

            {/* Mobile */}
            <TextField
              fullWidth
              id="mobile"
              name="mobile"
              label="Mobile Number"
              autoComplete="tel"
              margin="normal"
              value={formik.values.mobile}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.mobile && Boolean(formik.errors.mobile)}
              helperText={formik.touched.mobile && formik.errors.mobile}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon sx={{ color: theme.palette.text.secondary, mr: 1 }} />
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

            {/* Email */}
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email"
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
                  borderRadius: 1.5,
                  transition: 'all 0.2s ease',
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />

            {/* User Type */}
            <TextField
              select
              fullWidth
              id="userType"
              name="userType"
              label="I am a"
              margin="normal"
              value={formik.values.userType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.userType && Boolean(formik.errors.userType)}
              helperText={formik.touched.userType && formik.errors.userType}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  transition: 'all 0.2s ease',
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            >
              <MenuItem value="owner">Property Owner</MenuItem>
              <MenuItem value="tenant">Tenant</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>

            {/* Property Name */}
            <TextField
              fullWidth
              id="propertyName"
              name="propertyName"
              label="Property Name"
              margin="normal"
              value={formik.values.propertyName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.propertyName && Boolean(formik.errors.propertyName)}
              helperText={formik.touched.propertyName && formik.errors.propertyName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BuildIcon sx={{ color: theme.palette.text.secondary, mr: 1 }} />
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

            {/* Password + Confirm */}
            <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                margin="normal"
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
              <TextField
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                margin="normal"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowConfirmPassword}
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
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
            </Box>

            {/* Buttons */}
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
                'Create Account'
              )}
            </Button>

            <Button
              fullWidth
              component={Link}
              to="/login"
              variant="outlined"
              size="large"
              sx={{
                py: 1.5,
                fontWeight: 600,
                borderRadius: 1.5,
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
    </Grid>
  );
}

export default Register;

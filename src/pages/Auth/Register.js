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
} from '@mui/material';
import { register, clearError } from '../../store/slices/authSlice';

const validationSchema = Yup.object({
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
});

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

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
      propertyName: '',   // NEW FIELD
    },
    validationSchema,
    onSubmit: (values) => {
      const { confirmPassword, ...rest } = values;
      const payload = {
        ...rest,
        name: `${values.firstName} ${values.lastName}`.trim(),
      };
      dispatch(register(payload));
    },
  });

  return (
    <Grid
      container
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      {/* LEFT SECTION — FORM */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          width: "100%",
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 4, md: 8 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            width: '100%',
            maxWidth: 520,
          }}
        >
          <Typography variant="h4" gutterBottom>
            Create an account
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Set up your Gurudatta workspace to track shops, tenants, and due cycles.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
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
                margin="normal"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
              />
              <TextField
                fullWidth
                id="lastName"
                name="lastName"
                label="Last Name"
                margin="normal"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
              />
            </Box>

            {/* Mobile */}
            <TextField
              fullWidth
              id="mobile"
              name="mobile"
              label="Mobile Number"
              margin="normal"
              value={formik.values.mobile}
              onChange={formik.handleChange}
              error={formik.touched.mobile && Boolean(formik.errors.mobile)}
              helperText={formik.touched.mobile && formik.errors.mobile}
            />

            {/* Email */}
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email"
              type="email"
              margin="normal"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
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
              error={formik.touched.userType && Boolean(formik.errors.userType)}
              helperText={formik.touched.userType && formik.errors.userType}
            >
              <MenuItem value="owner">Property Owner</MenuItem>
              <MenuItem value="tenant">Tenant</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>

            <TextField
  fullWidth
  id="propertyName"
  name="propertyName"
  label="Property Name"
  margin="normal"
  value={formik.values.propertyName}
  onChange={formik.handleChange}
  error={formik.touched.propertyName && Boolean(formik.errors.propertyName)}
  helperText={formik.touched.propertyName && formik.errors.propertyName}
/>


            {/* Password + Confirm */}
            <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Password"
                type="password"
                margin="normal"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
              />
              <TextField
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                margin="normal"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              />
            </Box>

            {/* Buttons */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>

            <Button fullWidth component={Link} to="/login" sx={{ mt: 2 }}>
              Back to Login
            </Button>
          </form>
        </Paper>
      </Grid>

      {/* RIGHT SECTION — INFO SECTION */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          width: "100%",
          flex: 1,
          background: 'linear-gradient(145deg, #f97316, #facc15)',
          color: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 6, md: 10 },
          textAlign: { xs: "center", md: "left" },
        }}
      >
        <Box maxWidth={420}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Bring clarity to rent cycles
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.8 }}>
            Track upcoming due dates, payment history, and pending utilities for every shop—
            all in one place.
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}

export default Register;

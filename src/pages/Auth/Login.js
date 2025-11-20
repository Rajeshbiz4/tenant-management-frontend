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
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { login, clearError } from '../../store/slices/authSlice';
import HomeIcon from '@mui/icons-material/Home';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema,
    onSubmit: (values) => dispatch(login(values)),
  });

  return (
    <Grid
      container
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" }, // Responsive stacking
      }}
    >
      {/* LEFT SECTION */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          width: "100%",
          flex: 1,
          minHeight: { xs: "40vh", md: "100vh" },
          background: "linear-gradient(145deg, #1d4ed8, #2563eb)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 4, md: 8 },
          textAlign: { xs: "center", md: "left" },
        }}
      >
        <Box maxWidth={500}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: 16,
              bgcolor: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 4,
              mx: { xs: "auto", md: "0" },
            }}
          >
            <HomeIcon sx={{ fontSize: 38 }} />
          </Box>

          <Typography variant="h3" fontWeight={700} gutterBottom>
            Manage Your Tenants Effortlessly
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.8, mb: 3 }}>
            Stay on top of rent collection, utilities, and upcoming dues for every shop.
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Monitor all shops and tenants at a glance with real-time status indicators and due date tracking.
          </Typography>
        </Box>
      </Grid>

      {/* RIGHT SECTION */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          width: "100%",
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 4, md: 8 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            width: "100%",
            maxWidth: 440,
          }}
        >
          <Typography variant="h4" gutterBottom>
            Welcome back
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Log in with your credentials to access the dashboard.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
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
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />

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

            <Box display="flex" justifyContent="space-between" mt={1}>
              <Link to="/forgot-password" style={{ fontWeight: 600 }}>
                Forgot Password?
              </Link>
              <Link to="/register" style={{ fontWeight: 600 }}>
                Create account
              </Link>
            </Box>

            <Button type="submit" fullWidth variant="contained" sx={{ mt: 4 }} disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
            </Button>

            <Button fullWidth sx={{ mt: 2 }} disabled>
              Continue as Guest (Coming Soon)
            </Button>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Login;

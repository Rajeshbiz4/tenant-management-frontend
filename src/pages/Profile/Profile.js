import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Button,
  TextField,
  Avatar,
  Stack,
  Divider,
  Alert,
  IconButton,
  Chip,
  Paper,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import GradientBackground from '../../components/UI/GradientBackground';
import ModernLoader from '../../components/UI/ModernLoader';
import ChangePassword from './ChangePassword';
import { updateProfile } from '../../store/slices/authSlice';

function Profile() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const { properties } = useSelector((state) => state.property);
  const { tenants } = useSelector((state) => state.tenant);
  const { payments } = useSelector((state) => state.payment);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    propertyName: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        propertyName: user.propertyName || '',
      });
    }
  }, [user]);

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.propertyName.trim()) {
      errors.propertyName = 'Property name is required';
    } else if (formData.propertyName.trim().length < 2) {
      errors.propertyName = 'Property name must be at least 2 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaveLoading(true);
    setSuccessMessage('');
    
    try {
      const result = await dispatch(updateProfile(formData));
      
      if (updateProfile.fulfilled.match(result)) {
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setFormErrors({ general: result.payload || 'Failed to update profile. Please try again.' });
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setFormErrors({ general: 'Failed to update profile. Please try again.' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        propertyName: user.propertyName || '',
      });
    }
    setFormErrors({});
    setIsEditing(false);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && !user) {
    return <ModernLoader fullScreen message="Loading profile..." />;
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Unable to load profile information. Please try refreshing the page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <GradientBackground variant="primary" opacity={0.03} sx={{ borderRadius: 4, p: 4, mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={3}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: '2rem',
                fontWeight: 'bold',
              }}
            >
              {getInitials(user.name || 'User')}
            </Avatar>
            <IconButton
              sx={{
                position: 'absolute',
                bottom: -5,
                right: -5,
                bgcolor: 'background.paper',
                boxShadow: 2,
                '&:hover': { bgcolor: 'grey.100' },
              }}
              size="small"
            >
              <PhotoCameraIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box flex={1}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {user.name || 'User Profile'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your account settings and preferences
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip
                icon={<BusinessIcon />}
                label={user.propertyName || 'Property Owner'}
                color="primary"
                variant="outlined"
                size="small"
              />
              <Chip
                icon={<CalendarIcon />}
                label={`Member since ${formatDate(user.createdAt)}`}
                color="secondary"
                variant="outlined"
                size="small"
              />
            </Stack>
          </Box>
          <Box>
            {!isEditing ? (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
                sx={{ minWidth: 120 }}
              >
                Edit Profile
              </Button>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={saveLoading}
                  sx={{ minWidth: 100 }}
                >
                  {saveLoading ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={saveLoading}
                >
                  Cancel
                </Button>
              </Stack>
            )}
          </Box>
        </Stack>
      </GradientBackground>

      {/* Success Message */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {formErrors.general && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {formErrors.general}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <PersonIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Personal Information
                </Typography>
              </Stack>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    disabled={!isEditing}
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    disabled={!isEditing}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Property/Business Name"
                    value={formData.propertyName}
                    onChange={handleInputChange('propertyName')}
                    disabled={!isEditing}
                    error={!!formErrors.propertyName}
                    helperText={formErrors.propertyName || 'This name appears in your dashboard and reports'}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Information */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Account Details */}
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <EmailIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Account Details
                  </Typography>
                </Stack>
                
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      User ID
                    </Typography>
                    <Typography variant="body1" fontFamily="monospace">
                      {user.id || 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Account Created
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(user.createdAt)}
                    </Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Last Updated
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(user.updatedAt)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <SecurityIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Security
                  </Typography>
                </Stack>
                
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setShowChangePassword(true)}
                  >
                    Change Password
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={() => {
                      // TODO: Implement account deletion
                      console.log('Delete account clicked');
                    }}
                  >
                    Delete Account
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Stats
              </Typography>
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Properties</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {properties?.length || 0}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Tenants</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {tenants?.length || 0}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Total Earnings</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    ₹{payments?.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString('en-IN') || 0}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <ChangePassword
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </Container>
  );
}

export default Profile;
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, CardActions,
  IconButton, TextField, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, Pagination, CircularProgress,
  Chip, Stack, Tooltip, Avatar, Paper, Divider, Badge,
  CardHeader, LinearProgress, Grid, Alert, Fade, Grow
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Visibility as ViewIcon, Store as ShopIcon,
  Home as FlatIcon, Terrain as PlotIcon, Home as HomeIcon,
  Person as PersonIcon, AttachMoney as MoneyIcon,
  ElectricBolt as ElectricIcon, Build as MaintenanceIcon,
  CalendarToday as CalendarIcon, LocationOn as LocationIcon,
  TrendingUp as TrendingUpIcon, FilterList as FilterIcon,
  Search as SearchIcon, Clear as ClearIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
import {
  fetchProperties, createProperty, updateProperty, deleteProperty
} from '../../store/slices/propertySlice';
import ResponsivePageLayout, { 
  ResponsiveHeader, 
  ResponsiveFilters, 
  ResponsiveCardGrid,
  ResponsiveFormGrid,
  ResponsiveSection
} from '../../components/Layout/ResponsivePageLayout';

const validationSchema = Yup.object({
  propertyType: Yup.string().required('Property type is required'),

  shopName: Yup.string().required('Shop name is required'),

  shopNumber: Yup.string().required('Shop number is required'),

  area: Yup.number()
    .typeError('Area must be a number')
    .moreThan(0, 'Area must be greater than 0')
    .required('Area is required'),

  location: Yup.string().required('Location is required'),

  agreementStart: Yup.string().required('Agreement start date required'),

  agreementMonths: Yup.number()
    .typeError('Agreement months must be a number')
    .moreThan(0, 'Agreement months must be greater than 0')
    .required('Agreement months is required'),

  monthlyRent: Yup.number()
    .typeError('Monthly rent must be a number')
    .moreThan(0, 'Monthly rent must be greater than 0')
    .required('Monthly rent is required'),

  maintenance: Yup.number()
    .typeError('Maintenance must be a number')
    .moreThan(0, 'Maintenance must be greater than 0')
    .required('Maintenance is required'),

  lightBill: Yup.number()
    .typeError('Light bill must be a number')
    .moreThan(0, 'Light bill must be greater than 0')
    .required('Light bill is required'),

  rentLastPaid: Yup.string().nullable(),

  electricitySubmeter: Yup.string(),

  electricityLastUnit: Yup.number()
    .typeError('Last unit must be a number')
    .moreThan(0, 'Last unit must be greater than 0')
    .required('Last unit is required'),

  electricityUnitRate: Yup.number()
    .typeError('Unit rate must be a number')
    .moreThan(0, 'Unit rate must be greater than 0')
    .required('Unit rate is required'),
});


const getPropertyIcon = (type) => {
  switch (type) {
    case 'shop':
      return <ShopIcon fontSize="large" color="primary" />;
    case 'flat':
      return <FlatIcon fontSize="large" color="secondary" />;
    case 'plot':
      return <PlotIcon fontSize="large" color="success" />;
    default:
      return <HomeIcon fontSize="large" />;
  }
};

const getPropertyColor = (type) => {
  switch (type) {
    case 'shop':
      return 'primary';
    case 'flat':
      return 'secondary';
    case 'plot':
      return 'success';
    default:
      return 'default';
  }
};

const getOccupancyStatus = (property) => {
  if (property.tenant) {
    return {
      label: 'Occupied',
      color: 'success',
      icon: <PersonIcon fontSize="small" />
    };
  }
  return {
    label: 'Vacant',
    color: 'default',
    icon: null
  };
};

const calculateMonthlyIncome = (property) => {
  const rent = property.monthlyRent ?? property.rent?.monthlyRent ?? 0;
  const maintenance = property.maintenance ?? property.rent?.maintenance ?? 0;
  const light = property.lightBill ?? 0;
  return rent + maintenance + light;
};

function Properties() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { properties, pagination, loading } = useSelector((state) => state.property);
  const [open, setOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchProperties({ page, limit: 12, search, propertyType }));
  }, [dispatch, page, search, propertyType]);

  // Calculate summary statistics
  const stats = {
    total: properties.length,
    occupied: properties.filter(p => p.tenant).length,
    vacant: properties.filter(p => !p.tenant).length,
    totalIncome: properties.reduce((sum, p) => sum + calculateMonthlyIncome(p), 0),
    occupancyRate: properties.length > 0 ? Math.round((properties.filter(p => p.tenant).length / properties.length) * 100) : 0
  };

  useEffect(() => {
    dispatch(fetchProperties({ page, limit: 10, search, propertyType }));
  }, [dispatch, page, search, propertyType]);

  const formik = useFormik({
    initialValues: {
     propertyType: '',
  shopName: '',
  shopNumber: '',
  area: '',
  location: '',
  agreementStart: '',
  agreementMonths: '',
  monthlyRent: '',
  maintenance: '',
  lightBill: '',
  rentLastPaid: '',
  electricitySubmeter: '',
  electricityLastUnit: '',
  electricityUnitRate: '',
  isActive: true,
  tenant: null
    },
    validationSchema,
    onSubmit: async (values) => {
      const payload = {
        propertyType: values.propertyType,
        shopName: values.shopName,
        shopNumber: values.shopNumber,
        area: Number(values.area),
        location: values.location,
        monthlyRent: Number(values.monthlyRent),
        maintenance: Number(values.maintenance),
        lightBill: Number(values.lightBill),
        agreement: {
          startDate: values.agreementStart,
          months: Number(values.agreementMonths),
        },
        rent: {
          monthlyRent: Number(values.monthlyRent),
          maintenance: Number(values.maintenance),
          lastPaid: values.rentLastPaid || null,
        },
        electricity: {
          submeterNo: values.electricitySubmeter,
          lastUnit: Number(values.electricityLastUnit),
          unitRate: Number(values.electricityUnitRate),
        },
        isActive: !!values.isActive,
        tenant: values.tenant || null,
      };

      if (editingProperty) {
        dispatch(updateProperty({ id: editingProperty._id, ...payload }));
      } else {
        dispatch(createProperty(payload));
      }

      setOpen(false);
      setEditingProperty(null);
      formik.resetForm();
      dispatch(fetchProperties({ page, limit: 12, search, propertyType }));
    },
  });

  const handleEdit = (property) => {
    setEditingProperty(property);
    formik.setValues({
      propertyType: property.propertyType || '',
      shopName: property.shopName || '',
      shopNumber: property.shopNumber || '',
      area: property.area ?? '',
      location: property.location || '',
      agreementStart: property.agreement?.startDate || '',
      agreementMonths: property.agreement?.months || 0,
      monthlyRent: property.monthlyRent ?? property.rent?.monthlyRent ?? 0,
      maintenance: property.maintenance ?? property.rent?.maintenance ?? 0,
      lightBill: property.lightBill ?? 0,
      rentLastPaid: property.rent?.lastPaid || '',
      electricitySubmeter: property.electricity?.submeterNo || '',
      electricityLastUnit: property.electricity?.lastUnit || 0,
      electricityUnitRate: property.electricity?.unitRate || 0,
      isActive: property.isActive ?? !!property.tenant,
      tenant: property.tenant || null,
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      dispatch(deleteProperty(id));
      dispatch(fetchProperties({ page, limit: 12, search, propertyType }));
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingProperty(null);
    formik.resetForm();
  };

  const clearFilters = () => {
    setSearch('');
    setPropertyType('');
    setPage(1);
  };

  return (
    <ResponsivePageLayout>
      {/* Header with Stats */}
      <ResponsiveSection>
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white',
            borderRadius: 3,
            p: { xs: 3, sm: 4 },
            mb: 3,
          }}
        >
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            alignItems={{ xs: 'flex-start', sm: 'center' }} 
            spacing={3}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant={{ xs: 'h5', sm: 'h4' }} fontWeight="bold" gutterBottom>
                Properties Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                Manage your property portfolio with detailed insights and analytics
              </Typography>
              
              {/* Quick Stats */}
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Properties</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="success.light">{stats.occupied}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Occupied</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="warning.light">{stats.vacant}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Vacant</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="success.light">
                      ₹{stats.totalIncome.toLocaleString('en-IN')}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Monthly Income</Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Occupancy Rate Progress */}
              <Box sx={{ mt: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Occupancy Rate
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {stats.occupancyRate}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={stats.occupancyRate}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: stats.occupancyRate >= 80 ? 'success.light' : stats.occupancyRate >= 60 ? 'warning.light' : 'error.light',
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>
            </Box>
            
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => { 
                setEditingProperty(null); 
                formik.resetForm(); 
                setOpen(true); 
              }}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              Add Property
            </Button>
          </Stack>
        </Paper>
      </ResponsiveSection>

      {/* Enhanced Filters */}
      <ResponsiveSection>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Box sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Search & Filter
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FilterIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
                {(search || propertyType) && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={clearFilters}
                    color="error"
                  >
                    Clear
                  </Button>
                )}
              </Stack>
            </Stack>

            <Fade in={showFilters}>
              <ResponsiveFilters>
                <TextField
                  label="Search by name or location"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  fullWidth
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  placeholder="Enter property name or location..."
                />
                <TextField
                  select
                  label="Property Type"
                  value={propertyType}
                  onChange={(e) => { setPropertyType(e.target.value); setPage(1); }}
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="">All types</MenuItem>
                  <MenuItem value="flat">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <FlatIcon fontSize="small" />
                      <span>Flat</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="shop">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <ShopIcon fontSize="small" />
                      <span>Shop</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="plot">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PlotIcon fontSize="small" />
                      <span>Plot</span>
                    </Stack>
                  </MenuItem>
                </TextField>
              </ResponsiveFilters>
            </Fade>

            {/* Active Filters Display */}
            {(search || propertyType) && (
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Active Filters:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {search && (
                    <Chip
                      label={`Search: "${search}"`}
                      onDelete={() => { setSearch(''); setPage(1); }}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {propertyType && (
                    <Chip
                      label={`Type: ${propertyType}`}
                      onDelete={() => { setPropertyType(''); setPage(1); }}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Box>
            )}
          </Box>
        </Paper>
      </ResponsiveSection>

      {/* Enhanced Property Cards */}
      <ResponsiveSection>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress size={60} />
          </Box>
        ) : properties.length === 0 ? (
          <Paper 
            elevation={0} 
            sx={{ 
              border: '2px dashed', 
              borderColor: 'divider', 
              borderRadius: 3,
              p: 6,
              textAlign: 'center'
            }}
          >
            <HomeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Properties Found
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {search || propertyType 
                ? 'No properties match your current filters. Try adjusting your search criteria.'
                : 'Get started by adding your first property to the system.'
              }
            </Typography>
            {!search && !propertyType && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => { 
                  setEditingProperty(null); 
                  formik.resetForm(); 
                  setOpen(true); 
                }}
                sx={{ mt: 2 }}
              >
                Add Your First Property
              </Button>
            )}
          </Paper>
        ) : (
          <ResponsiveCardGrid cardSize="medium">
            {properties.map((property, index) => {
              const occupancyStatus = getOccupancyStatus(property);
              const monthlyIncome = calculateMonthlyIncome(property);
              
              return (
                <Grow in timeout={500 + index * 100} key={property._id}>
                  <Card 
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        transform: 'translateY(-4px)', 
                        boxShadow: 6,
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    {/* Enhanced Header */}
                    <CardHeader
                      avatar={
                        <Badge
                          badgeContent={occupancyStatus.icon}
                          color={occupancyStatus.color}
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        >
                          <Avatar 
                            sx={{ 
                              bgcolor: `${getPropertyColor(property.propertyType)}.light`,
                              width: 56, 
                              height: 56 
                            }}
                          >
                            {getPropertyIcon(property.propertyType)}
                          </Avatar>
                        </Badge>
                      }
                      title={
                        <Typography variant="h6" fontWeight="bold">
                          {property.shopName}
                        </Typography>
                      }
                      subheader={
                        <Stack spacing={0.5}>
                          <Typography variant="body2" color="text.secondary">
                            {property.shopNumber} • {property.propertyType} • {property.area} sq.ft
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <LocationIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {property.location}
                            </Typography>
                          </Stack>
                        </Stack>
                      }
                      action={
                        <Chip
                          label={occupancyStatus.label}
                          color={occupancyStatus.color}
                          size="small"
                          variant={property.tenant ? 'filled' : 'outlined'}
                        />
                      }
                    />

                    {/* Enhanced Content */}
                    <CardContent sx={{ flex: 1, pt: 0 }}>
                      {/* Financial Overview */}
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          bgcolor: 'primary.50', 
                          p: 2, 
                          borderRadius: 2, 
                          mb: 2,
                          border: '1px solid',
                          borderColor: 'primary.200'
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                          <MoneyIcon fontSize="small" color="primary" />
                          <Typography variant="subtitle2" fontWeight="bold" color="primary.dark">
                            Monthly Income: ₹{monthlyIncome.toLocaleString('en-IN')}
                          </Typography>
                        </Stack>
                        <Grid container spacing={1}>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">Rent</Typography>
                            <Typography variant="body2" fontWeight="600">
                              ₹{(property.monthlyRent ?? property.rent?.monthlyRent ?? 0).toLocaleString('en-IN')}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">Maintenance</Typography>
                            <Typography variant="body2" fontWeight="600">
                              ₹{(property.maintenance ?? property.rent?.maintenance ?? 0).toLocaleString('en-IN')}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">Electricity</Typography>
                            <Typography variant="body2" fontWeight="600">
                              ₹{(property.lightBill ?? 0).toLocaleString('en-IN')}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>

                      {/* Agreement Info */}
                      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Agreement: {property.agreement?.startDate 
                            ? format(new Date(property.agreement.startDate), 'dd MMM yyyy') 
                            : 'Not set'
                          } ({property.agreement?.months || 0} months)
                        </Typography>
                      </Stack>

                      {/* Tenant Info */}
                      {property.tenant && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PersonIcon fontSize="small" color="success" />
                          <Typography variant="body2" color="success.main" fontWeight="500">
                            Tenant: {property.tenant.name || 'Assigned'}
                          </Typography>
                        </Stack>
                      )}
                    </CardContent>

                    {/* Enhanced Actions */}
                    <Divider />
                    <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1.5 }}>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            onClick={() => navigate(`/properties/${property._id}`)}
                            sx={{ 
                              bgcolor: 'primary.50',
                              '&:hover': { bgcolor: 'primary.100' }
                            }}
                          >
                            <ViewIcon fontSize="small" color="primary" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Property">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEdit(property)}
                            sx={{ 
                              bgcolor: 'warning.50',
                              '&:hover': { bgcolor: 'warning.100' }
                            }}
                          >
                            <EditIcon fontSize="small" color="warning" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Property">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDelete(property._id)}
                            sx={{ 
                              bgcolor: 'error.50',
                              '&:hover': { bgcolor: 'error.100' }
                            }}
                          >
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                      
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <TrendingUpIcon fontSize="small" color="success" />
                        <Typography variant="caption" color="success.main" fontWeight="600">
                          ₹{monthlyIncome.toLocaleString('en-IN')}/mo
                        </Typography>
                      </Stack>
                    </CardActions>
                  </Card>
                </Grow>
              );
            })}
          </ResponsiveCardGrid>
        )}
      </ResponsiveSection>

      {/* Enhanced Pagination */}
      {pagination.totalPages > 1 && (
        <ResponsiveSection>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Showing {((page - 1) * 12) + 1} - {Math.min(page * 12, pagination.total)} of {pagination.total} properties
              </Typography>
              <Pagination 
                count={pagination.totalPages} 
                page={page} 
                onChange={(_, value) => setPage(value)}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          </Paper>
        </ResponsiveSection>
      )}

      {/* Enhanced Modal */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'primary.light' }}>
              {editingProperty ? <EditIcon /> : <AddIcon />}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {editingProperty ? 'Edit Property' : 'Add New Property'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {editingProperty ? 'Update property information' : 'Enter property details to add to your portfolio'}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        
        <Divider />
        
        <form onSubmit={formik.handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            {/* Form sections with better organization */}
            <Stack spacing={4}>
              {/* Basic Information Section */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                  Basic Information
                </Typography>
                <ResponsiveFormGrid columns={{ xs: 1, sm: 2, md: 2 }}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Property Name"
                    name="shopName"
                    value={formik.values.shopName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.shopName && Boolean(formik.errors.shopName)}
                    helperText={formik.touched.shopName && formik.errors.shopName}
                    InputProps={{
                      startAdornment: <HomeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />

                  <TextField
                    fullWidth
                    margin="normal"
                    label="Property Number"
                    name="shopNumber"
                    value={formik.values.shopNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.shopNumber && Boolean(formik.errors.shopNumber)}
                    helperText={formik.touched.shopNumber && formik.errors.shopNumber}
                  />

                  <TextField
                    select
                    fullWidth
                    margin="normal"
                    label="Property Type"
                    name="propertyType"
                    value={formik.values.propertyType}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.propertyType && Boolean(formik.errors.propertyType)}
                    helperText={formik.touched.propertyType && formik.errors.propertyType}
                  >
                    <MenuItem value="flat">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <FlatIcon fontSize="small" />
                        <span>Flat</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="shop">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <ShopIcon fontSize="small" />
                        <span>Shop</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="plot">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PlotIcon fontSize="small" />
                        <span>Plot</span>
                      </Stack>
                    </MenuItem>
                  </TextField>

                  <TextField
                    fullWidth
                    margin="normal"
                    label="Area (sq.ft)"
                    name="area"
                    type="number"
                    value={formik.values.area}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.area && Boolean(formik.errors.area)}
                    helperText={formik.touched.area && formik.errors.area}
                  />

                  <TextField
                    fullWidth
                    margin="normal"
                    label="Location"
                    name="location"
                    value={formik.values.location}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.location && Boolean(formik.errors.location)}
                    helperText={formik.touched.location && formik.errors.location}
                    sx={{ gridColumn: { sm: '1 / -1' } }}
                    InputProps={{
                      startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </ResponsiveFormGrid>
              </Box>

              {/* Agreement Section */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                  Agreement Details
                </Typography>
                <ResponsiveFormGrid columns={{ xs: 1, sm: 2, md: 2 }}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Agreement Start Date"
                    name="agreementStart"
                    type="date"
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={
                      formik.values.agreementStart
                        ? new Date(formik.values.agreementStart).toISOString().split('T')[0]
                        : ''
                    }
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.agreementStart && Boolean(formik.errors.agreementStart)}
                    helperText={formik.touched.agreementStart && formik.errors.agreementStart}
                    InputProps={{
                      startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />

                  <TextField
                    fullWidth
                    margin="normal"
                    label="Agreement Duration (months)"
                    name="agreementMonths"
                    type="number"
                    value={formik.values.agreementMonths}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.agreementMonths && Boolean(formik.errors.agreementMonths)}
                    helperText={formik.touched.agreementMonths && formik.errors.agreementMonths}
                  />
                </ResponsiveFormGrid>
              </Box>

              {/* Financial Section */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                  Financial Details
                </Typography>
                <ResponsiveFormGrid columns={{ xs: 1, sm: 2, md: 3 }}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Monthly Rent (₹)"
                    name="monthlyRent"
                    type="number"
                    value={formik.values.monthlyRent}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.monthlyRent && Boolean(formik.errors.monthlyRent)}
                    helperText={formik.touched.monthlyRent && formik.errors.monthlyRent}
                    InputProps={{
                      startAdornment: <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />

                  <TextField
                    fullWidth
                    margin="normal"
                    label="Maintenance (₹)"
                    name="maintenance"
                    type="number"
                    value={formik.values.maintenance}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.maintenance && Boolean(formik.errors.maintenance)}
                    helperText={formik.touched.maintenance && formik.errors.maintenance}
                    InputProps={{
                      startAdornment: <MaintenanceIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />

                  <TextField
                    fullWidth
                    margin="normal"
                    label="Electricity Bill (₹)"
                    name="lightBill"
                    type="number"
                    value={formik.values.lightBill}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.lightBill && Boolean(formik.errors.lightBill)}
                    helperText={formik.touched.lightBill && formik.errors.lightBill}
                    InputProps={{
                      startAdornment: <ElectricIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />

                  <TextField
                    fullWidth
                    margin="normal"
                    label="Rent Last Paid"
                    name="rentLastPaid"
                    type="date"
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={
                      formik.values.rentLastPaid
                        ? new Date(formik.values.rentLastPaid).toISOString().split('T')[0]
                        : ''
                    }
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.rentLastPaid && Boolean(formik.errors.rentLastPaid)}
                    helperText={formik.touched.rentLastPaid && formik.errors.rentLastPaid}
                  />
                </ResponsiveFormGrid>
              </Box>

              {/* Electricity Section */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                  Electricity Details
                </Typography>
                <ResponsiveFormGrid columns={{ xs: 1, sm: 2, md: 3 }}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Submeter Number"
                    name="electricitySubmeter"
                    value={formik.values.electricitySubmeter}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.electricitySubmeter && Boolean(formik.errors.electricitySubmeter)}
                    helperText={formik.touched.electricitySubmeter && formik.errors.electricitySubmeter}
                  />

                  <TextField
                    fullWidth
                    margin="normal"
                    label="Last Unit Reading"
                    name="electricityLastUnit"
                    type="number"
                    value={formik.values.electricityLastUnit}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.electricityLastUnit && Boolean(formik.errors.electricityLastUnit)}
                    helperText={formik.touched.electricityLastUnit && formik.errors.electricityLastUnit}
                  />

                  <TextField
                    fullWidth
                    margin="normal"
                    label="Unit Rate (₹/unit)"
                    name="electricityUnitRate"
                    type="number"
                    value={formik.values.electricityUnitRate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.electricityUnitRate && Boolean(formik.errors.electricityUnitRate)}
                    helperText={formik.touched.electricityUnitRate && formik.errors.electricityUnitRate}
                  />
                </ResponsiveFormGrid>
              </Box>

              {/* Summary Preview */}
              {(formik.values.monthlyRent || formik.values.maintenance || formik.values.lightBill) && (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Monthly Income Preview
                  </Typography>
                  <Typography variant="body2">
                    Total Monthly Income: ₹{(
                      Number(formik.values.monthlyRent || 0) + 
                      Number(formik.values.maintenance || 0) + 
                      Number(formik.values.lightBill || 0)
                    ).toLocaleString('en-IN')}
                  </Typography>
                </Alert>
              )}
            </Stack>
          </DialogContent>

          <Divider />
          
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClose} size="large">
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              size="large"
              sx={{ px: 4 }}
            >
              {editingProperty ? 'Update Property' : 'Create Property'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </ResponsivePageLayout>
  );
}

export default Properties;

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Stack,
  Pagination,
  Select,
  FormControl,
  InputLabel,
  Grid,
  LinearProgress,
  InputAdornment,
  Collapse,
  Fade,
  Avatar,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Build as BuildIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalanceWallet as WalletIcon,
  PendingActions as PendingIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
import {
  fetchMaintenance,
  fetchMaintenanceStats,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
} from '../../store/slices/maintenanceSlice';
import { fetchProperties } from '../../store/slices/propertySlice';
import ResponsivePageLayout, { 
  ResponsiveHeader, 
  ResponsiveFilters,
  ResponsiveStatsGrid,
  ResponsiveSection
} from '../../components/Layout/ResponsivePageLayout';

const validationSchema = Yup.object({
  property: Yup.string().required('Flat is required'),
  maintainer: Yup.string().required('Maintainer is required'),
  activityDate: Yup.date().required('Activity date is required'),
  paidDate: Yup.date().nullable(),
  amount: Yup.number()
    .typeError('Amount must be a number')
    .moreThan(0, 'Amount must be greater than 0')
    .required('Amount is required'),
  description: Yup.string(),
});

function Maintenance() {
  const dispatch = useDispatch();
  const { maintenanceRecords, stats, pagination, loading } = useSelector((state) => state.maintenance);
  const { properties } = useSelector((state) => state.property);
  const [open, setOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedMaintainer, setSelectedMaintainer] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Get only flat properties
  const flatProperties = properties.filter(p => p.propertyType === 'flat');

  useEffect(() => {
    dispatch(fetchProperties({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    const filters = { page, limit: 10 };
    if (selectedProperty) filters.property = selectedProperty;
    if (selectedMaintainer) filters.maintainer = selectedMaintainer;
    if (statusFilter) filters.status = statusFilter;
    if (searchTerm) filters.search = searchTerm;
    dispatch(fetchMaintenance(filters));
  }, [dispatch, page, selectedProperty, selectedMaintainer, statusFilter, searchTerm]);

  useEffect(() => {
    const statsFilters = {};
    if (selectedProperty) statsFilters.property = selectedProperty;
    dispatch(fetchMaintenanceStats(statsFilters));
  }, [dispatch, selectedProperty, maintenanceRecords]);

  const formik = useFormik({
    initialValues: {
      property: '',
      maintainer: '',
      activityDate: new Date().toISOString().split('T')[0],
      paidDate: '',
      amount: '',
      description: '',
      status: 'pending',
    },
    validationSchema,
    onSubmit: async (values) => {
      const payload = {
        property: values.property,
        maintainer: values.maintainer,
        activityDate: values.activityDate,
        paidDate: values.paidDate || null,
        amount: Number(values.amount),
        description: values.description || '',
        status: values.paidDate ? 'paid' : 'pending',
      };

      if (editingMaintenance) {
        dispatch(updateMaintenance({ id: editingMaintenance._id, ...payload }));
      } else {
        dispatch(createMaintenance(payload));
      }

      setOpen(false);
      setEditingMaintenance(null);
      formik.resetForm();
      dispatch(fetchMaintenance({ page, limit: 10 }));
      dispatch(fetchMaintenanceStats({}));
    },
  });

  const handleEdit = (maintenance) => {
    setEditingMaintenance(maintenance);
    formik.setValues({
      property: maintenance.property._id || maintenance.property,
      maintainer: maintenance.maintainer || '',
      activityDate: maintenance.activityDate
        ? new Date(maintenance.activityDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      paidDate: maintenance.paidDate
        ? new Date(maintenance.paidDate).toISOString().split('T')[0]
        : '',
      amount: maintenance.amount || '',
      description: maintenance.description || '',
      status: maintenance.status || 'pending',
    });
    setOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this maintenance record?')) {
      dispatch(deleteMaintenance(id));
      dispatch(fetchMaintenance({ page, limit: 10 }));
      dispatch(fetchMaintenanceStats({}));
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingMaintenance(null);
    formik.resetForm();
  };

  // Get unique maintainers from records
  const maintainers = [...new Set(maintenanceRecords.map(m => m.maintainer))].sort();

  return (
    <ResponsivePageLayout>
      {/* Enhanced Header with Statistics */}
      <ResponsiveSection>
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)',
            color: 'white',
            borderRadius: 3,
            p: { xs: 3, sm: 4 },
          }}
        >
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            alignItems={{ xs: 'flex-start', sm: 'center' }} 
            spacing={3}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant={{ xs: 'h5', sm: 'h4' }} fontWeight="bold" gutterBottom>
                Maintenance Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                Comprehensive maintenance tracking with detailed insights and analytics
              </Typography>
              
              {/* Quick Stats */}
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold">₹{stats?.summary?.totalSpending?.toLocaleString() || 0}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Spending</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="success.light">₹{stats?.summary?.paidSpending?.toLocaleString() || 0}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Paid</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="warning.light">₹{stats?.summary?.pendingSpending?.toLocaleString() || 0}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Pending</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="info.light">{stats?.byMaintainer?.length || 0}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Maintainers</Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Progress Indicators */}
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Payment Completion
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {stats?.summary?.totalSpending > 0 ? Math.round((stats?.summary?.paidSpending / stats?.summary?.totalSpending) * 100) : 0}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={stats?.summary?.totalSpending > 0 ? Math.round((stats?.summary?.paidSpending / stats?.summary?.totalSpending) * 100) : 0}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'success.light',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Records Processed
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {stats?.summary?.totalRecords || 0}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'info.light',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
            
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingMaintenance(null);
                formik.resetForm();
                formik.setFieldValue('activityDate', new Date().toISOString().split('T')[0]);
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
              Add Maintenance
            </Button>
          </Stack>
        </Paper>
      </ResponsiveSection>



      {/* Enhanced Search and Filters */}
      <ResponsiveSection>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Box sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Search & Filter Maintenance Records
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
                {(searchTerm || selectedProperty || selectedMaintainer || statusFilter) && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedProperty('');
                      setSelectedMaintainer('');
                      setStatusFilter('');
                      setPage(1);
                    }}
                    color="error"
                  >
                    Clear All
                  </Button>
                )}
              </Stack>
            </Stack>

            {/* Search Bar */}
            <TextField
              fullWidth
              label="Search maintenance records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="Search by property, maintainer, or description..."
              sx={{ mb: showFilters ? 2 : 0 }}
            />

            {/* Collapsible Filters */}
            <Collapse in={showFilters}>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Filter by Property</InputLabel>
                    <Select
                      value={selectedProperty}
                      label="Filter by Property"
                      onChange={(e) => {
                        setSelectedProperty(e.target.value);
                        setPage(1);
                      }}
                    >
                      <MenuItem value="">All Properties</MenuItem>
                      {flatProperties.map((property) => (
                        <MenuItem key={property._id} value={property._id}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <BuildIcon fontSize="small" />
                            <span>{property.shopName} - {property.shopNumber}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Filter by Maintainer</InputLabel>
                    <Select
                      value={selectedMaintainer}
                      label="Filter by Maintainer"
                      onChange={(e) => {
                        setSelectedMaintainer(e.target.value);
                        setPage(1);
                      }}
                    >
                      <MenuItem value="">All Maintainers</MenuItem>
                      {maintainers.map((maintainer) => (
                        <MenuItem key={maintainer} value={maintainer}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <PersonIcon fontSize="small" />
                            <span>{maintainer}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Filter by Status</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Filter by Status"
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                      }}
                    >
                      <MenuItem value="">All Status</MenuItem>
                      <MenuItem value="paid">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <TrendingUpIcon fontSize="small" color="success" />
                          <span>Paid</span>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="pending">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PendingIcon fontSize="small" color="warning" />
                          <span>Pending</span>
                        </Stack>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Collapse>

            {/* Active Filters Display */}
            {(searchTerm || selectedProperty || selectedMaintainer || statusFilter) && (
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Active Filters:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {searchTerm && (
                    <Chip
                      label={`Search: "${searchTerm}"`}
                      onDelete={() => setSearchTerm('')}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {selectedProperty && (
                    <Chip
                      label={`Property: ${flatProperties.find(p => p._id === selectedProperty)?.shopName || 'Unknown'}`}
                      onDelete={() => setSelectedProperty('')}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {selectedMaintainer && (
                    <Chip
                      label={`Maintainer: ${selectedMaintainer}`}
                      onDelete={() => setSelectedMaintainer('')}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {statusFilter && (
                    <Chip
                      label={`Status: ${statusFilter}`}
                      onDelete={() => setStatusFilter('')}
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

      {/* Enhanced Maintenance Records */}
      <ResponsiveSection>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        ) : maintenanceRecords.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              textAlign: 'center',
              py: 8,
              px: 4,
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            }}
          >
            <BuildIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom color="text.secondary">
              No maintenance records found
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              {searchTerm || selectedProperty || selectedMaintainer || statusFilter
                ? 'Try adjusting your search criteria or filters'
                : 'Start by adding your first maintenance record to track property upkeep'}
            </Typography>
            {!(searchTerm || selectedProperty || selectedMaintainer || statusFilter) && (
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingMaintenance(null);
                  formik.resetForm();
                  formik.setFieldValue('activityDate', new Date().toISOString().split('T')[0]);
                  setOpen(true);
                }}
                sx={{ mt: 2 }}
              >
                Add First Record
              </Button>
            )}
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {maintenanceRecords.map((record, index) => (
              <Grid item xs={12} sm={6} md={4} key={record._id}>
                <Fade in timeout={300 + index * 100}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    <CardContent sx={{ flex: 1, pb: 1 }}>
                      {/* Header with Property and Status */}
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="h6" fontWeight="bold" noWrap>
                            {record.property?.shopName || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {record.property?.shopNumber || 'N/A'} • {record.property?.location || 'N/A'}
                          </Typography>
                        </Box>
                        <Chip
                          label={record.status || 'pending'}
                          color={record.status === 'paid' ? 'success' : 'warning'}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Stack>

                      {/* Maintainer Info */}
                      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                          <PersonIcon fontSize="small" />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {record.maintainer}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Maintainer
                          </Typography>
                        </Box>
                      </Stack>

                      <Divider sx={{ my: 2 }} />

                      {/* Dates and Amount */}
                      <Stack spacing={1} mb={2}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CalendarIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            <strong>Activity:</strong> {record.activityDate
                              ? format(new Date(record.activityDate), 'dd MMM yyyy')
                              : '-'}
                          </Typography>
                        </Stack>
                        {record.paidDate && (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <TrendingUpIcon fontSize="small" color="success" />
                            <Typography variant="body2">
                              <strong>Paid:</strong> {format(new Date(record.paidDate), 'dd MMM yyyy')}
                            </Typography>
                          </Stack>
                        )}
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <MoneyIcon fontSize="small" color="primary" />
                          <Typography variant="body2">
                            <strong>Amount:</strong> ₹{record.amount?.toLocaleString() || 0}
                          </Typography>
                        </Stack>
                      </Stack>

                      {/* Description */}
                      {record.description && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            "{record.description}"
                          </Typography>
                        </Box>
                      )}
                    </CardContent>

                    {/* Action Buttons */}
                    <Divider />
                    <Box sx={{ p: 2 }}>
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Edit Record">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(record)}
                            sx={{
                              bgcolor: 'primary.50',
                              '&:hover': { bgcolor: 'primary.100' }
                            }}
                          >
                            <EditIcon fontSize="small" color="primary" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Record">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(record._id)}
                            sx={{
                              bgcolor: 'error.50',
                              '&:hover': { bgcolor: 'error.100' }
                            }}
                          >
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}
      </ResponsiveSection>

      {/* Enhanced Pagination */}
      {pagination.totalPages > 1 && (
        <ResponsiveSection>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              alignItems="center" 
              justifyContent="space-between" 
              spacing={2}
            >
              <Typography variant="body2" color="text.secondary">
                Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, pagination.total || 0)} of {pagination.total || 0} records
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
            </Stack>
          </Paper>
        </ResponsiveSection>
      )}

      {/* Enhanced Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: editingMaintenance ? 'warning.light' : 'primary.light' }}>
              {editingMaintenance ? <EditIcon /> : <AddIcon />}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {editingMaintenance ? 'Edit Maintenance Record' : 'Add New Maintenance Record'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {editingMaintenance ? 'Update maintenance information' : 'Enter maintenance details for property upkeep tracking'}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Paper elevation={0} sx={{ p: 3, mt: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Select Property"
                    name="property"
                    value={formik.values.property}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.property && Boolean(formik.errors.property)}
                    helperText={formik.touched.property && formik.errors.property}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BuildIcon />
                        </InputAdornment>
                      ),
                    }}
                    required
                  >
                    {flatProperties.map((property) => (
                      <MenuItem key={property._id} value={property._id}>
                        {property.shopName} - {property.shopNumber} ({property.location})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Maintainer Name"
                    name="maintainer"
                    value={formik.values.maintainer}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.maintainer && Boolean(formik.errors.maintainer)}
                    helperText={formik.touched.maintainer && formik.errors.maintainer}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    }}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Activity Date"
                    name="activityDate"
                    type="date"
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={formik.values.activityDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.activityDate && Boolean(formik.errors.activityDate)}
                    helperText={formik.touched.activityDate && formik.errors.activityDate}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon />
                        </InputAdornment>
                      ),
                    }}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Paid Date (Optional)"
                    name="paidDate"
                    type="date"
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={formik.values.paidDate}
                    onChange={(e) => {
                      formik.setFieldValue('paidDate', e.target.value);
                      if (e.target.value) {
                        formik.setFieldValue('status', 'paid');
                      } else {
                        formik.setFieldValue('status', 'pending');
                      }
                    }}
                    onBlur={formik.handleBlur}
                    error={formik.touched.paidDate && Boolean(formik.errors.paidDate)}
                    helperText={formik.touched.paidDate && formik.errors.paidDate}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TrendingUpIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Amount"
                    name="amount"
                    type="number"
                    value={formik.values.amount}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.amount && Boolean(formik.errors.amount)}
                    helperText={formik.touched.amount && formik.errors.amount}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MoneyIcon />
                        </InputAdornment>
                      ),
                    }}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description (Optional)"
                    name="description"
                    multiline
                    rows={3}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
                    placeholder="Enter maintenance details, work performed, materials used, etc."
                  />
                </Grid>
              </Grid>
            </Paper>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button onClick={handleClose} size="large">
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              size="large"
              startIcon={editingMaintenance ? <EditIcon /> : <AddIcon />}
            >
              {editingMaintenance ? 'Update Record' : 'Create Record'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </ResponsivePageLayout>
  );
}

export default Maintenance;


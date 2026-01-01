import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Tooltip,
  IconButton,
  CircularProgress,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Divider,
  Paper,
  Grid,
  LinearProgress,
  MenuItem,
  InputAdornment,
  Collapse,
  Skeleton,
  Menu,
  CardActions,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControlLabel,
  Switch,
  Alert,
  Fade
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  Payment as PaymentIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Call as CallIcon,
  Message as MessageIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ContactPhone as ContactPhoneIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';

import {
  fetchTenants,
  deleteTenant,
  updateTenant,
  updateRentStatus,
  updateMaintenanceStatus,
  updateLightBillStatus
} from '../../store/slices/tenantSlice';
import ResponsivePageLayout, { 
  ResponsiveCardGrid,
  ResponsiveFormGrid,
  ResponsiveSection
} from '../../components/Layout/ResponsivePageLayout';

// Helper functions
const formatDate = (date) => {
  if (!date) return 'Not set';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const formatCurrency = (amount) => `₹${amount?.toLocaleString('en-IN') || 0}`;

const getStatusColor = (status) => {
  switch (status) {
    case 'paid': return 'success';
    case 'pending': return 'warning';
    case 'overdue': return 'error';
    default: return 'default';
  }
};

const getTenantScore = (tenant) => {
  let score = 0;
  if (tenant.isVerified) score += 25;
  if (tenant.propertyId) score += 25;
  if (tenant.phone && tenant.email) score += 25;
  if (tenant.documents && tenant.documents.length > 0) score += 25;
  return score;
};

const getStatusChipProps = (status) => {
  switch (status) {
    case 'paid':
      return { color: 'success', icon: <CheckCircleIcon /> };
    case 'pending':
      return { color: 'warning', icon: <WarningIcon /> };
    case 'overdue':
      return { color: 'error', icon: <CancelIcon /> };
    default:
      return { color: 'default', icon: null };
  }
};

function Tenants() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tenants, pagination, loading } = useSelector((state) => state.tenant);

  // Enhanced state management
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(12);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'list'
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTenantForMenu, setSelectedTenantForMenu] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedTenantDetails, setSelectedTenantDetails] = useState(null);

  useEffect(() => {
    dispatch(fetchTenants({ page, limit: rowsPerPage }));
  }, [dispatch, page, rowsPerPage]);

  // Enhanced filtering and sorting
  const filteredAndSortedTenants = useMemo(() => {
    let filtered = tenants.filter(tenant => {
      const matchesSearch = !searchTerm || 
        tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.phone?.includes(searchTerm) ||
        tenant.propertyId?.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || 
        (statusFilter === 'active' && tenant.propertyId) ||
        (statusFilter === 'inactive' && !tenant.propertyId) ||
        (statusFilter === 'rent-paid' && tenant.rentStatus === 'paid') ||
        (statusFilter === 'rent-pending' && tenant.rentStatus === 'pending');

      const matchesVerification = !verificationFilter ||
        (verificationFilter === 'verified' && tenant.isVerified) ||
        (verificationFilter === 'unverified' && !tenant.isVerified);

      return matchesSearch && matchesStatus && matchesVerification;
    });

    // Sort tenants
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'name') {
        aValue = aValue?.toLowerCase() || '';
        bValue = bValue?.toLowerCase() || '';
      } else if (sortBy === 'score') {
        aValue = getTenantScore(a);
        bValue = getTenantScore(b);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [tenants, searchTerm, statusFilter, verificationFilter, sortBy, sortOrder]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = tenants.length;
    const active = tenants.filter(t => t.propertyId).length;
    const verified = tenants.filter(t => t.isVerified).length;
    const rentPaid = tenants.filter(t => t.rentStatus === 'paid').length;
    const rentPending = tenants.filter(t => t.rentStatus === 'pending').length;
    
    return {
      total,
      active,
      inactive: total - active,
      verified,
      unverified: total - verified,
      rentPaid,
      rentPending,
      occupancyRate: total > 0 ? Math.round((active / total) * 100) : 0,
      verificationRate: total > 0 ? Math.round((verified / total) * 100) : 0
    };
  }, [tenants]);

  const refresh = () => {
    dispatch(fetchTenants({ page, limit: rowsPerPage }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tenant?')) return;
    dispatch(deleteTenant(id));
    refresh();
  };

  // Enhanced status update functions
  const handleStatusUpdate = async (tenantId, statusType, newStatus) => {
    try {
      switch (statusType) {
        case 'rent':
          dispatch(updateRentStatus({ id: tenantId, rentStatus: newStatus }));
          break;
        case 'maintenance':
          dispatch(updateMaintenanceStatus({ id: tenantId, maintenanceStatus: newStatus }));
          break;
        case 'light':
          dispatch(updateLightBillStatus({ id: tenantId, lightBillStatus: newStatus }));
          break;
      }
      refresh();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Filter and utility functions
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setVerificationFilter('');
  };

  const handleMenuOpen = (event, tenant) => {
    setAnchorEl(event.currentTarget);
    setSelectedTenantForMenu(tenant);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTenantForMenu(null);
  };

  const handleViewDetails = (tenant) => {
    setSelectedTenantDetails(tenant);
    setDetailsDialog(true);
    handleMenuClose();
  };

  const handleContact = (tenant, method) => {
    if (method === 'phone' && tenant.phone) {
      window.open(`tel:${tenant.phone}`);
    } else if (method === 'email' && tenant.email) {
      window.open(`mailto:${tenant.email}`);
    }
    handleMenuClose();
  };

  // ================= EDIT =================
  const handleEditOpen = (tenant) => {
    setSelectedTenant({
      _id: tenant._id,
      name: tenant.name || '',
      email: tenant.email || '',
      phone: tenant.phone || '',
      isVerified: tenant.isVerified || false
    });
    setOpenEdit(true);
  };

  const handleEditClose = () => {
    setOpenEdit(false);
    setSelectedTenant(null);
  };

  const handleUpdate = async () => {
    console.log('Updating tenant:', selectedTenant);
    dispatch(
      updateTenant({
        tenantId: selectedTenant._id,
        tenantData: {
          name: selectedTenant.name,
          email: selectedTenant.email,
          phone: selectedTenant.phone,
          isVerified: selectedTenant.isVerified
        }
      })
    );
    handleEditClose();
    refresh();
  };

  if (loading && tenants.length === 0) {
    return (
      <ResponsivePageLayout>
        <Box sx={{ p: 4 }}>
          <Stack spacing={2}>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            ))}
          </Stack>
        </Box>
      </ResponsivePageLayout>
    );
  }

  return (
    <ResponsivePageLayout>
      {/* Enhanced Header with Statistics */}
      <ResponsiveSection>
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
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
                Tenant Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                Comprehensive tenant management with detailed insights and analytics
              </Typography>
              
              {/* Quick Stats */}
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Tenants</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="success.light">{stats.active}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Active</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="warning.light">{stats.verified}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Verified</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="info.light">{stats.rentPaid}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Rent Paid</Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Progress Indicators */}
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6}>
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
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Verification Rate
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {stats.verificationRate}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={stats.verificationRate}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: stats.verificationRate >= 80 ? 'success.light' : stats.verificationRate >= 60 ? 'warning.light' : 'error.light',
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
              onClick={() => navigate('/properties')}
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
              Add Tenant
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
                Search & Filter Tenants
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
                {(searchTerm || statusFilter || verificationFilter) && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={clearFilters}
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
              label="Search tenants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="Search by name, email, phone, or property location..."
              sx={{ mb: showFilters ? 2 : 0 }}
            />

            {/* Collapsible Filters */}
            <Collapse in={showFilters}>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="active">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CheckCircleIcon fontSize="small" color="success" />
                        <span>Active Tenants</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="inactive">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CancelIcon fontSize="small" color="error" />
                        <span>Inactive Tenants</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="rent-paid">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PaymentIcon fontSize="small" color="success" />
                        <span>Rent Paid</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="rent-pending">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <WarningIcon fontSize="small" color="warning" />
                        <span>Rent Pending</span>
                      </Stack>
                    </MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    label="Verification"
                    value={verificationFilter}
                    onChange={(e) => setVerificationFilter(e.target.value)}
                  >
                    <MenuItem value="">All Verification</MenuItem>
                    <MenuItem value="verified">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <VerifiedIcon fontSize="small" color="primary" />
                        <span>Verified</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="unverified">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <WarningIcon fontSize="small" color="warning" />
                        <span>Unverified</span>
                      </Stack>
                    </MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    label="Sort By"
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field);
                      setSortOrder(order);
                    }}
                  >
                    <MenuItem value="name-asc">Name (A-Z)</MenuItem>
                    <MenuItem value="name-desc">Name (Z-A)</MenuItem>
                    <MenuItem value="score-desc">Score (High-Low)</MenuItem>
                    <MenuItem value="score-asc">Score (Low-High)</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Collapse>

            {/* Active Filters Display */}
            {(searchTerm || statusFilter || verificationFilter) && (
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Active Filters ({filteredAndSortedTenants.length} results):
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
                  {statusFilter && (
                    <Chip
                      label={`Status: ${statusFilter}`}
                      onDelete={() => setStatusFilter('')}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {verificationFilter && (
                    <Chip
                      label={`Verification: ${verificationFilter}`}
                      onDelete={() => setVerificationFilter('')}
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

      <ResponsiveSection>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        ) : filteredAndSortedTenants.length === 0 ? (
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
            <PersonIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom color="text.secondary">
              No tenants found
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              {searchTerm || statusFilter || verificationFilter
                ? 'Try adjusting your search criteria or filters'
                : 'Start by adding your first tenant to manage properties effectively'}
            </Typography>
            {!(searchTerm || statusFilter || verificationFilter) && (
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => navigate('/properties')}
                sx={{ mt: 2 }}
              >
                Add First Tenant
              </Button>
            )}
          </Paper>
        ) : (
          <ResponsiveCardGrid cardSize="medium">
            {filteredAndSortedTenants.map((tenant) => (
              <Fade key={tenant._id} in timeout={300}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'visible',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  {/* Tenant Score Badge */}
                  <Badge
                    badgeContent={`${getTenantScore(tenant)}%`}
                    color={getTenantScore(tenant) >= 75 ? 'success' : getTenantScore(tenant) >= 50 ? 'warning' : 'error'}
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      zIndex: 1,
                      '& .MuiBadge-badge': {
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        minWidth: '40px',
                        height: '20px',
                      },
                    }}
                  />

                  <CardContent sx={{ flex: 1, pb: 1 }}>
                    {/* Header with Avatar and Basic Info */}
                    <Stack direction="row" spacing={2} alignItems="flex-start" mb={2}>
                      <Avatar
                        src={tenant.photo || ''}
                        alt={tenant.name}
                        sx={{
                          width: 64,
                          height: 64,
                          border: '3px solid',
                          borderColor: tenant.isVerified ? 'success.main' : 'grey.300',
                        }}
                      >
                        {tenant.name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                          <Typography variant="h6" noWrap fontWeight="bold">
                            {tenant.name}
                          </Typography>
                          {tenant.isVerified && (
                            <Tooltip title="Verified Tenant">
                              <VerifiedIcon color="primary" fontSize="small" />
                            </Tooltip>
                          )}
                        </Stack>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {tenant.propertyId
                            ? `${tenant.propertyId.propertyType?.toUpperCase()} - ${tenant.propertyId.location}`
                            : 'No property assigned'}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Contact Information */}
                    <Stack spacing={1} mb={2}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {tenant.phone || 'No phone'}
                        </Typography>
                        {tenant.phone && (
                          <Tooltip title="Call">
                            <IconButton
                              size="small"
                              onClick={() => window.open(`tel:${tenant.phone}`)}
                              sx={{ p: 0.5 }}
                            >
                              <CallIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ flex: 1 }} noWrap>
                          {tenant.email || 'No email'}
                        </Typography>
                        {tenant.email && (
                          <Tooltip title="Email">
                            <IconButton
                              size="small"
                              onClick={() => window.open(`mailto:${tenant.email}`)}
                              sx={{ p: 0.5 }}
                            >
                              <MessageIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    {/* Property and Financial Info */}
                    {tenant.propertyId && (
                      <Stack spacing={1} mb={2}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <HomeIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            <strong>Rent:</strong> {formatCurrency(tenant.propertyId.monthlyRent)}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CalendarIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            <strong>Last Paid:</strong> {formatDate(tenant.rentLastPaid)}
                          </Typography>
                        </Stack>
                      </Stack>
                    )}

                    {/* Status Chips */}
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={2}>
                      <Chip
                        label={tenant.propertyId ? 'Active' : 'Inactive'}
                        color={tenant.propertyId ? 'success' : 'default'}
                        size="small"
                        icon={tenant.propertyId ? <CheckCircleIcon /> : <CancelIcon />}
                      />
                      <Chip
                        label={tenant.isVerified ? 'Verified' : 'Unverified'}
                        color={tenant.isVerified ? 'primary' : 'default'}
                        size="small"
                        icon={tenant.isVerified ? <VerifiedIcon /> : <WarningIcon />}
                      />
                      {tenant.rentStatus && (
                        <Chip
                          {...getStatusChipProps(tenant.rentStatus)}
                          label={`Rent: ${tenant.rentStatus}`}
                          size="small"
                        />
                      )}
                    </Stack>

                    {/* Documents and Additional Info */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        {tenant.documents?.length || 0} Documents
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Score: {getTenantScore(tenant)}%
                      </Typography>
                    </Stack>
                  </CardContent>

                  {/* Action Buttons */}
                  <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                    <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(tenant)}
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' },
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Edit Tenant">
                        <IconButton
                          size="small"
                          onClick={() => handleEditOpen(tenant)}
                          sx={{
                            bgcolor: 'info.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'info.dark' },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Box sx={{ flex: 1 }} />

                      <Tooltip title="More Actions">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, tenant)}
                          sx={{
                            bgcolor: 'grey.100',
                            '&:hover': { bgcolor: 'grey.200' },
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete Tenant">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(tenant._id)}
                          sx={{
                            bgcolor: 'error.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'error.dark' },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </CardActions>
                </Card>
              </Fade>
            ))}
          </ResponsiveCardGrid>
        )}
      </ResponsiveSection>

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
                Showing {((page - 1) * rowsPerPage) + 1} to {Math.min(page * rowsPerPage, pagination.total || 0)} of {pagination.total || 0} tenants
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

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 200,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
            },
          },
        }}
      >
        <MenuItem onClick={() => handleViewDetails(selectedTenantForMenu)}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleContact(selectedTenantForMenu, 'phone')}>
          <ListItemIcon>
            <ContactPhoneIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Call Tenant</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleContact(selectedTenantForMenu, 'email')}>
          <ListItemIcon>
            <MessageIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Send Email</ListItemText>
        </MenuItem>
        
        <Divider />
        
        {selectedTenantForMenu?.propertyId && (
          <>
            <MenuItem onClick={() => handleStatusUpdate(selectedTenantForMenu._id, 'rent', 'paid')}>
              <ListItemIcon>
                <CheckCircleIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText>Mark Rent Paid</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={() => handleStatusUpdate(selectedTenantForMenu._id, 'rent', 'pending')}>
              <ListItemIcon>
                <WarningIcon fontSize="small" color="warning" />
              </ListItemIcon>
              <ListItemText>Mark Rent Pending</ListItemText>
            </MenuItem>
            
            <Divider />
          </>
        )}
        
        <MenuItem 
          onClick={() => {
            handleEditOpen(selectedTenantForMenu);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Tenant</ListItemText>
        </MenuItem>
      </Menu>

      {/* Tenant Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={() => setDetailsDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              src={selectedTenantDetails?.photo || ''}
              alt={selectedTenantDetails?.name}
              sx={{ width: 56, height: 56 }}
            >
              {selectedTenantDetails?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {selectedTenantDetails?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tenant Details & Information
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                  Personal Information
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <PersonIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Name</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedTenantDetails?.name || 'Not provided'}
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <PhoneIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedTenantDetails?.phone || 'Not provided'}
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <EmailIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedTenantDetails?.email || 'Not provided'}
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <VerifiedIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Verification Status</Typography>
                      <Chip
                        label={selectedTenantDetails?.isVerified ? 'Verified' : 'Unverified'}
                        color={selectedTenantDetails?.isVerified ? 'success' : 'warning'}
                        size="small"
                        icon={selectedTenantDetails?.isVerified ? <CheckCircleIcon /> : <WarningIcon />}
                      />
                    </Box>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

            {/* Property Information */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                  Property Information
                </Typography>
                {selectedTenantDetails?.propertyId ? (
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <BusinessIcon color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Property Type</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedTenantDetails.propertyId.propertyType?.toUpperCase()}
                        </Typography>
                      </Box>
                    </Stack>
                    
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <LocationIcon color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Location</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedTenantDetails.propertyId.location}
                        </Typography>
                      </Box>
                    </Stack>
                    
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <AccountBalanceIcon color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Monthly Rent</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatCurrency(selectedTenantDetails.propertyId.monthlyRent)}
                        </Typography>
                      </Box>
                    </Stack>
                    
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <CalendarIcon color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Last Rent Paid</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatDate(selectedTenantDetails.rentLastPaid)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                ) : (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No property assigned to this tenant
                  </Alert>
                )}
              </Paper>
            </Grid>

            {/* Status Information */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                  Status & Documents
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Current Status
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        label={selectedTenantDetails?.propertyId ? 'Active Tenant' : 'Inactive'}
                        color={selectedTenantDetails?.propertyId ? 'success' : 'default'}
                        icon={selectedTenantDetails?.propertyId ? <CheckCircleIcon /> : <CancelIcon />}
                      />
                      {selectedTenantDetails?.rentStatus && (
                        <Chip
                          {...getStatusChipProps(selectedTenantDetails.rentStatus)}
                          label={`Rent: ${selectedTenantDetails.rentStatus}`}
                        />
                      )}
                    </Stack>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Documents & Score
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body1">
                        Documents: {selectedTenantDetails?.documents?.length || 0}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body1">
                          Tenant Score: {getTenantScore(selectedTenantDetails || {})}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={getTenantScore(selectedTenantDetails || {})}
                          sx={{ flex: 1, height: 8, borderRadius: 4 }}
                          color={
                            getTenantScore(selectedTenantDetails || {}) >= 75 
                              ? 'success' 
                              : getTenantScore(selectedTenantDetails || {}) >= 50 
                                ? 'warning' 
                                : 'error'
                          }
                        />
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDetailsDialog(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => {
              handleEditOpen(selectedTenantDetails);
              setDetailsDialog(false);
            }}
          >
            Edit Tenant
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= EDIT TENANT MODAL ================= */}
      <Dialog open={openEdit} onClose={handleEditClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            Edit Tenant Information
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Update tenant details and verification status
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Paper elevation={0} sx={{ p: 3, mt: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <ResponsiveFormGrid columns={{ xs: 1, sm: 1 }} sx={{ gap: 3 }}>
              <TextField
                label="Full Name"
                fullWidth
                value={selectedTenant?.name || ''}
                onChange={(e) =>
                  setSelectedTenant({ ...selectedTenant, name: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
                required
              />

              <TextField
                label="Email Address"
                fullWidth
                type="email"
                value={selectedTenant?.email || ''}
                onChange={(e) =>
                  setSelectedTenant({ ...selectedTenant, email: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Phone Number"
                fullWidth
                value={selectedTenant?.phone || ''}
                onChange={(e) =>
                  setSelectedTenant({ ...selectedTenant, phone: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
                required
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={selectedTenant?.isVerified || false}
                    onChange={(e) =>
                      setSelectedTenant({
                        ...selectedTenant,
                        isVerified: e.target.checked
                      })
                    }
                    color="primary"
                  />
                }
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <VerifiedIcon color={selectedTenant?.isVerified ? 'primary' : 'disabled'} />
                    <Typography>
                      {selectedTenant?.isVerified ? 'Verified Tenant' : 'Unverified Tenant'}
                    </Typography>
                  </Stack>
                }
              />
            </ResponsiveFormGrid>
          </Paper>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={handleEditClose} size="large">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdate}
            disabled={
              !selectedTenant?.name ||
              !selectedTenant?.phone
            }
            size="large"
            startIcon={<EditIcon />}
          >
            Update Tenant
          </Button>
        </DialogActions>
      </Dialog>
    </ResponsivePageLayout>
  );
}

export default Tenants;

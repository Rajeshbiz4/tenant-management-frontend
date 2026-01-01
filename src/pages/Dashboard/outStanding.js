import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Grid,
  MenuItem,
  Card,
  CardContent,
  Stack,
  Avatar,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Collapse,
  InputAdornment,
  Divider,
  Alert,
  Fade,
  Grow,
  LinearProgress,
  Badge,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Phone as PhoneIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { fetchProperties } from '../../store/slices/propertySlice';
import { getPayments } from '../../store/slices/paymentSlice';
import ResponsivePageLayout, { 
  ResponsiveCardGrid,
  ResponsiveFormGrid,
  ResponsiveSection,
  ResponsiveGrid,
  ResponsiveGridItem
} from '../../components/Layout/ResponsivePageLayout';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function OutstandingPaymentsPage() {
  const dispatch = useDispatch();

  const { properties } = useSelector((state) => state.property);
  const { payments } = useSelector((state) => state.payment);

  const year = new Date().getFullYear();
  const currentMonth = monthNames[new Date().getMonth()];

  const [filters, setFilters] = useState({
    tenant: '',
    flat: '',
    month: currentMonth,
    search: '',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    dispatch(fetchProperties({ page: 1, limit: 100 }))
      .finally(() => setLoading(false));
  }, [dispatch]);

  useEffect(() => {
    // Only fetch payments if we have properties and haven't fetched yet
    if (properties.length > 0) {
      // Fetch payments for all properties at once (if backend supports it)
      // Otherwise, fetch only when a specific property is selected
      const propertyIds = properties.map(p => p._id);
      if (propertyIds.length > 0) {
        // Fetch payments for the first property as a sample, or implement batch fetching
        // For now, we'll only fetch when filters are applied to avoid multiple calls
        if (filters.flat) {
          dispatch(getPayments({ propertyId: filters.flat, year }));
        }
      }
    }
  }, [dispatch, filters.flat, year, properties.length]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({
      tenant: '',
      flat: '',
      month: currentMonth,
      search: '',
    });
  };

  const tenantOptions = useMemo(() => {
    return properties
      .filter((p) => p?.tenant)
      .map((p) => ({
        id: p.tenant._id,
        name: p.tenant.name,
      }));
  }, [properties]);

  const flatOptions = useMemo(() => {
    return properties.map((p) => ({
      id: p._id,
      name: p.shopName,
    }));
  }, [properties]);

  const outstandingRows = useMemo(() => {
    const rows = [];

    properties.forEach((property) => {
      if (!property?.tenant) return;
      const tenant = property.tenant;

      const rentDue = property.rent?.amount || 0;
      const maintenanceDue = property.rent?.maintenance || 0;
      const lightDue =
        (property.electricity?.lastUnit || 0) *
        (property.electricity?.unitRate || 0);
      const advanceDue = property.advance?.amount || 0;

      monthNames.forEach((month, index) => {
        const monthNumber = index + 1;

        const paymentsInMonth = payments.filter(
          (p) =>
            p.propertyId === property._id &&
            p.month === monthNumber &&
            p.year === year
        );

        const paid = (type) =>
          paymentsInMonth
            .filter((p) => p.type === type)
            .reduce((sum, p) => sum + p.amount, 0);

        const rentPending = Math.max(rentDue - paid('rent'), 0);
        const maintenancePending = Math.max(maintenanceDue - paid('maintenance'), 0);
        const lightPending = Math.max(lightDue - paid('light'), 0);
        const advancePending = Math.max(advanceDue - paid('advance'), 0);

        const totalOutstanding = rentPending + maintenancePending + lightPending + advancePending;

        if (totalOutstanding > 0) {
          rows.push({
            flatId: property._id,
            flat: property.shopName,
            tenantId: tenant._id,
            tenant: tenant.name,
            tenantPhone: tenant.phone,
            month,
            rentPending,
            maintenancePending,
            lightPending,
            advancePending,
            totalOutstanding,
          });
        }
      });
    });

    return rows;
  }, [properties, payments, year]);

  const filteredRows = outstandingRows.filter((row) => {
    const matchesSearch = !filters.search || 
      row.tenant.toLowerCase().includes(filters.search.toLowerCase()) ||
      row.flat.toLowerCase().includes(filters.search.toLowerCase());
    
    return (
      matchesSearch &&
      (!filters.tenant || row.tenantId === filters.tenant) &&
      (!filters.flat || row.flatId === filters.flat) &&
      (!filters.month || row.month === filters.month)
    );
  });

  const totalOutstanding = filteredRows.reduce((sum, row) => sum + row.totalOutstanding, 0);
  const totalProperties = new Set(filteredRows.map(row => row.flatId)).size;
  const totalTenants = new Set(filteredRows.map(row => row.tenantId)).size;

  const currency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

  return (
    <Box>
      {/* Enhanced Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
          color: 'white',
          p: { xs: 2, sm: 3 },
          borderRadius: '12px 12px 0 0',
        }}
      >
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
              <WarningIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Outstanding Payments
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Track pending payments across all properties
              </Typography>
            </Box>
          </Stack>
          
          {/* Summary Stats */}
          <Stack direction="row" spacing={3} alignItems="center">
            <Box textAlign="center">
              <Typography variant="h6" fontWeight="bold">
                {currency(totalOutstanding)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Outstanding
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h6" fontWeight="bold">
                {filteredRows.length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Pending Items
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Box>

      {/* Enhanced Filters */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderTop: 'none' }}>
        <Box sx={{ p: { xs: 2, sm: 3 }, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="600">
              Filter Outstanding Payments
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
              {(filters.tenant || filters.flat || filters.month !== currentMonth || filters.search) && (
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

          <Collapse in={showFilters}>
            <ResponsiveFormGrid>
              <ResponsiveGridItem xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Search"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search tenant or property..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </ResponsiveGridItem>

              <ResponsiveGridItem xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Tenant"
                  name="tenant"
                  value={filters.tenant}
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All Tenants</MenuItem>
                  {tenantOptions.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.name}
                    </MenuItem>
                  ))}
                </TextField>
              </ResponsiveGridItem>

              <ResponsiveGridItem xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Property"
                  name="flat"
                  value={filters.flat}
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All Properties</MenuItem>
                  {flatOptions.map((f) => (
                    <MenuItem key={f.id} value={f.id}>
                      {f.name}
                    </MenuItem>
                  ))}
                </TextField>
              </ResponsiveGridItem>

              <ResponsiveGridItem xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Month"
                  name="month"
                  value={filters.month}
                  onChange={handleFilterChange}
                >
                  {monthNames.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </TextField>
              </ResponsiveGridItem>
            </ResponsiveFormGrid>
          </Collapse>
        </Box>

        {/* Outstanding Payments Cards */}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {loading && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
            </Box>
          )}

          {filteredRows.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                px: 3,
              }}
            >
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'success.100',
                  color: 'success.main',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <CheckCircleIcon fontSize="large" />
              </Avatar>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                No Outstanding Payments! 🎉
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                {filters.search || filters.tenant || filters.flat || filters.month !== currentMonth
                  ? 'No payments match your current filters.'
                  : 'All payments are up to date.'}
              </Typography>
              {(filters.search || filters.tenant || filters.flat || filters.month !== currentMonth) && (
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </Box>
          ) : (
            <ResponsiveCardGrid cardSize="medium">
              {filteredRows.map((row, index) => (
                <Grow in timeout={400 + index * 100} key={`${row.flatId}-${row.month}`}>
                  <Card
                    elevation={0}
                    sx={{
                      border: '2px solid',
                      borderColor: 'error.main',
                      borderRadius: 3,
                      bgcolor: 'error.50',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      {/* Card Header */}
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box>
                          <Typography variant="h6" fontWeight="bold" gutterBottom>
                            {row.flat}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                            <PersonIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {row.tenant}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CalendarIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {row.month} {year}
                            </Typography>
                          </Stack>
                        </Box>
                        <Chip
                          label="Outstanding"
                          color="error"
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Stack>

                      {/* Payment Breakdown */}
                      <Box
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.8)',
                          borderRadius: 2,
                          p: 2,
                          mb: 2,
                        }}
                      >
                        <Typography variant="body2" fontWeight="600" color="text.secondary" mb={2}>
                          Payment Breakdown
                        </Typography>
                        <ResponsiveGrid spacing={1}>
                          {row.rentPending > 0 && (
                            <ResponsiveGridItem xs={6}>
                              <Stack spacing={0.5}>
                                <Typography variant="body2" color="primary.main" fontWeight="500">
                                  Rent
                                </Typography>
                                <Typography variant="body1" fontWeight="bold" color="primary.main">
                                  {currency(row.rentPending)}
                                </Typography>
                              </Stack>
                            </ResponsiveGridItem>
                          )}
                          {row.maintenancePending > 0 && (
                            <ResponsiveGridItem xs={6}>
                              <Stack spacing={0.5}>
                                <Typography variant="body2" color="warning.main" fontWeight="500">
                                  Maintenance
                                </Typography>
                                <Typography variant="body1" fontWeight="bold" color="warning.main">
                                  {currency(row.maintenancePending)}
                                </Typography>
                              </Stack>
                            </ResponsiveGridItem>
                          )}
                          {row.lightPending > 0 && (
                            <ResponsiveGridItem xs={6}>
                              <Stack spacing={0.5}>
                                <Typography variant="body2" color="info.main" fontWeight="500">
                                  Light Bill
                                </Typography>
                                <Typography variant="body1" fontWeight="bold" color="info.main">
                                  {currency(row.lightPending)}
                                </Typography>
                              </Stack>
                            </ResponsiveGridItem>
                          )}
                          {row.advancePending > 0 && (
                            <ResponsiveGridItem xs={6}>
                              <Stack spacing={0.5}>
                                <Typography variant="body2" color="success.main" fontWeight="500">
                                  Advance
                                </Typography>
                                <Typography variant="body1" fontWeight="bold" color="success.main">
                                  {currency(row.advancePending)}
                                </Typography>
                              </Stack>
                            </ResponsiveGridItem>
                          )}
                        </ResponsiveGrid>
                      </Box>

                      {/* Total Outstanding */}
                      <Box
                        sx={{
                          textAlign: 'center',
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'error.100',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" mb={0.5}>
                          Total Outstanding
                        </Typography>
                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          color="error.main"
                        >
                          {currency(row.totalOutstanding)}
                        </Typography>
                      </Box>
                    </CardContent>

                    {/* Card Actions */}
                    <Box sx={{ px: 3, pb: 3 }}>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<PaymentIcon />}
                          sx={{ flex: 1 }}
                          color="error"
                        >
                          Record Payment
                        </Button>
                        {row.tenantPhone && (
                          <Tooltip title={`Call ${row.tenant}`}>
                            <IconButton
                              size="small"
                              sx={{
                                bgcolor: 'primary.50',
                                color: 'primary.main',
                                '&:hover': { bgcolor: 'primary.100' },
                              }}
                              onClick={() => window.open(`tel:${row.tenantPhone}`)}
                            >
                              <PhoneIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </Box>
                  </Card>
                </Grow>
              ))}
            </ResponsiveCardGrid>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default OutstandingPaymentsPage;

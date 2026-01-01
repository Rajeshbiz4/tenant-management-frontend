import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Divider,
  Button,
  Chip,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress,
  Grid,
  Badge,
  Fade,
  Grow,
  TableContainer,
  TableSortLabel,
  TablePagination,
  InputAdornment,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Skeleton
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  DateRange as DateRangeIcon,
  Analytics as AnalyticsIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { fetchProperties } from '../../store/slices/propertySlice';
import { getPayments, clearPayments } from '../../store/slices/paymentSlice';
import ResponsivePageLayout, { 
  ResponsiveHeader, 
  ResponsiveFilters,
  ResponsiveSection,
  ResponsiveFormGrid
} from '../../components/Layout/ResponsivePageLayout';

const monthNames = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// Enhanced color coding for payment types
const PAYMENT_TYPES = {
  rent: { 
    bg: '#E3F2FD', 
    text: '#1565C0', 
    icon: <HomeIcon />,
    label: 'Rent Payment',
    color: 'primary'
  },
  maintenance: { 
    bg: '#FFF3E0', 
    text: '#EF6C00',
    icon: <ReceiptIcon />,
    label: 'Maintenance',
    color: 'warning'
  },
  light: { 
    bg: '#FFFDE7', 
    text: '#F9A825',
    icon: <ReceiptIcon />,
    label: 'Electricity Bill',
    color: 'info'
  },
  advance: { 
    bg: '#E8F5E9', 
    text: '#2E7D32',
    icon: <AccountBalanceIcon />,
    label: 'Advance Payment',
    color: 'success'
  },
};

// Helper functions
const formatCurrency = (amount) => `₹${amount?.toLocaleString('en-IN') || 0}`;
const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
});
const formatMonth = (monthIndex) => monthNames[monthIndex - 1] || 'N/A';

function PaymentHistoryPage() {
  const dispatch = useDispatch();
  const { properties } = useSelector((state) => state.property);
  const { payments, loading } = useSelector((state) => state.payment);

  // Enhanced state management
  const [propertyId, setPropertyId] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('paidOn');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showAnalytics, setShowAnalytics] = useState(true);

  // Fetch properties on load
  useEffect(() => {
    dispatch(fetchProperties({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Clear payments when component mounts if user has no properties
  useEffect(() => {
    if (properties.length === 0) {
      dispatch(clearPayments());
    }
  }, [dispatch, properties.length]);

  // Fetch payments when property, tenant, or year changes
  useEffect(() => {
    if (propertyId && properties.length > 0) {
      dispatch(getPayments({ propertyId, year }));
    } else {
      // Clear payments if no property selected or no properties
      dispatch(clearPayments());
    }
  }, [dispatch, propertyId, year, properties.length]);

  // Utility functions
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setPropertyId('');
    setTenantId('');
    setMonth('');
    setPaymentType('');
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
    setPage(0);
  };

  const exportData = () => {
    // Simple CSV export functionality
    const headers = ['Date', 'Month', 'Type', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedPayments.map(p => [
        formatDate(p.paidOn),
        formatMonth(p.month),
        p.type,
        p.amount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get tenants for selected property
  const tenants = propertyId
    ? [properties.find((p) => p._id === propertyId)?.tenant].filter(Boolean)
    : [];

  // Enhanced filtering and sorting logic
  const filteredAndSortedPayments = useMemo(() => {
    let filtered = payments
      .filter((p) => (!tenantId || p.tenantId === tenantId))
      .filter((p) => (!month || p.month === Number(month)))
      .filter((p) => (!paymentType || p.type === paymentType))
      .filter((p) => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
          p.type.toLowerCase().includes(searchLower) ||
          formatCurrency(p.amount).toLowerCase().includes(searchLower) ||
          formatDate(p.paidOn).toLowerCase().includes(searchLower)
        );
      })
      .filter((p) => {
        if (dateRange.start && dateRange.end) {
          const paymentDate = new Date(p.paidOn);
          const startDate = new Date(dateRange.start);
          const endDate = new Date(dateRange.end);
          return paymentDate >= startDate && paymentDate <= endDate;
        }
        return true;
      });

    // Sort payments
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'paidOn') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [payments, tenantId, month, paymentType, searchTerm, dateRange, sortBy, sortOrder]);

  // Enhanced analytics calculations
  const analytics = useMemo(() => {
    const totals = filteredAndSortedPayments.reduce(
      (acc, p) => {
        acc[p.type] = (acc[p.type] || 0) + p.amount;
        acc.total += p.amount;
        acc.count++;
        return acc;
      },
      { rent: 0, maintenance: 0, light: 0, advance: 0, total: 0, count: 0 }
    );

    // Calculate monthly trends
    const monthlyData = {};
    filteredAndSortedPayments.forEach(p => {
      const monthKey = `${p.year}-${p.month}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, count: 0, types: {} };
      }
      monthlyData[monthKey].total += p.amount;
      monthlyData[monthKey].count++;
      monthlyData[monthKey].types[p.type] = (monthlyData[monthKey].types[p.type] || 0) + p.amount;
    });

    // Calculate average payment
    const avgPayment = totals.count > 0 ? totals.total / totals.count : 0;

    // Calculate payment type distribution
    const typeDistribution = Object.keys(PAYMENT_TYPES).map(type => ({
      type,
      amount: totals[type],
      percentage: totals.total > 0 ? ((totals[type] / totals.total) * 100).toFixed(1) : 0,
      count: filteredAndSortedPayments.filter(p => p.type === type).length
    }));

    return {
      totals,
      monthlyData,
      avgPayment,
      typeDistribution,
      recentPayments: filteredAndSortedPayments.slice(0, 5)
    };
  }, [filteredAndSortedPayments]);

  // Pagination
  const paginatedPayments = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredAndSortedPayments.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAndSortedPayments, page, rowsPerPage]);

  return (
    <ResponsivePageLayout>
      {/* Enhanced Header with Analytics Toggle */}
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
                Payment History & Analytics
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                Comprehensive payment tracking with detailed insights and analytics
              </Typography>
              
              {/* Quick Stats */}
              {properties.length > 0 && propertyId && (
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" fontWeight="bold">{analytics.totals.count}</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Payments</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" fontWeight="bold">{formatCurrency(analytics.totals.total)}</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Amount</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" fontWeight="bold">{formatCurrency(analytics.avgPayment)}</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>Average Payment</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" fontWeight="bold">{analytics.typeDistribution.length}</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>Payment Types</Typography>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </Box>
            
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={exportData}
                disabled={!filteredAndSortedPayments.length}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' },
                }}
              >
                Export
              </Button>
              <FormControlLabel
                control={
                  <Switch
                    checked={showAnalytics}
                    onChange={(e) => setShowAnalytics(e.target.checked)}
                    sx={{ 
                      '& .MuiSwitch-thumb': { bgcolor: 'white' },
                      '& .MuiSwitch-track': { bgcolor: 'rgba(255, 255, 255, 0.3)' }
                    }}
                  />
                }
                label="Analytics"
                sx={{ color: 'white', m: 0 }}
              />
            </Stack>
          </Stack>
        </Paper>
      </ResponsiveSection>

      {/* No Properties State */}
      {properties.length === 0 && (
        <ResponsiveSection>
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
              You need to add properties first before you can view payment history.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => window.location.href = '/properties'}
            >
              Add Your First Property
            </Button>
          </Paper>
        </ResponsiveSection>
      )}

      {/* Enhanced Filters */}
      {properties.length > 0 && (
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
                  {(propertyId || tenantId || month || paymentType || searchTerm || dateRange.start) && (
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
                label="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: showFilters ? 2 : 0 }}
              />

              {/* Collapsible Filters */}
              <Collapse in={showFilters}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      select
                      fullWidth
                      label="Property"
                      value={propertyId}
                      onChange={(e) => {
                        setPropertyId(e.target.value);
                        setTenantId('');
                        setPage(0);
                      }}
                    >
                      <MenuItem value="">All Properties</MenuItem>
                      {properties.map((p) => (
                        <MenuItem key={p._id} value={p._id}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <HomeIcon fontSize="small" />
                            <span>{p.shopName} - {p.location}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      select
                      fullWidth
                      label="Tenant"
                      value={tenantId}
                      onChange={(e) => { setTenantId(e.target.value); setPage(0); }}
                      disabled={!tenants.length}
                    >
                      <MenuItem value="">All Tenants</MenuItem>
                      {tenants.map((t) => (
                        <MenuItem key={t._id} value={t._id}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <PersonIcon fontSize="small" />
                            <span>{t.name}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      select
                      fullWidth
                      label="Year"
                      value={year}
                      onChange={(e) => { setYear(Number(e.target.value)); setPage(0); }}
                    >
                      {[year - 2, year - 1, year, year + 1].map((y) => (
                        <MenuItem key={y} value={y}>
                          {y}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      select
                      fullWidth
                      label="Month"
                      value={month}
                      onChange={(e) => { setMonth(e.target.value); setPage(0); }}
                    >
                      <MenuItem value="">All Months</MenuItem>
                      {monthNames.map((m, i) => (
                        <MenuItem key={m} value={i + 1}>
                          {m}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      select
                      fullWidth
                      label="Payment Type"
                      value={paymentType}
                      onChange={(e) => { setPaymentType(e.target.value); setPage(0); }}
                    >
                      <MenuItem value="">All Types</MenuItem>
                      {Object.entries(PAYMENT_TYPES).map(([key, type]) => (
                        <MenuItem key={key} value={key}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            {type.icon}
                            <span>{type.label}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>

                {/* Date Range Picker */}
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: <DateRangeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: <DateRangeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  </Grid>
                </Grid>
              </Collapse>

              {/* Active Filters Display */}
              {(propertyId || tenantId || month || paymentType || searchTerm || dateRange.start) && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Active Filters:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {propertyId && (
                      <Chip
                        label={`Property: ${properties.find(p => p._id === propertyId)?.shopName}`}
                        onDelete={() => { setPropertyId(''); setTenantId(''); }}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {tenantId && (
                      <Chip
                        label={`Tenant: ${tenants.find(t => t._id === tenantId)?.name}`}
                        onDelete={() => setTenantId('')}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {month && (
                      <Chip
                        label={`Month: ${monthNames[month - 1]}`}
                        onDelete={() => setMonth('')}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {paymentType && (
                      <Chip
                        label={`Type: ${PAYMENT_TYPES[paymentType]?.label}`}
                        onDelete={() => setPaymentType('')}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {searchTerm && (
                      <Chip
                        label={`Search: "${searchTerm}"`}
                        onDelete={() => setSearchTerm('')}
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
      )}

      {/* Enhanced Analytics Dashboard */}
      {properties.length > 0 && propertyId && showAnalytics && filteredAndSortedPayments.length > 0 && (
        <ResponsiveSection>
          <Grid container spacing={3}>
            {/* Payment Type Distribution */}
            <Grid item xs={12} md={8}>
              <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Box sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                    <PieChartIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      Payment Distribution
                    </Typography>
                  </Stack>
                  <Grid container spacing={2}>
                    {analytics.typeDistribution.map((item) => {
                      const typeConfig = PAYMENT_TYPES[item.type];
                      return (
                        <Grid item xs={6} sm={3} key={item.type}>
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              p: 2, 
                              textAlign: 'center',
                              bgcolor: typeConfig.bg,
                              border: '1px solid',
                              borderColor: `${item.type === 'rent' ? 'primary' : item.type === 'maintenance' ? 'warning' : item.type === 'light' ? 'info' : 'success'}.200`,
                              borderRadius: 2
                            }}
                          >
                            <Stack alignItems="center" spacing={1}>
                              <Avatar sx={{ bgcolor: typeConfig.text, width: 40, height: 40 }}>
                                {typeConfig.icon}
                              </Avatar>
                              <Typography variant="body2" fontWeight="bold" color={typeConfig.text}>
                                {typeConfig.label}
                              </Typography>
                              <Typography variant="h6" fontWeight="bold" color={typeConfig.text}>
                                {formatCurrency(item.amount)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.percentage}% • {item.count} payments
                              </Typography>
                            </Stack>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              </Paper>
            </Grid>

            {/* Recent Payments Summary */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Box sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                    <TimelineIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      Recent Payments
                    </Typography>
                  </Stack>
                  <List dense>
                    {analytics.recentPayments.map((payment, index) => {
                      const typeConfig = PAYMENT_TYPES[payment.type];
                      return (
                        <ListItem key={payment._id} divider={index < analytics.recentPayments.length - 1}>
                          <ListItemIcon>
                            <Avatar sx={{ bgcolor: typeConfig.bg, color: typeConfig.text, width: 32, height: 32 }}>
                              {typeConfig.icon}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2" fontWeight="600">
                                {formatCurrency(payment.amount)}
                              </Typography>
                            }
                            secondary={
                              <Stack>
                                <Typography variant="caption" color="text.secondary">
                                  {typeConfig.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(payment.paidOn)}
                                </Typography>
                              </Stack>
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </ResponsiveSection>
      )}

      {/* Enhanced Payment Table/Cards */}
      {properties.length > 0 && propertyId && (
        <ResponsiveSection>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            {/* Table Header with Controls */}
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight="bold">
                  Payment Records
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    {filteredAndSortedPayments.length} payments found
                  </Typography>
                  <Divider orientation="vertical" flexItem />
                  <Button
                    size="small"
                    variant={viewMode === 'table' ? 'contained' : 'outlined'}
                    onClick={() => setViewMode('table')}
                  >
                    Table
                  </Button>
                  <Button
                    size="small"
                    variant={viewMode === 'cards' ? 'contained' : 'outlined'}
                    onClick={() => setViewMode('cards')}
                  >
                    Cards
                  </Button>
                </Stack>
              </Stack>
            </Box>

            {loading ? (
              <Box sx={{ p: 4 }}>
                <Stack spacing={1}>
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} variant="rectangular" height={60} />
                  ))}
                </Stack>
              </Box>
            ) : filteredAndSortedPayments.length === 0 ? (
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Payment Records Found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {propertyId 
                    ? 'No payments match your current filters. Try adjusting your search criteria.'
                    : 'Select a property to view payment history.'
                  }
                </Typography>
              </Box>
            ) : viewMode === 'table' ? (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <TableSortLabel
                            active={sortBy === 'paidOn'}
                            direction={sortBy === 'paidOn' ? sortOrder : 'asc'}
                            onClick={() => handleSort('paidOn')}
                          >
                            Date
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={sortBy === 'month'}
                            direction={sortBy === 'month' ? sortOrder : 'asc'}
                            onClick={() => handleSort('month')}
                          >
                            Month
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={sortBy === 'type'}
                            direction={sortBy === 'type' ? sortOrder : 'asc'}
                            onClick={() => handleSort('type')}
                          >
                            Type
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">
                          <TableSortLabel
                            active={sortBy === 'amount'}
                            direction={sortBy === 'amount' ? sortOrder : 'asc'}
                            onClick={() => handleSort('amount')}
                          >
                            Amount
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedPayments.map((payment, index) => {
                        const typeConfig = PAYMENT_TYPES[payment.type];
                        return (
                          <Grow in timeout={300 + index * 50} key={payment._id}>
                            <TableRow 
                              hover
                              sx={{ 
                                backgroundColor: typeConfig.bg,
                                '&:hover': { 
                                  backgroundColor: `${typeConfig.bg}dd`,
                                  transform: 'scale(1.01)',
                                  transition: 'all 0.2s ease'
                                }
                              }}
                            >
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                  <Avatar sx={{ bgcolor: typeConfig.text, width: 32, height: 32 }}>
                                    {typeConfig.icon}
                                  </Avatar>
                                  <Typography variant="body2" fontWeight="600">
                                    {formatDate(payment.paidOn)}
                                  </Typography>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={formatMonth(payment.month)}
                                  size="small"
                                  sx={{ bgcolor: 'white', fontWeight: 600 }}
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={typeConfig.label}
                                  color={typeConfig.color}
                                  size="small"
                                  icon={typeConfig.icon}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="h6" fontWeight="bold" color={typeConfig.text}>
                                  {formatCurrency(payment.amount)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Tooltip title="View Details">
                                  <IconButton size="small">
                                    <ViewIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          </Grow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Enhanced Pagination */}
                <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
                  <TablePagination
                    component="div"
                    count={filteredAndSortedPayments.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    showFirstButton
                    showLastButton
                  />
                </Box>
              </>
            ) : (
              /* Card View */
              <Box sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  {paginatedPayments.map((payment, index) => {
                    const typeConfig = PAYMENT_TYPES[payment.type];
                    return (
                      <Grid item xs={12} sm={6} md={4} key={payment._id}>
                        <Grow in timeout={300 + index * 100}>
                          <Card 
                            sx={{ 
                              border: '2px solid',
                              borderColor: typeConfig.text,
                              borderRadius: 2,
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 4,
                                transition: 'all 0.3s ease'
                              }
                            }}
                          >
                            <CardContent>
                              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                                <Avatar sx={{ bgcolor: typeConfig.text }}>
                                  {typeConfig.icon}
                                </Avatar>
                                <Box flex={1}>
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    {typeConfig.label}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {formatDate(payment.paidOn)}
                                  </Typography>
                                </Box>
                                <Typography variant="h6" fontWeight="bold" color={typeConfig.text}>
                                  {formatCurrency(payment.amount)}
                                </Typography>
                              </Stack>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Chip
                                  label={formatMonth(payment.month)}
                                  size="small"
                                  variant="outlined"
                                />
                                <IconButton size="small">
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grow>
                      </Grid>
                    );
                  })}
                </Grid>
                
                {/* Pagination for Card View */}
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                  <TablePagination
                    component="div"
                    count={filteredAndSortedPayments.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                    rowsPerPageOptions={[6, 12, 24]}
                    showFirstButton
                    showLastButton
                  />
                </Box>
              </Box>
            )}
          </Paper>
        </ResponsiveSection>
      )}

      {/* No Property Selected State */}
      {properties.length > 0 && !propertyId && (
        <ResponsiveSection>
          <Paper 
            elevation={0} 
            sx={{ 
              border: '2px dashed', 
              borderColor: 'primary.main', 
              borderRadius: 3,
              p: 6,
              textAlign: 'center',
              bgcolor: 'primary.50'
            }}
          >
            <AnalyticsIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom color="primary.dark">
              Select a Property to View Payment History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose a property from the filters above to see detailed payment records and analytics.
            </Typography>
          </Paper>
        </ResponsiveSection>
      )}
    </ResponsivePageLayout>
  );
}

export default PaymentHistoryPage;

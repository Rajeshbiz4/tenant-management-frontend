import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Stack,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Paper,
  Grid,
  LinearProgress,
  InputAdornment,
  Collapse,
  Button,
  Avatar,
  Alert,
  Fade
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalanceWallet as WalletIcon,
  Build as BuildIcon,
  PendingActions as PendingIcon,
  AttachMoney as MoneyIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { fetchAnalytics } from '../../store/slices/statsSlice';
import { fetchProperties } from '../../store/slices/propertySlice';
import ResponsivePageLayout, { 
  ResponsiveHeader, 
  ResponsiveFilters,
  ResponsiveStatsGrid,
  ResponsiveTwoColumn,
  ResponsiveSection
} from '../../components/Layout/ResponsivePageLayout';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function Analytics() {
  const dispatch = useDispatch();
  const { analytics, loading, error } = useSelector((state) => state.stats);
  const { properties } = useSelector((state) => state.property);

  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(''); // Empty for all-time data
  const [selectedMonth, setSelectedMonth] = useState(''); // Empty for all-time data
  const [selectedProperty, setSelectedProperty] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchProperties({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    const filters = {};
    if (selectedYear) filters.year = selectedYear;
    if (selectedMonth) filters.month = selectedMonth;
    if (selectedProperty) filters.propertyId = selectedProperty;
    
    dispatch(fetchAnalytics(filters));
  }, [dispatch, selectedYear, selectedMonth, selectedProperty]);

  const currency = (value = 0) => `₹${value.toLocaleString('en-IN')}`;

  if (loading && !analytics) {
    return (
      <ResponsivePageLayout>
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      </ResponsivePageLayout>
    );
  }

  if (error) {
    return (
      <ResponsivePageLayout>
        <Card>
          <CardContent>
            <Typography variant="h6" color="error" gutterBottom>
              Error Loading Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {error}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Please check:
              <br />• Backend server is running on port 8080
              <br />• You are logged in properly
              <br />• You have properties and data in the system
            </Typography>
          </CardContent>
        </Card>
      </ResponsivePageLayout>
    );
  }

  const earnings = analytics?.earnings || { total: 0, byType: {}, count: 0 };
  const spends = analytics?.spends || { total: 0, paid: 0, pending: 0, count: 0 };
  const pendingRent = analytics?.pendingRent || { total: 0, count: 0, details: [] };
  const netAmount = analytics?.netAmount || 0;
  const profitMargin = analytics?.profitMargin || 0;

  const summaryCards = [
    {
      title: 'Total Earnings',
      value: currency(earnings.total),
      helper: `${earnings.count} transactions`,
      icon: <TrendingUpIcon />,
      color: 'success.main',
      bgColor: 'success.light',
    },
    {
      title: 'Total Spends',
      value: currency(spends.total),
      helper: `${spends.count} maintenance records`,
      icon: <BuildIcon />,
      color: 'error.main',
      bgColor: 'error.light',
    },
    {
      title: 'Pending Rent',
      value: currency(pendingRent.total),
      helper: `${pendingRent.count} properties`,
      icon: <PendingIcon />,
      color: 'warning.main',
      bgColor: 'warning.light',
    },
    {
      title: 'Net Amount',
      value: currency(netAmount),
      helper: `${profitMargin}% profit margin`,
      icon: netAmount >= 0 ? <MoneyIcon /> : <TrendingDownIcon />,
      color: netAmount >= 0 ? 'primary.main' : 'error.main',
      bgColor: netAmount >= 0 ? 'primary.light' : 'error.light',
    },
  ];

  return (
    <ResponsivePageLayout>
      {/* Enhanced Header with Financial Overview */}
      <ResponsiveSection>
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
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
                Financial Analytics
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                Comprehensive financial insights and performance analytics for {
                  selectedYear && selectedMonth 
                    ? `${monthNames[selectedMonth - 1]} ${selectedYear}`
                    : selectedYear 
                    ? `Year ${selectedYear}`
                    : selectedMonth
                    ? `${monthNames[selectedMonth - 1]} (All Years)`
                    : 'All Time'
                }
              </Typography>
              
              {/* Quick Financial Stats */}
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold">{currency(earnings.total)}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Earnings</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="error.light">{currency(spends.total)}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Expenses</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color={netAmount >= 0 ? 'success.light' : 'error.light'}>
                      {currency(netAmount)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Net Profit</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="warning.light">{profitMargin}%</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Profit Margin</Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Progress Indicators */}
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Collection Efficiency
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {spends.total > 0 ? Math.round((spends.paid / spends.total) * 100) : 100}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={spends.total > 0 ? Math.round((spends.paid / spends.total) * 100) : 100}
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
                      Revenue Streams
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {earnings.count} Transactions
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
              startIcon={<RefreshIcon />}
              onClick={() => {
                const filters = {};
                if (selectedYear) filters.year = selectedYear;
                if (selectedMonth) filters.month = selectedMonth;
                if (selectedProperty) filters.propertyId = selectedProperty;
                dispatch(fetchAnalytics(filters));
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
              Refresh Data
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
                Analytics Filters & Controls
              </Typography>
            </Stack>

            {/* Basic filters */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="">All Years</MenuItem>
                  {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i).map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="">All Months</MenuItem>
                  {monthNames.map((month, index) => (
                    <MenuItem key={month} value={index + 1}>
                      {month}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Property (Optional)"
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                >
                  <MenuItem value="">All Properties</MenuItem>
                  {properties.map((property) => (
                    <MenuItem key={property._id} value={property._id}>
                      {property.shopName} - {property.shopNumber}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            {/* Status Messages */}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight="bold">Error Loading Analytics</Typography>
                <Typography variant="body2">{error}</Typography>
              </Alert>
            )}
          </Box>
        </Paper>
      </ResponsiveSection>

      {/* Enhanced Summary Cards */}
      <ResponsiveSection>
        <ResponsiveStatsGrid>
          {summaryCards.map((card, index) => (
            <Fade in timeout={500 + index * 200} key={card.title}>
              <Card 
                sx={{
                  height: '100%',
                  background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}CC 100%)`,
                  color: '#fff',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.3)',
                        borderRadius: '50%',
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {card.icon}
                    </Box>
                    <Box flex={1}>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {card.title}
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {card.value}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {card.helper}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Fade>
          ))}
        </ResponsiveStatsGrid>
      </ResponsiveSection>

      {/* Enhanced Detailed Breakdown */}
      <ResponsiveSection>
        <ResponsiveTwoColumn
          left={
            <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={3}>
                  <Avatar sx={{ bgcolor: 'success.light' }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">Earnings Breakdown</Typography>
                    <Typography variant="body2" color="text.secondary">Revenue by category</Typography>
                  </Box>
                </Stack>
                <Divider sx={{ mb: 3 }} />
                <Stack spacing={3}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                        <MoneyIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="body1" fontWeight="medium">Rent</Typography>
                    </Stack>
                    <Typography variant="h6" color="success.main" fontWeight="bold">
                      {currency(earnings.byType?.rent || 0)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'warning.light', width: 32, height: 32 }}>
                        <BuildIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="body1" fontWeight="medium">Maintenance</Typography>
                    </Stack>
                    <Typography variant="h6" color="success.main" fontWeight="bold">
                      {currency(earnings.byType?.maintenance || 0)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'info.light', width: 32, height: 32 }}>
                        <WalletIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="body1" fontWeight="medium">Light Bill</Typography>
                    </Stack>
                    <Typography variant="h6" color="success.main" fontWeight="bold">
                      {currency(earnings.byType?.light || 0)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'secondary.light', width: 32, height: 32 }}>
                        <TrendingUpIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="body1" fontWeight="medium">Advance</Typography>
                    </Stack>
                    <Typography variant="h6" color="success.main" fontWeight="bold">
                      {currency(earnings.byType?.advance || 0)}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ bgcolor: 'success.50', p: 2, borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Total Earnings
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      {currency(earnings.total)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          }
          right={
            <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={3}>
                  <Avatar sx={{ bgcolor: 'error.light' }}>
                    <BuildIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">Expenses Breakdown</Typography>
                    <Typography variant="body2" color="text.secondary">Maintenance costs analysis</Typography>
                  </Box>
                </Stack>
                <Divider sx={{ mb: 3 }} />
                <Stack spacing={3}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'success.light', width: 32, height: 32 }}>
                        <TrendingUpIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="body1" fontWeight="medium">Paid</Typography>
                    </Stack>
                    <Typography variant="h6" color="success.main" fontWeight="bold">
                      {currency(spends.paid || 0)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'warning.light', width: 32, height: 32 }}>
                        <PendingIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="body1" fontWeight="medium">Pending</Typography>
                    </Stack>
                    <Typography variant="h6" color="warning.main" fontWeight="bold">
                      {currency(spends.pending || 0)}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ bgcolor: 'error.50', p: 2, borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Total Expenses
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="error.main">
                      {currency(spends.total)}
                    </Typography>
                  </Box>
                  
                  {/* Net Profit Summary */}
                  <Box sx={{ mt: 3, p: 2, bgcolor: netAmount >= 0 ? 'success.50' : 'error.50', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Net Profit This Period
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color={netAmount >= 0 ? 'success.main' : 'error.main'}>
                      {currency(netAmount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {profitMargin}% profit margin
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          }
        />
      </ResponsiveSection>

      {/* Enhanced Pending Rent Details */}
      {pendingRent.details && pendingRent.details.length > 0 && (
        <ResponsiveSection>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={3}>
                <Avatar sx={{ bgcolor: 'warning.light' }}>
                  <PendingIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Pending Rent Collections</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pendingRent.details.length} properties with pending payments
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Property</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Property Number</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Tenant</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingRent.details.map((detail, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {detail.property}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={detail.propertyNumber} 
                            size="small" 
                            variant="outlined" 
                            color="primary"
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.light' }}>
                              <Typography variant="caption">
                                {detail.tenant?.charAt(0)?.toUpperCase()}
                              </Typography>
                            </Avatar>
                            <Typography variant="body2">{detail.tenant}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" fontWeight="bold" color="warning.main">
                            {currency(detail.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label="Pending" 
                            color="warning" 
                            size="small"
                            icon={<PendingIcon />}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: 'warning.50' }}>
                      <TableCell colSpan={3} align="right">
                        <Typography variant="h6" fontWeight="bold">
                          Total Pending Collections:
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h5" fontWeight="bold" color="warning.dark">
                          {currency(pendingRent.total)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${pendingRent.details.length} Properties`} 
                          color="warning" 
                          variant="filled"
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>
        </ResponsiveSection>
      )}
    </ResponsivePageLayout>
  );
}

export default Analytics;


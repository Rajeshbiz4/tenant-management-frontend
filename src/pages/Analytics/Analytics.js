import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Grid,
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
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalanceWallet as WalletIcon,
  Build as BuildIcon,
  PendingActions as PendingIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { fetchAnalytics } from '../../store/slices/statsSlice';
import { fetchProperties } from '../../store/slices/propertySlice';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function Analytics() {
  const dispatch = useDispatch();
  const { analytics, loading, error } = useSelector((state) => state.stats);
  const { properties } = useSelector((state) => state.property);

  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedProperty, setSelectedProperty] = useState('');

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
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
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
    <Box>
      {/* Header with Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Financial Analytics
          </Typography>
          {error && (
            <Typography variant="body2" color="error" gutterBottom>
              Error: {error}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {analytics?.period?.monthName || monthNames[selectedMonth - 1]} {analytics?.period?.year || selectedYear}
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mt={2}>
            <TextField
              select
              label="Year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i).map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              {monthNames.map((month, index) => (
                <MenuItem key={month} value={index + 1}>
                  {month}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Property (Optional)"
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              sx={{ minWidth: 250 }}
            >
              <MenuItem value="">All Properties</MenuItem>
              {properties.map((property) => (
                <MenuItem key={property._id} value={property._id}>
                  {property.shopName} - {property.shopNumber}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {summaryCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card sx={{ bgcolor: card.color, color: '#fff', height: '100%' }}>
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
          </Grid>
        ))}
      </Grid>

      {/* Detailed Breakdown */}
      <Grid container spacing={3}>
        {/* Earnings Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <TrendingUpIcon color="success" />
                <Typography variant="h6">Earnings Breakdown</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1">Rent</Typography>
                  <Typography variant="h6" color="success.main">
                    {currency(earnings.byType?.rent || 0)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1">Maintenance</Typography>
                  <Typography variant="h6" color="success.main">
                    {currency(earnings.byType?.maintenance || 0)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1">Light Bill</Typography>
                  <Typography variant="h6" color="success.main">
                    {currency(earnings.byType?.light || 0)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1">Advance</Typography>
                  <Typography variant="h6" color="success.main">
                    {currency(earnings.byType?.advance || 0)}
                  </Typography>
                </Box>
                <Divider />
                <Box display="flex" justifyContent="space-between" alignItems="center">
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
        </Grid>

        {/* Spends Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <BuildIcon color="error" />
                <Typography variant="h6">Spends Breakdown</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1">Paid</Typography>
                  <Typography variant="h6" color="success.main">
                    {currency(spends.paid || 0)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1">Pending</Typography>
                  <Typography variant="h6" color="warning.main">
                    {currency(spends.pending || 0)}
                  </Typography>
                </Box>
                <Divider />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontWeight="bold">
                    Total Spends
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="error.main">
                    {currency(spends.total)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Rent Details */}
        {pendingRent.details && pendingRent.details.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                  <PendingIcon color="warning" />
                  <Typography variant="h6">Pending Rent Details</Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Property</TableCell>
                      <TableCell>Property Number</TableCell>
                      <TableCell>Tenant</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingRent.details.map((detail, index) => (
                      <TableRow key={index}>
                        <TableCell>{detail.property}</TableCell>
                        <TableCell>{detail.propertyNumber}</TableCell>
                        <TableCell>{detail.tenant}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" fontWeight="bold" color="warning.main">
                            {currency(detail.amount)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: 'warning.light' }}>
                      <TableCell colSpan={3} align="right">
                        <Typography variant="h6" fontWeight="bold">
                          Total Pending:
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" fontWeight="bold" color="warning.dark">
                          {currency(pendingRent.total)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default Analytics;


import React, { useMemo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
  Button,
  Container,
  Grow,
  LinearProgress,
} from '@mui/material';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

import {
  Home as HomeIcon,
  People as PeopleIcon,
  ElectricBolt as ElectricIcon,
  Payments as PaymentsIcon,
  Event as EventIcon,
  Add as AddIcon,
  Payment as PaymentIcon,
  History as HistoryIcon,
  Build as BuildIcon,
  Analytics as AnalyticsIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalanceWallet as WalletIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { fetchOverview, fetchAnalytics } from '../../store/slices/statsSlice';
import { fetchProperties } from '../../store/slices/propertySlice';
import { fetchTenants } from '../../store/slices/tenantSlice';
import { getPayments } from '../../store/slices/paymentSlice';
import OutstandingPaymentsTable from './outStanding';
import GradientBackground from '../../components/UI/GradientBackground';
import ModernLoader from '../../components/UI/ModernLoader';

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { overview, analytics, loading } = useSelector((state) => state.stats);
  const { properties } = useSelector((state) => state.property);
  const { tenants } = useSelector((state) => state.tenant);
  const { payments } = useSelector((state) => state.payment);
  const { user } = useSelector((state) => state.auth);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  // Get property name from user registration (for welcome message)
  const propertyName = user?.propertyName 
    ? user.propertyName.charAt(0).toUpperCase() + user.propertyName.slice(1)
    : 'Property';

  useEffect(() => {
    dispatch(fetchOverview());
    dispatch(fetchProperties({ page: 1, limit: 100 }));
    dispatch(fetchTenants({ page: 1, limit: 100 }));
    // Fetch current month analytics for dashboard
    dispatch(fetchAnalytics({ year: currentYear, month: currentMonth }));
  }, [dispatch, currentYear, currentMonth]);

  // Only fetch payments if user has properties
  useEffect(() => {
    if (properties.length > 0) {
      // Fetch all payments for current year to calculate accurate rent collected
      dispatch(getPayments({ year: currentYear }));
    }
  }, [dispatch, currentYear, properties.length]);

  // Calculate total earnings from all payment types for current year
  const totalEarnings = useMemo(() => {
    return payments
      .filter((p) => p.year === currentYear)
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [payments, currentYear]);

  // Calculate monthly earnings for current month
  const monthlyEarnings = useMemo(() => {
    return payments
      .filter((p) => p.year === currentYear && p.month === currentMonth)
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [payments, currentYear, currentMonth]);

  // Calculate rent collected specifically (for reference)
  const rentCollected = useMemo(() => {
    return payments
      .filter((p) => p.type === 'rent' && p.year === currentYear)
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [payments, currentYear]);

  // Calculate overdue rent - properties with pending rent status
  const overdueRentCurrentYear = useMemo(() => {
    return properties
      .filter((p) => {
        const tenant = p.tenant;
        if (!tenant) return false;
        // Check if tenant has pending rent status
        return tenant.rentStatus === 'pending';
      })
      .reduce((sum, p) => {
        const rentAmount = p.rent?.monthlyRent || p.monthlyRent || 0;
        return sum + rentAmount;
      }, 0);
  }, [properties]);

  // Calculate occupancy rate
  const occupancyRate = useMemo(() => {
    if (properties.length === 0) return 0;
    const occupiedProperties = properties.filter(p => p.tenant).length;
    return Math.round((occupiedProperties / properties.length) * 100);
  }, [properties]);

  // Calculate collection efficiency
  const collectionEfficiency = useMemo(() => {
    const totalExpectedRent = properties.reduce((sum, p) => {
      if (p.tenant) {
        const rentAmount = p.rent?.monthlyRent || p.monthlyRent || 0;
        return sum + rentAmount;
      }
      return sum;
    }, 0);
    
    if (totalExpectedRent === 0) return 100;
    const collectedRent = totalExpectedRent - overdueRentCurrentYear;
    return Math.round((collectedRent / totalExpectedRent) * 100);
  }, [properties, overdueRentCurrentYear]);

  if (loading && !overview) {
    return <ModernLoader fullScreen message="Loading your dashboard..." />;
  }

  const currency = (value = 0) => `₹${value.toLocaleString('en-IN')}`;

  const summaryCards = [
    {
      title: 'Total Properties',
      value: overview?.totalProperties || properties.length,
      helper: 'Registered units',
      icon: <HomeIcon />,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      change: null,
    },
    {
      title: 'Active Tenants',
      value: overview?.totalTenants || tenants.length,
      helper: `${occupancyRate}% occupancy rate`,
      icon: <PeopleIcon />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      change: null,
    },
    {
      title: 'Monthly Earnings',
      value: currency(analytics?.earnings?.total || monthlyEarnings),
      helper: 'Current month',
      icon: <PaymentsIcon />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      change: null,
    },
    {
      title: 'Pending Collections',
      value: currency(analytics?.pendingRent?.total || overdueRentCurrentYear),
      helper: `${collectionEfficiency}% collection rate`,
      icon: <WarningIcon />,
      gradient: overdueRentCurrentYear > 0 
        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      change: null,
    },
  ];

  // Enhanced analytics cards for existing users
  const analyticsCards = [
    {
      title: 'Net Profit',
      value: currency(analytics?.netAmount || (totalEarnings - (analytics?.spends?.total || 0))),
      helper: `${analytics?.profitMargin || 0}% margin`,
      icon: analytics?.netAmount >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />,
      gradient: analytics?.netAmount >= 0 
        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    },
    {
      title: 'Total Expenses',
      value: currency(analytics?.spends?.total || 0),
      helper: `${analytics?.spends?.count || 0} maintenance records`,
      icon: <BuildIcon />,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Welcome Header */}
      <GradientBackground variant="primary" opacity={0.03} sx={{ borderRadius: 4, p: 4, mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: 'primary.main',
              fontSize: '1.5rem',
              fontWeight: 'bold',
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Welcome back, {user?.name || 'User'}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {propertyName} Management Dashboard • {new Date().toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
          </Box>
        </Stack>
      </GradientBackground>

      {/* Welcome Instructions for New Users */}
      {properties.length === 0 && (
        <Card sx={{ mb: 4, border: '2px solid', borderColor: 'info.main', bgcolor: 'info.light' }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <InfoIcon sx={{ color: 'info.main', mt: 0.5, fontSize: 32 }} />
              <Box flex={1}>
                <Typography variant="h5" gutterBottom fontWeight="bold" color="info.dark">
                  🎉 Welcome to {propertyName}!
                </Typography>
                <Typography variant="body1" paragraph color="text.primary">
                  Let's get you started with managing your properties efficiently. Follow these simple steps:
                </Typography>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {[
                    {
                      step: '1',
                      title: 'Add Your Properties',
                      description: 'Register your shops, flats, or plots with rent and maintenance details.',
                      action: 'Add Property',
                      path: '/properties',
                      icon: <HomeIcon />,
                    },
                    {
                      step: '2',
                      title: 'Register Tenants',
                      description: 'Add tenant information and link them to your properties.',
                      action: 'Add Tenants',
                      path: '/tenants',
                      icon: <PeopleIcon />,
                    },
                    {
                      step: '3',
                      title: 'Record Payments',
                      description: 'Track rent, maintenance, and utility payments from tenants.',
                      action: 'Make Payment',
                      path: '/payment',
                      icon: <PaymentIcon />,
                    },
                    {
                      step: '4',
                      title: 'Monitor Analytics',
                      description: 'View comprehensive reports and financial insights.',
                      action: 'View Analytics',
                      path: '/analytics',
                      icon: <AnalyticsIcon />,
                    },
                  ].map((item) => (
                    <Grid item xs={12} sm={6} md={3} key={item.step}>
                      <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          Step {item.step}: {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {item.description}
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => navigate(item.path)}
                          sx={{ mt: 'auto' }}
                        >
                          {item.action}
                        </Button>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/properties')}
                    sx={{ 
                      bgcolor: 'primary.main',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    Start Now - Add Your First Property
                  </Button>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Quick Action Buttons */}
      {properties.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Quick Actions
            </Typography>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              sx={{ mt: 2 }}
              flexWrap="wrap"
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => navigate('/properties')}
                sx={{ 
                  minWidth: 150,
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                Add Property
              </Button>
              <Button
                variant="contained"
                size="large"
                startIcon={<PaymentIcon />}
                onClick={() => navigate('/payment')}
                sx={{ 
                  minWidth: 150,
                  bgcolor: 'success.main',
                  '&:hover': { bgcolor: 'success.dark' }
                }}
              >
                Record Payment
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<HistoryIcon />}
                onClick={() => navigate('/paymenthistory')}
                sx={{ minWidth: 150 }}
              >
                Payment History
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<BuildIcon />}
                onClick={() => navigate('/maintenance')}
                sx={{ minWidth: 150 }}
              >
                Maintenance
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<AnalyticsIcon />}
                onClick={() => navigate('/analytics')}
                sx={{ minWidth: 150 }}
              >
                Full Analytics
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards - Only show if user has properties */}
      {properties.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {summaryCards.map((card, index) => (
            <Grid item xs={12} sm={6} lg={3} key={card.title}>
              <Grow in timeout={800 + index * 200}>
                <Card
                  sx={{
                    height: '100%',
                    background: card.gradient,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '100px',
                      height: '100px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '50%',
                      transform: 'translate(30px, -30px)',
                    },
                  }}
                >
                  <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {card.icon}
                      </Box>
                      <Box flex={1}>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          {card.title}
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
                          {card.value}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          {card.helper}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Analytics Cards for Advanced Metrics */}
      {properties.length > 0 && analytics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {analyticsCards.map((card, index) => (
            <Grid item xs={12} sm={6} key={card.title}>
              <Grow in timeout={1200 + index * 200}>
                <Card
                  sx={{
                    height: '100%',
                    background: card.gradient,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
              </Grow>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Performance Metrics */}
      {properties.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Performance Metrics
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Occupancy Rate
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {occupancyRate}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={occupancyRate}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: occupancyRate >= 80 ? 'success.main' : occupancyRate >= 60 ? 'warning.main' : 'error.main',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Collection Efficiency
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {collectionEfficiency}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={collectionEfficiency}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: collectionEfficiency >= 90 ? 'success.main' : collectionEfficiency >= 70 ? 'warning.main' : 'error.main',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Earnings Breakdown - Only show if user has properties and payments */}
      {properties.length > 0 && payments.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Earnings Breakdown ({currentYear})
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" p={2} sx={{ bgcolor: 'primary.light', borderRadius: 2 }}>
                  <Typography variant="body2" color="primary.dark" fontWeight="bold">Rent</Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    {currency(payments.filter(p => p.type === 'rent' && p.year === currentYear).reduce((sum, p) => sum + (p.amount || 0), 0))}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" p={2} sx={{ bgcolor: 'warning.light', borderRadius: 2 }}>
                  <Typography variant="body2" color="warning.dark" fontWeight="bold">Maintenance</Typography>
                  <Typography variant="h6" fontWeight="bold" color="warning.main">
                    {currency(payments.filter(p => p.type === 'maintenance' && p.year === currentYear).reduce((sum, p) => sum + (p.amount || 0), 0))}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" p={2} sx={{ bgcolor: 'info.light', borderRadius: 2 }}>
                  <Typography variant="body2" color="info.dark" fontWeight="bold">Light Bill</Typography>
                  <Typography variant="h6" fontWeight="bold" color="info.main">
                    {currency(payments.filter(p => p.type === 'light' && p.year === currentYear).reduce((sum, p) => sum + (p.amount || 0), 0))}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" p={2} sx={{ bgcolor: 'success.light', borderRadius: 2 }}>
                  <Typography variant="body2" color="success.dark" fontWeight="bold">Advance</Typography>
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    {currency(payments.filter(p => p.type === 'advance' && p.year === currentYear).reduce((sum, p) => sum + (p.amount || 0), 0))}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Upcoming & Overdue Payments - Only show if user has properties */}
      {properties.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <EventIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">Upcoming & Overdue Payments</Typography>
            </Stack>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Property</TableCell>
                    <TableCell>Tenant</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell align="center">Days</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Risk</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {properties
                    .map((property) => {
                      const tenant = property.tenant;
                      if (!tenant) return null;

                      // Get rent amount from property
                      const rentAmount = property.rent?.monthlyRent || property.monthlyRent || 0;
                      
                      // Calculate next due date based on tenant start date
                      const startDate = tenant.startDate
                        ? new Date(tenant.startDate)
                        : new Date();
                      
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      
                      // Calculate next due date (first of next month from start date)
                      let dueDate = new Date(startDate);
                      dueDate.setDate(1); // Set to first of the month
                      
                      // Move to next month
                      dueDate.setMonth(dueDate.getMonth() + 1);
                      
                      // Keep moving forward until we're past today
                      while (dueDate <= today) {
                        dueDate.setMonth(dueDate.getMonth() + 1);
                      }
                      
                      const diffDays = Math.ceil(
                        (dueDate - today) / (1000 * 60 * 60 * 24)
                      );
                      
                      const overdue = diffDays < 0 || tenant.rentStatus === 'pending';
                      const risk =
                        overdue && diffDays < -7
                          ? 'High'
                          : overdue || diffDays <= 5
                          ? 'Medium'
                          : 'Low';

                      return {
                        id: property._id,
                        shop: property.shopName || property.location,
                        shopNumber: property.shopNumber,
                        tenant: tenant.name,
                        dueDate,
                        days: diffDays,
                        amount: rentAmount,
                        status: tenant.rentStatus || 'pending',
                        overdue,
                        risk,
                      };
                    })
                    .filter(Boolean)
                    .sort((a, b) => {
                      // Sort by overdue first, then by days
                      if (a.overdue !== b.overdue) {
                        return a.overdue ? -1 : 1;
                      }
                      return a.days - b.days;
                    })
                    .map((item) => (
                      <TableRow
                        key={item.id}
                        sx={{
                          backgroundColor: item.overdue ? 'error.light' : 'success.light',
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {item.shop} {item.shopNumber ? `- ${item.shopNumber}` : ''}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.tenant}</TableCell>
                        <TableCell>
                          {item.dueDate.toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            fontWeight={600}
                            color={item.overdue ? 'error' : 'success.main'}
                          >
                            {item.overdue
                              ? `${Math.abs(item.days)} Late`
                              : `${item.days} Left`}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            {currency(item.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.status === 'paid' ? 'Paid' : 'Pending'}
                            color={item.status === 'paid' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.risk}
                            color={
                              item.risk === 'High'
                                ? 'error'
                                : item.risk === 'Medium'
                                ? 'warning'
                                : 'success'
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}

                  {!properties.some((p) => p.tenant) && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No upcoming or overdue payments 🎉
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Outstanding Payments - Only show if user has properties */}
      {properties.length > 0 && (
        <Card>
          <OutstandingPaymentsTable />
        </Card>
      )}
    </Container>
  );
}

export default Dashboard;

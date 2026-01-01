import React, { useMemo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PendingIcon from '@mui/icons-material/Pending';

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
  Paper,
  CardActions,
  Tooltip,
  IconButton,
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
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { fetchOverview, fetchAnalytics } from '../../store/slices/statsSlice';
import { fetchProperties } from '../../store/slices/propertySlice';
import { fetchTenants } from '../../store/slices/tenantSlice';
import { getPayments } from '../../store/slices/paymentSlice';
import OutstandingPaymentsTable from './outStanding';
import GradientBackground from '../../components/UI/GradientBackground';
import ModernLoader from '../../components/UI/ModernLoader';
import StatsCard from '../../components/UI/StatsCard';
import ResponsivePageLayout, { 
  ResponsiveSection, 
  ResponsiveStatsGrid,
  ResponsiveCardGrid,
  ResponsiveGrid,
  ResponsiveGridItem
} from '../../components/Layout/ResponsivePageLayout';

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
  const propertyName = user?.propertyName && typeof user.propertyName === 'string'
    ? user.propertyName.charAt(0).toUpperCase() + user.propertyName.slice(1)
    : 'Property';

  useEffect(() => {
    dispatch(fetchOverview());
    dispatch(fetchProperties({ page: 1, limit: 100 }));
    dispatch(fetchTenants({ page: 1, limit: 100 }));
    // Fetch all-time analytics for dashboard (no date filters)
    console.log('Dashboard: Fetching all-time analytics');
    dispatch(fetchAnalytics({}));
  }, [dispatch]);

  // Only fetch payments if user has properties
  useEffect(() => {
    if (properties.length > 0) {
      // Fetch all payments for all time to calculate accurate all-time earnings
      dispatch(getPayments({})); // Remove year filter to get all-time data
    }
  }, [dispatch, properties.length]);

  // Calculate total earnings from all payment types for all time (fallback)
  const totalEarningsFromPayments = useMemo(() => {
    return payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [payments]);

  // Calculate earnings by type from payments (fallback)
  const earningsByTypeFromPayments = useMemo(() => {
    return {
      rent: payments.filter(p => p.type === 'rent').reduce((sum, p) => sum + (p.amount || 0), 0),
      maintenance: payments.filter(p => p.type === 'maintenance').reduce((sum, p) => sum + (p.amount || 0), 0),
      light: payments.filter(p => p.type === 'light').reduce((sum, p) => sum + (p.amount || 0), 0),
      advance: payments.filter(p => p.type === 'advance').reduce((sum, p) => sum + (p.amount || 0), 0),
    };
  }, [payments]);

  // Calculate rent collected specifically (for reference) - all time
  const rentCollected = useMemo(() => {
    return payments
      .filter((p) => p.type === 'rent')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [payments]);

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

  console.log('Dashboard: Analytics data received:', analytics);
  console.log('Dashboard: Payments data:', payments.length, 'payments');
  console.log('Dashboard: Properties data:', properties.length, 'properties');
  console.log('Dashboard: Total earnings from payments (all-time fallback):', totalEarningsFromPayments);
  console.log('Dashboard: Using analytics data:', !!analytics?.earnings?.total);
  console.log('Dashboard: Using fallback data:', !analytics?.earnings?.total && totalEarningsFromPayments > 0);
  console.log('Dashboard: Analytics earnings total:', analytics?.earnings?.total);
  console.log('Dashboard: Analytics spends total:', analytics?.spends?.total);
  console.log('Dashboard: Analytics net amount:', analytics?.netAmount);

  const currency = (value = 0) => `₹${value.toLocaleString('en-IN')}`;

  const summaryCards = [
    {
      title: 'Total Properties',
      value: overview?.totalProperties || properties.length,
      subtitle: 'Registered units',
      icon: <HomeIcon />,
      color: 'primary',
      trend: 'up',
      trendValue: '+12%',
    },
    {
      title: 'Active Tenants',
      value: overview?.totalTenants || tenants.length,
      subtitle: `${occupancyRate}% occupancy rate`,
      icon: <PeopleIcon />,
      color: 'info',
      progress: occupancyRate,
    },
    {
      title: 'Total Earnings',
      value: currency(analytics?.earnings?.total || totalEarningsFromPayments),
      subtitle: 'All time earnings',
      icon: <PaymentsIcon />,
      color: 'success',
      trend: 'up',
      trendValue: '+8.2%',
    },
    {
      title: 'Total Expenses',
      value: currency(analytics?.spends?.total || 0),
      subtitle: 'All time maintenance',
      icon: <WarningIcon />,
      color: analytics?.spends?.total > 0 ? 'error' : 'success',
      trend: analytics?.spends?.total > 0 ? 'down' : 'up',
      trendValue: analytics?.spends?.total > 0 ? '-5.1%' : '+0%',
    },
  ];

  // Enhanced analytics cards for existing users
  const analyticsCards = [
    {
      title: 'Net Profit (All Time)',
      value: currency(analytics?.netAmount || (totalEarningsFromPayments - (analytics?.spends?.total || 0))),
      subtitle: `${analytics?.profitMargin || 0}% margin`,
      icon: (analytics?.netAmount || totalEarningsFromPayments) >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />,
      color: (analytics?.netAmount || totalEarningsFromPayments) >= 0 ? 'success' : 'error',
      trend: (analytics?.netAmount || totalEarningsFromPayments) >= 0 ? 'up' : 'down',
      trendValue: `${analytics?.profitMargin || 0}%`,
    },
    {
      title: 'Pending Collections',
      value: currency(analytics?.pendingRent?.total || overdueRentCurrentYear),
      subtitle: `${analytics?.pendingRent?.count || 0} properties pending`,
      icon: <PendingIcon />,
      color: 'warning',
      trend: 'down',
      trendValue: '-2.3%',
    },
    {
      title: 'Collection Efficiency',
      value: `${collectionEfficiency}%`,
      subtitle: 'Payment collection rate',
      icon: <CheckCircleIcon />,
      color: 'primary',
      progress: collectionEfficiency,
    },
  ];

  return (
    <ResponsivePageLayout>
      {/* Welcome Header */}
      <ResponsiveSection>
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white',
            borderRadius: 3,
            p: { xs: 3, sm: 4 },
            border: '1px solid',
            borderColor: 'primary.200',
          }}
        >
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            alignItems={{ xs: 'flex-start', sm: 'center' }} 
            spacing={3}
          >
            <Avatar
              sx={{
                width: { xs: 56, sm: 64 },
                height: { xs: 56, sm: 64 },
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                fontWeight: 'bold',
              }}
            >
              {(user?.name && typeof user.name === 'string') ? user.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant={{ xs: 'h5', sm: 'h4' }} 
                fontWeight="bold" 
                sx={{ mb: 1 }}
              >
                Welcome back, {user?.name || 'User'}!
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  opacity: 0.9,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                {propertyName} Management Dashboard • {new Date().toLocaleDateString('en-IN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>
            </Box>
            <Stack 
              direction={{ xs: 'row', sm: 'row' }} 
              spacing={2}
              sx={{ 
                width: { xs: '100%', sm: 'auto' },
                justifyContent: { xs: 'center', sm: 'flex-end' }
              }}
            >
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/properties')}
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  flex: { xs: 1, sm: 'none' },
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                Add Property
              </Button>
              <Button
                variant="outlined"
                startIcon={<PaymentIcon />}
                onClick={() => navigate('/payment')}
                size="small"
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  color: 'white',
                  flex: { xs: 1, sm: 'none' },
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Record Payment
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </ResponsiveSection>

      {/* Welcome Instructions for New Users */}
      {properties.length === 0 && (
        <ResponsiveSection>
          <Paper
            elevation={0}
            sx={{
              border: '2px solid',
              borderColor: 'info.main',
              bgcolor: 'info.50',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={3} 
                alignItems="flex-start"
              >
                <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48 }}>
                  <InfoIcon />
                </Avatar>
                <Box flex={1}>
                  <Typography 
                    variant={{ xs: 'h6', sm: 'h5' }} 
                    gutterBottom 
                    fontWeight="bold" 
                    color="info.dark"
                  >
                    🎉 Welcome to {propertyName}!
                  </Typography>
                  <Typography 
                    variant="body1" 
                    paragraph 
                    color="text.primary" 
                    sx={{ mb: 3 }}
                  >
                    Let's get you started with managing your properties efficiently. Follow these simple steps:
                  </Typography>
                  <ResponsiveCardGrid cardSize="small">
                    {[
                      {
                        step: '1',
                        title: 'Add Your Properties',
                        description: 'Register your shops, flats, or plots with rent and maintenance details.',
                        action: 'Add Property',
                        path: '/properties',
                        icon: <HomeIcon />,
                        color: 'primary',
                      },
                      {
                        step: '2',
                        title: 'Register Tenants',
                        description: 'Add tenant information and link them to your properties.',
                        action: 'Add Tenants',
                        path: '/tenants',
                        icon: <PeopleIcon />,
                        color: 'info',
                      },
                      {
                        step: '3',
                        title: 'Record Payments',
                        description: 'Track rent, maintenance, and utility payments from tenants.',
                        action: 'Make Payment',
                        path: '/payment',
                        icon: <PaymentIcon />,
                        color: 'success',
                      },
                      {
                        step: '4',
                        title: 'Monitor Analytics',
                        description: 'View comprehensive reports and financial insights.',
                        action: 'View Analytics',
                        path: '/analytics',
                        icon: <AnalyticsIcon />,
                        color: 'warning',
                      },
                    ].map((item) => (
                      <StatsCard
                        key={item.step}
                        title={`Step ${item.step}: ${item.title}`}
                        value=""
                        subtitle={item.description}
                        icon={item.icon}
                        color={item.color}
                        variant="outlined"
                        onClick={() => navigate(item.path)}
                      />
                    ))}
                  </ResponsiveCardGrid>
                  <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/properties')}
                      sx={{ 
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                      }}
                    >
                      Start Now - Add Your First Property
                    </Button>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Paper>
        </ResponsiveSection>
      )}

      {/* Summary Cards - Only show if user has properties */}
      {properties.length > 0 && (
        <ResponsiveSection>
          <ResponsiveStatsGrid>
            {summaryCards.map((card, index) => (
              <Grow in timeout={800 + index * 200} key={card.title}>
                <Box>
                  <StatsCard
                    title={card.title}
                    value={card.value}
                    subtitle={card.subtitle}
                    icon={card.icon}
                    color={card.color}
                    trend={card.trend}
                    trendValue={card.trendValue}
                    progress={card.progress}
                    variant="gradient"
                  />
                </Box>
              </Grow>
            ))}
          </ResponsiveStatsGrid>
        </ResponsiveSection>
      )}

      {/* Analytics Cards for Advanced Metrics */}
      {properties.length > 0 && analytics && (
        <ResponsiveSection>
          <ResponsiveGrid>
            {analyticsCards.map((card, index) => (
              <ResponsiveGridItem xs={12} sm={6} md={4} key={card.title}>
                <Grow in timeout={1200 + index * 200}>
                  <Box>
                    <StatsCard
                      title={card.title}
                      value={card.value}
                      subtitle={card.subtitle}
                      icon={card.icon}
                      color={card.color}
                      trend={card.trend}
                      trendValue={card.trendValue}
                      progress={card.progress}
                      variant="default"
                    />
                  </Box>
                </Grow>
              </ResponsiveGridItem>
            ))}
          </ResponsiveGrid>
        </ResponsiveSection>
      )}

      {/* Performance Metrics */}
      {properties.length > 0 && (
        <ResponsiveSection>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Performance Metrics
              </Typography>
              <ResponsiveGrid>
                <ResponsiveGridItem xs={12} sm={6}>
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
                </ResponsiveGridItem>
                <ResponsiveGridItem xs={12} sm={6}>
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
                </ResponsiveGridItem>
              </ResponsiveGrid>
            </CardContent>
          </Paper>
        </ResponsiveSection>
      )}

      {/* Earnings Breakdown - Only show if user has properties */}
      {properties.length > 0 && (analytics?.earnings?.total > 0 || totalEarningsFromPayments > 0) && (
        <ResponsiveSection>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                All-Time Earnings Breakdown
              </Typography>
              <ResponsiveGrid sx={{ mt: 1 }}>
                <ResponsiveGridItem xs={6} sm={3}>
                  <Box textAlign="center" p={{ xs: 2, sm: 3 }} sx={{ bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.200' }}>
                    <Typography variant="body2" color="primary.dark" fontWeight="bold">Rent</Typography>
                    <Typography variant={{ xs: 'h6', sm: 'h5' }} fontWeight="bold" color="primary.main">
                      {currency(analytics?.earnings?.byType?.rent || earningsByTypeFromPayments.rent)}
                    </Typography>
                  </Box>
                </ResponsiveGridItem>
                <ResponsiveGridItem xs={6} sm={3}>
                  <Box textAlign="center" p={{ xs: 2, sm: 3 }} sx={{ bgcolor: 'warning.50', borderRadius: 2, border: '1px solid', borderColor: 'warning.200' }}>
                    <Typography variant="body2" color="warning.dark" fontWeight="bold">Maintenance</Typography>
                    <Typography variant={{ xs: 'h6', sm: 'h5' }} fontWeight="bold" color="warning.main">
                      {currency(analytics?.earnings?.byType?.maintenance || earningsByTypeFromPayments.maintenance)}
                    </Typography>
                  </Box>
                </ResponsiveGridItem>
                <ResponsiveGridItem xs={6} sm={3}>
                  <Box textAlign="center" p={{ xs: 2, sm: 3 }} sx={{ bgcolor: 'info.50', borderRadius: 2, border: '1px solid', borderColor: 'info.200' }}>
                    <Typography variant="body2" color="info.dark" fontWeight="bold">Light Bill</Typography>
                    <Typography variant={{ xs: 'h6', sm: 'h5' }} fontWeight="bold" color="info.main">
                      {currency(analytics?.earnings?.byType?.light || earningsByTypeFromPayments.light)}
                    </Typography>
                  </Box>
                </ResponsiveGridItem>
                <ResponsiveGridItem xs={6} sm={3}>
                  <Box textAlign="center" p={{ xs: 2, sm: 3 }} sx={{ bgcolor: 'success.50', borderRadius: 2, border: '1px solid', borderColor: 'success.200' }}>
                    <Typography variant="body2" color="success.dark" fontWeight="bold">Advance</Typography>
                    <Typography variant={{ xs: 'h6', sm: 'h5' }} fontWeight="bold" color="success.main">
                      {currency(analytics?.earnings?.byType?.advance || earningsByTypeFromPayments.advance)}
                    </Typography>
                  </Box>
                </ResponsiveGridItem>
              </ResponsiveGrid>
            </CardContent>
          </Paper>
        </ResponsiveSection>
      )}

      {/* Upcoming & Overdue Payments - Only show if user has properties */}
      {properties.length > 0 && (
        <ResponsiveSection>
          <Paper
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            {/* Enhanced Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                color: 'white',
                p: { xs: 2, sm: 3 },
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
                    <CalendarIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Upcoming & Overdue Payments
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Monitor payment schedules and overdue amounts
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<PaymentIcon />}
                    onClick={() => navigate('/payment')}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                      },
                    }}
                  >
                    Record Payment
                  </Button>
                </Stack>
              </Stack>
            </Box>

            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              {/* Payment Cards Grid */}
              <ResponsiveCardGrid cardSize="medium">
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
                      tenantPhone: tenant.phone,
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
                  .map((item, index) => (
                    <Grow in timeout={600 + index * 100} key={item.id}>
                      <Card
                        elevation={0}
                        sx={{
                          border: '2px solid',
                          borderColor: item.overdue ? 'error.main' : item.risk === 'Medium' ? 'warning.main' : 'success.main',
                          borderRadius: 3,
                          bgcolor: item.overdue ? 'error.50' : item.risk === 'Medium' ? 'warning.50' : 'success.50',
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
                                {item.shop} {item.shopNumber ? `- ${item.shopNumber}` : ''}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <PersonIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  {item.tenant}
                                </Typography>
                              </Stack>
                            </Box>
                            <Stack spacing={1} alignItems="flex-end">
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
                                sx={{ fontWeight: 'bold' }}
                              />
                              <Chip
                                label={item.status === 'paid' ? 'Paid' : 'Pending'}
                                color={item.status === 'paid' ? 'success' : 'warning'}
                                size="small"
                                variant="outlined"
                              />
                            </Stack>
                          </Stack>

                          {/* Payment Details */}
                          <Box
                            sx={{
                              bgcolor: 'rgba(255, 255, 255, 0.8)',
                              borderRadius: 2,
                              p: 2,
                              mb: 2,
                            }}
                          >
                            <ResponsiveGrid>
                              <ResponsiveGridItem xs={6}>
                                <Stack spacing={1}>
                                  <Typography variant="body2" color="text.secondary" fontWeight="500">
                                    Due Date
                                  </Typography>
                                  <Typography variant="body1" fontWeight="bold">
                                    {item.dueDate.toLocaleDateString('en-IN', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </Typography>
                                </Stack>
                              </ResponsiveGridItem>
                              <ResponsiveGridItem xs={6}>
                                <Stack spacing={1} alignItems="flex-end">
                                  <Typography variant="body2" color="text.secondary" fontWeight="500">
                                    Amount Due
                                  </Typography>
                                  <Typography 
                                    variant="h6" 
                                    fontWeight="bold"
                                    color={item.overdue ? 'error.main' : 'success.main'}
                                  >
                                    {currency(item.amount)}
                                  </Typography>
                                </Stack>
                              </ResponsiveGridItem>
                            </ResponsiveGrid>
                          </Box>

                          {/* Days Indicator */}
                          <Box
                            sx={{
                              textAlign: 'center',
                              p: 2,
                              borderRadius: 2,
                              bgcolor: item.overdue ? 'error.100' : item.risk === 'Medium' ? 'warning.100' : 'success.100',
                            }}
                          >
                            <Typography
                              variant="h5"
                              fontWeight="bold"
                              color={item.overdue ? 'error.main' : item.risk === 'Medium' ? 'warning.main' : 'success.main'}
                            >
                              {item.overdue
                                ? `${Math.abs(item.days)} Days Late`
                                : `${item.days} Days Left`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.overdue ? 'Overdue Payment' : 'Until Due Date'}
                            </Typography>
                          </Box>
                        </CardContent>

                        {/* Card Actions */}
                        <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
                          <Stack direction="row" spacing={1} width="100%">
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<PaymentIcon />}
                              onClick={() => navigate('/payment')}
                              sx={{ flex: 1 }}
                              color={item.overdue ? 'error' : 'primary'}
                            >
                              {item.overdue ? 'Pay Now' : 'Record Payment'}
                            </Button>
                            {item.tenantPhone && (
                              <Tooltip title={`Call ${item.tenant}`}>
                                <IconButton
                                  size="small"
                                  sx={{
                                    bgcolor: 'primary.50',
                                    color: 'primary.main',
                                    '&:hover': { bgcolor: 'primary.100' },
                                  }}
                                  onClick={() => window.open(`tel:${item.tenantPhone}`)}
                                >
                                  <PhoneIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </CardActions>
                      </Card>
                    </Grow>
                  ))}
              </ResponsiveCardGrid>

              {/* Empty State */}
              {!properties.some((p) => p.tenant) && (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 6,
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
                    No Upcoming or Overdue Payments! 🎉
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    All your tenants are up to date with their payments.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/tenants')}
                  >
                    Add More Tenants
                  </Button>
                </Box>
              )}
            </CardContent>
          </Paper>
        </ResponsiveSection>
      )}

      {/* Outstanding Payments - Only show if user has properties */}
      {properties.length > 0 && (
        <ResponsiveSection>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <OutstandingPaymentsTable />
          </Paper>
        </ResponsiveSection>
      )}
    </ResponsivePageLayout>
  );
}

export default Dashboard;

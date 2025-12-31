import React, { useMemo, useEffect } from 'react';
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
} from '@mui/icons-material';
import { fetchOverview } from '../../store/slices/statsSlice';
import { fetchProperties } from '../../store/slices/propertySlice';
import { fetchTenants } from '../../store/slices/tenantSlice';
import { getPayments } from '../../store/slices/paymentSlice';
import OutstandingPaymentsTable from './outStanding';

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { overview, loading } = useSelector((state) => state.stats);
  const { properties } = useSelector((state) => state.property);
  const { tenants } = useSelector((state) => state.tenant);
  const { payments } = useSelector((state) => state.payment);
  const { user } = useSelector((state) => state.auth);

  const currentYear = new Date().getFullYear();
  
  // Get property name from user registration (for welcome message)
  const propertyName = user?.propertyName 
    ? user.propertyName.charAt(0).toUpperCase() + user.propertyName.slice(1)
    : 'Property';

  useEffect(() => {
    dispatch(fetchOverview());
    dispatch(fetchProperties({ page: 1, limit: 100 }));
    dispatch(fetchTenants({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Only fetch payments if user has properties
  useEffect(() => {
    if (properties.length > 0) {
      // Fetch all payments for current year to calculate accurate rent collected
      dispatch(getPayments({ year: currentYear }));
    }
  }, [dispatch, currentYear, properties.length]);

  // Calculate actual rent collected from payment records for current year
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const currency = (value = 0) => `₹${value.toLocaleString()}`;

  const summaryCards = [
    {
      title: 'Total Houses',
      value: overview?.totalProperties || 0,
      helper: 'Registered units',
      icon: <HomeIcon />,
      color: 'primary.main',
    },
    {
      title: 'Active Tenants',
      value: overview?.totalTenants || tenants.length,
      helper: 'Contracts running',
      icon: <PeopleIcon />,
      color: 'secondary.main',
    },
    {
      title: 'Rent Collected',
      value: currency(rentCollected),
      helper: 'Collected this year',
      icon: <PaymentsIcon />,
      color: 'success.main',
    },
    {
      title: 'Overdue Rent',
      value: currency(overdueRentCurrentYear),
      helper: 'Pending this year',
      icon: <ElectricIcon />,
      color: 'error.main',
    },
  ];

  return (
    <Stack spacing={4}>
      {/* Welcome Instructions for New Users */}
      {properties.length === 0 && (
        <Card sx={{ bgcolor: 'info.light', mb: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <InfoIcon sx={{ color: 'info.main', mt: 0.5 }} />
              <Box flex={1}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Welcome to {propertyName}!
                </Typography>
                <Typography variant="body1" paragraph>
                  Get started by following these steps:
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  <Box display="flex" gap={2} alignItems="flex-start">
                    <CheckCircleIcon sx={{ color: 'success.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Step 1: Add Your First Shop/Property
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Click "Add Shop" to register your first property. You can add flats, shops, or plots with details like rent, maintenance, and location.
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" gap={2} alignItems="flex-start">
                    <CheckCircleIcon sx={{ color: 'success.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Step 2: Add Tenants
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Once you have properties, go to "Tenants" page to add tenant information and link them to your properties.
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" gap={2} alignItems="flex-start">
                    <CheckCircleIcon sx={{ color: 'success.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Step 3: Record Payments
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Use "Make Payment" to record rent, maintenance, and light bill payments from your tenants.
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" gap={2} alignItems="flex-start">
                    <CheckCircleIcon sx={{ color: 'success.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Step 4: Track & Analyze
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Monitor your income, expenses, and pending payments through the Dashboard, Payment History, and Analytics pages.
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/properties')}
                    sx={{ 
                      bgcolor: 'primary.main',
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    Get Started - Add Your First Shop
                  </Button>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Quick Action Buttons */}
      {properties.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
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
                Add Shop
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
                Make Payment
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
                Analytics
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards - Only show if user has properties */}
      {properties.length > 0 && (
        <Grid container spacing={3} sx={{ color: '#fff' }}>
          {summaryCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title} sx={{ color: '#fff' }}>
            <Card sx={{ bgcolor: card.color, color: '#fff' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
                    {card.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="body2">{card.title}</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {card.value}
                    </Typography>
                    <Typography variant="caption">{card.helper}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
        </Grid>
      )}

      {/* Upcoming & Overdue Payments - Only show if user has properties */}
      {properties.length > 0 && (
      <Card>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <EventIcon color="primary" />
            <Typography variant="h6">Upcoming & Overdue Payments</Typography>
          </Stack>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Flat / Shop</TableCell>
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
                      backgroundColor: item.overdue ? '#ffebee' : '#e8f5e9',
                    }}
                  >
                    <TableCell>
                      {item.shop} {item.shopNumber ? `- ${item.shopNumber}` : ''}
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
                    <TableCell align="right">{currency(item.amount)}</TableCell>
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
        </CardContent>
      </Card>
      )}

      {/* Outstanding Payments - Only show if user has properties */}
      {properties.length > 0 && (
        <Card>
          <OutstandingPaymentsTable />
        </Card>
      )}
    </Stack>
  );
}

export default Dashboard;

import React, { useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
} from '@mui/icons-material';
import { fetchOverview } from '../../store/slices/statsSlice';
import { fetchProperties } from '../../store/slices/propertySlice';
import { fetchTenants } from '../../store/slices/tenantSlice';
import OutstandingPaymentsTable from './outStanding';

function Dashboard() {
  const dispatch = useDispatch();
  const { overview, loading } = useSelector((state) => state.stats);
  const { properties } = useSelector((state) => state.property);
  const { tenants } = useSelector((state) => state.tenant);

  useEffect(() => {
    dispatch(fetchOverview());
    dispatch(fetchProperties({ page: 1, limit: 50 }));
    dispatch(fetchTenants({ page: 1, limit: 50 }));
  }, [dispatch]);

  const aggregate = useMemo(() => {
    const totalRent = properties.reduce(
      (sum, property) => sum + (property.monthlyRent || 0),
      0
    );
    return { totalRent };
  }, [properties]);

  const rentCollected = Math.max(
    aggregate.totalRent - (overview?.pendingRent || 0),
    0
  );

  const overdueRentCurrentYear = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return tenants
      .filter((t) => {
        const start = t.startDate ? new Date(t.startDate) : new Date();
        const endOfYear = new Date(currentYear, 11, 31);
        return t.rentStatus !== 'paid' && start <= endOfYear;
      })
      .reduce((sum, t) => sum + (t.monthlyRent || 0), 0);
  }, [tenants]);

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
      {/* Summary Cards */}
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

      {/* Upcoming & Overdue Payments */}
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

                  const start = tenant.startDate
                    ? new Date(tenant.startDate)
                    : new Date();
                  const dueDate = new Date(start);
                  const today = new Date();
                  while (dueDate <= today) {
                    dueDate.setMonth(dueDate.getMonth() + 1);
                  }
                  const diffDays = Math.ceil(
                    (dueDate - today) / (1000 * 60 * 60 * 24)
                  );
                  const overdue = diffDays < 0;
                  const risk =
                    diffDays < 0
                      ? 'High'
                      : diffDays <= 5
                      ? 'Medium'
                      : 'Low';

                  return {
                    id: property._id,
                    shop: property.location,
                    tenant: tenant.name,
                    dueDate,
                    days: diffDays,
                    amount: property.monthlyRent || 0,
                    status: tenant.rentStatus || 'pending',
                    overdue,
                    risk,
                  };
                })
                .filter(Boolean)
                .map((item) => (
                  <TableRow
                    key={item.id}
                    sx={{
                      backgroundColor: item.overdue ? '#ffebee' : '#e8f5e9',
                    }}
                  >
                    <TableCell>{item.shop}</TableCell>
                    <TableCell>{item.tenant}</TableCell>
                    <TableCell>{item.dueDate.toLocaleDateString()}</TableCell>
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

      {/* Outstanding Payments */}
      <Card>
        <OutstandingPaymentsTable />
      </Card>
    </Stack>
  );
}

export default Dashboard;

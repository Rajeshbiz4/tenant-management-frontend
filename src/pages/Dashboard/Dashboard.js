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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  Home as HomeIcon,
  People as PeopleIcon,
  ElectricBolt as ElectricIcon,
  Payments as PaymentsIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchOverview } from '../../store/slices/statsSlice';
import { fetchProperties } from '../../store/slices/propertySlice';
import { fetchTenants } from '../../store/slices/tenantSlice';

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
    const totalRent = properties.reduce((sum, property) => sum + (property.monthlyRent || 0), 0);
    const pendingRentCount = tenants.filter((tenant) => tenant.rentStatus !== 'paid').length;
    const pendingLight = tenants.filter((tenant) => tenant.lightBillStatus !== 'paid').length;
    const pendingMaintenance = tenants.filter((tenant) => tenant.maintenanceStatus !== 'paid').length;
    return { totalRent, pendingRentCount, pendingLight, pendingMaintenance };
  }, [properties, tenants]);

  const rentCollected = Math.max(aggregate.totalRent - (overview?.pendingRent || 0), 0);

  const chartData = overview
    ? [
        { name: 'Rent', Collected: rentCollected, Pending: overview.pendingRent },
        { name: 'Maintenance', Collected: aggregate.totalRent * 0.1, Pending: overview.pendingMaintenance },
        { name: 'Electricity', Collected: aggregate.totalRent * 0.05, Pending: overview.pendingLightBill },
      ]
    : [];

  const upcomingDueDates = useMemo(() => {
    const today = new Date();
    return properties
      .map((property) => {
        const start = property.tenant?.startDate ? new Date(property.tenant.startDate) : new Date(property.createdAt || today);
        const dueDate = new Date(start);
        while (dueDate <= today) {
          dueDate.setMonth(dueDate.getMonth() + 1);
        }
        return {
          id: property._id,
          shop: property.location,
          tenant: property.tenant?.name || 'Vacant',
          amount: property.monthlyRent || 0,
          status: property.tenant?.rentStatus || 'pending',
          dueDate,
        };
      })
      .sort((a, b) => a.dueDate - b.dueDate)
      .slice(0, 5);
  }, [properties]);

  const tenantSnapshot = useMemo(
    () =>
      tenants.slice(0, 6).map((tenant) => ({
        name: tenant.name,
        property:
          tenant.propertyId && tenant.propertyId.location
            ? `${tenant.propertyId.propertyType} • ${tenant.propertyId.location}`
            : 'Unassigned',
        rentStatus: tenant.rentStatus || 'pending',
        electricStatus: tenant.lightBillStatus || 'pending',
        maintStatus: tenant.maintenanceStatus || 'pending',
      })),
    [tenants]
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const currency = (value = 0) => `₹${(value || 0).toLocaleString()}`;

  const summaryCards = [
    {
      title: 'Total Houses',
      value: overview?.totalProperties || 0,
      helper: 'Registered units',
      icon: <HomeIcon />,
    },
    {
      title: 'Active Tenants',
      value: overview?.totalTenants || tenants.length,
      helper: 'Contracts running',
      icon: <PeopleIcon />,
    },
    {
      title: 'Rent Collected',
      value: currency(rentCollected),
      helper: `Pending ${currency(overview?.pendingRent)}`,
      icon: <PaymentsIcon />,
    },
    {
      title: 'Invoices Due',
      value: aggregate.pendingRentCount,
      helper: 'Need follow-up',
      icon: <ElectricIcon />,
    },
  ];

  return (
    <Stack spacing={4}>
      {/* <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Quick insight into properties, tenants, and rent statuses.
        </Typography>
      </Box> */}

      <Grid container spacing={3}>
        {summaryCards.map((card) => (
          <Grid item xs={12} sm={12} md={12} key={card.title}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.light', color: '#fff' }}>{card.icon}</Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {card.title}
                    </Typography>
                    <Typography variant="h5">{card.value}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {card.helper}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Collection Overview
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Collected" fill="#2b6cb0" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Pending" fill="#f7a727" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <EventIcon color="primary" />
                <Typography variant="h6">Upcoming Due Dates</Typography>
              </Stack>
              <List dense>
                {upcomingDueDates.map((item) => (
                  <ListItem key={item.id} disableGutters sx={{ mb: 1.5 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.dark' }}>
                        {item.shop.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.shop}
                      secondary={`${item.tenant} · ${item.dueDate.toLocaleDateString()}`}
                    />
                    <Chip
                      label={currency(item.amount)}
                      color={item.status === 'paid' ? 'success' : 'warning'}
                      size="small"
                    />
                  </ListItem>
                ))}
                {!upcomingDueDates.length && (
                  <Typography variant="body2" color="text.secondary">
                    No invoices scheduled for this month.
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Tenant Payment Snapshot
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tenant</TableCell>
                <TableCell>Property</TableCell>
                <TableCell>Rent</TableCell>
                <TableCell>Electricity</TableCell>
                <TableCell>Maintenance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tenantSnapshot.map((row) => (
                <TableRow key={`${row.name}-${row.property}`}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.property}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.rentStatus === 'paid' ? 'Paid' : 'Pending'}
                      color={row.rentStatus === 'paid' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.electricStatus === 'paid' ? 'Paid' : 'Pending'}
                      color={row.electricStatus === 'paid' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.maintStatus === 'paid' ? 'Paid' : 'Pending'}
                      color={row.maintStatus === 'paid' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
              {!tenantSnapshot.length && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body2" color="text.secondary">
                      No tenant data available yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default Dashboard;


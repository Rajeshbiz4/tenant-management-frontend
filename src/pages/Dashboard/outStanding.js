import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Grid,
  MenuItem,
} from '@mui/material';
import { fetchProperties } from '../../store/slices/propertySlice';
import { getPayments } from '../../store/slices/paymentSlice';

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
  });

  useEffect(() => {
    dispatch(fetchProperties({ page: 1, limit: 100 }));
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
  }, [dispatch, filters.flat, year]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
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
    return (
      (!filters.tenant || row.tenantId === filters.tenant) &&
      (!filters.flat || row.flatId === filters.flat) &&
      (!filters.month || row.month === filters.month)
    );
  });

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Outstanding Payments
      </Typography>

      {/* Filters */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={4}>
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
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            label="Flat"
            name="flat"
            value={filters.flat}
            onChange={handleFilterChange}
          >
            <MenuItem value="">All Flats</MenuItem>
            {flatOptions.map((f) => (
              <MenuItem key={f.id} value={f.id}>
                {f.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={4}>
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
        </Grid>
      </Grid>

      {/* Table */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Flat Number</TableCell>
              <TableCell>Tenant Name</TableCell>
              <TableCell>Month</TableCell>
              <TableCell align="right" sx={{ color: '#1565C0', fontWeight: 600 }}>Rent Pending (₹)</TableCell>
              <TableCell align="right" sx={{ color: '#EF6C00', fontWeight: 600 }}>Maintenance Pending (₹)</TableCell>
              <TableCell align="right" sx={{ color: '#F9A825', fontWeight: 600 }}>Light Pending (₹)</TableCell>
              <TableCell align="right" sx={{ color: '#6A1B9A', fontWeight: 600 }}>Advance Pending (₹)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Total Outstanding (₹)</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No Outstanding Payments 🎉
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row, index) => (
                <TableRow key={index} sx={{ backgroundColor: '#ffebee' }}>
                  <TableCell>{row.flat}</TableCell>
                  <TableCell>{row.tenant}</TableCell>
                  <TableCell>{row.month}</TableCell>
                  <TableCell align="right">{row.rentPending}</TableCell>
                  <TableCell align="right">{row.maintenancePending}</TableCell>
                  <TableCell align="right">{row.lightPending}</TableCell>
                  <TableCell align="right">{row.advancePending}</TableCell>
                  <TableCell align="right">{row.totalOutstanding}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

export default OutstandingPaymentsPage;

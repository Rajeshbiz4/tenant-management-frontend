import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { fetchProperties } from '../../store/slices/propertySlice';
import { makePayment, getPayments } from '../../store/slices/paymentSlice';

const validationSchema = Yup.object({
  propertyId: Yup.string().required('Property is required'),
  tenantId: Yup.string().required('Tenant is required'),
  type: Yup.string().required('Payment type is required'),
  amount: Yup.number().min(1, 'Minimum 1').required('Amount is required'),
  paidOn: Yup.date().required('Payment date is required'),
  rentMonth: Yup.number().required('Month is required'),
});

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function PaymentsPage() {
  const dispatch = useDispatch();
  const { properties } = useSelector((state) => state.property);
  const { payments } = useSelector((state) => state.payment);

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [year] = useState(new Date().getFullYear());
  const [monthlySummary, setMonthlySummary] = useState([]);

  useEffect(() => {
    dispatch(fetchProperties({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (selectedProperty) calculateMonthlySummary();
  }, [payments, selectedProperty]);

  const paymentFormik = useFormik({
    initialValues: {
      propertyId: '',
      tenantId: '',
      type: 'rent',
      amount: '',
      paidOn: new Date().toISOString().split('T')[0],
      rentMonth: new Date().getMonth() + 1, // ✅ default current month

    },
    validationSchema,
    onSubmit: async (values) => {
      const paidDate = new Date(values.paidOn);

    const payload = {
      ...values,
      rentMonth: values.rentMonth,     // ✅ explicitly added
      month: values.rentMonth,         // (optional: keep if backend already uses `month`)
      year: paidDate.getFullYear(),
    };

    await dispatch(makePayment(payload));
    paymentFormik.resetForm();
    dispatch(getPayments({ propertyId: values.propertyId, year }));
  },
  });

  const handlePropertyChange = (propertyId) => {
    paymentFormik.setFieldValue('propertyId', propertyId);

    const property = properties.find((p) => p._id === propertyId);
    setSelectedProperty(property || null);

    if (property?.tenant) {
      paymentFormik.setFieldValue('tenantId', property.tenant._id);
      dispatch(getPayments({ propertyId, year }));
    } else {
      paymentFormik.setFieldValue('tenantId', '');
      setMonthlySummary([]);
    }
  };

  // ------------------ MONTHLY SUMMARY ------------------
  const calculateMonthlySummary = () => {
    if (!selectedProperty?.tenant) {
      setMonthlySummary([]);
      return;
    }

    const tenantStart = new Date(selectedProperty.tenant.startDate);
    const tenantEnd = selectedProperty.tenant.endDate
      ? new Date(selectedProperty.tenant.endDate)
      : null;

    const summary = monthNames
      .map((month, index) => {
        const monthNumber = index + 1;
        const checkDate = new Date(year, index, 1);

        // ❌ Skip non-active months
        if (
          checkDate < new Date(tenantStart.getFullYear(), tenantStart.getMonth(), 1) ||
          (tenantEnd && checkDate > new Date(tenantEnd.getFullYear(), tenantEnd.getMonth(), 1))
        ) {
          return null;
        }

        const paymentsInMonth = payments.filter((p) => p.month === monthNumber);

        const rentDue = selectedProperty.rent?.amount || 0;
        const maintenanceDue = selectedProperty.rent?.maintenance || 0;
        const lightDue =
          (selectedProperty.electricity?.lastUnit || 0) *
          (selectedProperty.electricity?.unitRate || 0);

        const paid = (type) =>
          paymentsInMonth
            .filter((p) => p.type === type)
            .reduce((sum, p) => sum + p.amount, 0);

        return {
          month,
          rentPaid: paid('rent'),
          rentPending: Math.max(rentDue - paid('rent'), 0),
          maintenancePaid: paid('maintenance'),
          maintenancePending: Math.max(maintenanceDue - paid('maintenance'), 0),
          lightPaid: paid('light'),
          lightPending: Math.max(lightDue - paid('light'), 0),
        };
      })
      .filter(Boolean);

    setMonthlySummary(summary);
  };
  // ----------------------------------------------------

  // ------------------ OUTSTANDING SUMMARY ------------------
  const outstandingSummary = monthlySummary.reduce(
    (acc, m) => {
      if (m.rentPending > 0) acc.rent++;
      if (m.maintenancePending > 0) acc.maintenance++;
      if (m.lightPending > 0) acc.light++;
      return acc;
    },
    { rent: 0, maintenance: 0, light: 0 }
  );

  const hasOutstanding =
    outstandingSummary.rent ||
    outstandingSummary.maintenance ||
    outstandingSummary.light;
  // --------------------------------------------------------

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Property Payments
      </Typography>

      {/* Payment Form */}
      <Card sx={{ mb: 3 }}>
       <CardContent>
  <form onSubmit={paymentFormik.handleSubmit}>
    <Grid container spacing={2}>

      {/* Property */}
      <Grid item xs={12} md={6}>
        <TextField
          select
          fullWidth
          label="Property"
          name="propertyId"
          value={paymentFormik.values.propertyId}
          onChange={(e) => handlePropertyChange(e.target.value)}
          onBlur={paymentFormik.handleBlur}
          error={paymentFormik.touched.propertyId && Boolean(paymentFormik.errors.propertyId)}
          helperText={paymentFormik.touched.propertyId && paymentFormik.errors.propertyId}
        >
          {properties.map((p) => (
            <MenuItem key={p._id} value={p._id}>
              {p.shopName} - {p.location}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* Tenant */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Tenant"
          value={selectedProperty?.tenant?.name || ''}
          disabled
        />
      </Grid>

      {/* Payment Type */}
      <Grid item xs={12} md={4}>
        <TextField
          select
          fullWidth
          label="Type"
          name="type"
          value={paymentFormik.values.type}
          onChange={paymentFormik.handleChange}
          onBlur={paymentFormik.handleBlur}
          error={paymentFormik.touched.type && Boolean(paymentFormik.errors.type)}
          helperText={paymentFormik.touched.type && paymentFormik.errors.type}
        >
          <MenuItem value="rent">Rent</MenuItem>
          <MenuItem value="maintenance">Maintenance</MenuItem>
          <MenuItem value="light">Light</MenuItem>
          <MenuItem value="advance">Advance</MenuItem>
        </TextField>
      </Grid>

      {/* Month */}
      <Grid item xs={12} md={4}>
        <TextField
          select
          fullWidth
          label="Month"
          name="rentMonth"
          value={paymentFormik.values.rentMonth}
          onChange={paymentFormik.handleChange}
          onBlur={paymentFormik.handleBlur}
          error={paymentFormik.touched.rentMonth && Boolean(paymentFormik.errors.rentMonth)}
          helperText={paymentFormik.touched.rentMonth && paymentFormik.errors.rentMonth}
        >
          {monthNames.map((month, index) => (
            <MenuItem key={month} value={index + 1}>
              {month}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* Amount */}
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          type="number"
          label="Amount"
          name="amount"
          value={paymentFormik.values.amount}
          onChange={paymentFormik.handleChange}
          onBlur={paymentFormik.handleBlur}
          error={paymentFormik.touched.amount && Boolean(paymentFormik.errors.amount)}
          helperText={paymentFormik.touched.amount && paymentFormik.errors.amount}
        />
      </Grid>

      {/* Paid On */}
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          type="date"
          label="Paid On"
          name="paidOn"
          InputLabelProps={{ shrink: true }}
          value={paymentFormik.values.paidOn}
          onChange={paymentFormik.handleChange}
          onBlur={paymentFormik.handleBlur}
          error={paymentFormik.touched.paidOn && Boolean(paymentFormik.errors.paidOn)}
          helperText={paymentFormik.touched.paidOn && paymentFormik.errors.paidOn}
        />
      </Grid>

      {/* Submit */}
      <Grid item xs={12}>
        <Button
          type="submit"
          variant="contained"
          disabled={!paymentFormik.isValid || paymentFormik.isSubmitting}
        >
          Make Payment
        </Button>
      </Grid>

    </Grid>
  </form>
</CardContent>

      </Card>

      {/* Yearly Summary */}
      {selectedProperty && monthlySummary.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6">Yearly Payment Summary ({year})</Typography>

            <Paper>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Month</TableCell>
                    <TableCell>Rent</TableCell>
                    <TableCell>Maintenance</TableCell>
                    <TableCell>Light</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {[...monthlySummary]
                    .sort((a, b) => monthNames.indexOf(b.month) - monthNames.indexOf(a.month))
                    .map((m) => (
                      <TableRow
                        key={m.month}
                        sx={{
                          backgroundColor:
                            m.rentPending || m.maintenancePending || m.lightPending
                              ? '#ffebee'
                              : '#e8f5e9',
                        }}
                      >
                        <TableCell>{m.month}</TableCell>
                        <TableCell sx={{ color: m.rentPending ? 'red' : 'green' }}>
                          ₹{m.rentPaid} / ₹{m.rentPending}
                        </TableCell>
                        <TableCell sx={{ color: m.maintenancePending ? 'red' : 'green' }}>
                          ₹{m.maintenancePaid} / ₹{m.maintenancePending}
                        </TableCell>
                        <TableCell sx={{ color: m.lightPending ? 'red' : 'green' }}>
                          ₹{m.lightPaid} / ₹{m.lightPending}
                        </TableCell>
                      </TableRow>
                    ))}

                  {/* Outstanding Summary */}
                  <TableRow
                    sx={{
                      backgroundColor: hasOutstanding ? '#ffcdd2' : '#c8e6c9',
                      fontWeight: 'bold',
                    }}
                  >
                    <TableCell>Outstanding Summary</TableCell>
                    <TableCell>{outstandingSummary.rent || 'No'} Month(s)</TableCell>
                    <TableCell>{outstandingSummary.maintenance || 'No'} Month(s)</TableCell>
                    <TableCell>{outstandingSummary.light || 'No'} Month(s)</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default PaymentsPage;

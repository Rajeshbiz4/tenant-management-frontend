import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FormControlLabel, Checkbox } from '@mui/material';

import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tabs,
  Tab,
  Stack,
  List,
  ListItem,
  ListItemText,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  Paid as PaidIcon,
  Pending as PendingIcon,
  FlashOn as FlashIcon,
  Build as BuildIcon,
  Payments as PaymentsIcon,
  CalendarToday as CalendarIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
import { getProperty } from '../../store/slices/propertySlice';
import {
  createTenant,
  deleteTenant,
  updateRentStatus,
  updateMaintenanceStatus,
  updateLightBillStatus,
} from '../../store/slices/tenantSlice';
import { getPayments, makePayment } from '../../store/slices/paymentSlice';
import { fetchMaintenance, createMaintenance } from '../../store/slices/maintenanceSlice';

const tenantValidationSchema = Yup.object({
  name: Yup.string().required('Name is required'),

  phone: Yup.string()
    .required('Phone is required'),

  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),

  aadhar: Yup.string()
    .required('Aadhar is required'),

  startDate: Yup.date()
    .required('Start date is required'),

  advance: Yup.number()
    .typeError('Advance must be a number')
    .positive('Advance must be greater than 0')
    .required('Advance is required'),

  isVerified: Yup.boolean()
    .required('Verification status is required'),
});


function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProperty } = useSelector((state) => state.property);
  const { payments } = useSelector((state) => state.payment);
  const { maintenanceRecords } = useSelector((state) => state.maintenance);
  const [loading, setLoading] = useState(true);
  const [tenantDialogOpen, setTenantDialogOpen] = useState(false);
  const [tab, setTab] = useState('rent');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await dispatch(getProperty(id));
      // Fetch payments for this property
      await dispatch(getPayments({ propertyId: id }));
      // Fetch maintenance records for this property
      await dispatch(fetchMaintenance({ property: id, limit: 50 }));
      setLoading(false);
    };
    if (id) {
      load();
    }
  }, [dispatch, id]);

  const refreshProperty = async () => {
    if (id) {
      await dispatch(getProperty(id));
      await dispatch(getPayments({ propertyId: id }));
      await dispatch(fetchMaintenance({ property: id, limit: 50 }));
    }
  };

  const tenant = currentProperty?.tenant || null;

  const tenantForm = useFormik({
    initialValues: {
  name: '',
  phone: '',
  email: '',
  aadhar: '',
  startDate: '',
  advance: '',
  isVerified: false,
  leaseId: id,
  propertyId: id,
},

    validationSchema: tenantValidationSchema,
    onSubmit: async (values) => {
      if (!id) return;
      await dispatch(createTenant({ leaseId: id, propertyId: id, tenantData: values }));
      setTenantDialogOpen(false);
      tenantForm.resetForm();
      refreshProperty();
    },
  });

  const handleDeleteTenant = async () => {
    if (!tenant?._id) return;
    if (!window.confirm('Are you sure you want to remove this tenant?')) return;
    await dispatch(deleteTenant(tenant._id));
    refreshProperty();
  };

  const toggleStatus = async (type) => {
    if (!tenant?._id) return;
    const current =
      type === 'rent'
        ? tenant.rentStatus
        : type === 'maintenance'
        ? tenant.maintenanceStatus
        : tenant.lightBillStatus;

    const next = current === 'paid' ? 'pending' : 'paid';

    if (type === 'rent') {
      await dispatch(updateRentStatus({ id: tenant._id, rentStatus: next }));
    } else if (type === 'maintenance') {
      await dispatch(
        updateMaintenanceStatus({ id: tenant._id, maintenanceStatus: next })
      );
    } else if (type === 'light') {
      await dispatch(
        updateLightBillStatus({ id: tenant._id, lightBillStatus: next })
      );
    }
    refreshProperty();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!currentProperty) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/properties')} sx={{ mb: 2 }}>
          Back to Shops
        </Button>
        <Typography variant="h6">Shop not found.</Typography>
      </Box>
    );
  }

  const tabConfig = [
    { id: 'rent', label: 'Rent History', icon: <PaymentsIcon /> },
    { id: 'electric', label: 'Electric Bills', icon: <FlashIcon /> },
    { id: 'maintenance', label: 'Maintenance', icon: <BuildIcon /> },
  ];

  // Get real data based on current tab
  const getRealHistoryData = () => {
    if (!currentProperty || !id) return [];

    switch (tab) {
      case 'rent':
        return payments
          .filter(payment => {
            // Handle both string and ObjectId comparisons
            const paymentPropertyId = payment.property?._id || payment.property;
            return (paymentPropertyId === id || paymentPropertyId?.toString() === id) && payment.type === 'rent';
          })
          .sort((a, b) => new Date(b.paidOn) - new Date(a.paidOn))
          .map(payment => ({
            id: payment._id,
            label: `Rent Payment`,
            amount: payment.amount,
            date: format(new Date(payment.paidOn), 'dd MMMM yyyy'),
            status: 'paid',
            type: 'rent',
            month: payment.month,
            year: payment.year,
            paidOn: payment.paidOn,
          }));

      case 'electric':
        return payments
          .filter(payment => {
            // Handle both string and ObjectId comparisons
            const paymentPropertyId = payment.property?._id || payment.property;
            return (paymentPropertyId === id || paymentPropertyId?.toString() === id) && payment.type === 'light';
          })
          .sort((a, b) => new Date(b.paidOn) - new Date(a.paidOn))
          .map(payment => ({
            id: payment._id,
            label: `Electric Bill Payment`,
            amount: payment.amount,
            date: format(new Date(payment.paidOn), 'dd MMMM yyyy'),
            status: 'paid',
            type: 'light',
            month: payment.month,
            year: payment.year,
            paidOn: payment.paidOn,
          }));

      case 'maintenance':
        return maintenanceRecords
          .filter(record => {
            // Handle both string and ObjectId comparisons
            const recordPropertyId = record.property?._id || record.property;
            return recordPropertyId === id || recordPropertyId?.toString() === id;
          })
          .sort((a, b) => new Date(b.activityDate) - new Date(a.activityDate))
          .map(record => ({
            id: record._id,
            label: record.description || 'Maintenance Work',
            amount: record.amount,
            date: format(new Date(record.activityDate), 'dd MMMM yyyy'),
            status: record.status,
            type: 'maintenance',
            maintainer: record.maintainer,
            activityDate: record.activityDate,
            paidDate: record.paidDate,
          }));

      default:
        return [];
    }
  };

  const historyData = getRealHistoryData();

  // Debug logging
  console.log('PropertyDetails Debug:', {
    propertyId: id,
    paymentsCount: payments.length,
    maintenanceCount: maintenanceRecords.length,
    currentTab: tab,
    historyDataCount: historyData.length,
    samplePayment: payments[0], // Full first payment for debugging
    sampleMaintenance: maintenanceRecords[0], // Full first maintenance record for debugging
    allPaymentPropertyIds: payments.map(p => ({
      id: p._id,
      property: p.property,
      propertyId: p.property?._id || p.property,
      type: p.type
    })),
    allMaintenancePropertyIds: maintenanceRecords.map(m => ({
      id: m._id,
      property: m.property,
      propertyId: m.property?._id || m.property
    }))
  });

  const createTestData = async (type) => {
    if (!tenant || !id) {
      alert('Need a tenant assigned to create test data');
      return;
    }

    try {
      if (type === 'rent' || type === 'electric') {
        // Create a test payment
        const paymentData = {
          propertyId: id,
          tenantId: tenant._id,
          type: type === 'rent' ? 'rent' : 'light',
          amount: type === 'rent' 
            ? (currentProperty.rent?.monthlyRent || currentProperty.monthlyRent || 5000)
            : (currentProperty.electricity?.lastUnit && currentProperty.electricity?.unitRate
                ? currentProperty.electricity.lastUnit * currentProperty.electricity.unitRate
                : 1000),
          paidOn: new Date().toISOString(),
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        };

        await dispatch(makePayment(paymentData));
        alert(`Test ${type} payment created successfully!`);
      } else if (type === 'maintenance') {
        // Create a test maintenance record
        const maintenanceData = {
          property: id,
          maintainer: 'Test Maintainer',
          activityDate: new Date().toISOString(),
          amount: 2000,
          description: 'Test maintenance work - plumbing repair',
          status: 'paid',
          paidDate: new Date().toISOString()
        };

        await dispatch(createMaintenance(maintenanceData));
        alert('Test maintenance record created successfully!');
      }

      // Refresh the data
      await refreshProperty();
    } catch (error) {
      console.error('Error creating test data:', error);
      alert('Error creating test data. Check console for details.');
    }
  };

  const currency = (amount) => `₹${amount?.toLocaleString('en-IN') || 0}`;

  const renderHistoryContent = () => {
    if (!tenant && tab !== 'maintenance') {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          Assign a tenant to begin tracking {tab === 'rent' ? 'rent payments' : 'electric bill payments'} for this property.
        </Typography>
      );
    }

    if (historyData.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No {tab === 'rent' ? 'rent payments' : tab === 'electric' ? 'electric bill payments' : 'maintenance records'} found for this property.
        </Typography>
      );
    }

    if (tab === 'maintenance') {
      return (
        <TableContainer component={Paper} elevation={0}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Maintainer</TableCell>
                <TableCell>Activity Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Paid Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historyData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {record.label}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {record.maintainer}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {record.date}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="primary.main">
                      {currency(record.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={record.status}
                      color={record.status === 'paid' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {record.paidDate ? format(new Date(record.paidDate), 'dd MMM yyyy') : '-'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    // For rent and electric bills
    return (
      <List>
        {historyData.map((entry) => (
          <ListItem key={entry.id} disableGutters divider>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
              <ReceiptIcon fontSize="small" color="action" />
              <ListItemText 
                primary={
                  <Typography variant="body1" fontWeight={500}>
                    {entry.label}
                  </Typography>
                }
                secondary={
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Paid on: {entry.date}
                    </Typography>
                    {entry.month && entry.year && (
                      <Typography variant="body2" color="text.secondary">
                        For: {new Date(entry.year, entry.month - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                      </Typography>
                    )}
                  </Stack>
                }
              />
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="h6" fontWeight={600} color="success.main">
                {currency(entry.amount)}
              </Typography>
              <Chip
                label={entry.status}
                color={entry.status === 'paid' ? 'success' : 'warning'}
                size="small"
              />
            </Stack>
          </ListItem>
        ))}
      </List>
    );
  };

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/properties')} sx={{ mb: 3 }}>
        Back to Shops
      </Button>
      <Typography variant="h4" gutterBottom>
        {currentProperty.location}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={3}>
        Shop #{currentProperty._id?.slice(-4)} · {tenant ? 'Occupied' : 'Vacant'}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} mb={2}>
                <Chip label={currentProperty.propertyType || 'Unknown'} color="primary" />
                <Chip label={`${currentProperty.area || 0} sq.ft`} />
              </Stack>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Monthly Rent
                  </Typography>
                  <Typography variant="h5">₹{currentProperty.rent?.monthlyRent || currentProperty.monthlyRent || 0}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Maintenance
                  </Typography>
                  <Typography variant="h5">₹{currentProperty.rent?.maintenance || currentProperty.maintenance || 0}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Light Bill (Last)
                  </Typography>
                  <Typography variant="h5">
                    ₹{currentProperty.electricity?.lastUnit && currentProperty.electricity?.unitRate
                      ? (currentProperty.electricity.lastUnit * currentProperty.electricity.unitRate)
                      : currentProperty.lightBill || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="h6">{tenant ? 'Occupied' : 'Vacant'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Agreement
                  </Typography>
                  <Typography variant="body1">
                    {currentProperty.agreement?.startDate
                      ? format(new Date(currentProperty.agreement.startDate), 'dd MMMM yyyy')
                      : '-'}{' '}
                    (Months: {currentProperty.agreement?.months || 0})
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Tenant</Typography>
                {!tenant && (
                  <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setTenantDialogOpen(true)}>
                    Add Tenant
                  </Button>
                )}
              </Stack>
              {tenant ? (
                <Box mt={2}>
                  <Typography variant="body1" fontWeight={600}>
                    {tenant.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tenant.email} · {tenant.phone}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Start date: {tenant.startDate ? format(new Date(tenant.startDate), 'dd MMMM yyyy') : '-'}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={3}>
                    <Chip
                      icon={tenant.rentStatus === 'paid' ? <PaidIcon /> : <PendingIcon />}
                      label={`Rent ${tenant.rentStatus || 'pending'}`}
                      color={tenant.rentStatus === 'paid' ? 'success' : 'warning'}
                    />
                    <Chip
                      icon={tenant.maintenanceStatus === 'paid' ? <PaidIcon /> : <PendingIcon />}
                      label={`Maint ${tenant.maintenanceStatus || 'pending'}`}
                      color={tenant.maintenanceStatus === 'paid' ? 'success' : 'warning'}
                    />
                    <Chip
                      icon={tenant.lightBillStatus === 'paid' ? <PaidIcon /> : <PendingIcon />}
                      label={`Elec ${tenant.lightBillStatus || 'pending'}`}
                      color={tenant.lightBillStatus === 'paid' ? 'success' : 'warning'}
                    />
                  </Stack>
                  <Stack direction="row" spacing={1} mt={3}>
                    <Button variant="outlined" size="small" onClick={() => toggleStatus('rent')}>
                      Toggle Rent
                    </Button>
                    <Button variant="outlined" size="small" onClick={() => toggleStatus('maintenance')}>
                      Toggle Maint
                    </Button>
                    <Button variant="outlined" size="small" onClick={() => toggleStatus('light')}>
                      Toggle Elec
                    </Button>
                  </Stack>
                  <Button
                    variant="text"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDeleteTenant}
                    sx={{ mt: 2 }}
                  >
                    Remove Tenant
                  </Button>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" mt={2}>
                  No tenant assigned to this shop yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Tabs value={tab} onChange={(_, value) => setTab(value)}>
            {tabConfig.map((item) => (
              <Tab
                key={item.id}
                value={item.id}
                icon={item.icon}
                iconPosition="start"
                label={item.label}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              />
            ))}
          </Tabs>
          <Divider sx={{ mb: 2 }} />
          
          {/* Debug Information - Remove this after fixing */}
          {process.env.NODE_ENV === 'development' && (
            <Card sx={{ mb: 3, bgcolor: 'info.light' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Debug Information</Typography>
                <Typography variant="body2">Property ID: {id}</Typography>
                <Typography variant="body2">Total Payments: {payments.length}</Typography>
                <Typography variant="body2">Total Maintenance: {maintenanceRecords.length}</Typography>
                <Typography variant="body2">Current Tab: {tab}</Typography>
                <Typography variant="body2">History Data Count: {historyData.length}</Typography>
                {payments.length > 0 && (
                  <Typography variant="body2">
                    Sample Payment Property ID: {payments[0]?.property?._id || payments[0]?.property}
                  </Typography>
                )}
                {maintenanceRecords.length > 0 && (
                  <Typography variant="body2">
                    Sample Maintenance Property ID: {maintenanceRecords[0]?.property?._id || maintenanceRecords[0]?.property}
                  </Typography>
                )}
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      console.log('All Payments:', payments);
                      console.log('All Maintenance:', maintenanceRecords);
                      console.log('Current Property:', currentProperty);
                    }}
                  >
                    Log All Data to Console
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Summary Stats for Current Tab */}
          {historyData.length > 0 && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Records
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    {historyData.length}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    {currency(historyData.reduce((sum, item) => sum + (item.amount || 0), 0))}
                  </Typography>
                </Card>
              </Grid>
              {tab === 'maintenance' && (
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Pending Amount
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="warning.main">
                      {currency(historyData.filter(item => item.status === 'pending').reduce((sum, item) => sum + (item.amount || 0), 0))}
                    </Typography>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}

          {/* History Content */}
          {renderHistoryContent()}

          {/* Add Test Data Button - Development Only */}
          {process.env.NODE_ENV === 'development' && historyData.length === 0 && tenant && (
            <Box sx={{ textAlign: 'center', mt: 3, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                No {tab} data found. Would you like to add some test data?
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => createTestData(tab)}
                sx={{ mt: 1 }}
              >
                Add Test {tab && typeof tab === 'string' ? tab.charAt(0).toUpperCase() + tab.slice(1) : 'Data'} Data
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog open={tenantDialogOpen} onClose={() => setTenantDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Tenant</DialogTitle>
        <form onSubmit={tenantForm.handleSubmit}>
        <DialogContent>
  <TextField
    fullWidth
    margin="normal"
    id="name"
    name="name"
    label="Name"
    value={tenantForm.values.name}
    onChange={tenantForm.handleChange}
    onBlur={tenantForm.handleBlur}
    error={tenantForm.touched.name && Boolean(tenantForm.errors.name)}
    helperText={tenantForm.touched.name && tenantForm.errors.name}
  />

  <TextField
    fullWidth
    margin="normal"
    id="phone"
    name="phone"
    label="Phone"
    value={tenantForm.values.phone}
    onChange={tenantForm.handleChange}
    onBlur={tenantForm.handleBlur}
    error={tenantForm.touched.phone && Boolean(tenantForm.errors.phone)}
    helperText={tenantForm.touched.phone && tenantForm.errors.phone}
  />

  <TextField
    fullWidth
    margin="normal"
    id="email"
    name="email"
    label="Email"
    value={tenantForm.values.email}
    onChange={tenantForm.handleChange}
    onBlur={tenantForm.handleBlur}
    error={tenantForm.touched.email && Boolean(tenantForm.errors.email)}
    helperText={tenantForm.touched.email && tenantForm.errors.email}
  />

  <TextField
    fullWidth
    margin="normal"
    id="aadhar"
    name="aadhar"
    label="Aadhar"
    value={tenantForm.values.aadhar}
    onChange={tenantForm.handleChange}
    onBlur={tenantForm.handleBlur}
    error={tenantForm.touched.aadhar && Boolean(tenantForm.errors.aadhar)}
    helperText={tenantForm.touched.aadhar && tenantForm.errors.aadhar}
  />

  <TextField
    fullWidth
    margin="normal"
    id="startDate"
    name="startDate"
    label="Start Date"
    type="date"
    InputLabelProps={{ shrink: true }}
    value={tenantForm.values.startDate}
    onChange={tenantForm.handleChange}
    onBlur={tenantForm.handleBlur}
    error={tenantForm.touched.startDate && Boolean(tenantForm.errors.startDate)}
    helperText={tenantForm.touched.startDate && tenantForm.errors.startDate}
  />

  {/* ✅ ADVANCE AMOUNT */}
  <TextField
    fullWidth
    margin="normal"
    id="advance"
    name="advance"
    label="Advance Amount"
    type="number"
    value={tenantForm.values.advance}
    onChange={tenantForm.handleChange}
    onBlur={tenantForm.handleBlur}
    error={tenantForm.touched.advance && Boolean(tenantForm.errors.advance)}
    helperText={tenantForm.touched.advance && tenantForm.errors.advance}
  />

  {/* ✅ IS VERIFIED */}
 <FormControlLabel
  control={
    <Checkbox
      name="isVerified"
      checked={Boolean(tenantForm.values.isVerified)}
      onChange={(e) => {
        tenantForm.setFieldValue('isVerified', e.target.checked);
      }}
      onBlur={tenantForm.handleBlur}
      color="primary"
    />
  }
  label="Is Verified"
/>
</DialogContent>

          <DialogActions>
            <Button onClick={() => setTenantDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default PropertyDetails;

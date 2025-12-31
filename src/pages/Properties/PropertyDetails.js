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
  const [loading, setLoading] = useState(true);
  const [tenantDialogOpen, setTenantDialogOpen] = useState(false);
  const [tab, setTab] = useState('rent');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await dispatch(getProperty(id));
      setLoading(false);
    };
    if (id) {
      load();
    }
  }, [dispatch, id]);

  const refreshProperty = () => {
    if (id) {
      dispatch(getProperty(id));
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

  const historyItems = Array.from({ length: tenant ? 3 : 0 }).map((_, idx) => ({
    label: `${tabConfig.find((t) => t.id === tab)?.label || 'Payment'} #${idx + 1}`,
    amount:
      tab === 'electric'
        ? currentProperty.electricity?.lastUnit * currentProperty.electricity?.unitRate || 0
        : tab === 'maintenance'
        ? currentProperty.rent?.maintenance || 0
        : currentProperty.rent?.amount || 0,
    date: format(new Date(Date.now() - idx * 30 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy'),
    status:
      tab === 'electric'
        ? tenant?.lightBillStatus
        : tab === 'maintenance'
        ? tenant?.maintenanceStatus
        : tenant?.rentStatus,
  }));

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
                <Chip label={currentProperty.propertyType} color="primary" />
                <Chip label={`${currentProperty.area} sq.ft`} />
              </Stack>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Monthly Rent
                  </Typography>
                  <Typography variant="h5">₹{currentProperty.rent?.amount || 0}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Maintenance
                  </Typography>
                  <Typography variant="h5">₹{currentProperty.rent?.maintenance || 0}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Light Bill
                  </Typography>
                  <Typography variant="h5">
                    ₹{currentProperty.electricity?.lastUnit * currentProperty.electricity?.unitRate || 0}
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
          {tenant ? (
            <List>
              {historyItems.map((entry, idx) => (
                <ListItem key={idx} disableGutters divider={idx < historyItems.length - 1}>
                  <ListItemText primary={entry.label} secondary={`Due: ${entry.date}`} />
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body1" fontWeight={600}>
                      ₹{entry.amount}
                    </Typography>
                    <Chip
                      label={entry.status || 'pending'}
                      color={entry.status === 'paid' ? 'success' : 'warning'}
                      size="small"
                    />
                  </Stack>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Assign a tenant to begin tracking payments for this shop.
            </Typography>
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

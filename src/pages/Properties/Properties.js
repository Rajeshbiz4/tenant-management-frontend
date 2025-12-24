import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, CardActions,
  IconButton, TextField, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, Pagination, CircularProgress,
  Chip, Stack, Tooltip, Avatar, Grid
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Visibility as ViewIcon, Store as ShopIcon,
  Home as FlatIcon, Terrain as PlotIcon, Home as HomeIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
import {
  fetchProperties, createProperty, updateProperty, deleteProperty
} from '../../store/slices/propertySlice';

const validationSchema = Yup.object({
  propertyType: Yup.string().required('Property type is required'),
  shopName: Yup.string().required('Shop name is required'),
  shopNumber: Yup.string().required('Shop number is required'),
  area: Yup.number().positive('Area must be positive').required('Area is required'),
  location: Yup.string().required('Location is required'),
  rentAmount: Yup.number().positive('Rent must be positive').required('Rent amount is required'),
  rentDeposit: Yup.number().min(0, 'Deposit must be positive').required('Deposit is required'),
  rentPaymentDay: Yup.number().min(1).max(31, 'Payment day must be 1-31').required('Payment day is required'),
  electricitySubmeter: Yup.string(),
  electricityLastUnit: Yup.number().min(0),
  electricityUnitRate: Yup.number().min(0),
  agreementStart: Yup.string().required('Agreement start date required'),
  agreementMonths: Yup.number().min(0, 'Months cannot be negative'),
});

const getPropertyIcon = (type) => {
  switch (type) {
    case 'shop':
      return <ShopIcon fontSize="large" color="primary" />;
    case 'flat':
      return <FlatIcon fontSize="large" color="secondary" />;
    case 'plot':
      return <PlotIcon fontSize="large" color="success" />;
    default:
      return <HomeIcon fontSize="large" />;
  }
};

function Properties() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { properties, pagination, loading } = useSelector((state) => state.property);
  const [open, setOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [propertyType, setPropertyType] = useState('');

  useEffect(() => {
    dispatch(fetchProperties({ page, limit: 10, search, propertyType }));
  }, [dispatch, page, search, propertyType]);

  const formik = useFormik({
    initialValues: {
      propertyType: '',
      shopName: '',
      shopNumber: '',
      area: '',
      location: '',
      agreementStart: '',
      agreementMonths: 0,
      rentAmount: 0,
      rentDeposit: 0,
      rentPaymentDay: 1,
      electricitySubmeter: '',
      electricityLastUnit: 0,
      electricityUnitRate: 0,
      tenant: null
    },
    validationSchema,
    onSubmit: async (values) => {
      const payload = {
        propertyType: values.propertyType,
        shopName: values.shopName,
        shopNumber: values.shopNumber,
        area: Number(values.area),
        location: values.location,
        agreement: {
          startDate: values.agreementStart,
          months: Number(values.agreementMonths),
        },
        rent: {
          amount: Number(values.rentAmount),
          deposit: Number(values.rentDeposit),
          paymentDay: Number(values.rentPaymentDay),
        },
        electricity: {
          submeterNo: values.electricitySubmeter,
          lastUnit: Number(values.electricityLastUnit),
          unitRate: Number(values.electricityUnitRate),
        },
        tenant: values.tenant || null,
        isActive: values.tenant ? true : false
      };

      if (editingProperty) {
        await dispatch(updateProperty({ id: editingProperty._id, ...payload }));
      } else {
        await dispatch(createProperty(payload));
      }

      setOpen(false);
      setEditingProperty(null);
      formik.resetForm();
      dispatch(fetchProperties({ page, limit: 10, search, propertyType }));
    },
  });

  const handleEdit = (property) => {
    setEditingProperty(property);
    formik.setValues({
      propertyType: property.propertyType,
      shopName: property.shopName,
      shopNumber: property.shopNumber,
      area: property.area,
      location: property.location,
      agreementStart: property.agreement?.startDate || '',
      agreementMonths: property.agreement?.months || 0,
      rentAmount: property.rent?.amount || 0,
      rentDeposit: property.rent?.deposit || 0,
      rentPaymentDay: property.rent?.paymentDay || 1,
      electricitySubmeter: property.electricity?.submeterNo || '',
      electricityLastUnit: property.electricity?.lastUnit || 0,
      electricityUnitRate: property.electricity?.unitRate || 0,
      tenant: property.tenant || null,
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      await dispatch(deleteProperty(id));
      dispatch(fetchProperties({ page, limit: 10, search, propertyType }));
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingProperty(null);
    formik.resetForm();
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2} mb={3}>
        <Box>
          <Typography variant="h4">Shops</Typography>
          <Typography variant="body2" color="text.secondary">
            Overview of all shops and their current status.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingProperty(null); formik.resetForm(); setOpen(true); }}>
          Add Shop
        </Button>
      </Box>

      {/* Filters */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
        <TextField
          label="Search by location"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          fullWidth
        />
        <TextField
          select
          label="Shop Type"
          value={propertyType}
          onChange={(e) => { setPropertyType(e.target.value); setPage(1); }}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All types</MenuItem>
          <MenuItem value="flat">Flat</MenuItem>
          <MenuItem value="shop">Shop</MenuItem>
          <MenuItem value="plot">Plot</MenuItem>
        </TextField>
      </Stack>

      {/* Cards */}
      {loading ? <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box> : (
        <Grid container spacing={3}>
          {properties.length === 0 && (
            <Grid item xs={12}>
              <Typography align="center">No shops found.</Typography>
            </Grid>
          )}
        {properties.map((property) => (
  <Grid item xs={12} sm={6} md={4} key={property._id}>
    <Card sx={{ 
      boxShadow: 3, 
      transition: 'transform 0.2s, box-shadow 0.2s', 
      '&:hover': { transform: 'scale(1.03)', boxShadow: 6 } 
    }}>
      {/* Header with avatar and property info */}
      <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Avatar sx={{ bgcolor: 'primary.light', width: 56, height: 56 }}>
          {getPropertyIcon(property.propertyType)}
        </Avatar>
        <Box flex={1}>
          <Typography variant="h6" gutterBottom>{property.shopName}</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {property.shopNumber} | {property.propertyType} | {property.area} sq.ft
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 0.5 }}>
            <Chip label={`Rent: ₹${property.rent?.amount || 0}`} size="small" color="primary" />
            <Chip label={`Deposit: ₹${property.rent?.deposit || 0}`} size="small" color="success" />
            <Chip label={`Day ${property.rent?.paymentDay || 1}`} size="small" color="warning" />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Agreement: {property.agreement?.startDate ? format(new Date(property.agreement.startDate), 'dd MMM yyyy') : '-'} 
            ({property.agreement?.months || 0} months)
          </Typography>
          <Chip 
            label={property.tenant ? 'Active' : 'Vacant'} 
            color={property.tenant ? 'success' : 'default'} 
            size="small" 
            sx={{ mt: 1 }} 
          />
        </Box>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <Tooltip title="View Details">
          <IconButton size="small" onClick={() => navigate(`/properties/${property._id}`)}>
            <ViewIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit Property">
          <IconButton size="small" onClick={() => handleEdit(property)}>
            <EditIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Property">
          <IconButton size="small" color="error" onClick={() => handleDelete(property._id)}>
            <DeleteIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  </Grid>
))}

        </Grid>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination count={pagination.totalPages} page={page} onChange={(e, value) => setPage(value)} />
        </Box>
      )}

      {/* Modal */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProperty ? 'Edit Property' : 'Add Property'}</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            {/* Basic Info */}
            <TextField fullWidth margin="normal" label="Shop Name" name="shopName" value={formik.values.shopName} onChange={formik.handleChange} />
            <TextField fullWidth margin="normal" label="Shop Number" name="shopNumber" value={formik.values.shopNumber} onChange={formik.handleChange} />
            <TextField select fullWidth margin="normal" label="Property Type" name="propertyType" value={formik.values.propertyType} onChange={formik.handleChange}>
              <MenuItem value="flat">Flat</MenuItem>
              <MenuItem value="shop">Shop</MenuItem>
              <MenuItem value="plot">Plot</MenuItem>
            </TextField>
            <TextField fullWidth margin="normal" label="Area (sq.ft)" name="area" type="number" value={formik.values.area} onChange={formik.handleChange} />
            <TextField fullWidth margin="normal" label="Location" name="location" value={formik.values.location} onChange={formik.handleChange} />

            {/* Agreement */}
            <TextField fullWidth margin="normal" label="Agreement Start Date" name="agreementStart" type="date" InputLabelProps={{ shrink: true }} value={formik.values.agreementStart ? new Date(formik.values.agreementStart).toISOString().split('T')[0] : ''} onChange={formik.handleChange} />
            <TextField fullWidth margin="normal" label="Agreement Months" name="agreementMonths" type="number" value={formik.values.agreementMonths} onChange={formik.handleChange} />

            {/* Rent */}
            <TextField fullWidth margin="normal" label="Rent Amount" name="rentAmount" type="number" value={formik.values.rentAmount} onChange={formik.handleChange} />
            <TextField fullWidth margin="normal" label="Deposit" name="rentDeposit" type="number" value={formik.values.rentDeposit} onChange={formik.handleChange} />
            <TextField fullWidth margin="normal" label="Payment Day" name="rentPaymentDay" type="number" value={formik.values.rentPaymentDay} onChange={formik.handleChange} />

            {/* Electricity */}
            <TextField fullWidth margin="normal" label="Submeter No" name="electricitySubmeter" value={formik.values.electricitySubmeter} onChange={formik.handleChange} />
            <TextField fullWidth margin="normal" label="Last Unit" name="electricityLastUnit" type="number" value={formik.values.electricityLastUnit} onChange={formik.handleChange} />
            <TextField fullWidth margin="normal" label="Unit Rate" name="electricityUnitRate" type="number" value={formik.values.electricityUnitRate} onChange={formik.handleChange} />

          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">{editingProperty ? 'Update' : 'Create'}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Properties;

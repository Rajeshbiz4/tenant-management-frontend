import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  CircularProgress,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Paid as PaidIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  fetchProperties,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../../store/slices/propertySlice';

const validationSchema = Yup.object({
  propertyType: Yup.string().required('Property type is required'),
  area: Yup.number().positive('Area must be positive').required('Area is required'),
  location: Yup.string().required('Location is required'),
  monthlyRent: Yup.number().positive('Rent must be positive').required('Monthly rent is required'),
  maintenance: Yup.number().min(0, 'Maintenance must be positive').required('Maintenance is required'),
  lightBill: Yup.number().min(0, 'Light bill must be positive'),
});

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
      area: '',
      location: '',
      monthlyRent: '',
      maintenance: '',
      lightBill: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      if (editingProperty) {
        await dispatch(updateProperty({ id: editingProperty._id, ...values }));
      } else {
        await dispatch(createProperty(values));
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
      area: property.area,
      location: property.location,
      monthlyRent: property.monthlyRent,
      maintenance: property.maintenance || 0,
      lightBill: property.lightBill || 0,
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
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2} mb={3}>
        <Box>
          <Typography variant="h4">Shops</Typography>
          <Typography variant="body2" color="text.secondary">
            Overview of every shop, rent agreement, and utility status.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingProperty(null);
            formik.resetForm();
            setOpen(true);
          }}
          sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}
        >
          Add Shop
        </Button>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
        <TextField
          label="Search by location"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          fullWidth
        />
        <TextField
          select
          label="Shop Type"
          value={propertyType}
          onChange={(e) => {
            setPropertyType(e.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All types</MenuItem>
          <MenuItem value="flat">Flat</MenuItem>
          <MenuItem value="shop">Shop</MenuItem>
          <MenuItem value="plot">Plot</MenuItem>
        </TextField>
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Card>
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Shop</TableCell>
                      <TableCell>Tenant</TableCell>
                      <TableCell align="right">Rent</TableCell>
                      <TableCell align="right">Electricity</TableCell>
                      <TableCell align="right">Maintenance</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {properties.map((property) => {
                      const tenant = property.tenant;
                      const statusChip = (state, label) => (
                        <Chip
                          label={label}
                          color={state === 'paid' ? 'success' : tenant ? 'warning' : 'default'}
                          size="small"
                          icon={state === 'paid' ? <PaidIcon /> : <PendingIcon />}
                        />
                      );
                      return (
                        <TableRow key={property._id}>
                          <TableCell>
                            <Typography variant="subtitle2">{property.location}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {property.propertyType} • {property.area} sq.ft
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {tenant ? (
                              <>
                                <Typography variant="body2">{tenant.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {tenant.phone}
                                </Typography>
                              </>
                            ) : (
                              <Chip label="Vacant" size="small" />
                            )}
                          </TableCell>
                          <TableCell align="right">₹{property.monthlyRent}</TableCell>
                          <TableCell align="right">₹{property.lightBill || 0}</TableCell>
                          <TableCell align="right">₹{property.maintenance || 0}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              {statusChip(tenant?.rentStatus, 'Rent')}
                              {statusChip(tenant?.lightBillStatus, 'Elec')}
                              {statusChip(tenant?.maintenanceStatus, 'Maint')}
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Tooltip title="View detail">
                                <IconButton size="small" onClick={() => navigate(`/properties/${property._id}`)}>
                                  <ViewIcon fontSize="inherit" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit shop">
                                <IconButton size="small" onClick={() => handleEdit(property)}>
                                  <EditIcon fontSize="inherit" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton size="small" color="error" onClick={() => handleDelete(property._id)}>
                                  <DeleteIcon fontSize="inherit" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {properties.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No shops found. Adjust filters or add a new record.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
          {pagination.totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination count={pagination.totalPages} page={page} onChange={(e, value) => setPage(value)} />
            </Box>
          )}
        </>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProperty ? 'Edit Property' : 'Add Property'}</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <TextField
              select
              fullWidth
              margin="normal"
              id="propertyType"
              name="propertyType"
              label="Property Type"
              value={formik.values.propertyType}
              onChange={formik.handleChange}
              error={formik.touched.propertyType && Boolean(formik.errors.propertyType)}
              helperText={formik.touched.propertyType && formik.errors.propertyType}
            >
              <MenuItem value="flat">Flat</MenuItem>
              <MenuItem value="shop">Shop</MenuItem>
              <MenuItem value="plot">Plot</MenuItem>
            </TextField>
            <TextField
              fullWidth
              margin="normal"
              id="area"
              name="area"
              label="Area (sq.ft)"
              type="number"
              value={formik.values.area}
              onChange={formik.handleChange}
              error={formik.touched.area && Boolean(formik.errors.area)}
              helperText={formik.touched.area && formik.errors.area}
            />
            <TextField
              fullWidth
              margin="normal"
              id="location"
              name="location"
              label="Location"
              value={formik.values.location}
              onChange={formik.handleChange}
              error={formik.touched.location && Boolean(formik.errors.location)}
              helperText={formik.touched.location && formik.errors.location}
            />
            <TextField
              fullWidth
              margin="normal"
              id="monthlyRent"
              name="monthlyRent"
              label="Monthly Rent"
              type="number"
              value={formik.values.monthlyRent}
              onChange={formik.handleChange}
              error={formik.touched.monthlyRent && Boolean(formik.errors.monthlyRent)}
              helperText={formik.touched.monthlyRent && formik.errors.monthlyRent}
            />
            <TextField
              fullWidth
              margin="normal"
              id="maintenance"
              name="maintenance"
              label="Maintenance"
              type="number"
              value={formik.values.maintenance}
              onChange={formik.handleChange}
              error={formik.touched.maintenance && Boolean(formik.errors.maintenance)}
              helperText={formik.touched.maintenance && formik.errors.maintenance}
            />
            <TextField
              fullWidth
              margin="normal"
              id="lightBill"
              name="lightBill"
              label="Light Bill (Optional)"
              type="number"
              value={formik.values.lightBill}
              onChange={formik.handleChange}
              error={formik.touched.lightBill && Boolean(formik.errors.lightBill)}
              helperText={formik.touched.lightBill && formik.errors.lightBill}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingProperty ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Properties;


import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Stack,
  Pagination,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Build as BuildIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalanceWallet as WalletIcon,
  PendingActions as PendingIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
import {
  fetchMaintenance,
  fetchMaintenanceStats,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
} from '../../store/slices/maintenanceSlice';
import { fetchProperties } from '../../store/slices/propertySlice';

const validationSchema = Yup.object({
  property: Yup.string().required('Flat is required'),
  maintainer: Yup.string().required('Maintainer is required'),
  activityDate: Yup.date().required('Activity date is required'),
  paidDate: Yup.date().nullable(),
  amount: Yup.number()
    .typeError('Amount must be a number')
    .moreThan(0, 'Amount must be greater than 0')
    .required('Amount is required'),
  description: Yup.string(),
});

function Maintenance() {
  const dispatch = useDispatch();
  const { maintenanceRecords, stats, pagination, loading } = useSelector((state) => state.maintenance);
  const { properties } = useSelector((state) => state.property);
  const [open, setOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedMaintainer, setSelectedMaintainer] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Get only flat properties
  const flatProperties = properties.filter(p => p.propertyType === 'flat');

  useEffect(() => {
    dispatch(fetchProperties({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    const filters = { page, limit: 10 };
    if (selectedProperty) filters.property = selectedProperty;
    if (selectedMaintainer) filters.maintainer = selectedMaintainer;
    if (statusFilter) filters.status = statusFilter;
    dispatch(fetchMaintenance(filters));
  }, [dispatch, page, selectedProperty, selectedMaintainer, statusFilter]);

  useEffect(() => {
    const statsFilters = {};
    if (selectedProperty) statsFilters.property = selectedProperty;
    dispatch(fetchMaintenanceStats(statsFilters));
  }, [dispatch, selectedProperty, maintenanceRecords]);

  const formik = useFormik({
    initialValues: {
      property: '',
      maintainer: '',
      activityDate: new Date().toISOString().split('T')[0],
      paidDate: '',
      amount: '',
      description: '',
      status: 'pending',
    },
    validationSchema,
    onSubmit: async (values) => {
      const payload = {
        property: values.property,
        maintainer: values.maintainer,
        activityDate: values.activityDate,
        paidDate: values.paidDate || null,
        amount: Number(values.amount),
        description: values.description || '',
        status: values.paidDate ? 'paid' : 'pending',
      };

      if (editingMaintenance) {
        await dispatch(updateMaintenance({ id: editingMaintenance._id, ...payload }));
      } else {
        await dispatch(createMaintenance(payload));
      }

      setOpen(false);
      setEditingMaintenance(null);
      formik.resetForm();
      dispatch(fetchMaintenance({ page, limit: 10 }));
      dispatch(fetchMaintenanceStats({}));
    },
  });

  const handleEdit = (maintenance) => {
    setEditingMaintenance(maintenance);
    formik.setValues({
      property: maintenance.property._id || maintenance.property,
      maintainer: maintenance.maintainer || '',
      activityDate: maintenance.activityDate
        ? new Date(maintenance.activityDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      paidDate: maintenance.paidDate
        ? new Date(maintenance.paidDate).toISOString().split('T')[0]
        : '',
      amount: maintenance.amount || '',
      description: maintenance.description || '',
      status: maintenance.status || 'pending',
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this maintenance record?')) {
      await dispatch(deleteMaintenance(id));
      dispatch(fetchMaintenance({ page, limit: 10 }));
      dispatch(fetchMaintenanceStats({}));
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingMaintenance(null);
    formik.resetForm();
  };

  // Get unique maintainers from records
  const maintainers = [...new Set(maintenanceRecords.map(m => m.maintainer))].sort();

  return (
    <Box>
      {/* Header */}
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2} mb={3}>
        <Box>
          <Typography variant="h4">Maintenance Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage maintenance records for flats
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingMaintenance(null);
            formik.resetForm();
            formik.setFieldValue('activityDate', new Date().toISOString().split('T')[0]);
            setOpen(true);
          }}
        >
          Add Maintenance
        </Button>
      </Box>

      {/* Overall Spending Board */}
      {stats && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <WalletIcon />
                  <Typography variant="h6">Total Spending</Typography>
                </Box>
                <Typography variant="h4">₹{stats.summary?.totalSpending?.toLocaleString() || 0}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {stats.summary?.totalRecords || 0} records
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <TrendingUpIcon />
                  <Typography variant="h6">Paid</Typography>
                </Box>
                <Typography variant="h4">₹{stats.summary?.paidSpending?.toLocaleString() || 0}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Completed payments
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <PendingIcon />
                  <Typography variant="h6">Pending</Typography>
                </Box>
                <Typography variant="h4">₹{stats.summary?.pendingSpending?.toLocaleString() || 0}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Awaiting payment
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <BuildIcon />
                  <Typography variant="h6">Maintainers</Typography>
                </Box>
                <Typography variant="h4">{stats.byMaintainer?.length || 0}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Active maintainers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
        <FormControl fullWidth sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Flat</InputLabel>
          <Select
            value={selectedProperty}
            label="Filter by Flat"
            onChange={(e) => {
              setSelectedProperty(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">All Flats</MenuItem>
            {flatProperties.map((property) => (
              <MenuItem key={property._id} value={property._id}>
                {property.shopName} - {property.shopNumber}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Maintainer</InputLabel>
          <Select
            value={selectedMaintainer}
            label="Filter by Maintainer"
            onChange={(e) => {
              setSelectedMaintainer(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">All Maintainers</MenuItem>
            {maintainers.map((maintainer) => (
              <MenuItem key={maintainer} value={maintainer}>
                {maintainer}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter by Status"
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Maintenance Records Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Maintenance Records
          </Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Flat</TableCell>
                      <TableCell>Maintainer</TableCell>
                      <TableCell>Activity Date</TableCell>
                      <TableCell>Paid Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {maintenanceRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Typography color="text.secondary" py={3}>
                            No maintenance records found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      maintenanceRecords.map((record) => (
                        <TableRow key={record._id} hover>
                          <TableCell>
                            {record.property?.shopName || 'N/A'} - {record.property?.shopNumber || 'N/A'}
                          </TableCell>
                          <TableCell>{record.maintainer}</TableCell>
                          <TableCell>
                            {record.activityDate
                              ? format(new Date(record.activityDate), 'dd MMM yyyy')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {record.paidDate
                              ? format(new Date(record.paidDate), 'dd MMM yyyy')
                              : '-'}
                          </TableCell>
                          <TableCell>₹{record.amount?.toLocaleString() || 0}</TableCell>
                          <TableCell>
                            <Chip
                              label={record.status || 'pending'}
                              color={record.status === 'paid' ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title={record.description || 'No description'}>
                              <Typography
                                variant="body2"
                                sx={{
                                  maxWidth: 200,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {record.description || '-'}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => handleEdit(record)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(record._id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Pagination
                    count={pagination.totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMaintenance ? 'Edit Maintenance Record' : 'Add Maintenance Record'}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <TextField
              select
              fullWidth
              margin="normal"
              label="Select Flat"
              name="property"
              value={formik.values.property}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.property && Boolean(formik.errors.property)}
              helperText={formik.touched.property && formik.errors.property}
            >
              {flatProperties.map((property) => (
                <MenuItem key={property._id} value={property._id}>
                  {property.shopName} - {property.shopNumber} ({property.location})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              margin="normal"
              label="Maintainer"
              name="maintainer"
              value={formik.values.maintainer}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.maintainer && Boolean(formik.errors.maintainer)}
              helperText={formik.touched.maintainer && formik.errors.maintainer}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Activity Date"
              name="activityDate"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formik.values.activityDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.activityDate && Boolean(formik.errors.activityDate)}
              helperText={formik.touched.activityDate && formik.errors.activityDate}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Paid Date (Optional)"
              name="paidDate"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formik.values.paidDate}
              onChange={(e) => {
                formik.setFieldValue('paidDate', e.target.value);
                if (e.target.value) {
                  formik.setFieldValue('status', 'paid');
                } else {
                  formik.setFieldValue('status', 'pending');
                }
              }}
              onBlur={formik.handleBlur}
              error={formik.touched.paidDate && Boolean(formik.errors.paidDate)}
              helperText={formik.touched.paidDate && formik.errors.paidDate}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Amount"
              name="amount"
              type="number"
              value={formik.values.amount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.amount && Boolean(formik.errors.amount)}
              helperText={formik.touched.amount && formik.errors.amount}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Description (Optional)"
              name="description"
              multiline
              rows={3}
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingMaintenance ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Maintenance;


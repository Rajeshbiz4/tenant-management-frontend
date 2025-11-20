import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Pagination,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Paid as PaidIcon,
  Pending as PendingIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  fetchTenants,
  deleteTenant,
  updateRentStatus,
  updateMaintenanceStatus,
  updateLightBillStatus,
} from '../../store/slices/tenantSlice';

function Tenants() {
  const dispatch = useDispatch();
  const { tenants, pagination, loading } = useSelector((state) => state.tenant);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchTenants({ page, limit: 10 }));
  }, [dispatch, page]);

  const refresh = () => {
    dispatch(fetchTenants({ page, limit: 10 }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tenant?')) return;
    await dispatch(deleteTenant(id));
    refresh();
  };

  const toggleStatus = async (tenant, type) => {
    const id = tenant._id;
    if (!id) return;

    if (type === 'rent') {
      const next = tenant.rentStatus === 'paid' ? 'pending' : 'paid';
      await dispatch(updateRentStatus({ id, rentStatus: next }));
    } else if (type === 'maintenance') {
      const next = tenant.maintenanceStatus === 'paid' ? 'pending' : 'paid';
      await dispatch(updateMaintenanceStatus({ id, maintenanceStatus: next }));
    } else if (type === 'light') {
      const next = tenant.lightBillStatus === 'paid' ? 'pending' : 'paid';
      await dispatch(updateLightBillStatus({ id, lightBillStatus: next }));
    }
    refresh();
  };

  const renderStatusChip = (status) => (
    <Chip
      label={status || 'pending'}
      color={status === 'paid' ? 'success' : 'warning'}
      size="small"
    />
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Tenants
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Property</TableCell>
              <TableCell>Rent</TableCell>
              <TableCell>Maintenance</TableCell>
              <TableCell>Light Bill</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow key={tenant._id}>
                <TableCell>{tenant.name}</TableCell>
                <TableCell>{tenant.phone}</TableCell>
                <TableCell>{tenant.email}</TableCell>
                <TableCell>
                  {tenant.propertyId
                    ? `${tenant.propertyId.propertyType} - ${tenant.propertyId.location}`
                    : '-'}
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {renderStatusChip(tenant.rentStatus)}
                    <Tooltip title="Toggle rent status">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => toggleStatus(tenant, 'rent')}
                      >
                        {tenant.rentStatus === 'paid' ? <PaidIcon /> : <PendingIcon />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {renderStatusChip(tenant.maintenanceStatus)}
                    <Tooltip title="Toggle maintenance status">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => toggleStatus(tenant, 'maintenance')}
                      >
                        {tenant.maintenanceStatus === 'paid' ? (
                          <PaidIcon />
                        ) : (
                          <PendingIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {renderStatusChip(tenant.lightBillStatus)}
                    <Tooltip title="Toggle light bill status">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => toggleStatus(tenant, 'light')}
                      >
                        {tenant.lightBillStatus === 'paid' ? (
                          <PaidIcon />
                        ) : (
                          <PendingIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>
                  <Tooltip title="Delete tenant">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(tenant._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={pagination.totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
          />
        </Box>
      )}
    </Box>
  );
}

export default Tenants;



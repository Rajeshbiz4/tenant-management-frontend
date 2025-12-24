import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Tooltip,
  IconButton,
  CircularProgress,
  Pagination,
} from '@mui/material';
import { fetchTenants, deleteTenant } from '../../store/slices/tenantSlice';
import { Delete as DeleteIcon } from '@mui/icons-material';

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Tenants
      </Typography>

      <Grid container spacing={3}>
        {tenants.map((tenant) => (
          <Grid item xs={12} sm={6} md={4} key={tenant._id}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    src={tenant.photo || ''}
                    alt={tenant.name}
                    sx={{ width: 56, height: 56 }}
                  />
                  <Box>
                    <Typography variant="h6">{tenant.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tenant.propertyId
                        ? `${tenant.propertyId.propertyType} - ${tenant.propertyId.location}`
                        : '-'}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2">
                  <strong>Phone:</strong> {tenant.phone || '-'}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {tenant.email || '-'}
                </Typography>
                <Typography variant="body2">
                  <strong>Starting Month:</strong>{' '}
                  {tenant.startDate
                    ? new Date(tenant.startDate).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })
                    : '-'}
                </Typography>

                <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                  <Chip
                    label={tenant.isActive ? 'Active' : 'Inactive'}
                    color={tenant.isActive ? 'success' : 'default'}
                    size="small"
                  />
                  <Chip
                    label={tenant.isVerified ? 'Verified' : 'Unverified'}
                    color={tenant.isVerified ? 'primary' : 'default'}
                    size="small"
                  />
                  <Chip
                    label={`${tenant.documents?.length || 0} Doc${
                      tenant.documents?.length === 1 ? '' : 's'
                    }`}
                    color="info"
                    size="small"
                  />
                  <Tooltip title="Delete tenant">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(tenant._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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

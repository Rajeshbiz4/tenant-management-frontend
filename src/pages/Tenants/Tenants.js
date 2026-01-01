import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Tooltip,
  IconButton,
  CircularProgress,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Divider
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';

import {
  fetchTenants,
  deleteTenant,
  updateTenant
} from '../../store/slices/tenantSlice';
import ResponsivePageLayout, { 
  ResponsiveHeader, 
  ResponsiveCardGrid,
  ResponsiveFormGrid,
  ResponsiveSection
} from '../../components/Layout/ResponsivePageLayout';

function Tenants() {
  const dispatch = useDispatch();
  const { tenants, pagination, loading } = useSelector((state) => state.tenant);

  const [page, setPage] = useState(1);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

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

  // ================= EDIT =================
  const handleEditOpen = (tenant) => {
    setSelectedTenant({
      _id: tenant._id,
      name: tenant.name || '',
      email: tenant.email || '',
      phone: tenant.phone || '',
      isVerified: tenant.isVerified || false
    });
    setOpenEdit(true);
  };

  const handleEditClose = () => {
    setOpenEdit(false);
    setSelectedTenant(null);
  };

  const handleUpdate = async () => {
    console.log('Updating tenant:', selectedTenant);
    await dispatch(
      updateTenant({
        tenantId: selectedTenant._id,
        tenantData: {
          name: selectedTenant.name,
          email: selectedTenant.email,
          phone: selectedTenant.phone,
          isVerified: selectedTenant.isVerified
        }
      })
    );
    handleEditClose();
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
    <ResponsivePageLayout>
      <ResponsiveHeader>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Tenants
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage tenant information and details
          </Typography>
        </Box>
      </ResponsiveHeader>

      <ResponsiveSection>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        ) : (
          <ResponsiveCardGrid cardSize="medium">
            {tenants.length === 0 ? (
              <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 4 }}>
                <Typography>No tenants found.</Typography>
              </Box>
            ) : (
              tenants.map((tenant) => (
                <Card
                  key={tenant._id}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: '0.3s',
                    '&:hover': { boxShadow: 6 }
                  }}
                >
                  <CardContent sx={{ flex: 1 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <Avatar
                        src={tenant.photo || ''}
                        alt={tenant.name}
                        sx={{ width: 56, height: 56 }}
                      />
                      <Box flex={1}>
                        <Typography variant="h6">{tenant.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {tenant.propertyId
                            ? `${tenant.propertyId.propertyType} - ${tenant.propertyId.location}`
                            : '-'}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="body2">
                      <strong>Phone:</strong> {tenant.phone || '-'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email:</strong> {tenant.email || '-'}
                    </Typography>

                    <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
                      <Chip
                        label={tenant.propertyId ? 'Active' : 'Inactive'}
                        color={tenant.propertyId ? 'success' : 'default'}
                        size="small"
                      />
                      <Chip
                        label={tenant.isVerified ? 'Verified' : 'Unverified'}
                        color={tenant.isVerified ? 'primary' : 'default'}
                        size="small"
                      />
                      <Chip
                        label={`${tenant.documents?.length || 0} Documents`}
                        color="info"
                        size="small"
                      />
                    </Stack>

                    <Box display="flex" justifyContent="flex-end" mt={2}>
                      <Tooltip title="Edit tenant">
                        <IconButton
                          color="primary"
                          onClick={() => handleEditOpen(tenant)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete tenant">
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(tenant._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </ResponsiveCardGrid>
        )}
      </ResponsiveSection>

      {pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={pagination.totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
          />
        </Box>
      )}

      {/* ================= EDIT TENANT MODAL ================= */}
      <Dialog open={openEdit} onClose={handleEditClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Tenant</DialogTitle>

        <DialogContent>
          <ResponsiveFormGrid columns={{ xs: 1, sm: 1 }} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              fullWidth
              value={selectedTenant?.name || ''}
              onChange={(e) =>
                setSelectedTenant({ ...selectedTenant, name: e.target.value })
              }
            />

            <TextField
              label="Email"
              fullWidth
              value={selectedTenant?.email || ''}
              onChange={(e) =>
                setSelectedTenant({ ...selectedTenant, email: e.target.value })
              }
            />

            <TextField
              label="Phone"
              fullWidth
              value={selectedTenant?.phone || ''}
              onChange={(e) =>
                setSelectedTenant({ ...selectedTenant, phone: e.target.value })
              }
            />

            <TextField
              label="Verification Status"
              select
              fullWidth
              SelectProps={{ native: true }}
              value={selectedTenant?.isVerified ? 'true' : 'false'}
              onChange={(e) =>
                setSelectedTenant({
                  ...selectedTenant,
                  isVerified: e.target.value === 'true'
                })
              }
            >
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </TextField>
          </ResponsiveFormGrid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdate}
            disabled={
              !selectedTenant?.name ||
              !selectedTenant?.phone
            }
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </ResponsivePageLayout>
  );
}

export default Tenants;

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Divider,
  Button,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { fetchProperties } from '../../store/slices/propertySlice';
import { getPayments, clearPayments } from '../../store/slices/paymentSlice';
import ResponsivePageLayout, { 
  ResponsiveHeader, 
  ResponsiveFilters,
  ResponsiveSection,
  ResponsiveFormGrid
} from '../../components/Layout/ResponsivePageLayout';

const monthNames = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// Color coding for payment types
const PAYMENT_COLORS = {
  rent: { bg: '#E3F2FD', text: '#1565C0' },
  maintenance: { bg: '#FFF3E0', text: '#EF6C00' },
  light: { bg: '#FFFDE7', text: '#F9A825' },
  advance: { bg: '#E8F5E9', text: '#2E7D32' },
};

function PaymentHistoryPage() {
  const dispatch = useDispatch();
  const { properties } = useSelector((state) => state.property);
  const { payments } = useSelector((state) => state.payment);

  const [propertyId, setPropertyId] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState('');

  // Fetch properties on load
  useEffect(() => {
    dispatch(fetchProperties({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Clear payments when component mounts if user has no properties
  useEffect(() => {
    if (properties.length === 0) {
      dispatch(clearPayments());
    }
  }, [dispatch, properties.length]);

  // Fetch payments when property, tenant, or year changes
  useEffect(() => {
    if (propertyId && properties.length > 0) {
      dispatch(getPayments({ propertyId, year }));
    } else {
      // Clear payments if no property selected or no properties
      dispatch(clearPayments());
    }
  }, [dispatch, propertyId, year, properties.length]);

  // Get tenants for selected property
  const tenants = propertyId
    ? [properties.find((p) => p._id === propertyId)?.tenant].filter(Boolean)
    : [];

  // Filter payments by tenant, month, and year
  const filteredPayments = useMemo(() => {
    return payments
      .filter((p) => (!tenantId || p.tenantId === tenantId))
      .filter((p) => (!month || p.month === Number(month)))
      .sort((a, b) => new Date(b.paidOn) - new Date(a.paidOn));
  }, [payments, tenantId, month]);

  // Totals by type
  const totals = useMemo(() => {
    return filteredPayments.reduce(
      (acc, p) => {
        acc[p.type] = (acc[p.type] || 0) + p.amount;
        acc.total += p.amount;
        return acc;
      },
      { rent: 0, maintenance: 0, light: 0, advance: 0, total: 0 }
    );
  }, [filteredPayments]);

  return (
    <ResponsivePageLayout>
      <ResponsiveHeader>
        <Box>
          <Typography variant="h4">
            Payment History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and track all payment records
          </Typography>
        </Box>
      </ResponsiveHeader>

      {/* Show message if user has no properties */}
      {properties.length === 0 && (
        <ResponsiveSection>
          <Card sx={{ bgcolor: 'info.light' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                No Properties Found
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                You need to add properties first before you can view payment history.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => window.location.href = '/properties'}
              >
                Add Your First Property
              </Button>
            </CardContent>
          </Card>
        </ResponsiveSection>
      )}

      {/* ================= FILTERS ================= */}
      {properties.length > 0 && (
        <ResponsiveSection>
          <Card>
            <CardContent>
              <ResponsiveFormGrid columns={{ xs: 1, sm: 2, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="Property"
                  value={propertyId}
                  onChange={(e) => {
                    setPropertyId(e.target.value);
                    setTenantId(''); // Reset tenant when property changes
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  {properties.map((p) => (
                    <MenuItem key={p._id} value={p._id}>
                      {p.shopName} - {p.location}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  label="Tenant"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  disabled={!tenants.length}
                >
                  <MenuItem value="">All</MenuItem>
                  {tenants.map((t) => (
                    <MenuItem key={t._id} value={t._id}>
                      {t.name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  label="Year"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                >
                  {[year - 1, year, year + 1].map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  label="Month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {monthNames.map((m, i) => (
                    <MenuItem key={m} value={i + 1}>
                      {m}
                    </MenuItem>
                  ))}
                </TextField>
              </ResponsiveFormGrid>
            </CardContent>
          </Card>
        </ResponsiveSection>
      )}

      {/* ================= TOTAL SUMMARY ================= */}
      {properties.length > 0 && propertyId && filteredPayments.length > 0 && (
        <ResponsiveSection>
          <Card>
            <CardContent>
              <Typography variant="h6">Totals</Typography>
              <Divider sx={{ my: 1 }} />
              <ResponsiveFormGrid columns={{ xs: 2, sm: 4, md: 5 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Rent</Typography>
                  <Typography variant="h6" fontWeight="bold">₹{totals.rent}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Maintenance</Typography>
                  <Typography variant="h6" fontWeight="bold">₹{totals.maintenance}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Light</Typography>
                  <Typography variant="h6" fontWeight="bold">₹{totals.light}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Advance</Typography>
                  <Typography variant="h6" fontWeight="bold">₹{totals.advance}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total</Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">₹{totals.total}</Typography>
                </Box>
              </ResponsiveFormGrid>
            </CardContent>
          </Card>
        </ResponsiveSection>
      )}

      {/* ================= PAYMENT TABLE ================= */}
      {properties.length > 0 && propertyId && (
        <ResponsiveSection>
          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Month</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((p) => {
                    const color = PAYMENT_COLORS[p.type] || PAYMENT_COLORS.advance;
                    return (
                      <TableRow key={p._id} sx={{ backgroundColor: color.bg }}>
                        <TableCell>{new Date(p.paidOn).toLocaleDateString()}</TableCell>
                        <TableCell>{monthNames[p.month - 1] || 'N/A'}</TableCell>
                        <TableCell sx={{ color: color.text, fontWeight: 600 }}>{p.type}</TableCell>
                        <TableCell align="right" sx={{ color: color.text, fontWeight: 700 }}>
                          ₹{p.amount}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No payment records found for this property
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </ResponsiveSection>
      )}

      {/* Show message when no property is selected */}
      {properties.length > 0 && !propertyId && (
        <ResponsiveSection>
          <Card>
            <CardContent>
              <Typography variant="body1" align="center" color="text.secondary">
                Please select a property to view payment history
              </Typography>
            </CardContent>
          </Card>
        </ResponsiveSection>
      )}
    </ResponsivePageLayout>
  );
}

export default PaymentHistoryPage;

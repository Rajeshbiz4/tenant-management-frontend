import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  SwipeHorizontal as SwipeIcon,
} from '@mui/icons-material';

function ResponsiveTable({ 
  columns = [], 
  data = [], 
  mobileCardRenderer, 
  title,
  emptyMessage = "No data available",
  showScrollHint = true,
  stickyHeader = true,
  ...tableProps 
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Validate required props
  if (!Array.isArray(columns) || !Array.isArray(data)) {
    console.warn('ResponsiveTable: columns and data must be arrays');
    return null;
  }

  // Mobile card layout
  if (isMobile && mobileCardRenderer) {
    return (
      <Card>
        {title && (
          <Box sx={{ p: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight="bold">
              {title}
            </Typography>
          </Box>
        )}
        <Box sx={{ p: 2 }}>
          <Stack spacing={2}>
            {data.length === 0 ? (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    {emptyMessage}
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              data.map((row, index) => mobileCardRenderer(row, index))
            )}
          </Stack>
        </Box>
      </Card>
    );
  }

  // Desktop table layout with enhanced horizontal scroll
  return (
    <Card>
      {title && (
        <Box sx={{ 
          p: 3, 
          pb: 2, 
          borderBottom: 1, 
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>
          {showScrollHint && isMobile && (
            <Tooltip title="Scroll horizontally to see more columns">
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: 'text.secondary',
                fontSize: '0.75rem'
              }}>
                <SwipeIcon fontSize="small" />
                <Typography variant="caption">Scroll →</Typography>
              </Box>
            </Tooltip>
          )}
        </Box>
      )}
      
      <TableContainer 
        sx={{ 
          overflowX: 'auto',
          // Enhanced scrollbar styling
          '&::-webkit-scrollbar': {
            height: '12px',
          },
          '&::-webkit-scrollbar-track': {
            background: theme.palette.grey?.[100] || '#f5f5f5',
            borderRadius: '6px',
            margin: '0 16px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.primary?.main || '#1976d2',
            borderRadius: '6px',
            '&:hover': {
              background: theme.palette.primary?.dark || '#1565c0',
            },
          },
          // Add scroll shadows for better UX
          background: `
            linear-gradient(90deg, white 30%, rgba(255,255,255,0)),
            linear-gradient(90deg, rgba(255,255,255,0), white 70%) 0 100%,
            radial-gradient(farthest-side at 0 50%, rgba(0,0,0,.2), rgba(0,0,0,0)),
            radial-gradient(farthest-side at 100% 50%, rgba(0,0,0,.2), rgba(0,0,0,0)) 0 100%
          `,
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'white',
          backgroundSize: '40px 100%, 40px 100%, 14px 100%, 14px 100%',
          backgroundAttachment: 'local, local, scroll, scroll',
        }}
        {...tableProps}
      >
        <Table 
          sx={{ 
            minWidth: { xs: 800, md: 'auto' }, // Ensure minimum width for scroll
            '& .MuiTableCell-root': {
              whiteSpace: 'nowrap', // Prevent text wrapping
            }
          }}
          stickyHeader={stickyHeader}
        >
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell 
                  key={column.id}
                  align={column.align || 'left'}
                  sx={{
                    fontWeight: 600,
                    backgroundColor: theme.palette.grey[50],
                    minWidth: column.minWidth || 120,
                    maxWidth: column.maxWidth || 'none',
                    position: stickyHeader ? 'sticky' : 'static',
                    top: 0,
                    zIndex: 1,
                    borderBottom: `2px solid ${theme.palette.divider}`,
                    // Hide columns on mobile if specified
                    display: column.hideOnMobile && isMobile ? 'none' : 'table-cell',
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Box sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      {emptyMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow 
                  key={rowIndex}
                  hover
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: theme.palette.action.hover,
                    },
                    // Alternate row colors for better readability
                    '&:nth-of-type(even)': {
                      backgroundColor: theme.palette.grey?.[25] || 'rgba(0, 0, 0, 0.02)',
                    },
                  }}
                >
                  {columns.map((column) => (
                    <TableCell 
                      key={column.id}
                      align={column.align || 'left'}
                      sx={{
                        minWidth: column.minWidth || 120,
                        maxWidth: column.maxWidth || 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: column.wrap ? 'normal' : 'nowrap',
                        padding: '16px',
                        // Hide columns on mobile if specified
                        display: column.hideOnMobile && isMobile ? 'none' : 'table-cell',
                      }}
                    >
                      {column.render ? column.render(row[column.id], row, rowIndex) : row[column.id]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Scroll hint for mobile */}
      {showScrollHint && isMobile && data.length > 0 && (
        <Box sx={{ 
          p: 2, 
          borderTop: 1, 
          borderColor: 'divider',
          backgroundColor: theme.palette.grey?.[50] || '#fafafa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}>
          <SwipeIcon fontSize="small" color="action" />
          <Typography variant="caption" color="text.secondary">
            Swipe left or right to see more columns
          </Typography>
        </Box>
      )}
    </Card>
  );
}

// Helper component for mobile cards
export function MobileCard({ children, ...props }) {
  return (
    <Card 
      sx={{ 
        borderRadius: 2,
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
        },
        transition: 'all 0.2s ease',
      }}
      {...props}
    >
      <CardContent sx={{ p: 3 }}>
        {children}
      </CardContent>
    </Card>
  );
}

// Helper component for status chips
export function StatusChip({ status, colorMap, ...props }) {
  const getColor = (status) => {
    if (colorMap && colorMap[status]) {
      return colorMap[status];
    }
    
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'active':
      case 'completed':
        return 'success';
      case 'pending':
      case 'due':
        return 'warning';
      case 'overdue':
      case 'failed':
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      label={status}
      color={getColor(status)}
      size="small"
      sx={{
        fontWeight: 600,
        textTransform: 'capitalize',
      }}
      {...props}
    />
  );
}

export default ResponsiveTable;
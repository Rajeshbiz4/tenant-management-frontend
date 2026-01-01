import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Home as PropertyIcon,
  People as TenantsIcon,
  Payment as PaymentIcon,
  Build as MaintenanceIcon,
} from '@mui/icons-material';

const iconMap = {
  properties: PropertyIcon,
  tenants: TenantsIcon,
  payments: PaymentIcon,
  maintenance: MaintenanceIcon,
};

function EmptyState({
  type = 'properties',
  title,
  description,
  actionText,
  onAction,
  illustration,
}) {
  const theme = useTheme();
  const IconComponent = iconMap[type] || PropertyIcon;

  const defaultContent = {
    properties: {
      title: 'No Properties Yet',
      description: 'Start by adding your first property to manage tenants and track payments.',
      actionText: 'Add Property',
    },
    tenants: {
      title: 'No Tenants Yet',
      description: 'Add tenants to your properties to start tracking rent and maintenance.',
      actionText: 'Add Tenant',
    },
    payments: {
      title: 'No Payments Recorded',
      description: 'Record rent, maintenance, and other payments from your tenants.',
      actionText: 'Record Payment',
    },
    maintenance: {
      title: 'No Maintenance Requests',
      description: 'Track maintenance requests and repairs for your properties.',
      actionText: 'Add Request',
    },
  };

  const content = defaultContent[type] || defaultContent.properties;

  return (
    <Card
      sx={{
        textAlign: 'center',
        py: 6,
        px: 4,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
        border: `2px dashed ${theme.palette.divider}`,
      }}
    >
      <CardContent>
        <Stack alignItems="center" spacing={3}>
          {/* Illustration or Icon */}
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            {illustration || (
              <IconComponent
                sx={{
                  fontSize: 48,
                  color: 'white',
                }}
              />
            )}
          </Box>

          {/* Content */}
          <Stack alignItems="center" spacing={2} maxWidth={400}>
            <Typography
              variant="h5"
              fontWeight="bold"
              color="text.primary"
            >
              {title || content.title}
            </Typography>
            
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ lineHeight: 1.6 }}
            >
              {description || content.description}
            </Typography>
          </Stack>

          {/* Action Button */}
          {onAction && (
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={onAction}
              sx={{
                mt: 3,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[8],
                },
                transition: 'all 0.3s ease',
              }}
            >
              {actionText || content.actionText}
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default EmptyState;
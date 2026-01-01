import React from 'react';
import {
  Box,
  Grid,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';

// Responsive grid that adapts to screen size
function ResponsiveGrid({ 
  children, 
  spacing = 3,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  ...props 
}) {
  return (
    <Grid container spacing={spacing} {...props}>
      {React.Children.map(children, (child, index) => (
        <Grid 
          item 
          xs={12 / columns.xs} 
          sm={12 / columns.sm} 
          md={12 / columns.md} 
          lg={12 / columns.lg}
          key={index}
        >
          {child}
        </Grid>
      ))}
    </Grid>
  );
}

// Responsive filter bar that wraps nicely on mobile
function ResponsiveFilterBar({ children, spacing = 2, ...props }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    return (
      <Stack spacing={spacing} {...props}>
        {children}
      </Stack>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: spacing,
        flexWrap: 'wrap',
        alignItems: 'center',
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

// Responsive form layout
function ResponsiveForm({ 
  children, 
  columns = { xs: 1, sm: 1, md: 2 },
  spacing = 3,
  ...props 
}) {
  return (
    <Grid container spacing={spacing} {...props}>
      {React.Children.map(children, (child, index) => {
        // If child has custom grid props, use them
        if (child?.props?.gridProps) {
          return (
            <Grid item {...child.props.gridProps} key={index}>
              {React.cloneElement(child, { gridProps: undefined })}
            </Grid>
          );
        }
        
        // Default responsive behavior
        return (
          <Grid 
            item 
            xs={12 / columns.xs}
            sm={12 / columns.sm}
            md={12 / columns.md}
            lg={12 / (columns.lg || columns.md)}
            key={index}
          >
            {child}
          </Grid>
        );
      })}
    </Grid>
  );
}

// Responsive button group
function ResponsiveButtonGroup({ 
  children, 
  spacing = 2,
  direction = { xs: 'column', sm: 'row' },
  ...props 
}) {
  return (
    <Stack 
      direction={direction}
      spacing={spacing}
      sx={{
        '& > button': {
          minWidth: { xs: '100%', sm: 'auto' },
        },
      }}
      {...props}
    >
      {children}
    </Stack>
  );
}

// Responsive card grid with consistent sizing
function ResponsiveCardGrid({ 
  children, 
  spacing = 3,
  minCardWidth = 280,
  maxColumns = 4,
  ...props 
}) {
  const theme = useTheme();
  
  // Calculate responsive columns based on screen size and card width
  const getColumns = () => {
    const breakpoints = theme.breakpoints.values;
    return {
      xs: 1,
      sm: Math.min(2, maxColumns),
      md: Math.min(Math.floor(breakpoints.md / minCardWidth), maxColumns),
      lg: Math.min(Math.floor(breakpoints.lg / minCardWidth), maxColumns),
      xl: Math.min(Math.floor(breakpoints.xl / minCardWidth), maxColumns),
    };
  };

  const columns = getColumns();

  return (
    <Grid container spacing={spacing} {...props}>
      {React.Children.map(children, (child, index) => (
        <Grid 
          item 
          xs={12 / columns.xs}
          sm={12 / columns.sm}
          md={12 / columns.md}
          lg={12 / columns.lg}
          xl={12 / columns.xl}
          key={index}
        >
          {child}
        </Grid>
      ))}
    </Grid>
  );
}

export {
  ResponsiveGrid,
  ResponsiveFilterBar,
  ResponsiveForm,
  ResponsiveButtonGroup,
  ResponsiveCardGrid,
};

export default ResponsiveGrid;
import React from 'react';
import { Container, Grid, Box, useTheme, useMediaQuery } from '@mui/material';

/**
 * ResponsivePageLayout - A standardized responsive layout component
 * 
 * Features:
 * - Responsive container with proper spacing
 * - Consistent padding and margins across all screen sizes
 * - Flexible grid system for different content layouts
 * - Mobile-first responsive design
 */
function ResponsivePageLayout({ 
  children, 
  maxWidth = 'xl',
  spacing = { xs: 2, sm: 3, md: 4 },
  containerProps = {},
  ...props 
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Container 
      maxWidth={maxWidth} 
      sx={{ 
        py: spacing,
        px: { xs: 2, sm: 3, md: 4 },
        ...containerProps.sx 
      }}
      {...containerProps}
      {...props}
    >
      {children}
    </Container>
  );
}

/**
 * ResponsiveGrid - A responsive grid wrapper with consistent spacing
 */
export function ResponsiveGrid({ 
  children, 
  spacing = { xs: 2, sm: 3, md: 3 },
  ...props 
}) {
  return (
    <Grid container spacing={spacing} {...props}>
      {children}
    </Grid>
  );
}

/**
 * ResponsiveGridItem - A responsive grid item with consistent breakpoints
 */
export function ResponsiveGridItem({ 
  children,
  xs = 12,
  sm,
  md,
  lg,
  xl,
  ...props 
}) {
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl} {...props}>
      {children}
    </Grid>
  );
}

/**
 * ResponsiveSection - A section wrapper with consistent spacing
 */
export function ResponsiveSection({ 
  children, 
  spacing = { xs: 2, sm: 3, md: 4 },
  ...props 
}) {
  return (
    <Box sx={{ mb: spacing }} {...props}>
      {children}
    </Box>
  );
}

/**
 * ResponsiveHeader - A responsive header section
 */
export function ResponsiveHeader({ 
  children, 
  direction = { xs: 'column', sm: 'row' },
  spacing = 2,
  alignItems = { xs: 'flex-start', sm: 'center' },
  justifyContent = 'space-between',
  ...props 
}) {
  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: direction,
        alignItems: alignItems,
        justifyContent: justifyContent,
        gap: spacing,
        mb: { xs: 2, sm: 3, md: 4 },
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

/**
 * ResponsiveFilters - A responsive filters section
 */
export function ResponsiveFilters({ 
  children, 
  direction = { xs: 'column', sm: 'row' },
  spacing = 2,
  ...props 
}) {
  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: direction,
        gap: spacing,
        mb: { xs: 2, sm: 3 },
        '& > *': {
          flex: { xs: '1 1 100%', sm: '1 1 auto' },
          minWidth: { xs: 'auto', sm: 200 }
        },
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

/**
 * ResponsiveCardGrid - A responsive card grid layout
 */
export function ResponsiveCardGrid({ 
  children,
  cardSize = 'medium', // small, medium, large
  ...props 
}) {
  const getCardBreakpoints = (size) => {
    switch (size) {
      case 'small':
        return { xs: 12, sm: 6, md: 4, lg: 3 };
      case 'large':
        return { xs: 12, sm: 12, md: 6, lg: 4 };
      case 'medium':
      default:
        return { xs: 12, sm: 6, md: 4 };
    }
  };

  const breakpoints = getCardBreakpoints(cardSize);

  return (
    <ResponsiveGrid {...props}>
      {React.Children.map(children, (child, index) => (
        <ResponsiveGridItem key={index} {...breakpoints}>
          {child}
        </ResponsiveGridItem>
      ))}
    </ResponsiveGrid>
  );
}

/**
 * ResponsiveFormGrid - A responsive form layout
 */
export function ResponsiveFormGrid({ 
  children,
  columns = { xs: 1, sm: 2, md: 3 },
  ...props 
}) {
  return (
    <ResponsiveGrid {...props}>
      {React.Children.map(children, (child, index) => {
        // Calculate responsive breakpoints based on columns
        const xs = 12;
        const sm = columns.sm ? 12 / columns.sm : 12;
        const md = columns.md ? 12 / columns.md : sm;
        const lg = columns.lg ? 12 / columns.lg : md;

        return (
          <ResponsiveGridItem key={index} xs={xs} sm={sm} md={md} lg={lg}>
            {child}
          </ResponsiveGridItem>
        );
      })}
    </ResponsiveGrid>
  );
}

/**
 * ResponsiveStatsGrid - A responsive stats/metrics grid
 */
export function ResponsiveStatsGrid({ children, ...props }) {
  return (
    <ResponsiveGrid {...props}>
      {React.Children.map(children, (child, index) => (
        <ResponsiveGridItem key={index} xs={12} sm={6} md={3}>
          {child}
        </ResponsiveGridItem>
      ))}
    </ResponsiveGrid>
  );
}

/**
 * ResponsiveTwoColumn - A responsive two-column layout
 */
export function ResponsiveTwoColumn({ 
  left, 
  right, 
  leftSize = { xs: 12, md: 8 },
  rightSize = { xs: 12, md: 4 },
  ...props 
}) {
  return (
    <ResponsiveGrid {...props}>
      <ResponsiveGridItem {...leftSize}>
        {left}
      </ResponsiveGridItem>
      <ResponsiveGridItem {...rightSize}>
        {right}
      </ResponsiveGridItem>
    </ResponsiveGrid>
  );
}

export default ResponsivePageLayout;
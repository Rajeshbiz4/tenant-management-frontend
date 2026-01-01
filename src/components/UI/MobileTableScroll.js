import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Card,
  IconButton,
  Typography,
  Fade,
  useTheme,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  SwipeHorizontal as SwipeIcon,
} from '@mui/icons-material';

function MobileTableScroll({ 
  children, 
  title,
  showNavigationButtons = true,
  showScrollHint = true 
}) {
  const theme = useTheme();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Hide hint after 3 seconds
    const timer = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <Card>
      {/* Header with title and navigation */}
      {(title || showNavigationButtons) && (
        <Box sx={{ 
          p: 2, 
          borderBottom: 1, 
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {title && (
            <Typography variant="h6" fontWeight="bold">
              {title}
            </Typography>
          )}
          
          {showNavigationButtons && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                size="small"
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                sx={{
                  bgcolor: canScrollLeft ? 'primary.light' : 'grey.200',
                  color: canScrollLeft ? 'primary.contrastText' : 'text.disabled',
                  '&:hover': {
                    bgcolor: canScrollLeft ? 'primary.main' : 'grey.200',
                  },
                }}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={scrollRight}
                disabled={!canScrollRight}
                sx={{
                  bgcolor: canScrollRight ? 'primary.light' : 'grey.200',
                  color: canScrollRight ? 'primary.contrastText' : 'text.disabled',
                  '&:hover': {
                    bgcolor: canScrollRight ? 'primary.main' : 'grey.200',
                  },
                }}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
      )}

      {/* Scrollable content */}
      <Box
        ref={scrollRef}
        onScroll={checkScrollability}
        sx={{
          overflowX: 'auto',
          overflowY: 'hidden',
          position: 'relative',
          // Enhanced scrollbar
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: theme.palette.grey[100],
            borderRadius: '4px',
            margin: '0 8px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            borderRadius: '4px',
            '&:hover': {
              background: theme.palette.primary.dark,
            },
          },
          // Scroll momentum for iOS
          WebkitOverflowScrolling: 'touch',
          // Scroll snap for better UX
          scrollSnapType: 'x proximity',
        }}
      >
        {children}
      </Box>

      {/* Scroll hint */}
      {showScrollHint && (
        <Fade in={showHint} timeout={500}>
          <Box sx={{ 
            p: 2, 
            borderTop: 1, 
            borderColor: 'divider',
            backgroundColor: theme.palette.primary.light,
            color: theme.palette.primary.contrastText,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}>
            <SwipeIcon fontSize="small" />
            <Typography variant="caption" fontWeight="medium">
              Swipe horizontally to see more data
            </Typography>
          </Box>
        </Fade>
      )}
    </Card>
  );
}

export default MobileTableScroll;
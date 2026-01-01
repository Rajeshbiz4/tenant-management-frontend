import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function ResponsiveDialog({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  showCloseButton = true,
  ...props
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={isMobile ? false : maxWidth}
      fullWidth={!isMobile && fullWidth}
      fullScreen={isSmallMobile}
      TransitionComponent={isMobile ? Transition : undefined}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          margin: isMobile ? 0 : 2,
          width: isMobile ? '100%' : 'auto',
          maxWidth: isMobile ? '100%' : 'none',
          height: isSmallMobile ? '100%' : 'auto',
          maxHeight: isMobile && !isSmallMobile ? '90vh' : 'none',
        },
      }}
      {...props}
    >
      {title && (
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          {title}
          {showCloseButton && (
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'text.primary',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}
      
      <DialogContent
        sx={{
          p: { xs: 2, sm: 3 },
          '&.MuiDialogContent-root': {
            paddingTop: title ? 3 : 2,
          },
        }}
      >
        {children}
      </DialogContent>
      
      {actions && (
        <DialogActions
          sx={{
            p: { xs: 2, sm: 3 },
            pt: 1,
            borderTop: 1,
            borderColor: 'divider',
            gap: 1,
            flexDirection: { xs: 'column', sm: 'row' },
            '& > :not(:first-of-type)': {
              ml: { xs: 0, sm: 1 },
            },
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}

export default ResponsiveDialog;
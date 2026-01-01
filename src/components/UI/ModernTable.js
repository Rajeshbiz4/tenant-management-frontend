import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Avatar,
  Stack,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  Checkbox,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

function ModernTable({
  title,
  data = [],
  columns = [],
  searchable = true,
  filterable = true,
  selectable = false,
  actions = [],
  onRowClick,
  pagination = true,
  dense = false,
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredData.map((row, index) => index);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleRowSelect = (event, index) => {
    event.stopPropagation();
    const selectedIndex = selected.indexOf(index);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, index);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleActionClick = (event, row, index) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedRow({ ...row, index });
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const isSelected = (index) => selected.indexOf(index) !== -1;

  // Filter data based on search term
  const filteredData = data.filter((row) =>
    searchTerm === '' ||
    columns.some((column) => {
      const value = row[column.field];
      return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  // Paginate data
  const paginatedData = pagination
    ? filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : filteredData;

  const renderCellContent = (row, column) => {
    const value = row[column.field];

    if (column.render) {
      return column.render(value, row);
    }

    if (column.type === 'avatar') {
      return (
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
          {value?.charAt(0)?.toUpperCase()}
        </Avatar>
      );
    }

    if (column.type === 'chip') {
      const chipProps = column.chipProps ? column.chipProps(value, row) : {};
      const displayValue = value && typeof value === 'string' ? value : (value?.toString() || 'N/A');
      return <Chip label={displayValue} size="small" {...chipProps} />;
    }

    if (column.type === 'currency') {
      return `₹${value?.toLocaleString('en-IN') || 0}`;
    }

    if (column.type === 'date') {
      return value ? new Date(value).toLocaleDateString('en-IN') : '-';
    }

    return value || '-';
  };

  return (
    <Paper elevation={0} sx={{ width: '100%', border: '1px solid', borderColor: 'divider' }}>
      {/* Table Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
          
          <Stack direction="row" spacing={2} alignItems="center">
            {searchable && (
              <TextField
                size="small"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250 }}
              />
            )}
            
            {filterable && (
              <Tooltip title="Filter">
                <IconButton size="small">
                  <FilterIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>

        {selected.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="primary">
              {selected.length} item(s) selected
            </Typography>
          </Box>
        )}
      </Box>

      {/* Table */}
      <TableContainer>
        <Table size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < filteredData.length}
                    checked={filteredData.length > 0 && selected.length === filteredData.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  align={column.align || 'left'}
                  sx={{
                    fontWeight: 600,
                    bgcolor: 'grey.50',
                    minWidth: column.minWidth,
                  }}
                >
                  {column.headerName}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => {
              const isItemSelected = isSelected(index);
              return (
                <TableRow
                  key={index}
                  hover
                  onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                  selected={isItemSelected}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:hover': {
                      bgcolor: 'grey.50',
                    },
                  }}
                >
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        onChange={(event) => handleRowSelect(event, index)}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.field} align={column.align || 'left'}>
                      {renderCellContent(row, column)}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(event) => handleActionClick(event, row, index)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                  align="center"
                  sx={{ py: 6 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No data available
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionClose}
        PaperProps={{
          sx: { minWidth: 150 },
        }}
      >
        {actions.map((action, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              action.onClick(selectedRow);
              handleActionClose();
            }}
          >
            <ListItemIcon>
              {action.icon}
            </ListItemIcon>
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </Paper>
  );
}

export default ModernTable;
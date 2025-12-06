// Import Libs
import * as React from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import ClickAwayListener from '@mui/material/ClickAwayListener';

// Import Components
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Paper,
  Typography,
  Checkbox,
  IconButton,
  Tooltip,
  TextField,
  Autocomplete,
  InputAdornment,
  Chip,
  Button,
  Grid,
  Grow,
  Popper,
  CircularProgress,
} from "@mui/material";

// Import Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import UploadOutlinedIcon from '@mui/icons-material/UploadOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}
function getComparator(order, orderBy) {
  if (!orderBy) return () => 0;
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function TableTemplateHead({
  columns,
  order,
  orderBy,
  onSelectAllClick,
  onRequestSort,
  isCheckbox,
  selected,
  visibleRowsMemo,
  isUpdate,
  isDelete,
  keyProperty = "id"
}) {
  const createSortHandler = (property) => (event) =>
    onRequestSort(event, property);

  return (
    <TableHead>
      <TableRow>
        {isCheckbox && (
          <TableCell padding="checkbox" sx={{ bgcolor: 'background.paper' }}>
            <Checkbox
              color="primary"
              indeterminate={
                visibleRowsMemo.length > 0 &&
                visibleRowsMemo.some((row) => selected.includes(row[keyProperty])) &&
                !visibleRowsMemo.every((row) => selected.includes(row[keyProperty]))
              }
              checked={
                visibleRowsMemo.length > 0 &&
                visibleRowsMemo.every((row) => selected.includes(row[keyProperty]))
              }
              onChange={onSelectAllClick}
            />
          </TableCell>
        )}

        {columns.map((col) => (
          <TableCell
            key={col.field}
            align={col.align || 'left'}
            padding={col.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === col.field ? order : false}
            sx={{ bgcolor: 'background.paper', width: col.width }}
          >
            {col.sortable ? (
              <TableSortLabel
                active={orderBy === col.field}
                direction={
                  orderBy === col.field && order ? order : 'asc'
                }
                onClick={createSortHandler(col.field)}
              >
                {col.label}
                {orderBy === col.field && order ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc'
                      ? 'sorted descending'
                      : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              col.label
            )}
          </TableCell>
        ))}

        {(isUpdate || isDelete) && (
          <TableCell
            key="action"
            align="center"
            sx={{ bgcolor: 'background.paper' }}
          >
            Action
          </TableCell>
        )}
      </TableRow>
    </TableHead>
  );
}

function TableTemplateToolbar({
  numSelected,
  onDelete,
  setSelected,
  title,
  search,
  onSearchChange,
  columns = [],
  visibleColumns,
  onVisibleColumnsChange,
  isCreate,
  isUpload,
  isDownload,
  onCreate,
  onUpload,
  onDownload,
  hideToolbar
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleFilterClick = (event) => setAnchorEl(event.currentTarget);
  const handleFilterClose = () => setAnchorEl(null);

  const handleDelete = async () => {
    const status = await onDelete();
    if(status) setSelected([]);
  }

  return (
    <Box sx={{ flexDirection: 'column', gap: 1 }}>
      <Box
        sx={{
          width: '100%',
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor:
            numSelected > 0
              ? (theme) =>
                  alpha(
                    theme.palette.primary.main,
                    theme.palette.action.activatedOpacity
                  )
              : 'inherit',
        }}
      >
        {numSelected > 0 ? (
          <>
            <Typography color="inherit" variant="subtitle1" sx={{ pl: 1 }}>
              {numSelected} selected
            </Typography>
            <Tooltip title="Delete">
              <IconButton onClick={handleDelete} color="error">
                <DeleteOutlineOutlinedIcon />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Grid container sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: (!isCreate && !isUpload && !isDownload && hideToolbar) ? "center" : "space-between" }}>
            <Grid size={{ xs: "auto" }}>
              <Typography variant="h6">{ title }</Typography>
            </Grid>
            <Grid container size={{ xs: "auto" }} gap={2}>
              {isCreate && <Grid size={{ xs: "auto", md: "auto" }}>
                <Button variant="outlined" color="info" startIcon={<AddOutlinedIcon />} disableElevation onClick={() => onCreate && onCreate()}>create</Button>
              </Grid>}
              {isUpload && <Grid size={{ xs: 5, md: "auto" }}>
                <Button variant="outlined" color="success" startIcon={<UploadOutlinedIcon />} disableElevation onClick={() => onUpload && onUpload()}>upload</Button>
              </Grid>}
              {isDownload && <Grid size={{ xs: 5, md: "auto" }}>
                <Button variant="outlined" color="primary" startIcon={<DownloadOutlinedIcon />} disableElevation onClick={() => onDownload && onDownload()}>download</Button>
              </Grid>}
            </Grid>
          </Grid>
        )}
      </Box>

      { !hideToolbar && (
        <Box sx={{ width: '100%', mb: 2 }} className="no-print">
          <Grid
            container
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Grid size={{ xs: 12, md:"auto" }}>
              {columns.length > 0 && (
                <>
                  <IconButton
                    variant="outlined"
                    color="info"
                    onClick={handleFilterClick}
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'white',
                      borderRadius: 2,
                      padding: '6px',
                      '&:hover': {
                        backgroundColor: 'primary.main',
                        color: 'white',
                      },
                    }}
                  >
                    <FilterListIcon />
                  </IconButton>

                  <Popper
                    anchorEl={anchorEl}
                    open={open}
                    placement="right"
                    sx={{ zIndex: 1300 }}
                  >
                    <ClickAwayListener onClickAway={handleFilterClose}>
                      <Grow in={open} style={{ transformOrigin: 'left top' }}>
                        <Box
                          sx={{
                            bgcolor: 'transparent',
                            boxShadow: 'none',
                            border: 'none',
                            p: 1,
                          }}
                        >
                          <Autocomplete
                            multiple
                            options={columns}
                            value={visibleColumns}
                            isOptionEqualToValue={(option, value) => option.field === value.field}
                            onChange={(e, value) => onVisibleColumnsChange(value)}
                            getOptionLabel={(option) => option.label}
                            renderTags={(value) =>
                              value.length > 0 ? (
                                <Chip
                                  label={`${value.length} column(s) applied`}
                                  color="primary"
                                  size="small"
                                />
                              ) : null
                            }
                            size="small"
                            renderInput={(params) => (
                              <TextField {...params} label="Columns" />
                            )}
                          />
                        </Box>
                      </Grow>
                    </ClickAwayListener>
                  </Popper>
                </>
              )}
            </Grid>

            <Grid size={{xs: 12, md: "auto"}}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" color="primary">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ width: '100%' }}
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
}

export default function TableTemplate({
  isLoading = false,
  columns,
  rows = [],
  isCheckbox = false,
  initialRowsPerPage = 5,
  stickyHeader = true,
  tableProps = {},
  title,
  tableHeight = 400,
  isCreate = true,
  isUpload = true,
  isDownload = true,
  isUpdate = true,
  isDelete = true,
  onCreate,
  onUpdate,
  onDelete,
  onUpload,
  onDownload,
  isPagination = true,
  hideToolbar = false,
  getRowClassName,
  keyProperty = "id",
}) {
  const [order, setOrder] = React.useState(null);
  const [orderBy, setOrderBy] = React.useState(null);
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(initialRowsPerPage);
  const [search, setSearch] = React.useState('');
  const [visibleColumns, setVisibleColumns] = React.useState(columns);

  const handleRequestSort = (event, property) => {
    if (orderBy !== property) setOrder('asc'), setOrderBy(property);
    else
      order === 'asc'
        ? setOrder('desc')
        : order === 'desc'
        ? (setOrder(null), setOrderBy(null))
        : setOrder('asc');
  };

  const handleSelectAllClick = (event) => {
    const pageRowIds = visibleRowsMemo.map((r) => r[keyProperty]);
    if (event.target.checked) {
      setSelected((prev) => [...new Set([...prev, ...pageRowIds])]);
    } else {
      setSelected((prev) => prev.filter((id) => !pageRowIds.includes(id)));
    }
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1)
      newSelected = newSelected.concat(selected, id);
    else if (selectedIndex === 0)
      newSelected = newSelected.concat(selected.slice(1));
    else if (selectedIndex === selected.length - 1)
      newSelected = newSelected.concat(selected.slice(0, -1));
    else if (selectedIndex > 0)
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredRows = React.useMemo(() => {
    return rows.filter((row) => {
      if (search) {
        return Object.values(row).some((val) =>
          String(val).toLowerCase().includes(search.toLowerCase())
        );
      }
      return true;
    });
  }, [rows, search]);

  const visibleRowsMemo = React.useMemo(
    () =>
      [...filteredRows]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredRows, order, orderBy, page, rowsPerPage]
  );

  return (
    <Paper
      elevation={3}
      sx={{
        px: 2,
        pb: 2,
        pt: title ? 2 : 0,
        borderRadius: 3,
        width: '100%',
        overflowX: 'hidden',
      }}
    >
      {title && (
        <TableTemplateToolbar
          title={title}
          numSelected={selected.length}
          onDelete={() => onDelete && onDelete(selected)}
          setSelected={setSelected}
          search={search}
          onSearchChange={setSearch}
          columns={columns}
          visibleColumns={visibleColumns}
          onVisibleColumnsChange={setVisibleColumns}
          isUpload={isUpload}
          isCreate={isCreate}
          isDownload={isDownload}
          onCreate={onCreate}
          onUpload={onUpload}
          onDownload={onDownload}
          hideToolbar={hideToolbar}
        />
      )}
      <TableContainer
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          width: '100%',
          height: tableHeight,
          overflowX: 'auto',
        }}
      >
        <Table
          stickyHeader={stickyHeader}
          {...tableProps}
          sx={{
            width: '100%',
          }}
        >
          <TableTemplateHead
            columns={visibleColumns}
            numSelected={selected.length}
            order={order}
            orderBy={orderBy}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            rowCount={filteredRows.length}
            isCheckbox={isCheckbox}
            selected={selected} 
            visibleRowsMemo={visibleRowsMemo}
            isUpdate={isUpdate}
            isDelete={isDelete}
            keyProperty={keyProperty}
          />

          <TableBody>
            {isLoading
              ? <TableRow>
                  <TableCell colSpan={visibleColumns.length + (isCheckbox ? 1 : 0) + (isUpdate || isDelete ? 1 : 0)}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: 200,
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              : (!isLoading && visibleRowsMemo.length > 0) ? (
                visibleRowsMemo.map((row, index) => {
                  const rowKey = row[keyProperty];
                  const isItemSelected = selected.indexOf(rowKey) !== -1;
                  const labelId = `table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      role={isCheckbox ? 'checkbox' : 'row'}
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={rowKey || index}
                      selected={isItemSelected}
                      sx={{
                        cursor: isCheckbox ? 'default' : 'pointer',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        ...(getRowClassName ? getRowClassName(row) : {}),
                      }}
                    >
                      {isCheckbox && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            inputProps={{ 'aria-labelledby': labelId }}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleClick(event, rowKey);
                            }}
                          />
                        </TableCell>
                      )}

                      {visibleColumns.map((col) => (
                        <TableCell
                          key={col.field}
                          align={col.align || 'left'}
                          padding={col.disablePadding ? 'none' : 'normal'}
                          sx={{ width: col.width, maxWidth: col.width, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                          {col.render ? col.render(row[col.field] ?? null, row) : (row[col.field] ?? "-")}
                        </TableCell>
                      ))}

                      {(isUpdate || isDelete) && (
                        <TableCell align="center">
                          <Box sx={{ display: "flex", justifyContent: "center" }}>
                            {isUpdate && (
                              <IconButton
                                color="warning"
                                size="small"
                                onClick={() => onUpdate && onUpdate(row)}
                              >
                                <EditOutlinedIcon />
                              </IconButton>
                            )}
                            {isDelete && (
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => onDelete && onDelete(row)}
                              >
                                <DeleteOutlineOutlinedIcon />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={
                      visibleColumns.length +
                      (isCheckbox ? 1 : 0) +
                      (isUpdate || isDelete ? 1 : 0)
                    }
                    align="center"
                    sx={{ py: 4 }}
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

      {isPagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            width: '100%',
          }}
        />
      )}
    </Paper>
  );
}

TableTemplate.propTypes = {
  isLoading: PropTypes.bool,
  columns: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
  isCheckbox: PropTypes.bool,
  initialRowsPerPage: PropTypes.number,
  stickyHeader: PropTypes.bool,
  tableProps: PropTypes.object,
  title: PropTypes.string,
  tableHeight: PropTypes.number,
  isCreate: PropTypes.bool,
  isUpload: PropTypes.bool,
  isDownload: PropTypes.bool,
  isUpdate: PropTypes.bool,
  isDelete: PropTypes.bool,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
  onUpload: PropTypes.func,
  onDownload: PropTypes.func,
  isPagination: PropTypes.bool,
  hideToolbar: PropTypes.bool,
  getRowClassName: PropTypes.func,
  keyProperty: PropTypes.string,
};

import { Avatar, Box, IconButton, Link, Stack, Tooltip } from '@mui/material';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import PropTypes from 'prop-types';
import { memo } from 'react';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { useBoolean } from 'src/hooks/use-boolean';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { fDate } from 'src/utils/format-time';

export const SupportTableRow = memo(
  ({ row, serialNumber }) => {
    const router = useRouter();

    const statusColorMap = {
      Request: 'warning',
      'Profile Viewed': 'info',
      'Viewed Pkg': 'primary',
      Engaged: 'success',
    };

    return (
      <>
        <TableRow hover tabIndex={-1}>
          <TableCell sx={{ whiteSpace: 'nowrap' }}>{serialNumber}</TableCell>

          <TableCell>
            <Stack spacing={2} direction="row" alignItems="center">
              <Avatar alt={row.name} src={row.avatar} />

              <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
                <Link color="inherit" sx={{ cursor: 'pointer' }} onClick={() => router.push(paths.dashboard.customers.details(1))}>
                  {' '}
                  {row.name}
                </Link>

                <Box component="span" sx={{ color: 'text.disabled' }}>
                  {row.email}
                </Box>
              </Stack>
            </Stack>
          </TableCell>

          <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.phone || '0'}</TableCell>

          <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.createdAt ? fDate(row.createdAt) : 'N/A'}</TableCell>

          <TableCell>
            <Label variant="soft" color={statusColorMap[row.status] || 'default'}>
              {row.status || 'N/A'}
            </Label>
          </TableCell>

          <TableCell align="center" sx={{ px: 1 }}>
            <Tooltip title="View Profile" arrow placement="top">
              <IconButton color="default" onClick={() => router.push(paths.dashboard.clientsDetails(row._id))}>
                <Iconify icon="solar:eye-bold" />
              </IconButton>
            </Tooltip>
          </TableCell>
        </TableRow>
      </>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for memo
    return (
      prevProps.row._id === nextProps.row._id &&
      prevProps.row.name === nextProps.row.name &&
      prevProps.row.balance === nextProps.row.balance &&
      prevProps.row.status === nextProps.row.status &&
      prevProps.row.createdAt === nextProps.row.createdAt &&
      prevProps.serialNumber === nextProps.serialNumber
    );
  }
);

SupportTableRow.propTypes = {
  row: PropTypes.object.isRequired,
  serialNumber: PropTypes.number.isRequired,
  onDeleteRow: PropTypes.func.isRequired,
};

SupportTableRow.displayName = 'SupportTableRow';

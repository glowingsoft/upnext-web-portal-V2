import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

export function RevenueClientTable({ title, tableData, headLabel }) {
  return (
    <Card sx={{ p: 3, bgcolor: 'common.white', borderRadius: 3, boxShadow: '0 2px 12px 0 rgba(16,30,54,0.04)', border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: 'text.primary' }}>
        {title}
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {headLabel.map((col) => (
                <TableCell key={col.id} sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: 13 }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row) => (
              <TableRow key={row.id} hover>
                {headLabel.map((col) => (
                  <TableCell key={col.id} sx={{ py: 1.5, fontWeight: 500, color: 'text.primary' }}>
                    {row[col.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {tableData.length === 0 && (
              <TableRow>
                <TableCell colSpan={headLabel.length} align="center" sx={{ py: 6, color: 'text.disabled' }}>
                  No clients found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

RevenueClientTable.propTypes = {
  title: PropTypes.string,
  tableData: PropTypes.array,
  headLabel: PropTypes.array,
};

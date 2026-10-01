import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export function AppNewServices({ title, subheader, tableData, headLabel, ...other }) {
  const router = useRouter();

  const handleNavigate = () => {
    router.push(paths.dashboard.services);
  };

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

      <Scrollbar sx={{ minHeight: 402 }}>
        <Table sx={{ minWidth: 680 }}>
          <TableHeadCustom headLabel={headLabel} />

          <TableBody>
            {tableData.map((row, idx) => (
              <RowItem key={idx} row={row} />
            ))}
          </TableBody>
        </Table>
      </Scrollbar>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button size="small" color="inherit" onClick={handleNavigate} endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}>
          View all
        </Button>
      </Box>
    </Card>
  );
}

function RowItem({ row }) {
  return (
    <>
      <TableRow>
        <TableCell>{row.serviceName}</TableCell>

        <TableCell>{row.providerName}</TableCell>

        <TableCell>{row?.type}</TableCell>

        <TableCell>{row?.amount}</TableCell>
      </TableRow>
    </>
  );
}

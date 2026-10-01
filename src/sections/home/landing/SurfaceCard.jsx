import { Paper } from '@mui/material';

export default function SurfaceCard({ children, sx = {}, ...paperProps }) {
  return (
    <Paper
      elevation={0}
      {...paperProps}
      sx={{
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        backgroundColor: 'background.paper',
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

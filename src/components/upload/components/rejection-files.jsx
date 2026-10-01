import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

import { varAlpha } from 'src/theme/styles';

// ----------------------------------------------------------------------

export function RejectionFiles({ files }) {
  if (!files.length) {
    return null;
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        py: 1,
        px: 2,
        mt: 3,
        textAlign: 'left',
        borderStyle: 'dashed',
        borderColor: 'error.main',
        bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.08),
      }}
    >
      {files.map(({ file, errors }) => {
        const key = file?.name ?? String(Math.random());

        return (
          <Box key={key} sx={{ my: 1 }}>
            {errors.map((error) => {
              const message = error.message.replace(
                /(\d+)\s*bytes/gi,
                (_, bytes) => `${(Number(bytes) / (1024 * 1024)).toFixed(0)} MB`
              );
              return (
                <Box key={error.code} component="span" sx={{ typography: 'caption' }}>
                  - {message}
                </Box>
              );
            })}
          </Box>
        );
      })}
    </Paper>
  );
}

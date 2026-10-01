import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

export function BreadcrumbsLink({ link, activeLast, disabled }) {
  const styles = {
    typography: 'body2',
    alignItems: 'center',
    color: 'text.primary',
    display: 'inline-flex',
    ...(disabled &&
      !activeLast && { cursor: 'default', pointerEvents: 'none', color: 'text.disabled' }),
  };

  const renderContent = (
    <>
      {link.icon && (
        <Box
          component="span"
          sx={{
            mr: 1,
            display: 'inherit',
            '& svg, & img': {
              width: 20,
              height: 20,
            },
          }}
        >
          {link.icon}
        </Box>
      )}

      {link.name}
    </>
  );

  if (link.onClick) {
    return (
      <Link
        component="button"
        type="button"
        onClick={link.onClick}
        sx={{ ...styles, border: 0, p: 0, bgcolor: 'transparent', font: 'inherit', cursor: 'pointer' }}
      >
        {renderContent}
      </Link>
    );
  }

  if (link.href) {
    return (
      <Link component={RouterLink} href={link.href} sx={styles}>
        {renderContent}
      </Link>
    );
  }

  return <Box sx={styles}> {renderContent} </Box>;
}

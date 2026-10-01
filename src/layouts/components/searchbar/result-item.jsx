import Box from '@mui/material/Box';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

import { varAlpha } from 'src/theme/styles';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ResultItem({ icon, iconName, title, path, groupLabel, onClickItem }) {
  return (
    <ListItemButton
      onClick={onClickItem}
      sx={{
        gap: 1.5,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: 'transparent',
        borderBottomColor: (theme) => theme.vars.palette.divider,
        transition: (theme) => theme.transitions.create(['background-color', 'border-color']),
        '&:hover': {
          borderRadius: 1.5,
          borderColor: (theme) => theme.vars.palette.primary.main,
          backgroundColor: (theme) =>
            varAlpha(
              theme.vars.palette.primary.mainChannel,
              theme.vars.palette.action.hoverOpacity
            ),
          '& .search-result-arrow': { opacity: 1, transform: 'translateX(0)' },
        },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 1.25,
          bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
          '& svg, & img': { width: 18, height: 18 },
        }}
      >
        {icon || <Iconify icon={iconName || 'solar:widget-2-bold-duotone'} width={18} sx={{ color: 'text.primary' }} />}
      </Box>

      <ListItemText
        primaryTypographyProps={{ typography: 'subtitle2', sx: { textTransform: 'capitalize' } }}
        secondaryTypographyProps={{ typography: 'caption', noWrap: true }}
        primary={title.map((part, index) => (
          <Box
            key={index}
            component="span"
            sx={{ color: part.highlight ? 'primary.main' : 'text.primary' }}
          >
            {part.text}
          </Box>
        ))}
        secondary={path.map((part, index) => (
          <Box
            key={index}
            component="span"
            sx={{ color: part.highlight ? 'primary.main' : 'text.secondary' }}
          >
            {part.text}
          </Box>
        ))}
      />

      {groupLabel && (
        <Label color="info" variant="soft" sx={{ flexShrink: 0 }}>
          {groupLabel}
        </Label>
      )}

      <Iconify
        icon="eva:arrow-ios-forward-fill"
        width={16}
        className="search-result-arrow"
        sx={{
          flexShrink: 0,
          color: 'primary.main',
          opacity: 0,
          transform: 'translateX(-4px)',
          transition: (theme) => theme.transitions.create(['opacity', 'transform']),
        }}
      />
    </ListItemButton>
  );
}

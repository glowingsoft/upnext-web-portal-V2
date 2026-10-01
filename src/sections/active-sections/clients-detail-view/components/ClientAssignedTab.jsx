import { useState } from 'react';
import { Box, Card, IconButton, Menu, MenuItem, Paper, Stack, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';

const initialAssignedSections = [
  {
    title: 'Training Plans',
    items: [{ id: 'training-1', name: 'Strength Block - Phase 2', lines: ['5 days/week', '6 weeks', 'Assigned to 2 clients'] }],
  },
  {
    title: 'Check In',
    items: [{ id: 'checkin-1', name: 'Weekly Check-In (Standard)', lines: ['Every Monday', '12 Clients', '7 Fields'] }],
  },
  {
    title: 'Documents',
    items: [{ id: 'document-1', name: 'File.Pdf', lines: ['2.3 MB', 'Uploaded March 28, 2026'] }],
  },
  {
    title: 'Supplement Plans',
    items: [{ id: 'supplement-1', name: 'Standard Stack', lines: ['Morning - Pre - Post', 'Assigned to 2 clients'] }],
  },
  {
    title: 'Meal Plans',
    items: [{ id: 'meal-1', name: 'Cutting Phase - 2400 Kcal', lines: ['P:220g - C:200g - F:60g', 'Assigned to 2 clients'] }],
  },
];

export default function ClientAssignedTab() {
  const [assignedSections, setAssignedSections] = useState(initialAssignedSections);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const isMenuOpen = Boolean(menuAnchorEl);

  const handleOpenMenu = (event, itemId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedItemId(itemId);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setSelectedItemId(null);
  };

  const handleUnassign = () => {
    if (!selectedItemId) return;

    setAssignedSections((prev) =>
      prev
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => item.id !== selectedItemId),
        }))
        .filter((section) => section.items.length > 0)
    );

    handleCloseMenu();
  };

  return (
    <Paper elevation={1} sx={{ boxShadow: 'none', mb: 4 }}>
      {assignedSections.map((section) => (
        <Box key={section.title} sx={{ mb: 2.5 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
            {section.title}
          </Typography>
          <Stack spacing={1.25}>
            {section.items.map((item) => (
              <Card key={item.name} sx={{ p: 1.5, borderRadius: 2, borderLeft: (theme) => `4px solid ${theme.palette.primary.main}` }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5}>
                  <Box>
                    <Typography variant="subtitle2">{item.name}</Typography>
                    {item.lines.map((line) => (
                      <Typography key={line} variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                        • {line}
                      </Typography>
                    ))}
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={(event) => handleOpenMenu(event, item.id)}>
                      <Iconify icon="solar:menu-dots-bold" />
                    </IconButton>
                  </Box>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Box>
      ))}

      <Menu anchorEl={menuAnchorEl} open={isMenuOpen} onClose={handleCloseMenu}>
        <MenuItem onClick={handleUnassign} sx={{ color: 'error.main', px: 3, fontSize: 14, fontWeight: 500 }}>
          Unassign
        </MenuItem>
      </Menu>
    </Paper>
  );
}

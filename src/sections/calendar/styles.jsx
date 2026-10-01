import { styled } from '@mui/material/styles';

import { varAlpha } from 'src/theme/styles';

// ----------------------------------------------------------------------

export const StyledCalendar = styled('div')(({ theme }) => ({
  position: 'relative',
  width: '100%',

  '& .fc': {
    '--fc-border-color': theme.vars.palette.divider,
    '--fc-page-bg-color': 'transparent',
    '--fc-neutral-bg-color': theme.vars.palette.background.neutral,
    '--fc-today-bg-color': varAlpha(theme.vars.palette.primary.mainChannel, 0.05),
    '--fc-event-border-color': 'transparent',
    '--fc-now-indicator-color': theme.vars.palette.error.main,
    '--fc-list-event-hover-bg-color': theme.vars.palette.action.hover,
    '--fc-highlight-color': theme.vars.palette.action.hover,

    fontFamily: theme.typography.fontFamily,
    color: theme.vars.palette.text.primary,
  },

  '& .fc .fc-license-message': { display: 'none' },
  '& .fc a': { color: theme.vars.palette.text.primary },

  '& .fc-scrollgrid': {
    borderRight: 0,
    borderLeft: 0,
    borderBottom: 0,
  },

  '& .fc-theme-standard td, & .fc-theme-standard th': {
    borderColor: theme.vars.palette.divider,
  },

  '& .fc-col-header': {
    backgroundColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
  },

  '& .fc-col-header-cell': {
    padding: theme.spacing(1.4, 0.5),
  },

  '& .fc-col-header-cell-cushion': {
    color: theme.vars.palette.text.primary,
    fontSize: 13,
    fontWeight: 700,
    textDecoration: 'none',
  },

  '& .fc-daygrid-day-number': {
    padding: theme.spacing(1, 1),
    color: theme.vars.palette.text.primary,
    fontSize: 13,
    fontWeight: 600,
    textDecoration: 'none',
  },

  '& .fc-day-other .fc-daygrid-day-number': {
    color: theme.vars.palette.text.disabled,
  },

  '& .fc-day-today': {
    backgroundColor: `${varAlpha(theme.vars.palette.primary.mainChannel, 0.045)} !important`,
  },

  '& .upnext-selected-day': {
    backgroundColor: `${varAlpha(theme.vars.palette.primary.mainChannel, 0.12)} !important`,
  },

  '& .fc-col-header-cell.upnext-selected-day .fc-col-header-cell-cushion': {
    color: theme.vars.palette.primary.main,
  },

  '& .fc-daygrid-day-frame': {
    minHeight: 105,
  },

  '& .fc-daygrid-event-harness': {
    marginLeft: 5,
    marginRight: 5,
  },

  '& .fc-daygrid-event': {
    minHeight: 34,
    marginTop: 3,
    border: 0,
    borderRadius: 7,
    cursor: 'pointer',
    overflow: 'hidden',
    transition: theme.transitions.create(['transform', 'box-shadow']),

    '&:hover': {
      zIndex: 10,
      transform: 'translateY(-1px)',
      boxShadow: theme.customShadows?.z8,
    },
  },

  '& .fc-timegrid-event': {
    border: 0,
    borderRadius: 7,
    cursor: 'pointer',
    overflow: 'hidden',
    boxShadow: `0 1px 2px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.12)}`,

    '&:hover': {
      zIndex: 10,
      boxShadow: theme.customShadows?.z8,
    },
  },

  '& .fc-timegrid-slot': {
    height: 26,
  },

  '& .fc-timegrid-slot-label': {
    color: theme.vars.palette.text.secondary,
    fontSize: 12,
  },

  '& .fc-timegrid-axis-cushion': {
    color: theme.vars.palette.text.secondary,
    fontSize: 12,
  },

  '& .fc-timegrid-now-indicator-line': {
    borderWidth: 1,
  },

  '& .fc-timegrid-now-indicator-arrow': {
    borderWidth: 5,
  },

  '& .fc-daygrid-more-link': {
    display: 'inline-flex',
    margin: theme.spacing(0.4, 0.75),
    padding: theme.spacing(0.25, 0.75),
    borderRadius: 6,
    color: theme.vars.palette.primary.main,
    backgroundColor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
    fontSize: 11,
    fontWeight: 700,
    textDecoration: 'none',

    '&:hover': {
      backgroundColor: varAlpha(theme.vars.palette.primary.mainChannel, 0.16),
    },
  },

  '& .fc-popover': {
    overflow: 'hidden',
    border: `1px solid ${theme.vars.palette.divider}`,
    borderRadius: 10,
    boxShadow: theme.customShadows?.z20,
    backgroundColor: theme.vars.palette.background.paper,
  },

  '& .fc-popover-header': {
    padding: theme.spacing(1),
    backgroundColor: theme.vars.palette.background.neutral,
  },

  '& .fc-list': {
    border: 0,
  },

  '& .fc-list-event': {
    cursor: 'pointer',
  },

  [theme.breakpoints.down('sm')]: {
    '& .fc-col-header-cell-cushion': {
      fontSize: 11,
    },

    '& .fc-daygrid-day-number': {
      padding: theme.spacing(0.75),
      fontSize: 11,
    },

    '& .fc-daygrid-day-frame': {
      minHeight: 85,
    },

    '& .fc-daygrid-event': {
      marginLeft: 2,
      marginRight: 2,
    },

    '& .fc-timegrid-axis': {
      width: 48,
    },
  },
}));

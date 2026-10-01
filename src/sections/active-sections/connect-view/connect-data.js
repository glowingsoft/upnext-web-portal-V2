// ----------------------------------------------------------------------

export const PROVIDER_CONNECTIONS = [
  {
    id: 'google-calendar',
    title: 'Google Calendar',
    titleKey: 'googleCalendar',
    description: 'Auto-sync consultations & sessions',
    descriptionKey: 'googleCalendarDescription',
    status: 'not-connected',
    buttonLabel: 'Connect Google Calendar',
    buttonLabelKey: 'connectGoogleCalendar',
    icon: 'logos:google-calendar',
    primaryAction: true,
  },
  {
    id: 'bank-account',
    title: 'Bank Account',
    titleKey: 'bankAccount',
    description: 'Receive Booking payments',
    descriptionKey: 'receiveBookingPayments',
    status: 'connected',
    buttonLabel: 'Payout Method',
    buttonLabelKey: 'payoutMethod',
    icon: 'twemoji:bank',
    primaryAction: true,
  },
];

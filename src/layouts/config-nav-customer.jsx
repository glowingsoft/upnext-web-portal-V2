import { paths } from 'src/routes/paths';
import { CONFIG } from 'src/config-global';
import { SvgColor } from 'src/components/svg-color';
import { Iconify } from 'src/components/iconify';

const icon = (name) => <SvgColor src={`${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  dashboard: icon('ic-dashboard-2'),
  parameter: icon('ic-parameter'),

  leads: icon('ic-leads'),
  calendar: icon('ic-calendar-2'),
  tasks: icon('ic-tasks-3'),
  chat: icon('ic-chat'),
  resources: icon('ic-resources'),
  plans: icon('ic-plans'),
  appSettings: icon('ic-settings'),
  service: icon('ic-service-hand'),
  providers: icon('ic-clients'),
  bookings: icon('ic-session'), // Changed session to bookings
  events: <Iconify icon="solar:ticket-bold" width={24} />,
  analytics: icon('ic-analytics-2'),
  revenue: icon('ic-revenue'),
  providerHub: icon('ic-provider-hub'),
};

const getNavData = (t) => [
  {
    items: [
      { title: t('dashboard'), path: paths.dashboard.root, icon: ICONS.dashboard },
      { title: t('providers'), path: paths.dashboard.providers, icon: ICONS.providers },
      { title: t('services'), path: paths.dashboard.services, icon: ICONS.service },
      { title: t('chat'), path: paths.dashboard.chat, icon: ICONS.chat },
      { title: t('bookings'), path: paths.dashboard.bookings, icon: ICONS.bookings },
      { title: t('events'), path: paths.dashboard.events, icon: ICONS.events },
      { title: t('calendar'), path: paths.dashboard.calendar, icon: ICONS.calendar },

      {
        title: t('settings'),
        path: paths.dashboard.appSettings.root,
        icon: ICONS.appSettings,
        children: [
          { title: t('termsAndConditions'), path: paths.dashboard.appSettings.terms },
          { title: t('privacyPolicy'), path: paths.dashboard.appSettings.privacy },
          { title: t('aboutUs'), path: paths.dashboard.appSettings.about },
          { title: t('faqs'), path: paths.dashboard.appSettings.faqs },
          { title: t('contactUs'), path: paths.dashboard.appSettings.contact },
          { title: t('helpCenter'), path: paths.dashboard.appSettings.helpCenter },
          { title: t('notifications'), path: paths.dashboard.appSettings.notifications },
          { title: t('manageCard'), path: paths.dashboard.appSettings.connectManageCards },
        ],
      },
    ],
  },
];

const defaultT = (key) => {
  const translations = {
    dashboard: 'Dashboard',
    providers: 'Providers',
    services: 'Services',
    chat: 'Chat',
    bookings: 'Bookings',
    events: 'Events',
    settings: 'Settings',
    terms: 'Terms',
    privacyPolicy: 'Privacy Policy',
    aboutUs: 'About Us',
    faqs: "Faq's",
    contactUs: 'Contact Us',
    helpCenter: 'Help Center',
    notifications: 'Notifications',
    manageCard: 'Manage Cards',
  };
  return translations[key] || key;
};

export { getNavData };
export const navDataCustomer = getNavData(defaultT);

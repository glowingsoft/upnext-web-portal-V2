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

  leads: icon('ic-leads-2'),
  calendar: icon('ic-calendar-2'),
  tasks: icon('ic-tasks-3'),
  chat: icon('ic-chat'),
  resources: icon('ic-resources'),
  plans: icon('ic-plans'),
  appSettings: icon('ic-settings-4'),
  service: icon('ic-service'),
  bookings: icon('ic-session'), // Changed session to bookings
  analytics: icon('ic-analytics-2'),
  revenue: icon('ic-revenue'),
  liveOffers: <Iconify icon="solar:bell-bing-bold-duotone" width={24} />,
};

const getNavData = (t) => [
  {
    items: [
      { title: t('dashboard'), path: paths.dashboard.root, icon: ICONS.dashboard },
      { title: t('liveBookingOffers'), path: paths.dashboard.liveOffers, icon: ICONS.liveOffers },
      { title: t('calendar'), path: paths.dashboard.calendar, icon: ICONS.calendar },
      { title: t('chat'), path: paths.dashboard.chat, icon: ICONS.chat },
      { title: t('services'), path: paths.dashboard.services, icon: ICONS.service },
      { title: t('packages'), path: paths.dashboard.packages, icon: ICONS.ecommerce },
      { title: t('promotions'), path: paths.dashboard.promotions, icon: ICONS.parameter },
      { title: t('bookings'), path: paths.dashboard.bookings, icon: ICONS.bookings }, // Changed sessions to bookings
      // { title: t('revenue'), path: paths.dashboard.revenue, icon: ICONS.revenue },
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
          { title: t('analytics'), path: paths.dashboard.appSettings.analytics },
          { title: t('billingHistory'), path: paths.dashboard.appSettings.billingHistory },
          { title: t('connect'), path: paths.dashboard.appSettings.connect },
        ],
      },
    ],
  },
];

const defaultT = (key) => {
  const translations = {
    dashboard: 'Dashboard',
    calendar: 'Calendar',
    liveBookingOffers: 'Live Booking Offers',
    chat: 'Chat',
    services: 'Services',
    packages: 'Packages',
    promotions: 'Promotions',
    bookings: 'Bookings',
    revenue: 'Revenue',
    settings: 'Settings',
    terms: 'Terms',
    privacyPolicy: 'Privacy Policy',
    aboutUs: 'About Us',
    faqs: "Faq's",
    contactUs: 'Contact Us',
    helpCenter: 'Help Center',
    subscription: 'Subscription',
    notifications: 'Notifications',
    analytics: 'Analytics',
    billingHistory: 'Billing History',
    connect: 'Connect',
  };
  return translations[key] || key;
};

export { getNavData };
export const navDataProvider = getNavData(defaultT);

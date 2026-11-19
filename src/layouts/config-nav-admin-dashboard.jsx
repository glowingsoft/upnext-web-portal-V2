import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`} />;

// const icon = (name) => (
//   <Iconify icon={name} />
// );

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
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
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard-2'),
  parameter: icon('ic-parameter'),

  terms: icon('ic-file'),
  privacy: icon('ic-lock'),
  faqs: icon('ic-faqs'),
  about: icon('ic-tour'),
  contact: icon('ic-contact'),
  support: icon('ic-chat'),
  helpCenter: icon('ic-help-center'),

  providers: icon('ic-leads-2'),
  bookings: icon('ic-session'),
  customers: icon('ic-clients'),
  categories: icon('ic-menu-item'),
  badges: icon('ic-label'),
  reviews: icon('ic-rating-2'),
  tags: <Iconify icon="solar:tag-bold" width={24} />,
  instantBooking: <Iconify icon="solar:bolt-bold" width={24} />,
};

// ----------------------------------------------------------------------

const getNavData = (t) => [
  {
    items: [
      { title: t('dashboard'), path: paths.adminDashboard.root, icon: ICONS.dashboard },

      { title: t('providers'), path: paths.adminDashboard.providers, icon: ICONS.providers },
      { title: t('customers'), path: paths.adminDashboard.customers, icon: ICONS.customers },
      { title: t('bookings'), path: paths.adminDashboard.bookings, icon: ICONS.bookings },
      { title: t('manageReviews'), path: paths.adminDashboard.reviews, icon: ICONS.reviews },
      { title: t('categories'), path: paths.adminDashboard.categories, icon: ICONS.categories },
      { title: t('tags'), path: paths.adminDashboard.tags, icon: ICONS.tags },
      { title: t('badges'), path: paths.adminDashboard.badges, icon: ICONS.badges },
      { title: t('instantBooking', { defaultValue: 'Instant Booking' }), path: paths.adminDashboard.instantBooking, icon: ICONS.instantBooking },
      // { title: t('events'), path: paths.adminDashboard.events, icon: ICONS.calendar },
      // { title: t('revenue'), path: paths.adminDashboard.revenue, icon: ICONS.analytics },

      { title: t('faqs'), path: paths.adminDashboard.content.faqs, icon: ICONS.faqs },
      { title: t('support'), path: paths.adminDashboard.content.support, icon: ICONS.support },
      { title: t('helpCenter'), path: paths.adminDashboard.content.helpCenter, icon: ICONS.helpCenter },

      { title: t('aboutUs'), path: paths.adminDashboard.content.about, icon: ICONS.about },
      // { title: t('contactUs'), path: paths.adminDashboard.content.contact, icon: ICONS.contact },

      { title: t('privacyPolicy'), path: paths.adminDashboard.content.privacy, icon: ICONS.privacy },
      { title: t('termsAndConditions'), path: paths.adminDashboard.content.terms, icon: ICONS.terms },

      // { title: t('chat'), path: paths.adminDashboard.chat, icon: ICONS.chat },

      // { title: t('ecommerce'), path: paths.adminDashboard.general.ecommerce, icon: ICONS.ecommerce },
      // { title: t('analytics'), path: paths.adminDashboard.general.analytics, icon: ICONS.analytics },
      // { title: t('banking'), path: paths.adminDashboard.general.banking, icon: ICONS.banking },
      // { title: t('booking'), path: paths.adminDashboard.general.booking, icon: ICONS.booking },
      // { title: t('file'), path: paths.adminDashboard.general.file, icon: ICONS.file },
      // { title: t('course'), path: paths.adminDashboard.general.course, icon: ICONS.course },
    ],
  },
];

const defaultT = (key) => {
  const translations = {
    dashboard: 'Dashboard',
    providers: 'Providers',
    customers: 'Customers',
    bookings: 'Bookings',
    manageReviews: 'Reviews',
    tags: 'Tags',
    events: 'Events',
    faqs: "Faq's",
    support: 'Support',
    helpCenter: 'Help Center',
    aboutUs: 'About Us',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    termsAndConditions: 'Terms & Conditions',
  };
  return translations[key] || key;
};

export { getNavData };
export const navDataAdmin = getNavData(defaultT);

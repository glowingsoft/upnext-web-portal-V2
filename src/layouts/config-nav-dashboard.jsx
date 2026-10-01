import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { Label } from 'src/components/label';
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
  // chat: icon('ic-chat'),
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
  // calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  // analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard-2'),
  parameter: icon('ic-parameter'),

  leads: icon('ic-leads'),
  clients: icon('ic-clients'),
  calendar: icon('ic-calendar-2'),
  tasks: icon('ic-tasks-3'),
  chat: icon('ic-chat'),
  resources: icon('ic-resources'),
  plans: icon('ic-plans'),
  appSettings: icon('ic-settings-4'),
  service: icon('ic-service'),
  session: icon('ic-session'),
  analytics: icon('ic-analytics-2'),
  revenue: icon('ic-revenue'),
};

// ----------------------------------------------------------------------

export const getNavData = (t) => [
  /**
   * Overview
   */
  {
    // subheader: ' ',
    items: [
      { title: t('dashboard'), path: paths.dashboard.root, icon: ICONS.dashboard },
      { title: t('leads'), path: paths.dashboard.leads, icon: ICONS.leads },
      { title: t('clients'), path: paths.dashboard.clients, icon: ICONS.clients },
      { title: t('calendar'), path: paths.dashboard.calendar, icon: ICONS.calendar },
      { title: t('tasks'), path: paths.dashboard.tasks, icon: ICONS.tasks },
      { title: t('chat'), path: paths.dashboard.chat, icon: ICONS.chat },
      { title: t('services'), path: paths.dashboard.services, icon: ICONS.service },
      { title: t('sessions'), path: paths.dashboard.sessions, icon: ICONS.session },
      { title: t('revenue'), path: paths.dashboard.revenue, icon: ICONS.revenue },
      {
        title: t('resources'),
        path: paths.dashboard.resources.root,
        icon: ICONS.resources,
        children: [
          { title: t('plans'), path: paths.dashboard.resources.plans },
          { title: t('checkIns'), path: paths.dashboard.resources.checkIns },
          { title: t('documents'), path: paths.dashboard.resources.documents },
        ],
      },
      {
        title: t('settings'),
        path: paths.dashboard.appSettings.root,
        icon: ICONS.appSettings,
        children: [
          { title: t('terms'), path: paths.dashboard.appSettings.terms },
          { title: t('privacyPolicy'), path: paths.dashboard.appSettings.privacy },
          { title: t('aboutUs'), path: paths.dashboard.appSettings.about },
          { title: t('faqsApostrophe'), path: paths.dashboard.appSettings.faqs },
          { title: t('contactUs'), path: paths.dashboard.appSettings.contact },
          { title: t('helpCenter'), path: paths.dashboard.appSettings.helpCenter },
          { title: t('subscription'), path: paths.dashboard.appSettings.subscription },
          { title: t('notifications'), path: paths.dashboard.appSettings.notifications },
          { title: t('billingHistory'), path: paths.dashboard.appSettings.billingHistory },
          { title: t('connect'), path: paths.dashboard.appSettings.connect },
        ],
      },

      // { title: t('navbar.plans'), path: paths.dashboard.plans, icon: ICONS.plans },

      // { title: t('navbar.ecommerce'), path: paths.dashboard.general.ecommerce, icon: ICONS.ecommerce },
      // { title: t('navbar.analytics'), path: paths.dashboard.general.analytics, icon: ICONS.analytics },
      // { title: t('navbar.banking'), path: paths.dashboard.general.banking, icon: ICONS.banking },
      // { title: t('navbar.sample'), path: paths.dashboard.sample, icon: ICONS.file },
      // { title: t('navbar.blank'), path: paths.dashboard.blank, icon: ICONS.blank },
    ],
  },
  /**
   * Management
   */
  // {
  //   subheader: 'Management',
  //   items: [
  //     {
  //       title: 'User',
  //       path: paths.dashboard.user.root,
  //       icon: ICONS.user,
  //       children: [
  //         { title: 'Profile', path: paths.dashboard.user.root },
  //         { title: 'Cards', path: paths.dashboard.user.cards },
  //         { title: 'List', path: paths.dashboard.user.list },
  //         { title: 'Create', path: paths.dashboard.user.new },
  //         { title: 'Edit', path: paths.dashboard.user.demo.edit },
  //         { title: 'Account', path: paths.dashboard.user.account },
  //       ],
  //     },
  //     {
  //       title: 'Product',
  //       path: paths.dashboard.product.root,
  //       icon: ICONS.product,
  //       children: [
  //         { title: 'List', path: paths.dashboard.product.root },
  //         { title: 'Details', path: paths.dashboard.product.demo.details },
  //         { title: 'Create', path: paths.dashboard.product.new },
  //         { title: 'Edit', path: paths.dashboard.product.demo.edit },
  //       ],
  //     },
  //     {
  //       title: 'Order',
  //       path: paths.dashboard.order.root,
  //       icon: ICONS.order,
  //       children: [
  //         { title: 'List', path: paths.dashboard.order.root },
  //         { title: 'Details', path: paths.dashboard.order.demo.details },
  //       ],
  //     },
  //     {
  //       title: 'Invoice',
  //       path: paths.dashboard.invoice.root,
  //       icon: ICONS.invoice,
  //       children: [
  //         { title: 'List', path: paths.dashboard.invoice.root },
  //         { title: 'Details', path: paths.dashboard.invoice.demo.details },
  //         { title: 'Create', path: paths.dashboard.invoice.new },
  //         { title: 'Edit', path: paths.dashboard.invoice.demo.edit },
  //       ],
  //     },
  //     {
  //       title: 'Blog',
  //       path: paths.dashboard.post.root,
  //       icon: ICONS.blog,
  //       children: [
  //         { title: 'List', path: paths.dashboard.post.root },
  //         { title: 'Details', path: paths.dashboard.post.demo.details },
  //         { title: 'Create', path: paths.dashboard.post.new },
  //         { title: 'Edit', path: paths.dashboard.post.demo.edit },
  //       ],
  //     },
  //     {
  //       title: 'Job',
  //       path: paths.dashboard.job.root,
  //       icon: ICONS.job,
  //       children: [
  //         { title: 'List', path: paths.dashboard.job.root },
  //         { title: 'Details', path: paths.dashboard.job.demo.details },
  //         { title: 'Create', path: paths.dashboard.job.new },
  //         { title: 'Edit', path: paths.dashboard.job.demo.edit },
  //       ],
  //     },
  //     {
  //       title: 'Tour',
  //       path: paths.dashboard.tour.root,
  //       icon: ICONS.tour,
  //       children: [
  //         { title: 'List', path: paths.dashboard.tour.root },
  //         { title: 'Details', path: paths.dashboard.tour.demo.details },
  //         { title: 'Create', path: paths.dashboard.tour.new },
  //         { title: 'Edit', path: paths.dashboard.tour.demo.edit },
  //       ],
  //     },
  //     { title: 'File manager', path: paths.dashboard.fileManager, icon: ICONS.folder },
  //     {
  //       title: 'Mail',
  //       path: paths.dashboard.mail,
  //       icon: ICONS.mail,
  //       info: (
  //         <Label color="error" variant="inverted">
  //           +32
  //         </Label>
  //       ),
  //     },
  //     { title: 'Chat', path: paths.dashboard.chat, icon: ICONS.chat },
  //     { title: 'Calendar', path: paths.dashboard.calendar, icon: ICONS.calendar },
  //     { title: 'Kanban', path: paths.dashboard.kanban, icon: ICONS.kanban },
  //   ],
  // },
  /**
   * Item State
   */
  // {
  //   subheader: 'Misc',
  //   items: [
  //     {
  //       // default roles : All roles can see this entry.
  //       // roles: ['user'] Only users can see this item.
  //       // roles: ['admin'] Only admin can see this item.
  //       // roles: ['admin', 'manager'] Only admin/manager can see this item.
  //       // Reference from 'src/guards/RoleBasedGuard'.
  //       title: 'Permission',
  //       path: paths.dashboard.permission,
  //       icon: ICONS.lock,
  //       roles: ['admin', 'manager'],
  //       caption: 'Only admin can see this item',
  //     },
  //     {
  //       title: 'Level',
  //       path: '#/dashboard/menu_level',
  //       icon: ICONS.menuItem,
  //       children: [
  //         {
  //           title: 'Level 1a',
  //           path: '#/dashboard/menu_level/menu_level_1a',
  //           children: [
  //             {
  //               title: 'Level 2a',
  //               path: '#/dashboard/menu_level/menu_level_1a/menu_level_2a',
  //             },
  //             {
  //               title: 'Level 2b',
  //               path: '#/dashboard/menu_level/menu_level_1a/menu_level_2b',
  //               children: [
  //                 {
  //                   title: 'Level 3a',
  //                   path: '#/dashboard/menu_level/menu_level_1a/menu_level_2b/menu_level_3a',
  //                 },
  //                 {
  //                   title: 'Level 3b',
  //                   path: '#/dashboard/menu_level/menu_level_1a/menu_level_2b/menu_level_3b',
  //                 },
  //               ],
  //             },
  //           ],
  //         },
  //         { title: 'Level 1b', path: '#/dashboard/menu_level/menu_level_1b' },
  //       ],
  //     },
  //     {
  //       title: 'Disabled',
  //       path: '#disabled',
  //       icon: ICONS.disabled,
  //       disabled: true,
  //     },
  //     {
  //       title: 'Label',
  //       path: '#label',
  //       icon: ICONS.label,
  //       info: (
  //         <Label
  //           color="info"
  //           variant="inverted"
  //           startIcon={<Iconify icon="solar:bell-bing-bold-duotone" />}
  //         >
  //           NEW
  //         </Label>
  //       ),
  //     },
  //     {
  //       title: 'Caption',
  //       path: '#caption',
  //       icon: ICONS.menuItem,
  //       caption:
  //         'Quisque malesuada placerat nisl. In hac habitasse platea dictumst. Cras id dui. Pellentesque commodo eros a enim. Morbi mollis tellus ac sapien.',
  //     },
  //     {
  //       title: 'Params',
  //       path: '/dashboard/params?id=e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1',
  //       icon: ICONS.parameter,
  //     },
  //     {
  //       title: 'External link',
  //       path: 'https://www.google.com/',
  //       icon: ICONS.external,
  //       info: <Iconify width={18} icon="prime:external-link" />,
  //     },
  //     { title: 'Blank', path: paths.dashboard.blank, icon: ICONS.blank },
  //   ],
  // },
];

// Backward compatibility - use English by default
const defaultT = (key) => {
  const translations = {
    'dashboard': 'Dashboard',
    'leads': 'Leads',
    'clients': 'Clients',
    'calendar': 'Calendar',
    'tasks': 'Tasks',
    'chat': 'Chat',
    'services': 'Services',
    'sessions': 'Sessions',
    'revenue': 'Revenue',
    'resources': 'Resources',
    'plans': 'Plans',
    'checkIns': 'Check-Ins',
    'documents': 'Documents',
    'settings': 'Settings',
    'terms': 'Terms',
    'privacyPolicy': 'Privacy Policy',
    'aboutUs': 'About Us',
    'faqsApostrophe': "Faq's",
    'contactUs': 'Contact Us',
    'helpCenter': 'Help Center',
    'subscription': 'Subscription',
    'notifications': 'Notifications',
    'billingHistory': 'Billing History',
    'connect': 'Connect',
  };
  return translations[key] || key;
};

export const navData = getNavData(defaultT);

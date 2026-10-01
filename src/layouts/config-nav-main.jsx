import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export const getNavData = (t) => [
  { title: t('home'), path: '/', icon: <Iconify width={22} icon="solar:home-2-bold-duotone" /> },
  {
    title: t('components'),
    path: paths.components,
    icon: <Iconify width={22} icon="solar:atom-bold-duotone" />,
  },
  {
    title: t('pages'),
    path: '/pages',
    icon: <Iconify width={22} icon="solar:file-bold-duotone" />,
    children: [
      {
        subheader: t('subheaderOther'),
        items: [
          { title: t('aboutus'), path: paths.about },
          { title: t('contactus'), path: paths.contact },
          { title: t('faqs'), path: paths.faqs },
          { title: t('pricing'), path: paths.pricing },
          { title: t('payment'), path: paths.payment },
          { title: t('maintenance'), path: paths.maintenance },
          { title: t('comingSoon'), path: paths.comingSoon },
        ],
      },
      {
        subheader: t('subheaderConcepts'),
        items: [
          { title: t('shop'), path: paths.product.root },
          { title: t('product'), path: paths.product.demo.details },
          { title: t('checkout'), path: paths.product.checkout },
          { title: t('posts'), path: paths.post.root },
          { title: t('post'), path: paths.post.demo.details },
        ],
      },
      {
        subheader: t('subheaderAuthDemo'),
        items: [
          { title: t('signIn'), path: paths.authDemo.split.signIn },
          { title: t('signUp'), path: paths.authDemo.split.signUp },
          { title: t('resetPassword'), path: paths.authDemo.split.resetPassword },
          { title: t('updatePassword'), path: paths.authDemo.split.updatePassword },
          { title: t('verify'), path: paths.authDemo.split.verify },
          { title: t('signInCentered'), path: paths.authDemo.centered.signIn },
          { title: t('signUpCentered'), path: paths.authDemo.centered.signUp },
          { title: t('resetPasswordCentered'), path: paths.authDemo.centered.resetPassword },
          { title: t('updatePasswordCentered'), path: paths.authDemo.centered.updatePassword },
          { title: t('verifyCentered'), path: paths.authDemo.centered.verify },
        ],
      },
      {
        subheader: t('subheaderError'),
        items: [
          { title: t('page403'), path: paths.page403 },
          { title: t('page404'), path: paths.page404 },
          { title: t('page500'), path: paths.page500 },
        ],
      },
      { subheader: t('subheaderDashboard'), items: [{ title: t('dashboard'), path: CONFIG.auth.redirectPath }] },
    ],
  },
  {
    title: t('docs'),
    icon: <Iconify width={22} icon="solar:notebook-bold-duotone" />,
    path: paths.docs,
  },
];

// Backward compatibility - use English by default
const defaultT = (key) => {
  const translations = {
    home: 'Home',
    components: 'Components',
    pages: 'Pages',
    docs: 'Docs',
    subheaderOther: 'Other',
    aboutus: 'About us',
    contactus: 'Contact us',
    faqs: 'FAQs',
    pricing: 'Pricing',
    payment: 'Payment',
    maintenance: 'Maintenance',
    comingSoon: 'Coming soon',
    subheaderConcepts: 'Concepts',
    shop: 'Shop',
    product: 'Product',
    checkout: 'Checkout',
    posts: 'Posts',
    post: 'Post',
    subheaderAuthDemo: 'Auth Demo',
    signIn: 'Sign in',
    signUp: 'Sign up',
    resetPassword: 'Reset password',
    updatePassword: 'Update password',
    verify: 'Verify',
    signInCentered: 'Sign in (centered)',
    signUpCentered: 'Sign up (centered)',
    resetPasswordCentered: 'Reset password (centered)',
    updatePasswordCentered: 'Update password (centered)',
    verifyCentered: 'Verify (centered)',
    subheaderError: 'Error',
    page403: 'Page 403',
    page404: 'Page 404',
    page500: 'Page 500',
    subheaderDashboard: 'Dashboard',
    dashboard: 'Dashboard',
  };
  return translations[key] || key;
};

export const navData = getNavData(defaultT);

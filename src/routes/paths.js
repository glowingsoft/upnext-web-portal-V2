import { paramCase } from 'src/utils/change-case';
import { _id, _postTitles } from 'src/_mock/assets';

// ----------------------------------------------------------------------

const MOCK_ID = _id[1];

const MOCK_TITLE = _postTitles[2];

const ROOTS = {
  AUTH: '/auth',
  AUTH_DEMO: '/auth-demo',
  DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/admin-dashboard',
  SUPER_ADMIN_DASHBOARD: '/super-admin-dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  howItWorks: '/how-it-works',
  reviews: '/reviews',
  events: '/events',
  services: '/services',
  about: '/about-us',
  stylist: {

    details: (slugOrId) => `/${slugOrId}`,
  },
  event: {
    details: (id) => `/event/${id}`,
  },
  contact: '/contact-us',
  faqs: '/faqs',
  privacy: '/privacy-policy',
  terms: '/terms-and-conditions',
  page403: '/error/403',
  page404: '/error/404',
  page500: '/error/500',
  components: '/components',
  docs: 'https://docs.minimals.cc',
  changelog: 'https://docs.minimals.cc/changelog',
  zoneStore: 'https://mui.com/store/items/zone-landing-page/',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  freeUI: 'https://mui.com/store/items/minimal-dashboard-free/',
  figma: 'https://www.figma.com/design/cAPz4pYPtQEXivqe11EcDE/%5BPreview%5D-Minimal-Web.v6.0.0',
  product: {
    root: `/product`,
    checkout: `/product/checkout`,
    details: (id) => `/product/${id}`,
    demo: { details: `/product/${MOCK_ID}` },
  },
  post: {
    root: `/post`,
    details: (title) => `/post/${paramCase(title)}`,
    demo: { details: `/post/${paramCase(MOCK_TITLE)}` },
  },
  admin: {
    login: `/admin/login`,
  },
  // AUTH
  auth: {
    amplify: {
      signIn: `${ROOTS.AUTH}/amplify/sign-in`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      signUp: `${ROOTS.AUTH}/amplify/sign-up`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },
    jwt: {
      signIn: `/login`,
      signUp: `${ROOTS.AUTH}/sign-up`,
      signUpComplete: `${ROOTS.AUTH}/sign-up/complete-profile`,
      forgetPassword: `${ROOTS.AUTH}/forget-password`,
      verifyPassword: `${ROOTS.AUTH}/verify-otp`,
      verifyAccount: `${ROOTS.AUTH}/verify-account`,
      verifyLoginOtp: `${ROOTS.AUTH}/verify-login-otp`,
      resetPassword: `${ROOTS.AUTH}/reset-password`,
    },
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    },
    auth0: {
      signIn: `${ROOTS.AUTH}/auth0/sign-in`,
    },
    supabase: {
      signIn: `${ROOTS.AUTH}/supabase/sign-in`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
    },
  },
  authDemo: {
    split: {
      signIn: `${ROOTS.AUTH_DEMO}/split/sign-in`,
      signUp: `${ROOTS.AUTH_DEMO}/split/sign-up`,
      resetPassword: `${ROOTS.AUTH_DEMO}/split/reset-password`,
      updatePassword: `${ROOTS.AUTH_DEMO}/split/update-password`,
      verify: `${ROOTS.AUTH_DEMO}/split/verify`,
    },
    centered: {
      signIn: `${ROOTS.AUTH_DEMO}/centered/sign-in`,
      signUp: `${ROOTS.AUTH_DEMO}/centered/sign-up`,
      resetPassword: `${ROOTS.AUTH_DEMO}/centered/reset-password`,
      updatePassword: `${ROOTS.AUTH_DEMO}/centered/update-password`,
      verify: `${ROOTS.AUTH_DEMO}/centered/verify`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    mail: `${ROOTS.DASHBOARD}/mail`,
    chat: `${ROOTS.DASHBOARD}/chat`,
    blank: `${ROOTS.DASHBOARD}/blank`,
    kanban: `${ROOTS.DASHBOARD}/kanban`,
    calendar: `${ROOTS.DASHBOARD}/calendar`,
    fileManager: `${ROOTS.DASHBOARD}/file-manager`,
    permission: `${ROOTS.DASHBOARD}/permission`,
    sample: `${ROOTS.DASHBOARD}/sample`,
    wallets: `${ROOTS.DASHBOARD}/wallets`,
    transactions: `${ROOTS.DASHBOARD}/transactions`,
    income: `${ROOTS.DASHBOARD}/category/income`,
    expense: `${ROOTS.DASHBOARD}/category/expense`,
    profile: `${ROOTS.DASHBOARD}/profile`,
    businessProfile: `${ROOTS.DASHBOARD}/business-profile`,
    businessProfileEdit: (id) => `${ROOTS.DASHBOARD}/business-profile/${id}/edit`,
    operatingHoursEdit: `${ROOTS.DASHBOARD}/business-profile/operating-hours/edit`,

    leads: `${ROOTS.DASHBOARD}/leads`,
    clients: `${ROOTS.DASHBOARD}/clients`,
    clientsDetails: (id) => `${ROOTS.DASHBOARD}/clients/${id}`,
    tasks: `${ROOTS.DASHBOARD}/tasks`,
    services: `${ROOTS.DASHBOARD}/services`,
    serviceNew: `${ROOTS.DASHBOARD}/services/new`,
    serviceEdit: (id) => `${ROOTS.DASHBOARD}/services/${id}/edit`,
    serviceDetails: (id) => `${ROOTS.DASHBOARD}/services/${id}`,
    sessions: `${ROOTS.DASHBOARD}/sessions`,
    revenue: `${ROOTS.DASHBOARD}/settings/analytics/revenue`,
    boostVisibility: `${ROOTS.DASHBOARD}/settings/revenue/boost`,

    //new Routes
    bookings: `${ROOTS.DASHBOARD}/bookings`, // Changed sessions to bookings
    bookingDetails: (id, mode) => `${ROOTS.DASHBOARD}/bookings/${id}${mode === 'instant' ? '?mode=instant' : ''}`,
    bookingSuccess: (id) => `${ROOTS.DASHBOARD}/bookings/success/${id}`,
    events: `${ROOTS.DASHBOARD}/events`,
    eventDetails: (id) => `${ROOTS.DASHBOARD}/events/${id}`,
    providers: `${ROOTS.DASHBOARD}/providers`,
    liveOffers: `${ROOTS.DASHBOARD}/live-offers`,
    providerDetails: (id) => `${ROOTS.DASHBOARD}/providers/${id}`,
    providerHub: `${ROOTS.DASHBOARD}/provider-hub`,
    packages: `${ROOTS.DASHBOARD}/packages`, // New route for packages
    packageNew: `${ROOTS.DASHBOARD}/packages/new`,
    packageEdit: (id) => `${ROOTS.DASHBOARD}/packages/${id}/edit`,
    packageDetails: (id) => `${ROOTS.DASHBOARD}/packages/${id}`,
    promotions: `${ROOTS.DASHBOARD}/promotions`, // New route for promotions
    promotionNew: `${ROOTS.DASHBOARD}/promotions/new`,
    promotionEdit: (id) => `${ROOTS.DASHBOARD}/promotions/${id}/edit`,
    promotionDetails: (id) => `${ROOTS.DASHBOARD}/promotions/${id}`,
    resources: {
      root: `${ROOTS.DASHBOARD}/resources`,
      plans: `${ROOTS.DASHBOARD}/resources/plans`,
      checkIns: `${ROOTS.DASHBOARD}/resources/check-ins`,
      documents: `${ROOTS.DASHBOARD}/resources/documents`,
    },

    appSettings: {
      root: `${ROOTS.DASHBOARD}/settings`,
      terms: `${ROOTS.DASHBOARD}/settings/terms-&-conditions`,
      privacy: `${ROOTS.DASHBOARD}/settings/privacy-policy`,
      about: `${ROOTS.DASHBOARD}/settings/about-us`,
      faqs: `${ROOTS.DASHBOARD}/settings/faqs`,
      contact: `${ROOTS.DASHBOARD}/settings/contact-us`,
      support: `${ROOTS.DASHBOARD}/settings/support`,
      helpCenter: `${ROOTS.DASHBOARD}/settings/help-center`,
      helpCenterDetails: (id) => `${ROOTS.DASHBOARD}/settings/help-center/${id}`,
      subscription: `${ROOTS.DASHBOARD}/settings/subscription`,
      notifications: `${ROOTS.DASHBOARD}/settings/notifications`,
      analytics: `${ROOTS.DASHBOARD}/settings/analytics`,
      billingHistory: `${ROOTS.DASHBOARD}/settings/billing-history`,
      connect: `${ROOTS.DASHBOARD}/settings/connect`,
      connectManageCards: `${ROOTS.DASHBOARD}/settings/connect/manage-cards`,
      connectPayoutMethod: `${ROOTS.DASHBOARD}/settings/connect/payout-method`,
    },

    general: {
      app: `${ROOTS.DASHBOARD}/app`,
      ecommerce: `${ROOTS.DASHBOARD}/ecommerce`,
      analytics: `${ROOTS.DASHBOARD}/analytics`,
      banking: `${ROOTS.DASHBOARD}/banking`,
      booking: `${ROOTS.DASHBOARD}/booking`,
      file: `${ROOTS.DASHBOARD}/file`,
      course: `${ROOTS.DASHBOARD}/course`,
    },
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      new: `${ROOTS.DASHBOARD}/user/new`,
      list: `${ROOTS.DASHBOARD}/user/list`,
      pending: `${ROOTS.DASHBOARD}/user/pending-users`,
      cards: `${ROOTS.DASHBOARD}/user/cards`,
      profile: `${ROOTS.DASHBOARD}/user/profile`,
      account: `${ROOTS.DASHBOARD}/user/account`,
      edit: (id) => `${ROOTS.DASHBOARD}/user/${id}/edit`,
      demo: {
        edit: `${ROOTS.DASHBOARD}/user/${MOCK_ID}/edit`,
      },
    },
    product: {
      root: `${ROOTS.DASHBOARD}/product`,
      new: `${ROOTS.DASHBOARD}/product/new`,
      details: (id) => `${ROOTS.DASHBOARD}/product/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/product/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/product/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/product/${MOCK_ID}/edit`,
      },
    },
    invoice: {
      root: `${ROOTS.DASHBOARD}/invoice`,
      new: `${ROOTS.DASHBOARD}/invoice/new`,
      details: (id) => `${ROOTS.DASHBOARD}/invoice/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/invoice/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}/edit`,
      },
    },
    post: {
      root: `${ROOTS.DASHBOARD}/post`,
      new: `${ROOTS.DASHBOARD}/post/new`,
      details: (title) => `${ROOTS.DASHBOARD}/post/${paramCase(title)}`,
      edit: (title) => `${ROOTS.DASHBOARD}/post/${paramCase(title)}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/post/${paramCase(MOCK_TITLE)}`,
        edit: `${ROOTS.DASHBOARD}/post/${paramCase(MOCK_TITLE)}/edit`,
      },
    },
    order: {
      root: `${ROOTS.DASHBOARD}/order`,
      details: (id) => `${ROOTS.DASHBOARD}/order/${id}`,
      demo: {
        details: `${ROOTS.DASHBOARD}/order/${MOCK_ID}`,
      },
    },
    job: {
      root: `${ROOTS.DASHBOARD}/job`,
      new: `${ROOTS.DASHBOARD}/job/new`,
      details: (id) => `${ROOTS.DASHBOARD}/job/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/job/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/job/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/job/${MOCK_ID}/edit`,
      },
    },
    tour: {
      root: `${ROOTS.DASHBOARD}/tour`,
      new: `${ROOTS.DASHBOARD}/tour/new`,
      details: (id) => `${ROOTS.DASHBOARD}/tour/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/tour/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}/edit`,
      },
    },
  },

  // ADMIN DASHBOARD
  adminDashboard: {
    root: `${ROOTS.ADMIN_DASHBOARD}`,
    profile: `${ROOTS.ADMIN_DASHBOARD}/profile`,
    customers: `${ROOTS.ADMIN_DASHBOARD}/customers`, // Changed clients to customers
    customerDetails: (id) => `${ROOTS.ADMIN_DASHBOARD}/customers/${id}`, // Changed clientsDetails to customerDetails
    bookings: `${ROOTS.ADMIN_DASHBOARD}/bookings`, // Changed sessions to bookings
    bookingDetails: (id) => `${ROOTS.ADMIN_DASHBOARD}/bookings/${id}`,
    reviews: `${ROOTS.ADMIN_DASHBOARD}/reviews`,
    serviceDetails: (id) => `${ROOTS.ADMIN_DASHBOARD}/services/${id}`,
    packageDetails: (id) => `${ROOTS.ADMIN_DASHBOARD}/packages/${id}`,
    promotionDetails: (id) => `${ROOTS.ADMIN_DASHBOARD}/promotions/${id}`,
    providers: `${ROOTS.ADMIN_DASHBOARD}/providers`,
    revenue: `${ROOTS.ADMIN_DASHBOARD}/revenue`, // Added revenue path

    providerDetails: (id) => `${ROOTS.ADMIN_DASHBOARD}/providers/${id}`,
    events: `${ROOTS.ADMIN_DASHBOARD}/events`,
    eventDetails: (id) => `${ROOTS.ADMIN_DASHBOARD}/events/${id}`,
    categories: `${ROOTS.ADMIN_DASHBOARD}/categories`,
    badges: `${ROOTS.ADMIN_DASHBOARD}/badges`,
    instantBooking: `${ROOTS.ADMIN_DASHBOARD}/instant-booking`,
    tags: `${ROOTS.ADMIN_DASHBOARD}/tags`,
    mail: `${ROOTS.ADMIN_DASHBOARD}/mail`,
    blank: `${ROOTS.ADMIN_DASHBOARD}/blank`,
    kanban: `${ROOTS.ADMIN_DASHBOARD}/kanban`,
    calendar: `${ROOTS.ADMIN_DASHBOARD}/calendar`,
    fileManager: `${ROOTS.ADMIN_DASHBOARD}/file-manager`,
    permission: `${ROOTS.ADMIN_DASHBOARD}/permission`,
    content: {
      terms: `${ROOTS.ADMIN_DASHBOARD}/terms`,
      privacy: `${ROOTS.ADMIN_DASHBOARD}/privacy`,
      faqs: `${ROOTS.ADMIN_DASHBOARD}/faqs`,
      faqsAdd: `${ROOTS.ADMIN_DASHBOARD}/faqs/add`,
      faqsEdit: (id) => `${ROOTS.ADMIN_DASHBOARD}/faqs/${id}/edit`,
      about: `${ROOTS.ADMIN_DASHBOARD}/about`,
      contact: `${ROOTS.ADMIN_DASHBOARD}/contact`,
      support: `${ROOTS.ADMIN_DASHBOARD}/support`,
      helpCenter: `${ROOTS.ADMIN_DASHBOARD}/help-center`,
      helpCenterDetails: (id) => `${ROOTS.ADMIN_DASHBOARD}/help-center/${id}`,
    },
    general: {
      app: `${ROOTS.ADMIN_DASHBOARD}/app`,
      ecommerce: `${ROOTS.ADMIN_DASHBOARD}/ecommerce`,
      analytics: `${ROOTS.ADMIN_DASHBOARD}/analytics`,
      banking: `${ROOTS.ADMIN_DASHBOARD}/banking`,
      booking: `${ROOTS.ADMIN_DASHBOARD}/booking`,
      file: `${ROOTS.ADMIN_DASHBOARD}/file`,
      course: `${ROOTS.ADMIN_DASHBOARD}/course`,
    },
    user: {
      root: `${ROOTS.ADMIN_DASHBOARD}/user`,
      new: `${ROOTS.ADMIN_DASHBOARD}/user/new`,
      list: `${ROOTS.ADMIN_DASHBOARD}/user/list`,
      cards: `${ROOTS.ADMIN_DASHBOARD}/user/cards`,
      profile: `${ROOTS.ADMIN_DASHBOARD}/user/profile`,
      account: `${ROOTS.ADMIN_DASHBOARD}/user/account`,
      edit: (id) => `${ROOTS.ADMIN_DASHBOARD}/user/${id}/edit`,
      demo: {
        edit: `${ROOTS.ADMIN_DASHBOARD}/user/${MOCK_ID}/edit`,
      },
    },
    product: {
      root: `${ROOTS.ADMIN_DASHBOARD}/product`,
      new: `${ROOTS.ADMIN_DASHBOARD}/product/new`,
      details: (id) => `${ROOTS.ADMIN_DASHBOARD}/product/${id}`,
      edit: (id) => `${ROOTS.ADMIN_DASHBOARD}/product/${id}/edit`,
      demo: {
        details: `${ROOTS.ADMIN_DASHBOARD}/product/${MOCK_ID}`,
        edit: `${ROOTS.ADMIN_DASHBOARD}/product/${MOCK_ID}/edit`,
      },
    },
    invoice: {
      root: `${ROOTS.ADMIN_DASHBOARD}/invoice`,
      new: `${ROOTS.ADMIN_DASHBOARD}/invoice/new`,
      details: (id) => `${ROOTS.ADMIN_DASHBOARD}/invoice/${id}`,
      edit: (id) => `${ROOTS.ADMIN_DASHBOARD}/invoice/${id}/edit`,
      demo: {
        details: `${ROOTS.ADMIN_DASHBOARD}/invoice/${MOCK_ID}`,
        edit: `${ROOTS.ADMIN_DASHBOARD}/invoice/${MOCK_ID}/edit`,
      },
    },
    post: {
      root: `${ROOTS.ADMIN_DASHBOARD}/post`,
      new: `${ROOTS.ADMIN_DASHBOARD}/post/new`,
      details: (title) => `${ROOTS.ADMIN_DASHBOARD}/post/${paramCase(title)}`,
      edit: (title) => `${ROOTS.ADMIN_DASHBOARD}/post/${paramCase(title)}/edit`,
      demo: {
        details: `${ROOTS.ADMIN_DASHBOARD}/post/${paramCase(MOCK_TITLE)}`,
        edit: `${ROOTS.ADMIN_DASHBOARD}/post/${paramCase(MOCK_TITLE)}/edit`,
      },
    },
    order: {
      root: `${ROOTS.ADMIN_DASHBOARD}/order`,
      details: (id) => `${ROOTS.ADMIN_DASHBOARD}/order/${id}`,
      demo: {
        details: `${ROOTS.ADMIN_DASHBOARD}/order/${MOCK_ID}`,
      },
    },
    job: {
      root: `${ROOTS.ADMIN_DASHBOARD}/job`,
      new: `${ROOTS.ADMIN_DASHBOARD}/job/new`,
      details: (id) => `${ROOTS.ADMIN_DASHBOARD}/job/${id}`,
      edit: (id) => `${ROOTS.ADMIN_DASHBOARD}/job/${id}/edit`,
      demo: {
        details: `${ROOTS.ADMIN_DASHBOARD}/job/${MOCK_ID}`,
        edit: `${ROOTS.ADMIN_DASHBOARD}/job/${MOCK_ID}/edit`,
      },
    },
    tour: {
      root: `${ROOTS.ADMIN_DASHBOARD}/tour`,
      new: `${ROOTS.ADMIN_DASHBOARD}/tour/new`,
      details: (id) => `${ROOTS.ADMIN_DASHBOARD}/tour/${id}`,
      edit: (id) => `${ROOTS.ADMIN_DASHBOARD}/tour/${id}/edit`,
      demo: {
        details: `${ROOTS.ADMIN_DASHBOARD}/tour/${MOCK_ID}`,
        edit: `${ROOTS.ADMIN_DASHBOARD}/tour/${MOCK_ID}/edit`,
      },
    },
  },
};

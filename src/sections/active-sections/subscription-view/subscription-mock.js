export const SUBSCRIPTION_PLANS = [
  {
    id: 'basic',
    name: 'Basic Tier',
    price: 0,
    active: false,
    description: 'A simple plan for getting started.',
    features: ['Access to core features', 'Basic profile visibility', 'Standard support'],
  },
  {
    id: 'pro',
    name: 'Pro Tier',
    price: 19,
    active: true,
    description: 'Ideal for professionals who want more visibility and tools.',
    features: ['Everything in Free', 'Advanced match scoring', 'See who viewed your profile', 'Priority in provider search'],
  },
  {
    id: 'elite',
    name: 'Elite Tier',
    price: 39,
    active: false,
    description: 'For users who want premium growth and support.',
    features: ['Everything in Pro', 'Priority onboarding', 'Featured profile placement', 'Premium customer support'],
  },
];

export const OFFER_WINDOW_SEC = 90;

export const LIVE_OFFERS_DEMO_ENABLED = import.meta.env.DEV || import.meta.env.VITE_LIVE_OFFERS_DEMO === 'true';

const IMG = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=70`;

export const OFFER_TEMPLATES = [
  {
    serviceName: 'Bridal Makeup',
    kind: 'service',
    category: 'Makeup & Beauty',
    price: 180,
    durationMins: 120,
    image: IMG('photo-1487412947147-5cebf100ffc2'),
    customer: { name: 'Amelia Carter', rating: 4.9, avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    locationType: 'At customer location',
    address: '24 Park Avenue, Manhattan',
  },
  {
    serviceName: 'Deep Tissue Massage',
    kind: 'service',
    category: 'Spa & Wellness',
    price: 80,
    durationMins: 60,
    image: IMG('photo-1519415510236-718bdfcd89c8'),
    customer: { name: 'Daniel Brooks', rating: 4.7, avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    locationType: 'At business location',
    address: 'Your salon',
  },
  {
    serviceName: 'Premium Haircut',
    kind: 'service',
    category: 'Hair',
    price: 35,
    durationMins: 45,
    image: IMG('photo-1503951914875-452162b0f3f1'),
    customer: { name: 'Marcus Lee', rating: 4.8, avatar: 'https://randomuser.me/api/portraits/men/41.jpg' },
    locationType: 'At business location',
    address: 'Your salon',
  },
  {
    serviceName: 'Hair Coloring & Highlights',
    kind: 'package',
    category: 'Hair',
    price: 110,
    durationMins: 150,
    image: IMG('photo-1515377905703-c4788e51af15'),
    customer: { name: 'Sofia Martinez', rating: 5, avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
    locationType: 'At business location',
    address: 'Your salon',
  },
  {
    serviceName: 'Manicure & Pedicure',
    kind: 'package',
    category: 'Nails',
    price: 65,
    durationMins: 90,
    image: IMG('photo-1512290923902-8a9f81dc236c'),
    customer: { name: 'Hannah Kim', rating: 4.6, avatar: 'https://randomuser.me/api/portraits/women/21.jpg' },
    locationType: 'At customer location',
    address: '118 Lake Street, Brooklyn',
  },
  {
    serviceName: 'Luxury Facial Treatment',
    kind: 'service',
    category: 'Skin Care',
    price: 65,
    durationMins: 75,
    image: IMG('photo-1512496015851-a90fb38ba796'),
    customer: { name: 'Olivia Turner', rating: 4.8, avatar: 'https://randomuser.me/api/portraits/women/12.jpg' },
    locationType: 'At business location',
    address: 'Your salon',
  },
];

function appointmentFrom(now, dayOffset, hour, minute) {
  const date = new Date(now);
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

let sequence = 0;

export function createOffer(template, { now = Date.now(), status = 'incoming', secondsLeft = OFFER_WINDOW_SEC, dayOffset = 0, hour = 15, minute = 0 } = {}) {
  sequence += 1;
  return {
    id: `offer-${now}-${sequence}`,
    ...template,
    status,
    receivedAt: now - (OFFER_WINDOW_SEC - secondsLeft) * 1000,
    expiresAt: now + secondsLeft * 1000,
    respondedAt: status === 'incoming' ? null : now - sequence * 7 * 60 * 1000,
    appointmentAt: appointmentFrom(now, dayOffset, hour, minute),
  };
}

export function buildInitialOffers(now = Date.now()) {
  const [bridal, massage, haircut, coloring, nails, facial] = OFFER_TEMPLATES;
  return [
    createOffer(bridal, { now, secondsLeft: 84, dayOffset: 1, hour: 10, minute: 30 }),
    createOffer(massage, { now, secondsLeft: 47, dayOffset: 0, hour: 17, minute: 0 }),
    createOffer(haircut, { now, secondsLeft: 22, dayOffset: 0, hour: 18, minute: 15 }),
    createOffer(coloring, { now, status: 'accepted', dayOffset: 2, hour: 13, minute: 0 }),
    createOffer(nails, { now, status: 'declined', dayOffset: 1, hour: 16, minute: 45 }),
    createOffer(facial, { now, status: 'expired', secondsLeft: 0, dayOffset: 0, hour: 12, minute: 0 }),
  ];
}

export function pickNextTemplate(offers) {
  const incomingNames = new Set(offers.filter((offer) => offer.status === 'incoming').map((offer) => offer.serviceName));
  const pool = OFFER_TEMPLATES.filter((template) => !incomingNames.has(template.serviceName));
  const list = pool.length ? pool : OFFER_TEMPLATES;
  return list[Math.floor(Math.random() * list.length)];
}

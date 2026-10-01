import { loadStripe } from '@stripe/stripe-js';

import { CONFIG } from 'src/config-global';

export const stripePromise = CONFIG.stripe.publishableKey ? loadStripe(CONFIG.stripe.publishableKey) : null;

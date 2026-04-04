import Stripe from 'stripe';

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not configured')
    _stripe = new Stripe(key, { apiVersion: '2023-10-16' })
  }
  return _stripe
}

export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '3 projects',
      'Basic cabinet templates',
      'Cut list generation',
      'Standard G-code export (GRBL only)',
      'Community support',
    ],
    limits: {
      projects: 3,
      exports_per_month: 10,
      cabinets_per_project: 10,
    },
  },
  hobbyist: {
    name: 'Hobbyist',
    price: 9,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_HOBBYIST,
    features: [
      'Unlimited projects',
      'All cabinet templates',
      'Advanced waste optimization',
      'All G-code formats (ShopBot, Shapeoko, X-Carve, GRBL)',
      '3D exports (OBJ, STL, 3MF, DXF)',
      'Email support',
    ],
    limits: {
      projects: -1,
      exports_per_month: 50,
      cabinets_per_project: -1,
    },
  },
  pro: {
    name: 'Pro',
    price: 29,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
    features: [
      'Everything in Hobbyist',
      'Advanced nesting (non-guillotine)',
      'Live hardware pricing from suppliers',
      'Project templates library',
      'Team collaboration (3 members)',
      'Priority support',
      'API access',
    ],
    limits: {
      projects: -1,
      exports_per_month: -1,
      cabinets_per_project: -1,
      team_members: 3,
    },
  },
  shop: {
    name: 'Shop',
    price: 79,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_SHOP,
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Custom branding on exports',
      'Priority hardware pricing',
      'Phone support',
      'Dedicated account manager',
      'Custom integrations',
    ],
    limits: {
      projects: -1,
      exports_per_month: -1,
      cabinets_per_project: -1,
      team_members: -1,
    },
  },
} as const;

export type PlanId = keyof typeof SUBSCRIPTION_PLANS;

export async function createCheckoutSession(
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  customerEmail?: string
): Promise<{ url: string; sessionId: string }> {
  const response = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      price_id: priceId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  return response.json();
}

export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<{ url: string }> {
  const response = await fetch('/api/stripe/create-portal-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_id: customerId,
      return_url: returnUrl,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create portal session');
  }

  return response.json();
}

export async function getSubscriptionStatus(customerId: string) {
  const response = await fetch(`/api/stripe/subscription/${customerId}`);
  if (!response.ok) {
    throw new Error('Failed to get subscription status');
  }
  return response.json();
}

export async function cancelSubscription(subscriptionId: string) {
  const response = await fetch('/api/stripe/cancel-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription_id: subscriptionId }),
  });

  if (!response.ok) {
    throw new Error('Failed to cancel subscription');
  }

  return response.json();
}

export async function reactivateSubscription(subscriptionId: string) {
  const response = await fetch('/api/stripe/reactivate-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription_id: subscriptionId }),
  });

  if (!response.ok) {
    throw new Error('Failed to reactivate subscription');
  }

  return response.json();
}

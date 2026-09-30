import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Created lazily: constructing at module load throws when STRIPE_SECRET_KEY is
// absent, which breaks `next build` (page-data collection imports this file).
let _stripe: Stripe | null = null
function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not configured')
    _stripe = new Stripe(key, {
      apiVersion: '2024-06-20' as Stripe.LatestApiVersion, // pinned: webhook payload shapes depend on it
    })
  }
  return _stripe
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        // TODO: provision user's plan in your database
        // session.customer, session.subscription, session.customer_email
        console.log('Checkout completed:', session.id, session.customer_email)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const plan = sub.metadata?.plan || 'unknown'
        // TODO: update user's tier in database
        console.log('Subscription updated:', sub.id, plan, sub.status)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        // TODO: downgrade user to free tier in database
        console.log('Subscription cancelled:', sub.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        // TODO: notify user of failed payment
        console.log('Payment failed:', invoice.id, invoice.customer_email)
        break
      }

      default:
        // Unhandled event type — log and ignore
        console.log('Unhandled Stripe event:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

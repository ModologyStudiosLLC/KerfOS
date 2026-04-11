import type { Metadata } from 'next'
import PricingPage from '@/components/Pricing'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Free to start, no credit card. KerfOS plans from $0 to $79/mo for full production shops.',
  alternates: { canonical: 'https://kerfos.com/pricing' },
  openGraph: {
    title: 'KerfOS Pricing — Free to Start',
    description: 'Start free. Upgrade when you need unlimited projects, 3D exports, and team collaboration.',
  },
}

export default function Pricing() {
  return <PricingPage />
}

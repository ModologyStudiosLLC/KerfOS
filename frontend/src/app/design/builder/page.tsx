import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cabinet Builder',
  description: 'Design cabinets parametrically — add shelves, doors, drawers, and dividers. Generate cut lists and export G-code instantly.',
  alternates: { canonical: 'https://kerfos.com/design/builder' },
  openGraph: {
    title: 'KerfOS Cabinet Builder — Design & Export G-Code',
    description: 'Free browser-based cabinet design tool. Parametric design → cut list → G-code in minutes.',
  },
}

import { CabinetBuilder } from '@/components/CabinetBuilder'

export default function BuilderPage() {
  return <CabinetBuilder />
}

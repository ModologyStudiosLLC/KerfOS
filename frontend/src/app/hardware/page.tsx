'use client'

import Link from 'next/link'
import { Search, Star } from 'lucide-react'
import { ToolCard } from '@/components/ToolCard'
import { PageHeader } from '@/components/PageHeader'

const tools = [
  {
    href: '/hardware/finder',
    label: 'Hardware Finder',
    description: 'Browse hinges, drawer slides, pulls, and fasteners matched to your build',
    icon: Search,
    plan: 'Hobbyist' as const,
    featured: true,
  },
  {
    href: '/hardware/recommendations',
    label: 'Smart Recommendations',
    description: 'AI-suggested hardware based on your cabinet dimensions and style',
    icon: Star,
    plan: 'Pro' as const,
  },
]

export default function HardwarePage() {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 40px' }}>
      <PageHeader
        crumbs={[{ label: 'kerfos', href: '/' }, { label: 'hardware' }]}
        title="Hardware"
        subtitle="Find and configure hardware that fits your cabinet design exactly."
        action={
          <Link href="/hardware/finder" className="k-btn k-btn-primary k-btn-sm">
            Find hardware
          </Link>
        }
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1px',
          background: 'var(--k-border)',
          border: '1px solid var(--k-border)',
        }}
      >
        {tools.map((tool) => (
          <ToolCard key={tool.href} {...tool} />
        ))}
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { Image, Trophy } from 'lucide-react'
import { ToolCard } from '@/components/ToolCard'
import { PageHeader } from '@/components/PageHeader'

const tools = [
  {
    href: '/community/gallery',
    label: 'Build Gallery',
    description: 'Browse finished kitchen, bath, and shop projects from KerfOS builders',
    icon: Image,
    plan: 'Free' as const,
    featured: true,
  },
  {
    href: '/community/brag-sheet',
    label: 'Brag Sheet',
    description: 'Share your finished build and show the community what you made',
    icon: Trophy,
    plan: 'Free' as const,
  },
]

export default function CommunityPage() {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 40px' }}>
      <PageHeader
        crumbs={[{ label: 'kerfos', href: '/' }, { label: 'community' }]}
        title="Community"
        subtitle="Share your builds and get inspired by what other woodworkers are making."
        action={
          <Link href="/community/gallery" className="k-btn k-btn-primary k-btn-sm">
            Browse gallery
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

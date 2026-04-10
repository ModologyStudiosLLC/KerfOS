'use client'

import Link from 'next/link'
import { Layers, GitMerge, AlignCenter } from 'lucide-react'
import { ToolCard } from '@/components/ToolCard'
import { PageHeader } from '@/components/PageHeader'

const tools = [
  {
    href: '/materials/selector',
    label: 'Material Selector',
    description: 'Browse sheet goods, hardwoods, and composites with live pricing',
    icon: Layers,
    plan: 'Free' as const,
    featured: true,
  },
  {
    href: '/materials/multi',
    label: 'Multi-Material Projects',
    description: 'Combine different species and sheet goods in a single project',
    icon: GitMerge,
    plan: 'Hobbyist' as const,
  },
  {
    href: '/materials/edge-banding',
    label: 'Edge Banding',
    description: 'Configure PVC, veneer, or solid wood banding on exposed edges',
    icon: AlignCenter,
    plan: 'Hobbyist' as const,
  },
]

export default function MaterialsPage() {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 40px' }}>
      <PageHeader
        crumbs={[{ label: 'kerfos', href: '/' }, { label: 'materials' }]}
        title="Materials"
        subtitle="Select and manage sheet goods, hardwoods, and edge treatments."
        action={
          <Link href="/materials/selector" className="k-btn k-btn-primary k-btn-sm">
            Browse materials
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

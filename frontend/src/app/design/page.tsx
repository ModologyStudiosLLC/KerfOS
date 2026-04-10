'use client'

import Link from 'next/link'
import { Square, Layers, FileImage, ScanLine, ScanFace } from 'lucide-react'
import { ToolCard } from '@/components/ToolCard'
import { PageHeader } from '@/components/PageHeader'

const tools = [
  {
    href: '/design/builder',
    label: 'Cabinet Builder',
    description: 'Parametric cabinet designer with real-time cut list and pricing',
    icon: Square,
    plan: 'Free' as const,
    featured: true,
  },
  {
    href: '/design/presets',
    label: 'Style Presets',
    description: 'Start from shaker, slab, inset, and other professional profiles',
    icon: Layers,
    plan: 'Hobbyist' as const,
  },
  {
    href: '/design/templates',
    label: 'Project Templates',
    description: 'Full kitchen, bath, and laundry room project starting points',
    icon: FileImage,
    plan: 'Hobbyist' as const,
  },
  {
    href: '/design/sketch',
    label: 'Sketch Import',
    description: 'Snap a photo of your hand sketch and convert it to a cabinet plan',
    icon: ScanLine,
    plan: 'Pro' as const,
  },
  {
    href: '/design/ar-scanner',
    label: 'AR Room Scanner',
    description: 'Scan your space with your phone camera to auto-fill dimensions',
    icon: ScanFace,
    plan: 'Pro' as const,
  },
]

export default function DesignPage() {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 40px' }}>
      <PageHeader
        crumbs={[{ label: 'kerfos', href: '/' }, { label: 'design' }]}
        title="Design"
        subtitle="Build, configure, and visualize your cabinet designs."
        action={
          <Link href="/design/builder" className="k-btn k-btn-primary k-btn-sm">
            New project
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

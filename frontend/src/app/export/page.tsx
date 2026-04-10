'use client'

import Link from 'next/link'
import { Terminal, Box } from 'lucide-react'
import { ToolCard } from '@/components/ToolCard'
import { PageHeader } from '@/components/PageHeader'

const tools = [
  {
    href: '/export/gcode',
    label: 'G-Code Export',
    description: 'Toolpaths for ShopBot, Shapeoko, X-Carve, and any GRBL machine',
    icon: Terminal,
    plan: 'Free' as const,
    featured: true,
  },
  {
    href: '/export/3d',
    label: '3D / CAD Export',
    description: 'Export OBJ, STL, 3MF, and DXF for visualization or custom fabrication',
    icon: Box,
    plan: 'Hobbyist' as const,
  },
]

export default function ExportPage() {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 40px' }}>
      <PageHeader
        crumbs={[{ label: 'kerfos', href: '/' }, { label: 'export' }]}
        title="Export"
        subtitle="Send your designs to your CNC machine or 3D workflow."
        action={
          <Link href="/export/gcode" className="k-btn k-btn-primary k-btn-sm">
            Export G-code
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

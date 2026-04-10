'use client'

import Link from 'next/link'
import { Scissors, Grid, Archive, Stethoscope, DollarSign, BarChart } from 'lucide-react'
import { ToolCard } from '@/components/ToolCard'
import { PageHeader } from '@/components/PageHeader'

const tools = [
  {
    href: '/optimize/cutlist',
    label: 'Cut List Export',
    description: 'Generate optimized cut lists sorted by part, material, or machine',
    icon: Scissors,
    plan: 'Free' as const,
    featured: true,
  },
  {
    href: '/optimize/nesting',
    label: 'Advanced Nesting',
    description: 'Non-guillotine nesting for maximum yield from every sheet',
    icon: Grid,
    plan: 'Hobbyist' as const,
  },
  {
    href: '/optimize/yield',
    label: 'Board Yield',
    description: 'Visualize sheet utilization and track waste percentage per project',
    icon: BarChart,
    plan: 'Hobbyist' as const,
  },
  {
    href: '/optimize/scrap',
    label: 'Scrap Tracker',
    description: 'Log and reuse offcuts across jobs to eliminate repeat waste',
    icon: Archive,
    plan: 'Hobbyist' as const,
  },
  {
    href: '/optimize/doctor',
    label: 'Design Doctor',
    description: 'Automated structural and joinery checks before you cut',
    icon: Stethoscope,
    plan: 'Hobbyist' as const,
  },
  {
    href: '/optimize/cost',
    label: 'Cost Optimizer',
    description: 'Find material substitutions that cut cost without cutting quality',
    icon: DollarSign,
    plan: 'Pro' as const,
  },
]

export default function OptimizePage() {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 40px' }}>
      <PageHeader
        crumbs={[{ label: 'kerfos', href: '/' }, { label: 'optimize' }]}
        title="Optimize"
        subtitle="Reduce waste, cut costs, and validate your designs before you cut."
        action={
          <Link href="/optimize/cutlist" className="k-btn k-btn-primary k-btn-sm">
            Generate cut list
          </Link>
        }
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
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

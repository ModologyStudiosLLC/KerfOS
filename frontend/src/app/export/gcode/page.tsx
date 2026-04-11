'use client'
import { useEffect, useState } from 'react'
import GCodeExporter from '@/components/GCodeExporter'
import { PageHeader } from '@/components/PageHeader'
import type { Cabinet } from '@/components/CabinetBuilder'

const DEFAULT_CABINET: Cabinet = {
  id: 1,
  name: 'Base Cabinet',
  width: 36,
  height: 34.5,
  depth: 24,
  material: 'Birch Plywood',
}

export default function GCodePage() {
  const [cabinets, setCabinets] = useState<Cabinet[]>([DEFAULT_CABINET])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('kerfos_cabinet')
      if (raw) {
        const { cabinet } = JSON.parse(raw)
        if (cabinet) setCabinets([cabinet])
      }
    } catch {}
    setLoaded(true)
  }, [])

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 40px' }}>
      <PageHeader
        crumbs={[{ label: 'kerfos', href: '/' }, { label: 'export', href: '/export' }, { label: 'g-code' }]}
        title="G-Code Export"
        subtitle="Export toolpaths for ShopBot, Shapeoko, X-Carve, and any GRBL-based machine."
      />
      {loaded && <GCodeExporter cabinets={cabinets} />}
    </div>
  )
}

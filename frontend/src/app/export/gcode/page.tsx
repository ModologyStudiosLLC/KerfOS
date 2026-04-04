'use client'
import GCodeExporter from '@/components/GCodeExporter'

const defaultCabinet = {
  id: 1,
  name: 'Base Cabinet',
  width: 36,
  height: 34.5,
  depth: 24,
  material: 'Birch Plywood',
}

export default function GCodePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">G-Code Export</h1>
      <GCodeExporter cabinets={[defaultCabinet]} />
    </div>
  )
}

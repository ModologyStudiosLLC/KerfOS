'use client'
import CutListExporter from '@/components/CutListExporter'

const defaultCabinet = {
  id: 1,
  name: 'Base Cabinet',
  width: 36,
  height: 34.5,
  depth: 24,
  material: 'Birch Plywood',
}

export default function CutListPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cut List Export</h1>
      <CutListExporter cabinets={[defaultCabinet]} materials={{}} />
    </div>
  )
}

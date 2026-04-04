'use client'
import DesignDoctor from '@/components/DesignDoctor'

const sampleDesign = {
  id: 'sample',
  name: 'Base Cabinet',
  width: 36,
  height: 34.5,
  depth: 24,
  material: 'Birch Plywood',
}

export default function DesignDoctorPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Design Doctor</h1>
      <DesignDoctor design={sampleDesign} />
    </div>
  )
}

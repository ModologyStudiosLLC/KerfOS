'use client'
import MaterialSelector from '@/components/MaterialSelector'

export default function MaterialSelectorPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Material Selector</h1>
      <MaterialSelector
        selected={null}
        onSelect={(material) => console.log('Selected', material)}
      />
    </div>
  )
}

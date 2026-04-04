'use client'
import StoreIntegration from '@/components/StoreIntegration'

export default function StoresPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Store Integration</h1>
      <StoreIntegration materials={[]} hardware={[]} />
    </div>
  )
}

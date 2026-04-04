'use client'
import DesignExporter from '@/components/DesignExporter'

export default function Export3DPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">3D Export</h1>
      <DesignExporter cabinet={null} />
    </div>
  )
}

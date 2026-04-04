'use client'
import SketchToDesign from '@/components/SketchToDesign'

export default function SketchPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sketch Import</h1>
      <SketchToDesign onDesignGenerated={(design) => console.log('Design generated', design)} />
    </div>
  )
}

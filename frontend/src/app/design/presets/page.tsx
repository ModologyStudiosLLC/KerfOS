'use client'
import StylePresetsGallery from '@/components/StylePresetsGallery'

export default function PresetsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Style Presets</h1>
      <StylePresetsGallery
        onApplyPreset={(preset) => console.log('Apply preset', preset)}
        onPreviewPreset={(preset) => console.log('Preview preset', preset)}
      />
    </div>
  )
}

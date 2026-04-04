'use client'
import CommunityGallery from '@/components/CommunityGallery'

export default function GalleryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Community Gallery</h1>
      <CommunityGallery onSelectProject={(project) => console.log('Selected', project)} />
    </div>
  )
}

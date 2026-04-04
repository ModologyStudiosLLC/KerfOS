import Link from 'next/link'
import { Image, Trophy } from 'lucide-react'

const tools = [
  { href: '/community/gallery', label: 'Gallery', description: 'Browse completed projects from the KerfOS community', icon: Image },
  { href: '/community/brag-sheet', label: 'Brag Sheet', description: 'Share your finished builds and get feedback', icon: Trophy },
]

export default function CommunityPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Community</h1>
      <p className="text-gray-600 mb-8">Share your work and get inspired by other builders.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map(({ href, label, description, icon: Icon }) => (
          <Link key={href} href={href} className="group border border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <Icon className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">{label}</span>
            </div>
            <p className="text-gray-500 text-sm">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

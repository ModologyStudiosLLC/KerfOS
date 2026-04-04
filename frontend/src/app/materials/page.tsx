import Link from 'next/link'
import { Layers, GitMerge, AlignCenter } from 'lucide-react'

const tools = [
  { href: '/materials/selector', label: 'Material Selector', description: 'Browse and select sheet goods, hardwoods, and composites', icon: Layers },
  { href: '/materials/multi', label: 'Multi-Material Projects', description: 'Manage projects with multiple materials and species', icon: GitMerge },
  { href: '/materials/edge-banding', label: 'Edge Banding', description: 'Configure edge banding for exposed panel edges', icon: AlignCenter },
]

export default function MaterialsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Materials</h1>
      <p className="text-gray-600 mb-8">Select and manage materials for your projects.</p>
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

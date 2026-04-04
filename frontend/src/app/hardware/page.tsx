import Link from 'next/link'
import { Search, Star } from 'lucide-react'

const tools = [
  { href: '/hardware/finder', label: 'Hardware Finder', description: 'Find the right hinges, slides, and pulls for your build', icon: Search },
  { href: '/hardware/recommendations', label: 'Recommendations', description: 'AI-powered hardware recommendations based on your design', icon: Star },
]

export default function HardwarePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Hardware</h1>
      <p className="text-gray-600 mb-8">Find and configure hardware for your cabinet builds.</p>
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

import Link from 'next/link'
import { Square, Layers, FileImage, ScanLine } from 'lucide-react'

const tools = [
  { href: '/design/builder', label: 'Cabinet Builder', description: 'Design cabinets with real-time cut lists and pricing', icon: Square },
  { href: '/design/presets', label: 'Style Presets', description: 'Start from professional cabinet style templates', icon: Layers },
  { href: '/design/templates', label: 'Templates', description: 'Full project templates for kitchens, baths, and more', icon: FileImage },
  { href: '/design/sketch', label: 'Sketch Import', description: 'Import a sketch or photo to start your design', icon: ScanLine },
]

export default function DesignPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Design</h1>
      <p className="text-gray-600 mb-8">Build, configure, and visualize your cabinet designs.</p>
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

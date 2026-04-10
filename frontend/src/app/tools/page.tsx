'use client'

import Link from 'next/link'
import { MapPin, ShoppingCart, Calculator, Thermometer, History } from 'lucide-react'

const tools = [
  { href: '/tools/localization', label: 'Local Suppliers', description: 'Find lumber yards and hardware stores near you', icon: MapPin },
  { href: '/tools/stores', label: 'Store Integration', description: 'Order materials directly from Home Depot, Lowe\'s, and more', icon: ShoppingCart },
  { href: '/tools/scratch-build', label: 'Scratch Build Calc', description: 'Calculate what tools and time a build from scratch requires', icon: Calculator },
  { href: '/tools/climate', label: 'Climate Adjustment', description: 'Adjust tolerances for your local climate and humidity', icon: Thermometer },
  { href: '/tools/history', label: 'Version History', description: 'Browse and restore previous versions of your designs', icon: History },
]

export default function ToolsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Tools</h1>
      <p className="text-gray-600 mb-8">Utilities to plan, source, and manage your builds.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

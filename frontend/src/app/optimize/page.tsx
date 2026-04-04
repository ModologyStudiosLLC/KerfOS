import Link from 'next/link'
import { Scissors, Grid, Archive, Stethoscope, DollarSign, BarChart } from 'lucide-react'

const tools = [
  { href: '/optimize/cutlist', label: 'Cut List Export', description: 'Generate and export optimized cut lists for your build', icon: Scissors },
  { href: '/optimize/nesting', label: 'Advanced Nesting', description: 'Non-guillotine nesting for maximum sheet yield', icon: Grid },
  { href: '/optimize/scrap', label: 'Scrap Tracker', description: 'Track and reuse offcuts across projects', icon: Archive },
  { href: '/optimize/doctor', label: 'Design Doctor', description: 'Automated structural and safety checks on your design', icon: Stethoscope },
  { href: '/optimize/cost', label: 'Cost Optimizer', description: 'Find cost savings without sacrificing quality', icon: DollarSign },
  { href: '/optimize/yield', label: 'Board Yield', description: 'Calculate board yield and minimize waste', icon: BarChart },
]

export default function OptimizePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Optimize</h1>
      <p className="text-gray-600 mb-8">Reduce waste, cut costs, and validate your designs.</p>
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

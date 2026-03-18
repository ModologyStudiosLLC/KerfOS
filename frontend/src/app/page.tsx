import { CabinetBuilder } from '@/components/CabinetBuilder'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">KerfOS</h1>
          <p className="text-gray-600 mt-2">Precision cabinet design for woodworkers and DIYers</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Cabinet Builder</h2>
              <CabinetBuilder />
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Features</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Drag-and-drop cabinet components
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Real-time 3D visualization
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Material library with pricing
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Cut list generation
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Hardware recommendations
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Quick Start</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>Drag cabinet components from the palette</li>
                <li>Adjust dimensions using the controls</li>
                <li>Select materials from the library</li>
                <li>Generate cut list and pricing</li>
                <li>Export for fabrication</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
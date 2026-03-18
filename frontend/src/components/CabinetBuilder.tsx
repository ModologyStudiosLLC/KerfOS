'use client'

import { useState } from 'react'
import { Ruler, Box, Scissors, DollarSign } from 'lucide-react'

interface Cabinet {
  id: number
  name: string
  width: number
  height: number
  depth: number
  material: string
}

export function CabinetBuilder() {
  const [cabinet, setCabinet] = useState<Cabinet>({
    id: 1,
    name: 'Base Cabinet',
    width: 36,
    height: 34.5,
    depth: 24,
    material: 'Birch Plywood'
  })

  const [materials] = useState([
    { id: 1, name: 'Birch Plywood', price: 65.99 },
    { id: 2, name: 'MDF', price: 42.50 },
    { id: 3, name: 'Oak Hardwood', price: 89.99 }
  ])

  const [cutList, setCutList] = useState<any[]>([])
  const [price, setPrice] = useState<number>(0)

  const calculateCutList = () => {
    // Simple cut list calculation
    const cuts = [
      { part: 'Bottom/Top', quantity: 2, width: cabinet.width, height: cabinet.depth },
      { part: 'Sides', quantity: 2, width: cabinet.height, height: cabinet.depth },
      { part: 'Back', quantity: 1, width: cabinet.width, height: cabinet.height },
      { part: 'Shelves', quantity: 2, width: cabinet.width - 1.5, height: cabinet.depth - 1.5 }
    ]
    setCutList(cuts)
  }

  const calculatePrice = () => {
    const selectedMaterial = materials.find(m => m.name === cabinet.material)
    if (!selectedMaterial) return

    // Simple price calculation
    const cabinetVolume = cabinet.width * cabinet.height * cabinet.depth
    const sheetArea = 48 * 96 // Standard sheet size in square inches
    const estimatedSheets = cabinetVolume / (sheetArea * 0.75)
    const materialCost = estimatedSheets * selectedMaterial.price
    const hardwareCost = 25.00
    const totalCost = materialCost + hardwareCost

    setPrice(totalCost)
  }

  const handleDimensionChange = (dimension: 'width' | 'height' | 'depth', value: number) => {
    setCabinet(prev => ({
      ...prev,
      [dimension]: value
    }))
  }

  const handleMaterialChange = (materialName: string) => {
    setCabinet(prev => ({
      ...prev,
      material: materialName
    }))
  }

  const handleCalculate = () => {
    calculateCutList()
    calculatePrice()
  }

  return (
    <div className="space-y-6">
      {/* Dimensions */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Ruler className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-medium">Dimensions (inches)</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
            <input
              type="number"
              value={cabinet.width}
              onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
            <input
              type="number"
              value={cabinet.height}
              onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Depth</label>
            <input
              type="number"
              value={cabinet.depth}
              onChange={(e) => handleDimensionChange('depth', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Material Selection */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Box className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-medium">Material</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {materials.map((material) => (
            <button
              key={material.id}
              onClick={() => handleMaterialChange(material.name)}
              className={`p-4 border rounded-lg text-center transition-colors ${
                cabinet.material === material.name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{material.name}</div>
              <div className="text-sm text-gray-600">${material.price}/sheet</div>
            </button>
          ))}
        </div>
      </div>

      {/* Calculate Button */}
      <button
        onClick={handleCalculate}
        className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Calculate Cut List & Price
      </button>

      {/* Results */}
      {cutList.length > 0 && (
        <div className="space-y-6">
          {/* Cut List */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Scissors className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-medium">Cut List</h3>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Part</th>
                    <th className="text-left py-2">Qty</th>
                    <th className="text-left py-2">Width</th>
                    <th className="text-left py-2">Height</th>
                  </tr>
                </thead>
                <tbody>
                  {cutList.map((cut, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-2">{cut.part}</td>
                      <td className="py-2">{cut.quantity}</td>
                      <td className="py-2">{cut.width.toFixed(1)}"</td>
                      <td className="py-2">{cut.height.toFixed(1)}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-medium">Estimated Cost</h3>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-700">
                ${price.toFixed(2)}
              </div>
              <div className="text-sm text-green-600 mt-1">
                Includes material and hardware
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cabinet Preview */}
      <div className="mt-8 p-4 bg-gray-900 rounded-lg">
        <div className="text-white text-center mb-4">3D Preview (Coming Soon)</div>
        <div className="h-48 bg-gray-800 rounded flex items-center justify-center">
          <div className="text-gray-400">
            <Box className="w-12 h-12 mx-auto mb-2" />
            <div>Interactive 3D visualization</div>
            <div className="text-sm">Powered by Three.js</div>
          </div>
        </div>
      </div>
    </div>
  )
}
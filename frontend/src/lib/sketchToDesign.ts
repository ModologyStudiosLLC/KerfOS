export interface SketchToDesignResult {
  success: boolean
  confidence: number
  detectedCabinets: number
  detectedStyle?: string
  detectedType?: string
  designs: Array<{
    name: string
    description: string
    specs: {
      width: number
      height: number
      depth: number
      doors: number
      drawers: number
    }
  }>
  tips?: string[]
  notes?: string[]
  warnings?: string[]
}

export async function processSketchImage(imageBase64: string): Promise<SketchToDesignResult> {
  const response = await fetch('/api/sketch-to-design', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageBase64 }),
  })
  if (!response.ok) throw new Error('Failed to process sketch')
  return response.json()
}

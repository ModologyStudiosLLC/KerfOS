export interface CabinetDesign {
  id: string
  name: string
  width: number
  height: number
  depth: number
  material: string
  components?: Array<{
    id: string
    name: string
    width: number
    height: number
    depth: number
    material: string
  }>
}

export interface DesignIssue {
  id: string
  severity: 'critical' | 'warning' | 'info'
  category: 'structural' | 'dimensions' | 'material' | 'hardware'
  title: string
  description: string
  affectedComponent?: string
  suggestedFix?: string
  details?: Record<string, unknown>
  suggestions?: Array<{ title: string; description: string; autoFixable?: boolean; fix?: unknown }>
}

export interface DesignSuggestion {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category: 'cost' | 'strength' | 'aesthetics' | 'efficiency'
}

export interface DesignDoctorResult {
  score: number
  issues: DesignIssue[]
  suggestions: DesignSuggestion[]
  passedChecks: string[]
  estimatedBuildTime?: number
  totalIssues?: number
  criticalCount?: number
  warningCount?: number
  tips?: string[]
}

export function runLocalDesignChecks(design: CabinetDesign): DesignDoctorResult {
  const issues: DesignIssue[] = []
  const suggestions: DesignSuggestion[] = []
  const passedChecks: string[] = []

  // Dimension checks
  if (design.width > 48) {
    issues.push({
      id: 'width-too-wide',
      severity: 'warning',
      category: 'dimensions',
      title: 'Cabinet width exceeds standard sheet',
      description: `Width of ${design.width}" exceeds standard 48" sheet width. Consider splitting into two cabinets.`,
      suggestedFix: 'Split into two cabinets under 48" wide',
    })
  } else {
    passedChecks.push('Width within sheet bounds')
  }

  if (design.depth > 30) {
    issues.push({
      id: 'depth-too-deep',
      severity: 'info',
      category: 'dimensions',
      title: 'Unusual cabinet depth',
      description: `Depth of ${design.depth}" is deeper than standard (24"). Verify this is intentional.`,
    })
  } else {
    passedChecks.push('Depth within standard range')
  }

  if (design.height > 96) {
    issues.push({
      id: 'height-exceeds-sheet',
      severity: 'critical',
      category: 'dimensions',
      title: 'Height exceeds standard sheet',
      description: `Height of ${design.height}" exceeds standard 96" sheet length.`,
      suggestedFix: 'Reduce height or use joined panels',
    })
  } else {
    passedChecks.push('Height within sheet bounds')
  }

  // Material suggestions
  if (design.material === 'MDF' && design.depth >= 24) {
    suggestions.push({
      id: 'mdf-moisture',
      title: 'Consider moisture-resistant material',
      description: 'MDF is susceptible to moisture. For base cabinets, plywood or moisture-resistant MDF is recommended.',
      impact: 'high',
      category: 'strength',
    })
  }

  const score = Math.max(0, 100 - issues.filter(i => i.severity === 'critical').length * 25 - issues.filter(i => i.severity === 'warning').length * 10)

  return { score, issues, suggestions, passedChecks }
}

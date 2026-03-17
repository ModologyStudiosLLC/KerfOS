'use client';

import React, { useState, useEffect } from 'react';

interface ScratchBuildCalculatorProps {
  onCalculate?: (result: CalculationResult) => void;
}

interface Tool {
  id: string;
  name: string;
  category: string;
  owned: boolean;
  impactOnTime: number; // percentage reduction
  required: boolean;
  alternatives: string[];
}

interface CalculationResult {
  projectId: string;
  estimatedHours: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  toolReadiness: number; // percentage
  missingTools: string[];
  recommendations: string[];
  timeline: {
    phase: string;
    hours: number;
    tools: string[];
  }[];
  rentalSuggestions: {
    tool: string;
    reason: string;
    estimatedCost: string;
  }[];
}

interface CabinetSpec {
  type: string;
  quantity: number;
  complexity: 'simple' | 'moderate' | 'complex';
}

const ScratchBuildCalculator: React.FC<ScratchBuildCalculatorProps> = ({ onCalculate }) => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [cabinets, setCabinets] = useState<CabinetSpec[]>([
    { type: 'base', quantity: 1, complexity: 'moderate' },
  ]);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const defaultTools: Tool[] = [
    // Essential Tools
    { id: '1', name: 'Table Saw', category: 'cutting', owned: false, impactOnTime: 40, required: true, alternatives: ['Circular saw + guide', 'Track saw'] },
    { id: '2', name: 'Miter Saw', category: 'cutting', owned: false, impactOnTime: 20, required: false, alternatives: ['Table saw', 'Hand saw + miter box'] },
    { id: '3', name: 'Circular Saw', category: 'cutting', owned: false, impactOnTime: 25, required: false, alternatives: ['Table saw', 'Track saw'] },
    { id: '4', name: 'Jigsaw', category: 'cutting', owned: false, impactOnTime: 10, required: false, alternatives: ['Coping saw', 'Band saw'] },
    
    // Joinery
    { id: '5', name: 'Kreg Jig (Pocket Hole)', category: 'joinery', owned: false, impactOnTime: 30, required: false, alternatives: ['Biscuit joiner', 'Doweling jig', 'Traditional joinery'] },
    { id: '6', name: 'Router', category: 'joinery', owned: false, impactOnTime: 25, required: false, alternatives: ['Router table', 'Biscuit joiner'] },
    { id: '7', name: 'Brad Nailer', category: 'joinery', owned: false, impactOnTime: 20, required: false, alternatives: ['Hammer + finish nails', 'Screw gun'] },
    
    // Assembly
    { id: '8', name: 'Drill/Driver', category: 'assembly', owned: false, impactOnTime: 15, required: true, alternatives: ['Hand screwdriver (much slower)'] },
    { id: '9', name: 'Impact Driver', category: 'assembly', owned: false, impactOnTime: 10, required: false, alternatives: ['Drill/Driver'] },
    { id: '10', name: 'Bar Clamps (set of 4+)', category: 'assembly', owned: false, impactOnTime: 15, required: true, alternatives: ['Pipe clamps', 'Quick-grip clamps'] },
    
    // Finishing
    { id: '11', name: 'Orbital Sander', category: 'finishing', owned: false, impactOnTime: 20, required: false, alternatives: ['Block sander', 'Random orbit sander'] },
    { id: '12', name: 'Edge Banding Iron', category: 'finishing', owned: false, impactOnTime: 10, required: false, alternatives: ['Household iron', 'Edge banding trimmer'] },
    
    // Measuring
    { id: '13', name: 'Tape Measure', category: 'measuring', owned: false, impactOnTime: 5, required: true, alternatives: ['Ruler', 'Folding rule'] },
    { id: '14', name: 'Square (Speed/Combination)', category: 'measuring', owned: false, impactOnTime: 5, required: true, alternatives: [] },
    { id: '15', name: 'Level', category: 'measuring', owned: false, impactOnTime: 5, required: true, alternatives: [] },
  ];

  useEffect(() => {
    setTools(defaultTools);
  }, []);

  const toggleTool = (id: string) => {
    setTools(tools.map(tool => 
      tool.id === id ? { ...tool, owned: !tool.owned } : tool
    ));
  };

  const addCabinet = () => {
    setCabinets([...cabinets, { type: 'base', quantity: 1, complexity: 'moderate' }]);
  };

  const updateCabinet = (index: number, field: keyof CabinetSpec, value: any) => {
    const updated = [...cabinets];
    updated[index] = { ...updated[index], [field]: value };
    setCabinets(updated);
  };

  const removeCabinet = (index: number) => {
    setCabinets(cabinets.filter((_, i) => i !== index));
  };

  const calculateBuild = async () => {
    setLoading(true);

    // Simulate API call - in production, this would call the backend
    await new Promise(resolve => setTimeout(resolve, 1500));

    const baseHoursPerCabinet: Record<string, number> = {
      base: 8,
      wall: 4,
      tall: 12,
      corner: 10,
      vanity: 10,
    };

    const complexityMultiplier: Record<string, number> = {
      simple: 0.7,
      moderate: 1.0,
      complex: 1.5,
    };

    const skillMultiplier: Record<string, number> = {
      beginner: 1.5,
      intermediate: 1.0,
      advanced: 0.75,
    };

    // Calculate base time
    let baseHours = 0;
    cabinets.forEach(cabinet => {
      const cabinetBase = baseHoursPerCabinet[cabinet.type] || 8;
      const adjusted = cabinetBase * complexityMultiplier[cabinet.complexity] * cabinet.quantity;
      baseHours += adjusted;
    });

    // Apply skill multiplier
    baseHours *= skillMultiplier[skillLevel];

    // Calculate tool impact
    const ownedTools = tools.filter(t => t.owned);
    const totalImpact = ownedTools.reduce((sum, tool) => sum + tool.impactOnTime, 0);
    const toolReadiness = Math.min(100, (ownedTools.length / tools.filter(t => t.required).length) * 100);

    // Apply tool time reduction (capped at 50%)
    const timeReduction = Math.min(0.5, totalImpact / 100);
    const estimatedHours = baseHours * (1 - timeReduction);

    // Find missing required tools
    const missingTools = tools.filter(t => t.required && !t.owned).map(t => t.name);

    // Generate timeline
    const timeline = [
      { phase: 'Planning & Layout', hours: Math.round(estimatedHours * 0.1), tools: ['Tape Measure', 'Square', 'Pencil'] },
      { phase: 'Material Preparation', hours: Math.round(estimatedHours * 0.15), tools: ['Table Saw', 'Circular Saw'] },
      { phase: 'Cut Parts to Size', hours: Math.round(estimatedHours * 0.25), tools: ['Table Saw', 'Miter Saw'] },
      { phase: 'Edge Banding', hours: Math.round(estimatedHours * 0.1), tools: ['Edge Banding Iron', 'Router'] },
      { phase: 'Drill Pocket Holes', hours: Math.round(estimatedHours * 0.1), tools: ['Kreg Jig', 'Drill/Driver'] },
      { phase: 'Assembly', hours: Math.round(estimatedHours * 0.2), tools: ['Drill/Driver', 'Clamps', 'Brad Nailer'] },
      { phase: 'Sanding & Prep', hours: Math.round(estimatedHours * 0.05), tools: ['Orbital Sander'] },
      { phase: 'Finishing', hours: Math.round(estimatedHours * 0.05), tools: ['Brush/Roller', 'Sprayer (optional)'] },
    ];

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (!tools.find(t => t.name === 'Table Saw')?.owned) {
      recommendations.push('Consider renting a table saw for cleaner, faster cuts - saves 4+ hours on this project');
    }
    if (!tools.find(t => t.name === 'Kreg Jig (Pocket Hole)')?.owned && skillLevel === 'beginner') {
      recommendations.push('A Kreg Jig makes joinery much easier for beginners - highly recommended for your first cabinet build');
    }
    if (cabinets.length > 3) {
      recommendations.push('For multiple cabinets, batch your work: cut all parts first, then assemble all at once');
    }
    if (skillLevel === 'beginner') {
      recommendations.push('Start with a simple base cabinet before tackling complex joinery or drawers');
    }

    // Rental suggestions
    const rentalSuggestions = [];
    if (!tools.find(t => t.name === 'Table Saw')?.owned) {
      rentalSuggestions.push({
        tool: 'Table Saw',
        reason: 'Essential for accurate rip cuts and plywood breakdown',
        estimatedCost: '$40-60/day',
      });
    }
    if (!tools.find(t => t.name === 'Router')?.owned && cabinets.some(c => c.complexity === 'complex')) {
      rentalSuggestions.push({
        tool: 'Router',
        reason: 'Needed for decorative edges and dado cuts',
        estimatedCost: '$25-40/day',
      });
    }
    if (!tools.find(t => t.name === 'Brad Nailer')?.owned) {
      rentalSuggestions.push({
        tool: 'Brad Nailer',
        reason: 'Speeds up assembly significantly',
        estimatedCost: '$20-35/day',
      });
    }

    const calculationResult: CalculationResult = {
      projectId: Date.now().toString(),
      estimatedHours: Math.round(estimatedHours * 10) / 10,
      skillLevel,
      toolReadiness,
      missingTools,
      recommendations,
      timeline,
      rentalSuggestions,
    };

    setResult(calculationResult);
    setLoading(false);
    onCalculate?.(calculationResult);
  };

  const categories = [...new Set(tools.map(t => t.category))];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <span className="text-3xl">🔧</span>
        Scratch-Build Calculator
      </h2>

      <p className="text-gray-600 mb-6">
        Enter your tools and get accurate time estimates for your cabinet project.
      </p>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Inputs */}
        <div className="space-y-6">
          {/* Skill Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Skill Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['beginner', 'intermediate', 'advanced'].map((level) => (
                <button
                  key={level}
                  onClick={() => setSkillLevel(level as any)}
                  className={`py-2 px-4 rounded-lg border-2 transition capitalize ${
                    skillLevel === level
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Cabinet Selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Cabinets to Build
              </label>
              <button
                onClick={addCabinet}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add Cabinet
              </button>
            </div>

            <div className="space-y-3">
              {cabinets.map((cabinet, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <select
                      value={cabinet.type}
                      onChange={(e) => updateCabinet(index, 'type', e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="base">Base Cabinet</option>
                      <option value="wall">Wall Cabinet</option>
                      <option value="tall">Tall/Pantry Cabinet</option>
                      <option value="corner">Corner Cabinet</option>
                      <option value="vanity">Vanity Cabinet</option>
                    </select>
                    {cabinets.length > 1 && (
                      <button
                        onClick={() => removeCabinet(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <label className="text-xs text-gray-500">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={cabinet.quantity}
                        onChange={(e) => updateCabinet(index, 'quantity', Number(e.target.value))}
                        className="w-20 border rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Complexity</label>
                      <select
                        value={cabinet.complexity}
                        onChange={(e) => updateCabinet(index, 'complexity', e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value="simple">Simple</option>
                        <option value="moderate">Moderate</option>
                        <option value="complex">Complex</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tools Checklist */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tools You Own
            </label>
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category}>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    {category}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {tools
                      .filter((t) => t.category === category)
                      .map((tool) => (
                        <label
                          key={tool.id}
                          className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition ${
                            tool.owned
                              ? 'border-green-500 bg-green-50'
                              : tool.required
                              ? 'border-red-200 bg-red-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={tool.owned}
                            onChange={() => toggleTool(tool.id)}
                            className="rounded"
                          />
                          <span className="text-sm flex-1">{tool.name}</span>
                          {tool.required && !tool.owned && (
                            <span className="text-xs text-red-600">Required</span>
                          )}
                        </label>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateBuild}
            disabled={loading}
            className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Calculating...' : 'Calculate Build Time'}
          </button>
        </div>

        {/* Right Column - Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Build Estimate</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm opacity-80">Estimated Time</p>
                  <p className="text-3xl font-bold">{result.estimatedHours} hrs</p>
                </div>
                <div>
                  <p className="text-sm opacity-80">Tool Readiness</p>
                  <p className="text-3xl font-bold">{result.toolReadiness}%</p>
                </div>
              </div>
              {result.missingTools.length > 0 && (
                <div className="mt-4 p-3 bg-white/20 rounded">
                  <p className="text-sm font-medium">Missing Required Tools:</p>
                  <p className="text-sm">{result.missingTools.join(', ')}</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div>
              <h4 className="font-semibold mb-3">Build Timeline</h4>
              <div className="space-y-2">
                {result.timeline.map((phase, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{phase.phase}</p>
                      <p className="text-gray-500 text-xs">
                        {phase.tools.join(' • ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{phase.hours} hrs</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">💡 Recommendations</h4>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-gray-600 flex gap-2">
                      <span>•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rental Suggestions */}
            {result.rentalSuggestions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">🔧 Tool Rental Suggestions</h4>
                <div className="space-y-2">
                  {result.rentalSuggestions.map((suggestion, i) => (
                    <div key={i} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{suggestion.tool}</p>
                          <p className="text-sm text-gray-600">{suggestion.reason}</p>
                        </div>
                        <span className="text-sm font-semibold text-green-600">
                          {suggestion.estimatedCost}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScratchBuildCalculator;

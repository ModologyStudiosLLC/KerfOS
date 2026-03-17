"use client";

import React, { useState, useEffect } from 'react';

interface ScrapPiece {
  id: string;
  width: number;
  height: number;
  thickness: number;
  material_id: string;
  material_name: string;
  sheet_source: number;
  x_position: number;
  y_position: number;
  grain_direction: string | null;
  notes: string;
  created_at: string | null;
  is_usable: boolean;
  area_sqin: number;
  area_sqft: number;
}

interface ScrapSuggestion {
  scrap_id: string;
  project_type: string;
  description: string;
  max_width: number;
  max_height: number;
  priority: number;
}

interface ScrapMatch {
  scrap: ScrapPiece;
  needs_rotation: boolean;
  waste_if_used: {
    area_sqft: number;
    percentage: number;
  };
}

interface ScrapTrackerProps {
  projectId?: number;
  cutList?: any;
  materialId?: string;
  materialName?: string;
  thickness?: number;
  onScrapSelect?: (scrap: ScrapPiece) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ScrapTracker({
  projectId,
  cutList,
  materialId,
  materialName,
  thickness,
  onScrapSelect,
}: ScrapTrackerProps) {
  const [scraps, setScraps] = useState<ScrapPiece[]>([]);
  const [suggestions, setSuggestions] = useState<ScrapSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'find' | 'suggest'>('inventory');
  
  // Find scrap state
  const [findWidth, setFindWidth] = useState('');
  const [findHeight, setFindHeight] = useState('');
  const [matches, setMatches] = useState<ScrapMatch[]>([]);
  
  // Summary state
  const [summary, setSummary] = useState<any>(null);

  // Process cutlist when provided
  useEffect(() => {
    if (cutList && materialId && materialName && thickness) {
      processCutlist();
    }
  }, [cutList]);

  // Load scrap inventory on mount
  useEffect(() => {
    loadScrapInventory();
  }, [projectId]);

  const processCutlist = async () => {
    if (!cutList || !materialId || !materialName || !thickness) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/scrap/process-cutlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cutlist: cutList,
          material_id: materialId,
          material_name: materialName,
          thickness: thickness,
          project_id: projectId,
        }),
      });

      if (!response.ok) throw new Error('Failed to process cutlist');

      const data = await response.json();
      setScraps(data.scraps || []);
      setSuggestions(data.suggestions || []);
    } catch (err) {
      setError('Could not process cutlist for scraps');
    } finally {
      setLoading(false);
    }
  };

  const loadScrapInventory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (projectId) params.append('project_id', String(projectId));
      
      const response = await fetch(`${API_URL}/api/scrap/list?${params}`);
      if (!response.ok) throw new Error('Failed to load scraps');
      
      const data = await response.json();
      setScraps(data.scraps || []);
      
      // Load summary
      const summaryResponse = await fetch(`${API_URL}/api/scrap/summary?${params}`);
      if (summaryResponse.ok) {
        setSummary(await summaryResponse.json());
      }
    } catch (err) {
      setError('Could not load scrap inventory');
    } finally {
      setLoading(false);
    }
  };

  const findScrapForPiece = async () => {
    const width = parseFloat(findWidth);
    const height = parseFloat(findHeight);
    
    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
      setError('Please enter valid dimensions');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/scrap/find`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          needed_width: width,
          needed_height: height,
          material_id: materialId,
          thickness: thickness,
        }),
      });

      if (!response.ok) throw new Error('Failed to find matching scrap');

      const data = await response.json();
      setMatches(data.matches || []);
    } catch (err) {
      setError('Could not find matching scrap pieces');
    } finally {
      setLoading(false);
    }
  };

  const markScrapUsed = async (scrapId: string) => {
    try {
      const params = new URLSearchParams();
      if (projectId) params.append('project_id', String(projectId));
      
      const response = await fetch(`${API_URL}/api/scrap/${scrapId}/use?${params}`, {
        method: 'PUT',
      });

      if (!response.ok) throw new Error('Failed to mark scrap as used');

      // Refresh inventory
      loadScrapInventory();
    } catch (err) {
      setError('Could not update scrap status');
    }
  };

  const deleteScrap = async (scrapId: string) => {
    try {
      const params = new URLSearchParams();
      if (projectId) params.append('project_id', String(projectId));
      
      const response = await fetch(`${API_URL}/api/scrap/${scrapId}?${params}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete scrap');

      // Refresh inventory
      loadScrapInventory();
    } catch (err) {
      setError('Could not delete scrap');
    }
  };

  // Group scraps by material
  const scrapsByMaterial = scraps.reduce((acc, scrap) => {
    if (!acc[scrap.material_name]) {
      acc[scrap.material_name] = [];
    }
    acc[scrap.material_name].push(scrap);
    return acc;
  }, {} as Record<string, ScrapPiece[]>);

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>🗑️</span>
          Scrap Tracker
        </h3>
        <button
          onClick={loadScrapInventory}
          className="text-slate-400 hover:text-white transition-colors"
          title="Refresh"
        >
          🔄
        </button>
      </div>

      {/* Summary */}
      {summary && (
        <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{summary.total_pieces}</p>
              <p className="text-xs text-slate-400">Pieces</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">
                {summary.total_area_sqft?.toFixed(1)}
              </p>
              <p className="text-xs text-slate-400">Sq Ft</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">
                {summary.suggestions_count || 0}
              </p>
              <p className="text-xs text-slate-400">Uses</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'inventory'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Inventory
        </button>
        <button
          onClick={() => setActiveTab('find')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'find'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Find Scrap
        </button>
        <button
          onClick={() => setActiveTab('suggest')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'suggest'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Suggestions
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700 p-3 rounded-lg mb-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <span className="animate-spin text-2xl">⚙️</span>
        </div>
      )}

      {/* Inventory Tab */}
      {!loading && activeTab === 'inventory' && (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.keys(scrapsByMaterial).length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-4xl mb-2">📦</p>
              <p>No scrap pieces tracked yet.</p>
              <p className="text-sm mt-1">Process a cutlist to find usable leftovers.</p>
            </div>
          ) : (
            Object.entries(scrapsByMaterial).map(([material, materialScraps]) => (
              <div key={material}>
                <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <span>🪵</span>
                  {material}
                  <span className="text-slate-500">({materialScraps.length} pieces)</span>
                </h4>
                <div className="space-y-2">
                  {materialScraps.map((scrap) => (
                    <div
                      key={scrap.id}
                      className={`p-3 rounded-lg border ${
                        scrap.is_usable
                          ? 'bg-slate-700/50 border-slate-600'
                          : 'bg-slate-800/50 border-slate-700 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">
                            {scrap.width.toFixed(1)}" × {scrap.height.toFixed(1)}"
                            <span className="text-slate-400 text-sm ml-2">
                              ({scrap.area_sqft.toFixed(2)} sq ft)
                            </span>
                          </p>
                          <p className="text-slate-400 text-xs mt-1">
                            Sheet #{scrap.sheet_source} • Thickness: {scrap.thickness}"
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {scrap.is_usable && onScrapSelect && (
                            <button
n                              onClick={() => onScrapSelect(scrap)}
                              className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                            >
                              Use
                            </button>
                          )}
                          {scrap.is_usable && (
                            <button
                              onClick={() => markScrapUsed(scrap.id)}
                              className="px-2 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded"
                            >
                              Mark Used
                            </button>
                          )}
                          <button
                            onClick={() => deleteScrap(scrap.id)}
                            className="px-2 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs rounded"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Find Tab */}
      {!loading && activeTab === 'find' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Width (in)</label>
              <input
                type="number"
                value={findWidth}
                onChange={(e) => setFindWidth(e.target.value)}
                placeholder="e.g., 12"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Height (in)</label>
              <input
                type="number"
                value={findHeight}
                onChange={(e) => setFindHeight(e.target.value)}
                placeholder="e.g., 24"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
          </div>
          <button
            onClick={findScrapForPiece}
            disabled={!findWidth || !findHeight}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Find Matching Scrap
          </button>

          {matches.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-300">
                Found {matches.length} matching piece(s):
              </h4>
              {matches.map((match, index) => (
                <div
                  key={index}
                  className="p-3 bg-green-900/20 border border-green-700 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">
                        {match.scrap.width.toFixed(1)}" × {match.scrap.height.toFixed(1)}"
                        {match.needs_rotation && (
                          <span className="text-yellow-400 text-sm ml-2">
                            (rotate 90°)
                          </span>
                        )}
                      </p>
                      <p className="text-green-400 text-sm">
                        Waste: {match.waste_if_used.percentage.toFixed(1)}%
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (onScrapSelect) onScrapSelect(match.scrap);
                        markScrapUsed(match.scrap.id);
                      }}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
                    >
                      Use This
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Suggestions Tab */}
      {!loading && activeTab === 'suggest' && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {suggestions.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-4xl mb-2">💡</p>
              <p>No suggestions available.</p>
              <p className="text-sm mt-1">Process a cutlist to see what you can make with scraps.</p>
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  suggestion.priority === 1
                    ? 'bg-green-900/20 border-green-700'
                    : suggestion.priority === 2
                    ? 'bg-yellow-900/20 border-yellow-700'
                    : 'bg-slate-700/50 border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {suggestion.priority === 1 ? '✨' : suggestion.priority === 2 ? '👍' : '👌'}
                  </span>
                  <div className="flex-1">
                    <p className="text-white font-medium">{suggestion.project_type}</p>
                    <p className="text-slate-400 text-sm">{suggestion.description}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      Fits: up to {suggestion.max_width.toFixed(1)}" × {suggestion.max_height.toFixed(1)}"
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

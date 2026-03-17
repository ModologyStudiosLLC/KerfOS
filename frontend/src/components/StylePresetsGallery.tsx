import React, { useState, useEffect } from 'react';
import { StylePreset, STYLE_PRESETS, StylePresetCategory } from '../lib/stylePresets';

interface StylePresetsGalleryProps {
  currentDesign?: any;
  onApplyPreset: (preset: StylePreset) => void;
  onPreviewPreset?: (preset: StylePreset) => void;
}

const StylePresetsGallery: React.FC<StylePresetsGalleryProps> = ({
  currentDesign,
  onApplyPreset,
  onPreviewPreset
}) => {
  const [selectedCategory, setSelectedCategory] = useState<StylePresetCategory | 'all'>('all');
  const [selectedPreset, setSelectedPreset] = useState<StylePreset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories: { value: StylePresetCategory | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'All Styles', icon: '📋' },
    { value: 'door_style', label: 'Door Styles', icon: '🚪' },
    { value: 'frame_type', label: 'Frame Types', icon: '🖼️' },
    { value: 'drawer_style', label: 'Drawer Styles', icon: '🗄️' },
    { value: 'finish', label: 'Finishes', icon: '🎨' },
    { value: 'hardware', label: 'Hardware', icon: '🔩' },
  ];

  const filteredPresets = Object.values(STYLE_PRESETS).filter(preset => {
    const matchesCategory = selectedCategory === 'all' || preset.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePresetClick = (preset: StylePreset) => {
    setSelectedPreset(preset);
    onPreviewPreset?.(preset);
  };

  const handleApply = (preset: StylePreset) => {
    onApplyPreset(preset);
    setSelectedPreset(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🎨</span>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Style Presets Gallery</h2>
          <p className="text-sm text-gray-500">One-click cabinet styles</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search styles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Presets Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {filteredPresets.map((preset) => (
          <div
            key={preset.id}
            onClick={() => handlePresetClick(preset)}
            className={`relative cursor-pointer rounded-lg border-2 overflow-hidden transition-all hover:shadow-lg ${
              selectedPreset?.id === preset.id
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Preview Image */}
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              {preset.previewImage ? (
                <img
                  src={preset.previewImage}
                  alt={preset.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-4xl">{preset.icon || '📦'}</div>
              )}
            </div>
            
            {/* Info */}
            <div className="p-3">
              <h3 className="font-medium text-gray-800 text-sm truncate">{preset.name}</h3>
              <p className="text-xs text-gray-500 truncate">{preset.description}</p>
            </div>
            
            {/* Popular Badge */}
            {preset.popular && (
              <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-medium">
                ⭐ Popular
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Preset Details */}
      {selectedPreset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{selectedPreset.icon || '📦'}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{selectedPreset.name}</h3>
                    <p className="text-sm text-gray-500">{selectedPreset.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPreset(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Preview */}
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg aspect-video mb-6 flex items-center justify-center">
                {selectedPreset.previewImage ? (
                  <img
                    src={selectedPreset.previewImage}
                    alt={selectedPreset.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-6xl">{selectedPreset.icon || '📦'}</div>
                )}
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">Door Style</h4>
                  <p className="text-sm text-gray-600">
                    {selectedPreset.settings.doorStyle || 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">Frame Type</h4>
                  <p className="text-sm text-gray-600">
                    {selectedPreset.settings.frameType || 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">Material</h4>
                  <p className="text-sm text-gray-600">
                    {selectedPreset.settings.material || 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">Hardware</h4>
                  <p className="text-sm text-gray-600">
                    {selectedPreset.settings.hardwareType || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Features */}
              {selectedPreset.features && selectedPreset.features.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Key Features</h4>
                  <ul className="space-y-1">
                    {selectedPreset.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-green-500">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* What Gets Changed */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-800 mb-2">What Will Change</h4>
                <div className="space-y-1 text-sm text-blue-700">
                  {Object.entries(selectedPreset.settings).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-blue-100 px-1 rounded">{key}</span>
                      <span>→</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedPreset(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApply(selectedPreset)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply Style
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredPresets.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-2">🔍</div>
          <p>No styles found matching your search</p>
        </div>
      )}
    </div>
  );
};

export default StylePresetsGallery;
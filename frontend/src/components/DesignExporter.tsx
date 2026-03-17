"use client";

import React, { useState, useRef } from "react";

export interface Cabinet {
  id: string;
  name: string;
  width: number;
  height: number;
  depth: number;
  material: {
    id: string;
    name: string;
    type: string;
    thickness: number;
    pricePerSqFt: number;
  };
  components: any[];
}

export interface DesignExporterProps {
  cabinet: Cabinet | null;
  onExport?: (format: string, content: string) => void;
}

export default function DesignExporter({ cabinet, onExport }: DesignExporterProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>('obj');
  const [isExporting, setIsExporting] = useState(false);
  const [exportContent, setExportContent] = useState<string | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const formats = [
    { value: 'obj', label: 'OBJ (Shapr3D)', description: '3D model for Shapr3D and other tools' },
    { value: 'stl', label: 'STL (3D Printing)', description: '3D printing and CNC' },
    { value: '3mf', label: '3MF (3D Manufacturing)', description: '3D Manufacturing Format' },
    { value: 'dxf', label: 'DXF (SketchUp)', description: '2D/3D for SketchUp and CAD' },
  ];

  const handleExport = async () => {
    if (!cabinet) return;
    setIsExporting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/export/${selectedFormat}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cabinet),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const data = await response.json();
      setExportContent(data.content);

      if (onExport) {
        onExport(selectedFormat, data.content);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (!exportContent) return;

    const blob = new Blob([exportContent], {
      type: selectedFormat === 'stl' ? 'application/octet-stream' : 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cabinet?.name || 'cabinet'}.${selectedFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = () => {
    if (!exportContent) return;
    navigator.clipboard.writeText(exportContent);
    alert('Exported content copied to clipboard!');
  };

  if (!cabinet) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Export to 3D Formats</h3>
        <p className="text-slate-400 text-sm">Select a cabinet to export</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700" ref={exportRef}>
      <h3 className="text-lg font-semibold text-white mb-4">Export to 3D Formats</h3>

      <div className="space-y-4">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Format
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formats.map((format) => (
              <button
                key={format.value}
                type="button"
                onClick={() => setSelectedFormat(format.value)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedFormat === format.value
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="font-medium">{format.label}</div>
                    <div className="text-xs text-slate-400">{format.description}</div>
                  </div>
                  {selectedFormat === format.value && (
                    <div className="text-blue-400">✓</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? 'Exporting...' : 'Export'}
        </button>

        {/* Export Content */}
        {exportContent && (
          <div className="mt-4 p-4 bg-slate-900 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-white">Exported Content</h4>
              <span className="text-xs text-slate-400">{selectedFormat.toUpperCase()}</span>
            </div>
            <pre className="text-xs text-slate-300 overflow-auto max-h-48 whitespace-pre-wrap break-all">
              {exportContent}
            </pre>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-sm py-2 px-3 rounded transition-colors"
              >
                📥 Download
              </button>
              <button
                type="button"
                onClick={handleCopyToClipboard}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-sm py-2 px-3 rounded transition-colors"
              >
                📋 Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

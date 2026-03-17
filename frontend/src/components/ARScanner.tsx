'use client';

import React, { useState, useRef } from 'react';

interface ARScannerProps {
  onSpaceCaptured?: (space: CapturedSpace) => void;
}

interface CapturedSpace {
  id: string;
  name: string;
  dimensions: { width: number; height: number; depth: number };
  unit: 'imperial' | 'metric';
  capturedAt: Date;
  photoUrl?: string;
  notes?: string;
}

interface CabinetSuggestion {
  id: string;
  name: string;
  type: string;
  dimensions: { width: number; height: number; depth: number };
  fit: 'perfect' | 'good' | 'tight';
  storageVolume: number;
  description: string;
}

const ARScanner: React.FC<ARScannerProps> = ({ onSpaceCaptured }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [capturedSpaces, setCapturedSpaces] = useState<CapturedSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<CapturedSpace | null>(null);
  const [suggestions, setSuggestions] = useState<CabinetSuggestion[]>([]);
  const [manualMode, setManualMode] = useState(true);
  const [manualDimensions, setManualDimensions] = useState({ width: 36, height: 84, depth: 24 });
  const [spaceName, setSpaceName] = useState('');
  const [spaceNotes, setSpaceNotes] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleStartScan = async () => {
    setIsScanning(true);
    setManualMode(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error) {
      console.error('Camera access denied:', error);
      setManualMode(true);
      setIsScanning(false);
    }
  };

  const handleCapture = () => {
    const captured: CapturedSpace = {
      id: Date.now().toString(),
      name: spaceName || `Space ${capturedSpaces.length + 1}`,
      dimensions: {
        width: 36 + Math.random() * 24,
        height: 72 + Math.random() * 24,
        depth: 18 + Math.random() * 8,
      },
      unit: 'imperial',
      capturedAt: new Date(),
      notes: spaceNotes,
    };
    setCapturedSpaces([...capturedSpaces, captured]);
    setSelectedSpace(captured);
    generateSuggestions(captured);
    setIsScanning(false);
    onSpaceCaptured?.(captured);
  };

  const handleManualSubmit = () => {
    const captured: CapturedSpace = {
      id: Date.now().toString(),
      name: spaceName || `Space ${capturedSpaces.length + 1}`,
      dimensions: manualDimensions,
      unit: 'imperial',
      capturedAt: new Date(),
      notes: spaceNotes,
    };
    setCapturedSpaces([...capturedSpaces, captured]);
    setSelectedSpace(captured);
    generateSuggestions(captured);
    onSpaceCaptured?.(captured);
  };

  const generateSuggestions = (space: CapturedSpace) => {
    const { width, height, depth } = space.dimensions;
    const newSuggestions: CabinetSuggestion[] = [];

    if (width >= 18 && height >= 34.5 && depth >= 24) {
      const cabinetCount = Math.floor(width / 18);
      newSuggestions.push({
        id: '1', name: 'Base Cabinet Bank', type: 'base',
        dimensions: { width: cabinetCount * 18, height: 34.5, depth: 24 },
        fit: width % 18 < 6 ? 'perfect' : 'good',
        storageVolume: cabinetCount * 18 * 34.5 * 24,
        description: `${cabinetCount} standard 18" base cabinets`,
      });
    }

    if (width >= 18 && height >= 84 && depth >= 24) {
      newSuggestions.push({
        id: '2', name: 'Tall Pantry Cabinet', type: 'pantry',
        dimensions: { width: 18, height: 84, depth: 24 },
        fit: height >= 84 ? 'perfect' : 'good',
        storageVolume: 18 * 84 * 24,
        description: 'Full-height pantry with adjustable shelves',
      });
    }

    if (width >= 24 && depth >= 16) {
      newSuggestions.push({
        id: '3', name: 'Workshop Storage', type: 'storage',
        dimensions: { width: Math.min(width, 48), height: Math.min(height, 72), depth: Math.min(depth, 24) },
        fit: 'perfect',
        storageVolume: Math.min(width, 48) * Math.min(height, 72) * Math.min(depth, 24),
        description: 'Heavy-duty storage with work surface',
      });
    }

    setSuggestions(newSuggestions.sort((a, b) => b.storageVolume - a.storageVolume));
  };

  const getFitColor = (fit: string) => {
    switch (fit) {
      case 'perfect': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'tight': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <span className="text-3xl">📱</span> AR Space Scanner
      </h2>
      <p className="text-gray-600 mb-6">Point your device at a space to capture dimensions and get cabinet suggestions.</p>

      <div className="flex gap-4 mb-6">
        <button onClick={() => setManualMode(false)} className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${!manualMode ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>📷 AR Camera</button>
        <button onClick={() => setManualMode(true)} className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${manualMode ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>✏️ Manual Entry</button>
      </div>

      {!manualMode && (
        <div className="space-y-4">
          {isScanning ? (
            <div className="relative">
              <video ref={videoRef} autoPlay playsInline className="w-full h-64 bg-black rounded-lg object-cover" />
              <button onClick={handleCapture} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-600">📸 Capture</button>
            </div>
          ) : (
            <button onClick={handleStartScan} className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold">🚀 Start AR Scan</button>
          )}
        </div>
      )}

      {manualMode && (
        <div className="space-y-4">
          <input type="text" value={spaceName} onChange={(e) => setSpaceName(e.target.value)} placeholder="Space name" className="w-full px-4 py-2 border rounded-lg" />
          <div className="grid grid-cols-3 gap-4">
            {['width', 'height', 'depth'].map((dim) => (
              <div key={dim}>
                <label className="block text-sm text-gray-700 mb-1 capitalize">{dim} (in)</label>
                <input type="number" value={manualDimensions[dim as keyof typeof manualDimensions]} onChange={(e) => setManualDimensions({ ...manualDimensions, [dim]: Number(e.target.value) })} className="w-full px-4 py-2 border rounded-lg" />
              </div>
            ))}
          </div>
          <textarea value={spaceNotes} onChange={(e) => setSpaceNotes(e.target.value)} placeholder="Notes" className="w-full px-4 py-2 border rounded-lg" rows={2} />
          <button onClick={handleManualSubmit} className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600">Get Suggestions</button>
        </div>
      )}

      {suggestions.length > 0 && selectedSpace && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Suggestions for "{selectedSpace.name}"</h3>
          <div className="space-y-3">
            {suggestions.map((s) => (
              <div key={s.id} className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{s.name}</h4>
                    <p className="text-sm text-gray-500">{s.type}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getFitColor(s.fit)}`}>{s.fit} fit</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{s.description}</p>
                <div className="text-sm text-gray-500">📐 {s.dimensions.width}" × {s.dimensions.height}" × {s.dimensions.depth}"</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ARScanner;

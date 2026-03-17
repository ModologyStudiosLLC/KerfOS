import React, { useState, useCallback } from 'react';
import { SketchToDesignResult } from '../lib/sketchToDesign';

interface SketchToDesignProps {
  onDesignGenerated: (design: any) => void;
}

const SketchToDesign: React.FC<SketchToDesignProps> = ({ onDesignGenerated }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [result, setResult] = useState<SketchToDesignResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const processImage = useCallback(async () => {
    if (!uploadedImage) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/sketch-to-design/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: uploadedImage })
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedImage]);

  const handleUseDesign = (design: any) => {
    onDesignGenerated(design);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">✏️</span>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Sketch to Design</h2>
          <p className="text-sm text-gray-500">Upload a sketch or photo to convert to a cabinet design</p>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
          uploadedImage ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {uploadedImage ? (
          <div className="space-y-4">
            <img
              src={uploadedImage}
              alt="Uploaded sketch"
              className="max-h-64 mx-auto rounded-lg shadow"
            />
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setUploadedImage(null);
                  setResult(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Remove
              </button>
              <label className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 cursor-pointer hover:bg-gray-200">
                Change
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        ) : (
          <label className="cursor-pointer">
            <div className="space-y-3">
              <div className="text-5xl">📤</div>
              <div className="text-gray-600">
                <span className="font-medium">Click to upload</span> or drag and drop
              </div>
              <div className="text-sm text-gray-500">
                PNG, JPG, or photo of your sketch
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Process Button */}
      {uploadedImage && !result && (
        <button
          onClick={processImage}
          disabled={isProcessing}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </>
          ) : (
            <>
              <span>🔍</span>
              Convert to Cabinet Design
            </>
          )}
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Detected Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">Detected Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm text-blue-700">
              <div>Cabinets detected: <span className="font-medium">{result.detectedCabinets}</span></div>
              <div>Confidence: <span className="font-medium">{(result.confidence * 100).toFixed(0)}%</span></div>
              <div>Style: <span className="font-medium">{result.detectedStyle}</span></div>
              <div>Type: <span className="font-medium">{result.detectedType}</span></div>
            </div>
          </div>

          {/* Generated Designs */}
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Generated Designs</h3>
            <div className="grid gap-4">
              {result.designs.map((design, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{design.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{design.description}</p>
                      
                      <div className="flex gap-4 mt-3 text-sm text-gray-600">
                        <span>Width: {design.specs.width}"</span>
                        <span>Height: {design.specs.height}"</span>
                        <span>Depth: {design.specs.depth}"</span>
                      </div>
                      
                      {design.specs.doors > 0 && (
                        <span className="inline-block mt-2 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                          {design.specs.doors} door{design.specs.doors > 1 ? 's' : ''}
                        </span>
                      )}
                      {design.specs.drawers > 0 && (
                        <span className="inline-block mt-2 ml-2 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                          {design.specs.drawers} drawer{design.specs.drawers > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleUseDesign(design)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      Use This Design
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          {result.tips && result.tips.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-medium text-yellow-800 mb-2">💡 Tips</h3>
              <ul className="space-y-1 text-sm text-yellow-700">
                {result.tips.map((tip, idx) => (
                  <li key={idx}>• {tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Try Again */}
          <button
            onClick={() => {
              setResult(null);
              setUploadedImage(null);
            }}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Upload Another Sketch
          </button>
        </div>
      )}
    </div>
  );
};

export default SketchToDesign;
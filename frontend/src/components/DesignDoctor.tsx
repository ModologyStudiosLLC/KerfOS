import React, { useState, useCallback } from 'react';
import { DesignDoctorResult, CabinetDesign, DesignIssue, DesignSuggestion } from '../lib/designDoctor';

interface DesignDoctorProps {
  design: CabinetDesign;
  onFixIssue?: (issue: DesignIssue, fix: any) => void;
}

const DesignDoctor: React.FC<DesignDoctorProps> = ({ design, onFixIssue }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<DesignDoctorResult | null>(null);
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  const scanDesign = useCallback(async () => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/design-doctor/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(design)
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Failed to scan design:', error);
    } finally {
      setIsScanning(false);
    }
  }, [design]);

  const getSeverityColor = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-500 text-red-800';
      case 'warning': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'info': return 'bg-blue-100 border-blue-500 text-blue-800';
    }
  };

  const getSeverityIcon = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      structural: '🏗️',
      clearance: '📏',
      hardware: '🔩',
      material: '🪵',
      safety: '🛡️',
      aesthetics: '🎨'
    };
    return icons[category] || '📋';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">👨‍⚕️</span>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Design Doctor</h2>
            <p className="text-sm text-gray-500">Catch problems before you build</p>
          </div>
        </div>
        <button
          onClick={scanDesign}
          disabled={isScanning}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isScanning ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Scanning...
            </>
          ) : (
            <>
              <span>🔍</span>
              Scan Design
            </>
          )}
        </button>
      </div>

      {!result && !isScanning && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">🏥</div>
          <p className="text-lg mb-2">Your design hasn't been checked yet</p>
          <p className="text-sm">Click "Scan Design" to detect potential issues</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-gray-800">{result.totalIssues}</div>
              <div className="text-sm text-gray-500">Total Issues</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-red-600">{result.criticalCount}</div>
              <div className="text-sm text-red-600">Critical</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-yellow-600">{result.warningCount}</div>
              <div className="text-sm text-yellow-600">Warnings</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{result.score}/100</div>
              <div className="text-sm text-green-600">Health Score</div>
            </div>
          </div>

          {/* Issues List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Issues Found</h3>
            {result.issues.map((issue) => (
              <div
                key={issue.id}
                className={`border-l-4 rounded-lg p-4 ${getSeverityColor(issue.severity)}`}
              >
                <div
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{getSeverityIcon(issue.severity)}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{issue.title}</span>
                        <span className="text-sm opacity-75">{getCategoryIcon(issue.category)} {issue.category}</span>
                      </div>
                      <p className="text-sm mt-1">{issue.description}</p>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 transition-transform ${expandedIssue === issue.id ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {expandedIssue === issue.id && (
                  <div className="mt-4 pt-4 border-t border-current/20">
                    {/* Technical Details */}
                    <div className="bg-white/50 rounded p-3 mb-3">
                      <h4 className="font-medium text-sm mb-2">Technical Details</h4>
                      <pre className="text-xs overflow-x-auto">{JSON.stringify(issue.details, null, 2)}</pre>
                    </div>

                    {/* Suggestions */}
                    {issue.suggestions && issue.suggestions.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Suggested Fixes</h4>
                        {issue.suggestions.map((suggestion, idx) => (
                          <div key={idx} className="bg-white/50 rounded p-3 flex items-start justify-between">
                            <div>
                              <p className="font-medium text-sm">{suggestion.title}</p>
                              <p className="text-xs mt-1">{suggestion.description}</p>
                            </div>
                            {suggestion.autoFixable && onFixIssue && (
                              <button
                                onClick={() => onFixIssue(issue, suggestion.fix)}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                              >
                                Auto Fix
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Tips */}
          {result.tips && result.tips.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">💡 Pro Tips</h3>
              <ul className="space-y-1 text-sm text-blue-700">
                {result.tips.map((tip, idx) => (
                  <li key={idx}>• {tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DesignDoctor;
"use client";
import React, { useState } from "react";
import { Cabinet } from "./CabinetBuilder";

interface GCodeExporterProps {
  cabinets: Cabinet[];
  onGCodeGenerated?: (gcode: string, metadata: any) => void;
}

interface GCodeOperation {
  operation: number;
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  sheet: number;
  commands: string[];
}

interface GCodeResponse {
  gcode: string;
  metadata: {
    totalOperations: number;
    totalSheets: number;
    estimatedTime: number; // minutes
    materialThickness: number;
  };
  preview: GCodeOperation[];
}

export default function GCodeExporter({ cabinets, onGCodeGenerated }: GCodeExporterProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gcodeData, setGCodeData] = useState<GCodeResponse | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<GCodeOperation | null>(null);

  const generateGCode = async () => {
    if (cabinets.length === 0) {
      setError("No cabinets to generate G-code");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Build cut list client-side from cabinet dimensions
      const SHEET_W = 48, SHEET_H = 96, GAP = 0.5;
      const cutList = cabinets.flatMap((cab, sheetIdx) => {
        const parts = [
          { partName: `${cab.name} Bottom/Top`, partId: `${cab.id}-bt`, width: cab.width, height: cab.depth, quantity: 2 },
          { partName: `${cab.name} Sides`,      partId: `${cab.id}-s`,  width: cab.height, height: cab.depth, quantity: 2 },
          { partName: `${cab.name} Back`,        partId: `${cab.id}-bk`, width: cab.width,  height: cab.height, quantity: 1 },
          { partName: `${cab.name} Shelves`,     partId: `${cab.id}-sh`, width: cab.width - 1.5, height: cab.depth - 1.5, quantity: 2 },
        ];
        // Expand quantity and assign x/y positions (simple row nesting)
        const flat: Array<{ partName: string; partId: string; width: number; height: number; x: number; y: number }> = [];
        let curX = GAP, curY = GAP, rowH = 0;
        for (const p of parts) {
          for (let i = 0; i < p.quantity; i++) {
            if (curX + p.width > SHEET_W - GAP) { curY += rowH + GAP; curX = GAP; rowH = 0; }
            flat.push({ partName: p.partName, partId: `${p.partId}-${i}`, width: p.width, height: p.height, x: curX, y: curY });
            curX += p.width + GAP;
            rowH = Math.max(rowH, p.height);
          }
        }
        return { sheetNumber: sheetIdx + 1, width: SHEET_W, height: SHEET_H, cuts: flat };
      });

      const cutListData = { cutList, totalSheets: cabinets.length };
      const gcodeResponse = await generateGCodeFromCutList(cutListData);
      setGCodeData(gcodeResponse);
      setShowPreview(true);

      if (onGCodeGenerated) {
        onGCodeGenerated(gcodeResponse.gcode, gcodeResponse.metadata);
      }
    } catch (err) {
      setError("Could not generate G-code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateGCodeFromCutList = async (cutListData: any): Promise<GCodeResponse> => {
    // Generate G-code preview data
    const preview: GCodeOperation[] = [];
    let opNum = 1;

    for (const sheet of cutListData.cutList || []) {
      for (const cut of sheet.cuts || []) {
        preview.push({
          operation: opNum++,
          type: "rect_cut",
          name: `${cut.partName}_${cut.partId}`,
          x: cut.x,
          y: cut.y,
          width: cut.width,
          height: cut.height,
          sheet: sheet.sheetNumber,
          commands: [
            `Rapid to (${cut.x.toFixed(2)}, ${cut.y.toFixed(2)})`,
            `Spindle ON (12000 RPM)`,
            `Plunge to -18.0 mm`,
            `Cut rectangle (${cut.width.toFixed(2)}" x ${cut.height.toFixed(2)})`,
            `Retract Z`
          ]
        });
      }
    }

    // Generate actual G-code
    const gcode = generateGCodeString(cutListData);

    return {
      gcode,
      metadata: {
        totalOperations: preview.length,
        totalSheets: cutListData.totalSheets || 0,
        estimatedTime: preview.length * 2, // ~2 min per operation
        materialThickness: 18.0 // mm (3/4" plywood)
      },
      preview
    };
  };

  const generateGCodeString = (cutListData: any): string => {
    let gcode = [];
    
    // Header
    gcode.push("");
    gcode.push("(Modology Cabinet Designer - G-code for CNC)");
    gcode.push(`(Generated: ${new Date().toLocaleDateString()})`);
    gcode.push("");
    gcode.push("G20");  // Inch mode
    gcode.push("G90");  // Absolute positioning
    gcode.push("");
    
    // Spindle on
    gcode.push("M03 S12000");
    gcode.push("G04 P2");  // Dwell for 2 seconds
    gcode.push("");
    
    let opNum = 1;
    for (const sheet of cutListData.cutList || []) {
      gcode.push(`(Sheet ${sheet.sheetNumber}: ${sheet.width}" x ${sheet.height}")`);
      gcode.push("");
      
      for (const cut of sheet.cuts || []) {
        gcode.push(`(Piece ${opNum}: ${cut.partName})`);
        gcode.push("");
        
        // Rapid to start position
        gcode.push(`G00 Z5.0`);
        gcode.push(`G00 X${cut.x.toFixed(4)} Y${cut.y.toFixed(4)}`);
        
        // Plunge
        gcode.push(`G01 Z-3.0 F50.0`);
        
        // Cut rectangle
        gcode.push(`G01 X${(cut.x + cut.width).toFixed(4)} F100.0`);
        gcode.push(`G01 Y${(cut.y + cut.height).toFixed(4)}`);
        gcode.push(`G01 X${cut.x.toFixed(4)}`);
        gcode.push(`G01 Y${cut.y.toFixed(4)}`);
        
        // Retract
        gcode.push(`G00 Z5.0`);
        gcode.push("");
        
        opNum++;
      }
    }
    
    // Footer
    gcode.push("(End of G-code)");
    gcode.push("M05");  // Spindle off
    gcode.push("G00 X0 Y0 Z20");
    gcode.push("");
    gcode.push("M02");  // Program end
    
    return gcode.join("\n");
  };

  const downloadGCode = () => {
    if (!gcodeData) return;

    const blob = new Blob([gcodeData.gcode], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "cabinet_parts.nc";  // .nc is common for G-code
    link.click();
  };

  const copyToClipboard = async () => {
    if (!gcodeData) return;

    try {
      await navigator.clipboard.writeText(gcodeData.gcode);
      alert("G-code copied to clipboard!");
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const viewOperation = (op: GCodeOperation) => {
    setSelectedOperation(op);
  };

  const closePreview = () => {
    setShowPreview(false);
    setSelectedOperation(null);
  };

  return (
    <div className="space-y-4">
      {/* Generate Button */}
      <button
        onClick={generateGCode}
        disabled={loading || cabinets.length === 0}
        className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors shadow-lg shadow-green-600/30"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin mr-2">⚙️</span>
            Generating G-code...
          </span>
        ) : (
          "Generate G-code for CNC"
        )}
      </button>

      {error && (
        <div className="bg-red-900/20 border border-red-700 p-4 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {gcodeData && (
        <div className="space-y-3">
          {/* Metadata */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <h3 className="font-semibold text-white mb-2">
              G-code Metadata
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-sm">Total Operations</p>
                <p className="text-2xl font-bold text-white">
                  {gcodeData.metadata.totalOperations}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Sheets</p>
                <p className="text-2xl font-bold text-white">
                  {gcodeData.metadata.totalSheets}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Est. Time</p>
                <p className="text-2xl font-bold text-blue-400">
                  {Math.floor(gcodeData.metadata.estimatedTime)}m {Math.round((gcodeData.metadata.estimatedTime % 1) * 60)}s
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Material Thickness</p>
                <p className="text-2xl font-bold text-green-400">
                  {gcodeData.metadata.materialThickness}" mm
                </p>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-2">
            <button
              onClick={downloadGCode}
              className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              <span className="mr-2">⬇️</span>
              Download G-code (.nc file)
            </button>
            <button
              onClick={copyToClipboard}
              className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              <span className="mr-2">📋</span>
              Copy to Clipboard
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              <span className="mr-2">👁️</span>
              {showPreview ? "Hide Preview" : "Show Preview"}
            </button>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-600">
              <h3 className="font-semibold text-white mb-3">G-code Preview</h3>
              
              {selectedOperation ? (
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedOperation(null)}
                    className="mb-4 text-blue-400 hover:text-blue-300"
                  >
                    ← Back to all operations
                  </button>
                  
                  <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                    <h4 className="font-semibold text-white mb-2">
                      Operation {selectedOperation.operation}: {selectedOperation.name}
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div>
                        <p className="text-slate-400">Position</p>
                        <p className="text-white">
                          ({selectedOperation.x.toFixed(2)}, {selectedOperation.y.toFixed(2)})
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Dimensions</p>
                        <p className="text-white">
                          {selectedOperation.width.toFixed(2)}" x {selectedOperation.height.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Sheet</p>
                        <p className="text-white">
                          Sheet {selectedOperation.sheet}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Type</p>
                        <p className="text-white">
                          {selectedOperation.type.charAt(0).toUpperCase() + selectedOperation.type.slice(1)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-slate-400 text-sm font-semibold mb-1">Commands:</p>
                      {selectedOperation.commands.map((cmd, i) => (
                        <div
                          key={i}
                          className="bg-slate-900/50 rounded px-3 py-2 text-sm font-mono text-slate-300"
                        >
                          {cmd}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-slate-400 text-sm">
                    {gcodeData.preview.length} operations:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {gcodeData.preview.map((op) => (
                      <div
                        key={op.operation}
                        onClick={() => viewOperation(op)}
                        className="bg-slate-700/50 rounded-lg p-3 border border-slate-600 cursor-pointer hover:bg-slate-700 hover:border-blue-500 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-slate-400 text-sm">
                            Op {op.operation}
                          </span>
                          <span className="text-slate-400 text-xs">
                            Sheet {op.sheet}
                          </span>
                        </div>
                        <p className="text-white font-semibold text-sm mb-1">
                          {op.name}
                        </p>
                        <div className="text-xs text-slate-400">
                          <span>Position: ({op.x.toFixed(1)}, {op.y.toFixed(1)})</span>
                          <span className="ml-2">
                            Size: {op.width.toFixed(1)}" x {op.height.toFixed(1)}
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
      )}
    </div>
  );
}
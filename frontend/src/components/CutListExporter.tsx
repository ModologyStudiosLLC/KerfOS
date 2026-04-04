"use client";
import React, { useState } from "react";
import { Cabinet, Material } from "./CabinetBuilder";

interface CutListExporterProps {
  cabinets: Cabinet[];
  materials: Record<string, { material: Material, quantity: number }>;
}

interface CutListResponse {
  cutList: {
    sheetNumber: number;
    width: number;
    height: number;
    cuts: {
      x: number;
      y: number;
      width: number;
      height: number;
      partName: string;
      partId: string;
    }[];
  }[];
  wastePercentage: number;
  totalSheets: number;
}

export default function CutListExporter({
  cabinets,
  materials
}: CutListExporterProps) {
  const [loading, setLoading] = useState(false);
  const [cutList, setCutList] = useState<CutListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateCutList = async () => {
    if (cabinets.length === 0) {
      setError("No cabinets to generate cut list");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // TODO: Update this URL when backend is deployed
      const response = await fetch("http://localhost:8000/api/cutlists/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ cabinets })
      });

      if (!response.ok) {
        throw new Error("Failed to generate cut list");
      }

      const data: CutListResponse = await response.json();
      setCutList(data);
    } catch (err) {
      setError("Could not generate cut list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!cutList) return;

    // Generate simple PDF using print window
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = generatePDFHTML(cutList, cabinets, materials);
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const downloadCSV = () => {
    if (!cutList) return;

    const csvContent = generateCSV(cutList, cabinets);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "cutlist.csv";
    link.click();
  };

  const downloadDXF = () => {
    if (!cutList) return;

    const dxfContent = generateDXF(cutList, cabinets);
    const blob = new Blob([dxfContent], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "cutlist.dxf";
    link.click();
  };

  const downloadGCode = async () => {
    if (!cutList) return;

    // Generate G-code from cut list
    try {
      const response = await fetch("http://localhost:8000/api/gcode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ cutList })
      });

      if (!response.ok) {
        throw new Error("Failed to generate G-code");
      }

      const data = await response.json();
      const gcodeContent = data.gcode;

      const blob = new Blob([gcodeContent], { type: "text/plain;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "cabinet_parts.nc"; // .nc is common for G-code
      link.click();
    } catch (err) {
      setError("Could not generate G-code. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Generate Button */}
      <button
        onClick={generateCutList}
        disabled={loading || cabinets.length === 0}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-600/30"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin mr-2">⚙️</span>
            Generating...
          </span>
        ) : (
          "Generate Optimized Cut List"
        )}
      </button>

      {error && (
        <div className="bg-red-900/20 border border-red-700 p-4 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {cutList && (
        <div className="space-y-3">
          {/* Summary */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <h3 className="font-semibold text-white mb-2">
              Cut List Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-sm">Total Sheets</p>
                <p className="text-2xl font-bold text-white">
                  {cutList.totalSheets}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Waste</p>
                <p className={`text-2xl font-bold ${
                  cutList.wastePercentage < 15
                    ? "text-green-400"
                    : cutList.wastePercentage < 25
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}>
                  {cutList.wastePercentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-2">
            <button
              onClick={downloadPDF}
              className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              <span className="mr-2">📄</span>
              Download PDF
            </button>
            <button
              onClick={downloadCSV}
              className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              <span className="mr-2">📊</span>
              Download CSV
            </button>
            <button
              onClick={downloadDXF}
              className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              <span className="mr-2">📐</span>
              Download DXF (for CNC)
            </button>
            <button
              onClick={downloadGCode}
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              <span className="mr-2">⚙️</span>
              Download G-code (for CNC)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function generatePDFHTML(
  cutList: CutListResponse,
  cabinets: Cabinet[],
  materials: Record<string, { material: Material, quantity: number }>
): string {
  const materialList = Object.entries(materials)
    .map(([id, { material, quantity }]) => ({
      material,
      quantity,
      cost: quantity * (material.pricePerSqFt ?? material.price ?? 0)
    }));
  const totalCost = materialList.reduce((sum, { cost }) => sum + cost, 0);

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Modology Cut List</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { color: #333; }
    h2 { color: #555; margin-top: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f5f5f5; }
    .summary { background: #e7f3e7; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .sheet { page-break-after: always; margin: 20px 0; border: 2px solid #333; }
    .cut { border: 1px dashed #666; position: absolute; }
    .good { color: #22c55e; }
    .warning { color: #f59e0b; }
    .bad { color: #ef4444; }
  </style>
</head>
<body>
  <h1>Modology Cabinet Cut List</h1>
  <p>Generated: ${new Date().toLocaleDateString()}</p>

  <div class="summary">
    <h2>Summary</h2>
    <p><strong>Total Sheets:</strong> ${cutList.totalSheets}</p>
    <p><strong>Waste:</strong> 
      <span class="${
        cutList.wastePercentage < 15
          ? 'good'
          : cutList.wastePercentage < 25
          ? 'warning'
          : 'bad'
      }">
        ${cutList.wastePercentage.toFixed(1)}%
      </span>
    </p>
    <p><strong>Estimated Cost:</strong> $${totalCost.toFixed(2)}</p>
  </div>

  <h2>Cabinets (${cabinets.length})</h2>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Dimensions</th>
        <th>Components</th>
      </tr>
    </thead>
    <tbody>
      ${cabinets.map(c => `
        <tr>
          <td>${c.name}</td>
          <td>${c.width}"W × ${c.height}"H × ${c.depth}"D</td>
          <td>${(c.components ?? []).length} parts</td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <h2>Material Requirements</h2>
  <table>
    <thead>
      <tr>
        <th>Material</th>
        <th>Quantity</th>
        <th>Cost</th>
      </tr>
    </thead>
    <tbody>
      ${materialList.map(({ material, quantity, cost }) => `
        <tr>
          <td>${material.name} (${material.thickness}")</td>
          <td>${quantity} sq ft</td>
          <td>$${cost.toFixed(2)}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <h2>Cut Sheets (${cutList.cutList.length})</h2>
  ${cutList.cutList.map((sheet, index) => `
    <div class="sheet">
      <h3>Sheet ${index + 1} (${sheet.width}" × ${sheet.height}")</h3>
      <div style="position: relative; width: 100%; height: 600px; border: 1px solid #ccc;">
        ${sheet.cuts.map((cut, i) => `
          <div class="cut"
               style="left: ${(cut.x / sheet.width) * 100}%;
                       top: ${(cut.y / sheet.height) * 100}%;
                       width: ${(cut.width / sheet.width) * 100}%;
                       height: ${(cut.height / sheet.height) * 100}%;">
            ${i + 1}: ${cut.partName}
          </div>
        `).join("")}
      </div>
    </div>
  `).join("")}

</body>
</html>
`;
}

function generateCSV(cutList: CutListResponse, cabinets: Cabinet[]): string {
  let csv = "Sheet,Part,X Position,Y Position,Width,Height,Material\n";
  cutList.cutList.forEach((sheet, sheetIndex) => {
    sheet.cuts.forEach((cut, cutIndex) => {
      csv += `${sheetIndex + 1},${cutIndex + 1},${cut.x.toFixed(2)},${cut.y.toFixed(2)},${cut.width.toFixed(2)},${cut.height.toFixed(2)},${cut.partName}\n`;
    });
  });

  // Add summary
  csv += `\nTotal Sheets,${cutList.totalSheets}\n`;
  csv += `Waste Percentage,${cutList.wastePercentage.toFixed(1)}%\n`;
  csv += `Total Cabinets,${cabinets.length}\n`;

  return csv;
}

function generateDXF(cutList: CutListResponse, cabinets: Cabinet[]): string {
  // Basic DXF file format for CNC machines
  let dxf = "0\nSECTION\n2\nHEADER\n";
  dxf += "9\n$ACADVER\n1\nAC1015\n";
  dxf += "0\nENDSEC\n";

  // Add ENTITIES section
  dxf += "0\nSECTION\n2\nENTITIES\n";

  cutList.cutList.forEach((sheet, sheetIndex) => {
    sheet.cuts.forEach((cut, cutIndex) => {
      // Create LWPOLYLINE for each cut
      dxf += "0\nLWPOLYLINE\n";
      dxf += "8\n0\n"; // Layer

      // First point
      dxf += `10\n${cut.x.toFixed(4)}\n`; // X
      dxf += `20\n${cut.y.toFixed(4)}\n`; // Y

      // Second point
      dxf += `11\n${(cut.x + cut.width).toFixed(4)}\n`; // X
      dxf += `21\n${cut.y.toFixed(4)}\n`; // Y

      // Third point
      dxf += `12\n${(cut.x + cut.width).toFixed(4)}\n`; // X
      dxf += `22\n${(cut.y + cut.height).toFixed(4)}\n`; // Y

      // Fourth point
      dxf += `13\n${cut.x.toFixed(4)}\n`; // X
      dxf += `23\n${(cut.y + cut.height).toFixed(4)}\n`; // Y

      // Close polyline
      dxf += "70\n1\n"; // Closed flag
      dxf += "0\nSEQEND\n";
    });
  });

  dxf += "0\nENDSEC\n";
  dxf += "0\nEOF\n";

  return dxf;
}

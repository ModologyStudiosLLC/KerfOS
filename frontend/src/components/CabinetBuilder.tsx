"use client";

import React, { useState } from "react";
import CabinetPreview from "./CabinetPreview";
import MaterialSelector from "./MaterialSelector";
import DimensionEditor from "./DimensionEditor";
import CutListExporter from "./CutListExporter";
import CabinetForm from "./CabinetForm";
import DesignExporter from "./DesignExporter";
import DesignAssistant from "./DesignAssistant";

export interface Cabinet {
  id: string;
  name: string;
  width: number;
  height: number;
  depth: number;
  materialId: string;
  components: CabinetComponent[];
}

export interface CabinetComponent {
  id: string;
  name: string;
  width: number;
  height: number;
  quantity: number;
  materialId: string;
}

export interface Material {
  id: string;
  name: string;
  type: "plywood" | "mdf" | "hardwood";
  thickness: number;
  pricePerSqFt: number;
  supplier: string;
}

export default function CabinetBuilder() {
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [selectedCabinet, setSelectedCabinet] = useState<Cabinet | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [showAssistant, setShowAssistant] = useState(false);

  const handleAddCabinet = (cabinet: Cabinet) => {
    setCabinets([...cabinets, cabinet]);
    setSelectedCabinet(cabinet);
    setShowAssistant(false); // Close assistant when cabinet is added
  };

  const handleUpdateCabinet = (id: string, updatedCabinet: Partial<Cabinet>) => {
    setCabinets(cabinets.map(c => 
      c.id === id ? { ...c, ...updatedCabinet } : c
    ));
    if (selectedCabinet?.id === id) {
      setSelectedCabinet({ ...selectedCabinet, ...updatedCabinet });
    }
  };

  const handleDeleteCabinet = (id: string) => {
    setCabinets(cabinets.filter(c => c.id !== id));
    if (selectedCabinet?.id === id) {
      setSelectedCabinet(null);
    }
  };

  const totalMaterials = calculateTotalMaterials(cabinets);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Cabinet Designer
          </h1>
          <p className="text-slate-300">
            Design cabinets, generate cut lists, and prepare for CNC fabrication
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Builder Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Design Assistant Toggle */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">
                Design Assistant
              </h2>
              <button
                type="button"
                onClick={() => setShowAssistant(!showAssistant)}
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  showAssistant
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                {showAssistant ? '🤖 Hide Assistant' : '🤖 Show Assistant'}
              </button>
            </div>

            {/* Design Assistant Panel */}
            {showAssistant && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <DesignAssistant
                  cabinets={cabinets}
                  onAddCabinet={handleAddCabinet}
                  onUpdateCabinet={handleUpdateCabinet}
                  onCabinetSelect={(id) => {
                    const cabinet = cabinets.find(c => c.id === id);
                    if (cabinet) setSelectedCabinet(cabinet);
                  }}
                />
              </div>
            )}

            {/* Add New Cabinet */}
            {!showAssistant && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Add Cabinet
                </h2>
                <CabinetForm onAdd={handleAddCabinet} />
              </div>
            )}

            {/* Material Selection */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">
                Materials
              </h2>
              <MaterialSelector 
                selected={selectedMaterial}
                onSelect={setSelectedMaterial}
              />
            </div>

            {/* Export Options */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">
                Export
              </h2>
              <CutListExporter 
                cabinets={cabinets}
                materials={totalMaterials}
              />
              {selectedCabinet && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <DesignExporter cabinet={selectedCabinet} />
                </div>
              )}
            </div>
          </div>

          {/* Middle Column: 3D Preview */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 sticky top-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                3D Preview
              </h2>
              {selectedCabinet ? (
                <CabinetPreview 
                  cabinet={selectedCabinet}
                  material={selectedMaterial}
                />
              ) : (
                <div className="h-96 flex items-center justify-center text-slate-400">
                  <p>Select a cabinet to see 3D preview</p>
                </div>
              )}
            </div>


            {/* Cabinet List */}
            <div className="mt-6 bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">
                Cabinets ({cabinets.length})
              </h2>
              <div className="space-y-3">
                {cabinets.map(cabinet => (
                  <div 
                    key={cabinet.id}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedCabinet?.id === cabinet.id
                        ? 'bg-blue-600/20 border-blue-500'
                        : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">
                        {cabinet.name}
                      </h3>
                      <button
                        onClick={() => handleDeleteCabinet(cabinet.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-slate-400 text-sm">
                      {cabinet.width}"W × {cabinet.height}"H × {cabinet.depth}"D
                    </p>
                    <button
                      onClick={() => setSelectedCabinet(cabinet)}
                      className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
                    >
                      {selectedCabinet?.id === cabinet.id ? "Selected" : "Select"}
                    </button>
                  </div>
                ))}
                {cabinets.length === 0 && (
                  <p className="text-slate-400 text-center py-8">
                    No cabinets yet. Add your first cabinet above!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateTotalMaterials(cabinets: Cabinet[]): Record<string, { material: Material, quantity: number }> {
  const materials: Record<string, { material: Material, quantity: number }> = {};
  
  cabinets.forEach(cabinet => {
    cabinet.components.forEach(component => {
      const key = component.materialId;
      if (!materials[key]) {
        materials[key] = { material: {} as Material, quantity: 0 };
      }
      materials[key].quantity += component.quantity;
    });
  });
  
  return materials;
}

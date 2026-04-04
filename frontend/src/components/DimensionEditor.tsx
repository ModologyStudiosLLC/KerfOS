"use client";

import React, { useState } from "react";
import { Cabinet, CabinetComponent } from "./CabinetBuilder";

interface DimensionEditorProps {
  cabinet: Cabinet;
  onUpdate: (componentId: string, updates: Partial<CabinetComponent>) => void;
  onDelete: (componentId: string) => void;
  onAddComponent: (component: CabinetComponent) => void;
}

export default function DimensionEditor({
  cabinet,
  onUpdate,
  onDelete,
  onAddComponent
}: DimensionEditorProps) {
  const [newComponent, setNewComponent] = useState({
    name: "",
    width: 12,
    height: 12,
    quantity: 1,
    materialId: cabinet.materialId
  });

  const handleAdd = () => {
    if (!newComponent.name.trim()) {
      alert("Please enter a component name");
      return;
    }

    const component: CabinetComponent = {
      id: Date.now().toString(),
      ...newComponent
    };

    onAddComponent(component);
    setNewComponent({
      name: "",
      width: 12,
      height: 12,
      quantity: 1,
      materialId: cabinet.materialId
    });
  };

  return (
    <div className="space-y-6">
      {/* Component List */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">
          Components ({cabinet.components?.length})
        </h3>
        
        {cabinet.components?.length === 0 ? (
          <p className="text-slate-400 text-sm py-4 border border-dashed border-slate-700 rounded-lg">
            No components yet. Add your first component below.
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {cabinet.components?.map(component => (
              <div
                key={component.id}
                className="bg-slate-700/50 border border-slate-600 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <input
                      type="text"
                      value={component.name}
                      onChange={(e) => onUpdate(component.id, { name: e.target.value })}
                      className="bg-transparent text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                    />
                    <p className="text-slate-400 text-sm">
                      Qty: {component.quantity}
                    </p>
                  </div>
                  <button
                    onClick={() => onDelete(component.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                        Width (in)
                      </label>
                      <input
                        type="number"
                        value={component.width}
                        onChange={(e) => onUpdate(component.id, { width: parseFloat(e.target.value) || 0 })}
                        min="1"
                        max="96"
                        step="0.5"
                        className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                        Height (in)
                      </label>
                      <input
                        type="number"
                        value={component.height}
                        onChange={(e) => onUpdate(component.id, { height: parseFloat(e.target.value) || 0 })}
                        min="1"
                        max="96"
                        step="0.5"
                        className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                  </div>
                </div>

                <div className="mt-2">
                  <label className="block text-xs text-slate-400 mb-1">
                      Quantity
                    </label>
                  <input
                    type="number"
                    value={component.quantity}
                    onChange={(e) => onUpdate(component.id, { quantity: parseInt(e.target.value) || 1 })}
                    min="1"
                    max="100"
                    className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Component */}
      <div className="border-t border-slate-700 pt-4">
        <h3 className="text-lg font-semibold text-white mb-3">
          Add Component
        </h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-slate-300 mb-1">
                Component Name
              </label>
            <input
              type="text"
              value={newComponent.name}
              onChange={(e) => setNewComponent({ ...newComponent, name: e.target.value })}
              placeholder="e.g., Side Panel, Shelf, Door"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1">
                    Width (in)
                  </label>
                <input
                  type="number"
                  value={newComponent.width}
                  onChange={(e) => setNewComponent({ ...newComponent, width: parseFloat(e.target.value) || 0 })}
                  min="1"
                  max="96"
                  step="0.5"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                    Height (in)
                  </label>
                <input
                  type="number"
                  value={newComponent.height}
                  onChange={(e) => setNewComponent({ ...newComponent, height: parseFloat(e.target.value) || 0 })}
                  min="1"
                  max="96"
                  step="0.5"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                    Quantity
                  </label>
                <input
                  type="number"
                  value={newComponent.quantity}
                  onChange={(e) => setNewComponent({ ...newComponent, quantity: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">
                  Quick Presets
                </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNewComponent({
                  name: "Shelf",
                  width: cabinet.width - 1,
                  height: 12,
                  quantity: 1,
                  materialId: cabinet.materialId
                })}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
              >
                Shelf
              </button>
              <button
                type="button"
                onClick={() => setNewComponent({
                  name: "Side Panel",
                  width: cabinet.depth,
                  height: cabinet.height,
                  quantity: 2,
                  materialId: cabinet.materialId
                })}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
              >
                Side Panels (2)
              </button>
              <button
                type="button"
                onClick={() => setNewComponent({
                  name: "Top/Bottom",
                  width: cabinet.width - 1,
                  height: cabinet.depth,
                  quantity: 2,
                  materialId: cabinet.materialId
                })}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
              >
                Top/Bottom (2)
              </button>
              <button
                type="button"
                onClick={() => setNewComponent({
                  name: "Back Panel",
                  width: cabinet.width - 0.5,
                  height: cabinet.height - 0.5,
                  quantity: 1,
                  materialId: cabinet.materialId
                })}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
              >
                Back Panel
              </button>
              <button
                type="button"
                onClick={() => setNewComponent({
                  name: "Door Front",
                  width: cabinet.width - 0.125,
                  height: cabinet.height - 0.125,
                  quantity: 1,
                  materialId: cabinet.materialId
                })}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
              >
                Door Front
              </button>
              <button
                type="button"
                onClick={() => setNewComponent({
                  name: "Drawer Front",
                  width: cabinet.width - 1,
                  height: 6,
                  quantity: 1,
                  materialId: cabinet.materialId
                })}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
              >
                Drawer Front
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!newComponent.name.trim()}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-600/30"
          >
            Add Component
          </button>
        </div>
      </div>
    </div>
  );
}

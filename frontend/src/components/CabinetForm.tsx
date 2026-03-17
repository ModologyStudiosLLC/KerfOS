"use client";

import React, { useState } from "react";
import { Material } from "./CabinetBuilder";

interface CabinetFormProps {
  onAdd: (cabinet: {
    id: string;
    name: string;
    width: number;
    height: number;
    depth: number;
    materialId: string;
    components: {
      id: string;
      name: string;
      width: number;
      height: number;
      quantity: number;
      materialId: string;
    }[];
  }) => void;
}

export default function CabinetForm({ onAdd }: CabinetFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    width: 36,
    height: 72,
    depth: 24,
    materialId: "1"
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "width" || name === "height" || name === "depth"
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter a cabinet name");
      return;
    }

    const newCabinet = {
      id: Date.now().toString(),
      name: formData.name,
      width: formData.width,
      height: formData.height,
      depth: formData.depth,
      materialId: formData.materialId,
      components: generateDefaultComponents(formData)
    };

    onAdd(newCabinet);

    // Reset form
    setFormData(prev => ({
      ...prev,
      name: "",
      width: 36,
      height: 72,
      depth: 24
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Cabinet Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Kitchen Base Cabinet"
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Dimensions */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Width (in)
          </label>
          <input
            type="number"
            name="width"
            value={formData.width}
            onChange={handleChange}
            min="12"
            max="96"
            step="0.5"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Height (in)
          </label>
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleChange}
            min="12"
            max="96"
            step="0.5"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Depth (in)
          </label>
          <input
            type="number"
            name="depth"
            value={formData.depth}
            onChange={handleChange}
            min="12"
            max="48"
            step="0.5"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Material Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Material
        </label>
        <select
          name="materialId"
          value={formData.materialId}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="1">Birch Plywood (0.75")</option>
          <option value="2">Oak MDF (0.75")</option>
          <option value="3">Red Oak Hardwood (1.0")</option>
          <option value="4">Maple Plywood (0.5")</option>
          <option value="5">Cherry Hardwood (1.0")</option>
        </select>
      </div>

      {/* Preset Options */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Quick Presets
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setFormData(prev => ({
              ...prev,
              name: "",
              width: 36,
              height: 34.5,
              depth: 24
            }))}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
          >
            Base Cabinet (36"×34.5"×24")
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({
              ...prev,
              name: "",
              width: 36,
              height: 12,
              depth: 12
            }))}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
          >
            Wall Cabinet (36"×12"×12")
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({
              ...prev,
              name: "",
              width: 36,
              height: 72,
              depth: 24
            }))}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
          >
            Tall Cabinet (36"×72"×24")
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({
              ...prev,
              name: "",
              width: 48,
              height: 34.5,
              depth: 24
            }))}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
          >
            Wide Base (48"×34.5"×24")
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-600/30"
      >
        Add Cabinet
      </button>
    </form>
  );
}

function generateDefaultComponents(formData: {
  name: string;
  width: number;
  height: number;
  depth: number;
  materialId: string;
}) {
  // Generate basic cabinet components
  return [
    {
      id: `${Date.now()}-carcass`,
      name: `${formData.name || "Cabinet"} Carcass`,
      width: formData.width,
      height: formData.height,
      quantity: 4, // 2 sides, top, bottom
      materialId: formData.materialId
    },
    {
      id: `${Date.now()}-back`,
      name: `${formData.name || "Cabinet"} Back Panel`,
      width: formData.width,
      height: formData.height,
      quantity: 1,
      materialId: formData.materialId
    }
  ];
}

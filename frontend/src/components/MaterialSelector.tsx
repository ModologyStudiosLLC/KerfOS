"use client";

import React, { useEffect, useState } from "react";
import { Material } from "./CabinetBuilder";

interface MaterialSelectorProps {
  selected: Material | null;
  onSelect: (material: Material) => void;
}

interface MaterialResponse {
  materials: Material[];
}

export default function MaterialSelector({ selected, onSelect }: MaterialSelectorProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Update this URL when backend is deployed
      const response = await fetch("http://localhost:8000/api/materials");
      
      if (!response.ok) {
        throw new Error("Failed to fetch materials");
      }

      const data: MaterialResponse = await response.json();
      setMaterials(data.materials || []);
    } catch (err) {
      setError("Could not load materials. Using defaults.");
      // Use default materials as fallback
      setMaterials(getDefaultMaterials());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500">
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-700 p-4 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
          <button
            onClick={fetchMaterials}
            className="mt-2 text-sm text-red-400 hover:text-red-300"
          >
            Retry
          </button>
        </div>
      ) : materials.length === 0 ? (
        <p className="text-slate-400 text-center py-4">No materials available</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {materials.map((material) => (
            <button
              key={material.id}
              onClick={() => onSelect(material)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                selected?.id === material.id
                  ? "bg-blue-600/20 border-blue-500"
                  : "bg-slate-700/50 border-slate-600 hover:border-slate-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">
                    {material.name}
                  </h3>
                  <p className="text-sm text-slate-300">
                    {material.type} • {material.thickness}" thick
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">
                    ${material.pricePerSqFt.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-400">/sq ft</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Supplier: {material.supplier}
              </p>
            </button>
          ))}
        </div>
      )}

      <div className="pt-2 border-t border-slate-700">
        <button
          onClick={fetchMaterials}
          className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
        >
          Refresh Materials
        </button>
      </div>
    </div>
  );
}

function getDefaultMaterials(): Material[] {
  return [
    {
      id: "1",
      name: "Birch Plywood",
      type: "plywood",
      thickness: 0.75,
      pricePerSqFt: 2.50,
      supplier: "Home Depot"
    },
    {
      id: "2",
      name: "Oak MDF",
      type: "mdf",
      thickness: 0.75,
      pricePerSqFt: 1.75,
      supplier: "Lowe's"
    },
    {
      id: "3",
      name: "Red Oak Hardwood",
      type: "hardwood",
      thickness: 1.0,
      pricePerSqFt: 4.50,
      supplier: "Woodcraft"
    },
    {
      id: "4",
      name: "Maple Plywood",
      type: "plywood",
      thickness: 0.5,
      pricePerSqFt: 2.00,
      supplier: "Home Depot"
    },
    {
      id: "5",
      name: "Cherry Hardwood",
      type: "hardwood",
      thickness: 1.0,
      pricePerSqFt: 6.00,
      supplier: "Rockler"
    }
  ];
}

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UnitSystem,
  UnitPreferences,
  formatMeasurement,
  parseMeasurement,
  fromInches,
  toInches,
  ImperialUnit,
  MetricUnit,
} from './units';

// Default preferences
const DEFAULT_PREFERENCES: UnitPreferences = {
  system: 'imperial',
  imperialDisplay: 'in-fraction',
  metricDisplay: 'mm',
  showFractions: true,
  fractionDenominator: 16,
};

// Storage key for persisting preferences
const STORAGE_KEY = 'modology-unit-preferences';

// Context type
interface UnitContextType {
  preferences: UnitPreferences;
  setPreferences: (prefs: Partial<UnitPreferences>) => void;
  setSystem: (system: UnitSystem) => void;
  toggleSystem: () => void;
  format: (valueInInches: number) => string;
  parse: (input: string) => number;
  convert: (value: number, from: ImperialUnit | MetricUnit, to: ImperialUnit | MetricUnit) => number;
  toDisplayUnit: (valueInInches: number) => { value: number; unit: string };
  fromDisplayUnit: (value: number, unit: string) => number;
}

// Create context
const UnitContext = createContext<UnitContextType | undefined>(undefined);

// Provider component
interface UnitProviderProps {
  children: ReactNode;
  initialPreferences?: Partial<UnitPreferences>;
}

export function UnitProvider({ children, initialPreferences }: UnitProviderProps) {
  // Initialize from localStorage or defaults
  const [preferences, setPreferencesState] = useState<UnitPreferences>(() => {
    if (typeof window === 'undefined') {
      return { ...DEFAULT_PREFERENCES, ...initialPreferences };
    }
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_PREFERENCES, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load unit preferences:', e);
    }
    
    return { ...DEFAULT_PREFERENCES, ...initialPreferences };
  });

  // Persist to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      } catch (e) {
        console.error('Failed to save unit preferences:', e);
      }
    }
  }, [preferences]);

  // Update preferences
  const setPreferences = (prefs: Partial<UnitPreferences>) => {
    setPreferencesState(prev => ({ ...prev, ...prefs }));
  };

  // Set the unit system
  const setSystem = (system: UnitSystem) => {
    setPreferencesState(prev => ({ ...prev, system }));
  };

  // Toggle between imperial and metric
  const toggleSystem = () => {
    setPreferencesState(prev => ({
      ...prev,
      system: prev.system === 'imperial' ? 'metric' : 'imperial',
    }));
  };

  // Format a value for display
  const format = (valueInInches: number): string => {
    return formatMeasurement(valueInInches, preferences);
  };

  // Parse user input to inches
  const parse = (input: string): number => {
    return parseMeasurement(input, preferences.system);
  };

  // Convert between any units
  const convert = (
    value: number,
    from: ImperialUnit | MetricUnit,
    to: ImperialUnit | MetricUnit
  ): number => {
    const inches = toInches(value, from);
    return fromInches(inches, to);
  };

  // Convert inches to current display unit
  const toDisplayUnit = (valueInInches: number): { value: number; unit: string } => {
    if (preferences.system === 'imperial') {
      if (preferences.imperialDisplay === 'ft') {
        return { value: fromInches(valueInInches, 'ft'), unit: 'ft' };
      }
      return { value: valueInInches, unit: 'in' };
    } else {
      return {
        value: fromInches(valueInInches, preferences.metricDisplay),
        unit: preferences.metricDisplay,
      };
    }
  };

  // Convert from display unit to inches
  const fromDisplayUnit = (value: number, unit: string): number => {
    return toInches(value, unit as ImperialUnit | MetricUnit);
  };

  const value: UnitContextType = {
    preferences,
    setPreferences,
    setSystem,
    toggleSystem,
    format,
    parse,
    convert,
    toDisplayUnit,
    fromDisplayUnit,
  };

  return <UnitContext.Provider value={value}>{children}</UnitContext.Provider>;
}

// Hook to use unit context
export function useUnits(): UnitContextType {
  const context = useContext(UnitContext);
  if (context === undefined) {
    throw new Error('useUnits must be used within a UnitProvider');
  }
  return context;
}

// Unit toggle button component
export function UnitToggleButton({ className = '' }: { className?: string }) {
  const { preferences, toggleSystem } = useUnits();

  return (
    <button
      onClick={toggleSystem}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg
        bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium
        transition-colors duration-200
        ${className}
      `}
      title={`Switch to ${preferences.system === 'imperial' ? 'Metric' : 'Imperial'} units`}
    >
      <span className="text-lg">
        {preferences.system === 'imperial' ? '📏' : '📐'}
      </span>
      <span>
        {preferences.system === 'imperial' ? 'Imperial (in)' : 'Metric (mm)'}
      </span>
      <span className="text-slate-400 ml-1">↔</span>
    </button>
  );
}

// Unit display component
interface UnitDisplayProps {
  value: number;
  className?: string;
  showUnit?: boolean;
}

export function UnitDisplay({ value, className = '', showUnit = true }: UnitDisplayProps) {
  const { format, preferences } = useUnits();

  return (
    <span className={className}>
      {format(value)}
      {showUnit && preferences.system === 'metric' && (
        <span className="text-slate-400 ml-1">
          {preferences.metricDisplay}
        </span>
      )}
    </span>
  );
}

// Unit input component
interface UnitInputProps {
  value: number; // Always stored in inches internally
  onChange: (valueInInches: number) => void;
  label?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export function UnitInput({
  value,
  onChange,
  label,
  className = '',
  placeholder = '',
  disabled = false,
  min,
  max,
  step = 0.0625, // 1/16" default
}: UnitInputProps) {
  const { format, parse, preferences, toDisplayUnit, fromDisplayUnit } = useUnits();

  // Get display value and unit
  const { value: displayValue, unit } = toDisplayUnit(value);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Try to parse the input
    if (preferences.system === 'imperial') {
      // Allow fraction input like "12 1/2"
      const parsed = parse(inputValue);
      if (!isNaN(parsed)) {
        onChange(parsed);
      }
    } else {
      // Metric - just parse the number
      const numValue = parseFloat(inputValue);
      if (!isNaN(numValue)) {
        const inches = fromDisplayUnit(numValue, unit);
        onChange(inches);
      }
    }
  };

  // Determine step based on unit system
  const actualStep = preferences.system === 'metric' ? 1 : step;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm text-slate-400">{label}</label>
      )}
      <div className="relative">
        <input
          type="text"
          value={preferences.system === 'imperial' ? format(value).replace('"', '') : displayValue.toFixed(1)}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 pr-10
            bg-slate-800 border border-slate-600 rounded-lg
            text-white placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
          {preferences.system === 'imperial' ? '"' : unit}
        </span>
      </div>
    </div>
  );
}

// Export the context for direct use if needed
export { UnitContext };

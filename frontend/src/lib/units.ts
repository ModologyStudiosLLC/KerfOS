/**
 * Unit Conversion Utilities for Modology Cabinet Designer
 * 
 * Supports both Imperial (inches, feet) and Metric (mm, cm, m) units.
 * All internal calculations are done in inches, with conversion at display time.
 */

export type UnitSystem = 'imperial' | 'metric';

export type ImperialUnit = 'in' | 'ft' | 'in-fraction';
export type MetricUnit = 'mm' | 'cm' | 'm';

export interface UnitPreferences {
  system: UnitSystem;
  imperialDisplay: ImperialUnit;
  metricDisplay: MetricUnit;
  showFractions: boolean;
  fractionDenominator: 16 | 32 | 64; // Common woodworking denominators
}

// Conversion constants
const MM_PER_INCH = 25.4;
const CM_PER_INCH = 2.54;
const M_PER_INCH = 0.0254;
const INCHES_PER_FOOT = 12;

/**
 * Convert a value from inches to another unit
 */
export function fromInches(value: number, unit: ImperialUnit | MetricUnit): number {
  switch (unit) {
    case 'in':
      return value;
    case 'ft':
      return value / INCHES_PER_FOOT;
    case 'in-fraction':
      return value; // Handled separately by formatFraction
    case 'mm':
      return value * MM_PER_INCH;
    case 'cm':
      return value * CM_PER_INCH;
    case 'm':
      return value * M_PER_INCH;
    default:
      return value;
  }
}

/**
 * Convert a value to inches from another unit
 */
export function toInches(value: number, unit: ImperialUnit | MetricUnit): number {
  switch (unit) {
    case 'in':
    case 'in-fraction':
      return value;
    case 'ft':
      return value * INCHES_PER_FOOT;
    case 'mm':
      return value / MM_PER_INCH;
    case 'cm':
      return value / CM_PER_INCH;
    case 'm':
      return value / M_PER_INCH;
    default:
      return value;
  }
}

/**
 * Convert between any two units
 */
export function convertUnit(
  value: number,
  fromUnit: ImperialUnit | MetricUnit,
  toUnit: ImperialUnit | MetricUnit
): number {
  const inches = toInches(value, fromUnit);
  return fromInches(inches, toUnit);
}

/**
 * Format a decimal as a fraction (e.g., 3.5 -> "3 1/2")
 */
export function formatFraction(
  decimal: number,
  denominator: 16 | 32 | 64 = 16,
  maxDenominator?: number
): string {
  // Handle negative numbers
  const sign = decimal < 0 ? '-' : '';
  const absValue = Math.abs(decimal);
  
  // Get whole number part
  const whole = Math.floor(absValue);
  const remainder = absValue - whole;
  
  // Find closest fraction
  const actualDenom = maxDenominator || denominator;
  const numerator = Math.round(remainder * actualDenom);
  
  if (numerator === 0) {
    return sign + (whole > 0 ? whole.toString() : '0');
  }
  
  if (numerator === actualDenom) {
    return sign + (whole + 1).toString();
  }
  
  // Simplify fraction
  const gcd = greatestCommonDivisor(numerator, actualDenom);
  const simplifiedNum = numerator / gcd;
  const simplifiedDenom = actualDenom / gcd;
  
  if (whole > 0) {
    return `${sign}${whole} ${simplifiedNum}/${simplifiedDenom}`;
  }
  return `${sign}${simplifiedNum}/${simplifiedDenom}`;
}

/**
 * Calculate greatest common divisor
 */
function greatestCommonDivisor(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

/**
 * Parse a fraction string to decimal (e.g., "3 1/2" -> 3.5)
 */
export function parseFraction(fraction: string): number {
  // Handle simple decimal
  if (!fraction.includes('/') && !fraction.includes(' ')) {
    return parseFloat(fraction) || 0;
  }
  
  let result = 0;
  
  // Split on space for whole number
  const parts = fraction.trim().split(' ');
  
  if (parts.length === 2) {
    // Has whole number part
    result = parseFloat(parts[0]) || 0;
    const fracPart = parts[1];
    const [num, denom] = fracPart.split('/').map(Number);
    if (denom && !isNaN(num)) {
      result += num / denom;
    }
  } else if (parts.length === 1) {
    // Just fraction
    const [num, denom] = parts[0].split('/').map(Number);
    if (denom && !isNaN(num)) {
      result = num / denom;
    }
  }
  
  return result;
}

/**
 * Format a measurement for display based on preferences
 */
export function formatMeasurement(
  valueInInches: number,
  prefs: UnitPreferences
): string {
  if (prefs.system === 'imperial') {
    if (prefs.showFractions || prefs.imperialDisplay === 'in-fraction') {
      const formatted = formatFraction(valueInInches, prefs.fractionDenominator);
      return `${formatted}"`;
    } else if (prefs.imperialDisplay === 'ft') {
      const feet = Math.floor(valueInInches / INCHES_PER_FOOT);
      const inches = valueInInches % INCHES_PER_FOOT;
      if (feet > 0 && inches > 0) {
        return `${feet}' ${inches.toFixed(1)}"`;
      } else if (feet > 0) {
        return `${feet}'`;
      }
      return `${inches.toFixed(2)}"`;
    } else {
      return `${valueInInches.toFixed(2)}"`;
    }
  } else {
    // Metric
    const converted = fromInches(valueInInches, prefs.metricDisplay);
    return `${converted.toFixed(1)} ${prefs.metricDisplay}`;
  }
}

/**
 * Parse a user input string to inches
 * Supports formats: "12", "12.5", "12 1/2", "1ft 6in", "450mm", "45cm"
 */
export function parseMeasurement(input: string, defaultUnit: UnitSystem = 'imperial'): number {
  const trimmed = input.trim().toLowerCase();
  
  // Check for explicit metric units
  if (trimmed.endsWith('mm')) {
    return toInches(parseFloat(trimmed), 'mm');
  }
  if (trimmed.endsWith('cm')) {
    return toInches(parseFloat(trimmed), 'cm');
  }
  if (trimmed.endsWith('m') && !trimmed.includes('mm') && !trimmed.includes('cm')) {
    return toInches(parseFloat(trimmed), 'm');
  }
  
  // Check for feet notation (e.g., "1'6" or "1ft 6in")
  const feetMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*(?:'|ft|feet)/);
  const inchesMatch = trimmed.match(/(\d+(?:[\s/]\d+\/\d+)?)\s*(?:"|in|inches)?$/);
  
  if (feetMatch) {
    let totalInches = toInches(parseFloat(feetMatch[1]), 'ft');
    if (inchesMatch && !feetMatch[0].includes(inchesMatch[1])) {
      totalInches += parseFraction(inchesMatch[1]);
    }
    return totalInches;
  }
  
  // Just inches (possibly with fraction)
  if (inchesMatch) {
    return parseFraction(inchesMatch[1]);
  }
  
  // Plain number - use default unit
  const parsed = parseFloat(trimmed);
  if (!isNaN(parsed)) {
    if (defaultUnit === 'metric') {
      // Assume mm for metric
      return toInches(parsed, 'mm');
    }
    return parsed; // Inches
  }
  
  return 0;
}

/**
 * Common woodworking measurements as fractions
 */
export const COMMON_SIZES = {
  PLYWOOD_1_4: 0.25,      // 1/4" plywood
  PLYWOOD_1_2: 0.5,       // 1/2" plywood
  PLYWOOD_3_4: 0.75,      // 3/4" plywood (actually 23/32")
  PLYWOOD_23_32: 23/32,   // True 3/4" plywood
  PLYWOOD_5_8: 0.625,     // 5/8" plywood
  MDF_1_2: 0.5,           // 1/2" MDF
  MDF_3_4: 0.75,          // 3/4" MDF
  LUMBER_2X4: 1.5,        // Actual 2x4 dimension
  LUMBER_2X6: 5.5,        // Actual 2x6 dimension
  LUMBER_2X8: 7.25,       // Actual 2x8 dimension
  LUMBER_1X4: 3.5,        // Actual 1x4 dimension
  LUMBER_1X6: 5.5,        // Actual 1x6 dimension
};

/**
 * Get a human-readable label for a measurement
 */
export function getMeasurementLabel(
  valueInInches: number,
  prefs: UnitPreferences
): { short: string; long: string; withUnit: string } {
  const formatted = formatMeasurement(valueInInches, prefs);
  
  if (prefs.system === 'imperial') {
    const feet = Math.floor(valueInInches / INCHES_PER_FOOT);
    const inches = valueInInches % INCHES_PER_FOOT;
    
    if (feet > 0) {
      return {
        short: `${feet}'`,
        long: `${feet}' ${inches.toFixed(1)}"`,
        withUnit: formatted
      };
    }
    return {
      short: `${valueInInches.toFixed(1)}"`,
      long: `${valueInInches.toFixed(2)} inches`,
      withUnit: formatted
    };
  } else {
    const mm = fromInches(valueInInches, 'mm');
    const cm = fromInches(valueInInches, 'cm');
    const m = fromInches(valueInInches, 'm');
    
    if (m >= 1) {
      return {
        short: `${m.toFixed(2)}m`,
        long: `${m.toFixed(3)} meters`,
        withUnit: formatted
      };
    } else if (cm >= 10) {
      return {
        short: `${cm.toFixed(1)}cm`,
        long: `${cm.toFixed(1)} centimeters`,
        withUnit: formatted
      };
    }
    return {
      short: `${mm.toFixed(0)}mm`,
      long: `${mm.toFixed(0)} millimeters`,
      withUnit: formatted
    };
  }
}

/**
 * Calculate area in square feet from inches
 */
export function areaToSqFt(widthInches: number, heightInches: number): number {
  return (widthInches * heightInches) / 144;
}

/**
 * Calculate area in square meters from inches
 */
export function areaToSqM(widthInches: number, heightInches: number): number {
  const widthM = fromInches(widthInches, 'm');
  const heightM = fromInches(heightInches, 'm');
  return widthM * heightM;
}

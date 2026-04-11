"use client";

import { useEffect, useState, useRef } from "react";
import { Cabinet, CanvasComponent } from "../CabinetBuilder";

interface AIRailProps {
  cabinet: Cabinet;
  selectedComp: CanvasComponent | null;
}

interface Suggestion {
  text: string;
  severity: 'info' | 'warning' | 'tip';
}

// ─── Local rule engine (no API needed) ───────────────────────────────────────
function getRuleSuggestions(cabinet: Cabinet, comp: CanvasComponent | null): Suggestion[] {
  const tips: Suggestion[] = [];

  if (!comp) {
    // Cabinet-level tips
    if (cabinet.width > 36) {
      tips.push({ severity: 'warning', text: `At ${cabinet.width}", this cabinet is wide. Add a center divider to prevent top sag under load.` });
    }
    if (cabinet.depth > 26) {
      tips.push({ severity: 'info', text: `Depth of ${cabinet.depth}" is deeper than standard (24"). Verify your space allows for door swing and drawer pull-out.` });
    }
    if (cabinet.height > 84) {
      tips.push({ severity: 'warning', text: `At ${cabinet.height}" tall, secure this cabinet to wall studs at both top and mid-height.` });
    }
    if (tips.length === 0) {
      tips.push({ severity: 'tip', text: `${cabinet.width}"W × ${cabinet.height}"H × ${cabinet.depth}"D — dimensions look solid. Select a component for specific feedback.` });
    }
    return tips;
  }

  // Component-level tips
  const { type, width, height, depth } = comp;

  if (type === 'shelf') {
    if (width > 36) {
      tips.push({ severity: 'warning', text: `Shelf span of ${width}" will sag under load with 3/4" ply. Add a center support or use 1-1/8" material.` });
    } else if (width > 24) {
      tips.push({ severity: 'info', text: `${width}" shelf is manageable in 3/4" ply for light loads. Dado it into the sides for rigidity.` });
    } else {
      tips.push({ severity: 'tip', text: `${width}" shelf — solid span for 3/4" ply. No support needed.` });
    }
    if (depth < cabinet.depth - 3) {
      tips.push({ severity: 'info', text: `Shelf depth (${depth}") is ${cabinet.depth - depth}" shorter than the cabinet. Intentional setback?` });
    }
  }

  if (type === 'divider') {
    if (height < cabinet.height - 2) {
      tips.push({ severity: 'info', text: `Divider height (${height}") doesn't reach the full interior. It won't provide structural support across the full span.` });
    } else {
      tips.push({ severity: 'tip', text: `Full-height divider — good. Dadoing this into the top and bottom panels will prevent racking.` });
    }
  }

  if (type === 'door') {
    if (width > 24) {
      tips.push({ severity: 'warning', text: `Door width of ${width}" is heavy. Use 5-piece construction or add a middle rail to prevent warping.` });
    }
    if (height > 48) {
      tips.push({ severity: 'info', text: `Tall door (${height}"). Use 3 hinges minimum — top, bottom, and center.` });
    }
    if (tips.length === 0) {
      tips.push({ severity: 'tip', text: `Door at ${width}"W × ${height}"H — standard size. 2 hinges is fine.` });
    }
  }

  if (type === 'drawer') {
    if (width > 30) {
      tips.push({ severity: 'info', text: `Wide drawer at ${width}". Consider center-mount or dual undermount slides for stability.` });
    }
    if (height < 3) {
      tips.push({ severity: 'warning', text: `Drawer height of ${height}" is very short. Most drawer slides require at least 3" clearance.` });
    }
    if (tips.length === 0) {
      tips.push({ severity: 'tip', text: `${width}"W drawer — standard. Side-mount slides at 3/4 extension work well here.` });
    }
  }

  if (type === 'box') {
    tips.push({ severity: 'tip', text: `Cabinet box: ${width}"W × ${height}"H × ${depth}"D. Add shelves, doors, or drawers from the palette.` });
  }

  return tips;
}

const SEVERITY_COLOR = {
  warning: '#f59e0b',
  info: '#60a5fa',
  tip: 'rgba(232,201,154,0.7)',
};

const SEVERITY_ICON = {
  warning: '⚠',
  info: 'ℹ',
  tip: '→',
};

// ─── Component ────────────────────────────────────────────────────────────────
export function AIRail({ cabinet, selectedComp }: AIRailProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDismissed(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSuggestions(getRuleSuggestions(cabinet, selectedComp));
    }, 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [cabinet, selectedComp]);

  if (dismissed || suggestions.length === 0) return null;

  return (
    <div style={{
      marginTop: '8px',
      padding: '10px 12px',
      background: 'rgba(10,14,28,0.6)',
      border: '1px solid rgba(196,93,44,0.2)',
      borderRadius: '4px',
      position: 'relative',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '8px',
      }}>
        <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--k-canvas-text-muted)' }}>
          AI Rail
        </span>
        <button
          onClick={() => setDismissed(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--k-canvas-text-muted)', fontSize: '14px', lineHeight: 1, padding: '0 2px' }}
        >×</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {suggestions.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: '7px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '11px', color: SEVERITY_COLOR[s.severity], flexShrink: 0, marginTop: '1px' }}>
              {SEVERITY_ICON[s.severity]}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--k-canvas-text-muted)', lineHeight: 1.55 }}>
              {s.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { AIRail } from './canvas/AIRail'
import { runLocalDesignChecks } from '../lib/designDoctor'

const CabinetPreview = dynamic(() => import('./CabinetPreview'), { ssr: false })

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Material {
  id: number | string
  name: string
  price?: number
  thickness?: number
  type?: string
  pricePerSqFt?: number
  supplier?: string
}

export type ComponentType = 'box' | 'door' | 'drawer' | 'shelf' | 'divider' | 'toe-kick'

export interface CanvasComponent {
  id: string
  type: ComponentType
  name: string
  width: number   // inches
  height: number  // inches
  depth: number   // inches
  position: [number, number, number]  // inches from world origin
  material?: string
}

export interface Cabinet {
  id: number
  name: string
  width: number
  height: number
  depth: number
  material: string
  materialId?: string
  components?: CabinetComponent[]
}

// Legacy type used by DimensionEditor / CutListExporter
export interface CabinetComponent {
  id: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
  name: string
  width: number
  height: number
  depth?: number
  quantity?: number
  material?: string
  materialId?: string
}

type Snapshot   = { cabinet: Cabinet; components: CanvasComponent[] }
type ViewPreset = 'perspective' | 'front' | 'top' | 'side'

// ─── Data ────────────────────────────────────────────────────────────────────

const MATERIALS = [
  { id: 1, name: 'Birch Plywood',  price: 65.99, type: 'plywood',  thickness: 0.75 },
  { id: 2, name: 'MDF',            price: 42.50, type: 'mdf',      thickness: 0.75 },
  { id: 3, name: 'Oak Hardwood',   price: 89.99, type: 'hardwood', thickness: 0.75 },
]

let _uid = 1
const uid = () => `c-${++_uid}`

function defaultComponent(type: ComponentType, cab: Cabinet): CanvasComponent {
  switch (type) {
    case 'door':
      return { id: uid(), type, name: 'Door', width: cab.width - 1.5, height: cab.height - 1.5, depth: 0.75, position: [0, cab.height / 2, cab.depth / 2 + 0.5] }
    case 'drawer':
      return { id: uid(), type, name: 'Drawer', width: cab.width - 1.5, height: 6, depth: 0.75, position: [0, 6, cab.depth / 2 + 0.5] }
    case 'shelf':
      return { id: uid(), type, name: 'Shelf', width: cab.width - 1.5, height: 0.75, depth: cab.depth - 1.5, position: [0, cab.height / 2, 0] }
    case 'divider':
      return { id: uid(), type, name: 'Divider', width: 0.75, height: cab.height - 1.5, depth: cab.depth - 1.5, position: [0, cab.height / 2, 0] }
    case 'toe-kick':
      return { id: uid(), type, name: 'Toe Kick', width: cab.width, height: 4, depth: 0.75, position: [0, 2, -cab.depth / 2 + 0.375] }
    case 'box':
    default:
      return { id: uid(), type: 'box', name: 'Cabinet Box', width: cab.width, height: cab.height, depth: cab.depth, position: [0, cab.height / 2, 0] }
  }
}

// ─── Templates ───────────────────────────────────────────────────────────────

interface Template {
  id: string
  name: string
  desc: string
  dims: string
  cabinet: Cabinet
  buildComponents: (cab: Cabinet) => CanvasComponent[]
}

const TEMPLATES: Template[] = [
  {
    id: 'base',
    name: 'Base Cabinet',
    desc: 'Standard kitchen base with two adjustable shelves and toe kick',
    dims: '36" × 34½" × 24"',
    cabinet: { id: 1, name: 'Base Cabinet', width: 36, height: 34.5, depth: 24, material: 'Birch Plywood' },
    buildComponents: (cab) => [
      defaultComponent('box', cab),
      { id: uid(), type: 'shelf', name: 'Lower Shelf', width: cab.width - 1.5, height: 0.75, depth: cab.depth - 1.5, position: [0, 10, 0] },
      { id: uid(), type: 'shelf', name: 'Upper Shelf', width: cab.width - 1.5, height: 0.75, depth: cab.depth - 1.5, position: [0, 22, 0] },
      { id: uid(), type: 'toe-kick', name: 'Toe Kick', width: cab.width, height: 4, depth: 0.75, position: [0, 2, -(cab.depth / 2) + 0.375] },
    ],
  },
  {
    id: 'upper',
    name: 'Upper Cabinet',
    desc: 'Two-door wall-mount upper with center shelf',
    dims: '36" × 30" × 12"',
    cabinet: { id: 1, name: 'Upper Cabinet', width: 36, height: 30, depth: 12, material: 'Birch Plywood' },
    buildComponents: (cab) => [
      defaultComponent('box', cab),
      { id: uid(), type: 'shelf', name: 'Shelf', width: cab.width - 1.5, height: 0.75, depth: cab.depth - 1.5, position: [0, 14, 0] },
      { id: uid(), type: 'door', name: 'Left Door', width: (cab.width - 2.25) / 2, height: cab.height - 1.5, depth: 0.75, position: [-(cab.width - 2.25) / 4, cab.height / 2, cab.depth / 2 + 0.5] },
      { id: uid(), type: 'door', name: 'Right Door', width: (cab.width - 2.25) / 2, height: cab.height - 1.5, depth: 0.75, position: [(cab.width - 2.25) / 4, cab.height / 2, cab.depth / 2 + 0.5] },
    ],
  },
  {
    id: 'pantry',
    name: 'Pantry Cabinet',
    desc: 'Full-height pantry with five adjustable shelves',
    dims: '18" × 84" × 24"',
    cabinet: { id: 1, name: 'Pantry Cabinet', width: 18, height: 84, depth: 24, material: 'Birch Plywood' },
    buildComponents: (cab) => [
      defaultComponent('box', cab),
      ...[14, 28, 42, 56, 70].map((y, i) => ({
        id: uid(), type: 'shelf' as ComponentType, name: `Shelf ${i + 1}`,
        width: cab.width - 1.5, height: 0.75, depth: cab.depth - 1.5,
        position: [0, y, 0] as [number, number, number],
      })),
    ],
  },
  {
    id: 'blank',
    name: 'Blank Canvas',
    desc: 'Start with an empty box and build from scratch',
    dims: '36" × 34½" × 24"',
    cabinet: { id: 1, name: 'My Cabinet', width: 36, height: 34.5, depth: 24, material: 'Birch Plywood' },
    buildComponents: (cab) => [defaultComponent('box', cab)],
  },
]

// ─── Palette items ────────────────────────────────────────────────────────────

const PALETTE_ITEMS: { id: ComponentType; label: string; desc: string }[] = [
  { id: 'door',     label: 'Door',     desc: 'Face panel, overlay or inset' },
  { id: 'drawer',   label: 'Drawer',   desc: 'Drawer front or box' },
  { id: 'shelf',    label: 'Shelf',    desc: 'Adjustable horizontal panel' },
  { id: 'divider',  label: 'Divider',  desc: 'Vertical partition panel' },
  { id: 'toe-kick', label: 'Toe Kick', desc: '4" base strip' },
]

// ─── Palette icon ─────────────────────────────────────────────────────────────

function PaletteIcon({ type }: { type: ComponentType }) {
  const p = { width: 18, height: 18, viewBox: '0 0 18 18', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' }
  switch (type) {
    case 'box':      return <svg {...p}><rect x="1.5" y="1.5" width="15" height="15" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="4" y="4" width="10" height="10" rx="0.5" stroke="currentColor" strokeWidth="0.7" strokeOpacity="0.4"/></svg>
    case 'door':     return <svg {...p}><rect x="4" y="1" width="10" height="16" rx="1" stroke="currentColor" strokeWidth="1.3"/><circle cx="12" cy="9" r="0.9" fill="currentColor"/></svg>
    case 'drawer':   return <svg {...p}><rect x="1.5" y="5.5" width="15" height="7" rx="1" stroke="currentColor" strokeWidth="1.3"/><line x1="6" y1="9" x2="12" y2="9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
    case 'shelf':    return <svg {...p}><rect x="1.5" y="7" width="15" height="4" rx="0.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.3"/></svg>
    case 'divider':  return <svg {...p}><rect x="7" y="1.5" width="4" height="15" rx="0.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.3"/></svg>
    case 'toe-kick': return <svg {...p}><rect x="1.5" y="11.5" width="15" height="5" rx="0.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.3"/></svg>
    default:         return null
  }
}

// ─── Template schematic SVG ───────────────────────────────────────────────────

function TemplateSchematic({ id }: { id: string }) {
  const common = { width: 64, height: 64, viewBox: '0 0 64 64', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' }
  const stroke = '#c45d2c'
  const fill   = 'rgba(196,93,44,0.10)'
  switch (id) {
    case 'base': return (
      <svg {...common}>
        <rect x="8" y="8" width="48" height="46" rx="1" stroke={stroke} strokeWidth="1.2" fill={fill}/>
        <line x1="8" y1="20" x2="56" y2="20" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.5"/>
        <line x1="8" y1="34" x2="56" y2="34" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.5"/>
        <rect x="8" y="54" width="48" height="6" rx="0.5" fill="rgba(196,93,44,0.2)" stroke={stroke} strokeWidth="0.8"/>
      </svg>
    )
    case 'upper': return (
      <svg {...common}>
        <rect x="8" y="10" width="48" height="44" rx="1" stroke={stroke} strokeWidth="1.2" fill={fill}/>
        <line x1="32" y1="10" x2="32" y2="54" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.5"/>
        <line x1="8" y1="28" x2="56" y2="28" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.5"/>
      </svg>
    )
    case 'pantry': return (
      <svg {...common}>
        <rect x="18" y="4" width="28" height="56" rx="1" stroke={stroke} strokeWidth="1.2" fill={fill}/>
        {[14, 22, 30, 38, 46].map(y => (
          <line key={y} x1="18" y1={y} x2="46" y2={y} stroke={stroke} strokeWidth="0.8" strokeOpacity="0.5"/>
        ))}
      </svg>
    )
    case 'blank': return (
      <svg {...common}>
        <rect x="8" y="8" width="48" height="48" rx="1" stroke={stroke} strokeWidth="1.2" fill={fill} strokeDasharray="4 3"/>
      </svg>
    )
    default: return null
  }
}

// ─── Template Picker ──────────────────────────────────────────────────────────

function TemplatePicker({ onSelect }: { onSelect: (t: Template) => void }) {
  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', background: 'var(--k-canvas-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
      <div style={{ maxWidth: '640px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--k-canvas-accent)', marginBottom: '12px' }}>KerfOS Builder</div>
          <h1 style={{ fontFamily: 'var(--font-sora), Sora, sans-serif', fontSize: '26px', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--k-canvas-text)', marginBottom: '8px' }}>Start with a template</h1>
          <p style={{ fontSize: '13px', color: 'var(--k-canvas-text-muted)', lineHeight: 1.6 }}>Pick a starting point or build from scratch. You can change everything after.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => onSelect(t)}
              style={{ padding: '20px', background: 'var(--k-canvas-surface)', border: '1px solid var(--k-canvas-border)', borderRadius: '4px', cursor: 'pointer', textAlign: 'left', transition: 'border-color 150ms ease, background 150ms ease', display: 'flex', flexDirection: 'column', gap: '12px' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--k-canvas-accent)'; e.currentTarget.style.background = 'var(--k-canvas-surface-2)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--k-canvas-border)'; e.currentTarget.style.background = 'var(--k-canvas-surface)' }}
            >
              <TemplateSchematic id={t.id} />
              <div>
                <div style={{ fontFamily: 'var(--font-sora), Sora, sans-serif', fontSize: '14px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--k-canvas-text)', marginBottom: '3px' }}>{t.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--k-canvas-text-muted)', lineHeight: 1.5, marginBottom: '6px' }}>{t.desc}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '10px', color: 'var(--k-canvas-accent)', opacity: 0.8 }}>{t.dims}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = {
  shell: {
    display: 'flex', flexDirection: 'column' as const,
    height: 'calc(100vh - 60px)',
    background: 'var(--k-canvas-bg)', color: 'var(--k-canvas-text)',
    fontFamily: 'var(--font-inter), system-ui, sans-serif',
    overflow: 'hidden',
  },
  toolbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 12px', height: '44px', flexShrink: 0,
    borderBottom: '1px solid var(--k-canvas-border)',
    background: 'var(--k-canvas-surface)',
    gap: '8px',
  },
  toolbarLeft: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 },
  toolbarRight: { display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 },
  toolbarTitle: {
    fontFamily: 'var(--font-sora), Sora, sans-serif',
    fontSize: '13px', fontWeight: 600, letterSpacing: '-0.01em',
    color: 'var(--k-canvas-text)', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis',
  },
  tbBtn: {
    padding: '4px 10px', fontSize: '11px', fontWeight: 500,
    border: '1px solid var(--k-canvas-border)', background: 'transparent',
    color: 'var(--k-canvas-text-muted)', cursor: 'pointer', borderRadius: '3px',
    letterSpacing: '0.01em', whiteSpace: 'nowrap' as const,
  },
  tbBtnActive: {
    padding: '4px 10px', fontSize: '11px', fontWeight: 500,
    border: '1px solid var(--k-canvas-accent)', background: 'var(--k-canvas-accent-dim)',
    color: 'var(--k-canvas-accent)', cursor: 'pointer', borderRadius: '3px',
    letterSpacing: '0.01em', whiteSpace: 'nowrap' as const,
  },
  tbBtnPrimary: {
    padding: '4px 12px', fontSize: '11px', fontWeight: 600,
    border: '1px solid var(--k-canvas-accent)', background: 'var(--k-canvas-accent)',
    color: '#fff', cursor: 'pointer', borderRadius: '3px',
  },
  tbSep: { width: 1, height: 20, background: 'var(--k-canvas-border)', flexShrink: 0 },
  middle: { display: 'flex', flex: 1, overflow: 'hidden' },
  palette: {
    width: '220px', flexShrink: 0,
    borderRight: '1px solid var(--k-canvas-border)',
    background: 'var(--k-canvas-surface)',
    display: 'flex', flexDirection: 'column' as const, overflow: 'hidden',
  },
  paletteSection: {
    padding: '8px 14px', fontSize: '9px', fontWeight: 700,
    letterSpacing: '0.10em', textTransform: 'uppercase' as const,
    color: 'var(--k-canvas-text-muted)',
    borderBottom: '1px solid var(--k-canvas-border)',
    background: 'rgba(0,0,0,0.12)',
  },
  paletteDims: { padding: '10px 14px', borderBottom: '1px solid var(--k-canvas-border)' },
  paletteDimRow: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' },
  paletteDimLabel: { fontSize: '10px', fontWeight: 600, color: 'var(--k-canvas-text-muted)', width: '44px', flexShrink: 0 },
  paletteDimInput: {
    flex: 1, padding: '4px 7px', fontSize: '12px',
    background: 'var(--k-canvas-bg)', border: '1px solid var(--k-canvas-border)',
    color: 'var(--k-canvas-text)', borderRadius: '3px', outline: 'none',
  },
  paletteScrollArea: { flex: 1, overflowY: 'auto' as const },
  paletteItem: {
    padding: '9px 14px', cursor: 'pointer',
    borderBottom: '1px solid var(--k-canvas-border)',
    userSelect: 'none' as const,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    transition: 'background 100ms ease',
  },
  paletteItemLeft: { display: 'flex', alignItems: 'center', gap: '9px' },
  paletteItemLabel: { fontSize: '12px', color: 'var(--k-canvas-text)', lineHeight: 1.2 },
  paletteItemDesc: { fontSize: '10px', color: 'var(--k-canvas-text-muted)', lineHeight: 1.3, marginTop: '1px' },
  canvas: { flex: 1, overflow: 'hidden', position: 'relative' as const },
  panel: {
    width: '240px', flexShrink: 0,
    borderLeft: '1px solid var(--k-canvas-border)',
    background: 'var(--k-canvas-surface)',
    display: 'flex', flexDirection: 'column' as const, overflow: 'hidden',
  },
  panelHeader: {
    padding: '8px 14px', fontSize: '9px', fontWeight: 700,
    letterSpacing: '0.10em', textTransform: 'uppercase' as const,
    color: 'var(--k-canvas-text-muted)',
    borderBottom: '1px solid var(--k-canvas-border)',
    background: 'rgba(0,0,0,0.12)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  panelBody: { flex: 1, overflowY: 'auto' as const, padding: '14px' },
  fieldLabel: { fontSize: '10px', fontWeight: 600, color: 'var(--k-canvas-text-muted)', marginBottom: '4px', display: 'block', letterSpacing: '0.03em' },
  input: {
    width: '100%', padding: '5px 8px', fontSize: '12px',
    background: 'var(--k-canvas-bg)', border: '1px solid var(--k-canvas-border)',
    color: 'var(--k-canvas-text)', borderRadius: '3px', outline: 'none',
    marginBottom: '10px',
  },
  select: {
    width: '100%', padding: '5px 8px', fontSize: '12px',
    background: 'var(--k-canvas-bg)', border: '1px solid var(--k-canvas-border)',
    color: 'var(--k-canvas-text)', borderRadius: '3px', outline: 'none',
    marginBottom: '10px',
  },
  divider: { height: '1px', background: 'var(--k-canvas-border)', margin: '12px 0' },
  sectionLabel: {
    fontSize: '9px', fontWeight: 700, letterSpacing: '0.10em',
    textTransform: 'uppercase' as const,
    color: 'var(--k-canvas-text-muted)', marginBottom: '10px',
  },
  mutedText: { fontSize: '11px', color: 'var(--k-canvas-text-muted)', lineHeight: 1.55 },
  ghostBtn: {
    width: '100%', padding: '6px', fontSize: '11px', fontWeight: 500,
    background: 'transparent', border: '1px solid var(--k-canvas-border)',
    color: 'var(--k-canvas-text-muted)', cursor: 'pointer', borderRadius: '3px',
    marginTop: '6px',
  },
  deleteBtn: {
    width: '100%', padding: '6px', fontSize: '11px', fontWeight: 500,
    background: 'transparent', border: '1px solid rgba(196,93,44,0.3)',
    color: 'var(--k-canvas-accent)', cursor: 'pointer', borderRadius: '3px',
    marginTop: '6px',
  },
  bottomBar: {
    display: 'flex', alignItems: 'center', gap: '20px',
    padding: '0 16px', height: '36px', flexShrink: 0,
    borderTop: '1px solid var(--k-canvas-border)',
    background: 'var(--k-canvas-surface)', fontSize: '11px',
  },
  bottomStat: { display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--k-canvas-text-muted)', whiteSpace: 'nowrap' as const },
  bottomStatValue: { color: 'var(--k-canvas-text)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' as const },
  exportBtn: {
    marginLeft: 'auto', padding: '4px 14px', fontSize: '11px', fontWeight: 600,
    background: 'var(--k-canvas-accent)', color: '#fff',
    border: 'none', borderRadius: '3px', cursor: 'pointer', whiteSpace: 'nowrap' as const,
  },
}

// ─── Component list item ──────────────────────────────────────────────────────

function ComponentListItem({ comp, isSelected, onClick }: { comp: CanvasComponent; isSelected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px', borderRadius: '3px', cursor: 'pointer', marginBottom: '1px', background: isSelected ? 'var(--k-canvas-accent-dim)' : 'transparent', transition: 'background 100ms ease' }}
      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)' }}
      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
    >
      <span style={{ color: isSelected ? 'var(--k-canvas-accent)' : 'var(--k-canvas-text-muted)', display: 'flex', flexShrink: 0 }}><PaletteIcon type={comp.type} /></span>
      <span style={{ fontSize: '12px', color: isSelected ? 'var(--k-canvas-accent)' : 'var(--k-canvas-text)' }}>{comp.name}</span>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function CabinetBuilder() {
  const [showTemplates, setShowTemplates] = useState(true)

  const [cabinet, setCabinet] = useState<Cabinet>({
    id: 1, name: 'Base Cabinet', width: 36, height: 34.5, depth: 24, material: 'Birch Plywood',
  })
  const [components, setComponents] = useState<CanvasComponent[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [history, setHistory] = useState<Snapshot[]>([])
  const [future,  setFuture]  = useState<Snapshot[]>([])

  const [viewPreset, setViewPreset] = useState<ViewPreset>('perspective')

  // Persist cabinet + components to localStorage so /export/gcode can read them
  useEffect(() => {
    try {
      localStorage.setItem('kerfos_cabinet', JSON.stringify({ cabinet, components }))
    } catch {}
  }, [cabinet, components])

  // ── DFM violations ───────────────────────────────────────────────────────
  const violations = useMemo((): Record<string, 'critical' | 'warning' | 'info'> => {
    const design = {
      id: String(cabinet.id), name: cabinet.name,
      width: cabinet.width, height: cabinet.height, depth: cabinet.depth,
      material: cabinet.material,
      components: components.map(c => ({ id: c.id, name: c.name, width: c.width, height: c.height, depth: c.depth, material: cabinet.material })),
    }
    const result = runLocalDesignChecks(design)
    const map: Record<string, 'critical' | 'warning' | 'info'> = {}
    for (const issue of result.issues) {
      if (issue.affectedComponent) {
        // affectedComponent may be a name or id — match by either
        const comp = components.find(c => c.id === issue.affectedComponent || c.name === issue.affectedComponent)
        if (comp) map[comp.id] = issue.severity
      }
    }
    // Shelf sag check (local, not in designDoctor)
    for (const c of components) {
      if (c.type === 'shelf' && c.width > 36) {
        const existing = map[c.id]
        if (!existing || existing === 'info') map[c.id] = 'warning'
      }
    }
    return map
  }, [cabinet, components])

  const selectedMaterial = MATERIALS.find(m => m.name === cabinet.material) ?? MATERIALS[0]
  const selectedComp = components.find(c => c.id === selectedId) ?? null

  // ── History ──────────────────────────────────────────────────────────────

  const snapshot = useCallback((): Snapshot => ({ cabinet, components }), [cabinet, components])

  const pushHistory = useCallback(() => {
    const s = snapshot()
    setHistory(h => [...h.slice(-29), s])
    setFuture([])
  }, [snapshot])

  const undo = useCallback(() => {
    setHistory(h => {
      if (h.length === 0) return h
      const prev = h[h.length - 1]
      setFuture(f => [snapshot(), ...f.slice(0, 29)])
      setCabinet(prev.cabinet)
      setComponents(prev.components)
      setSelectedId(null)
      return h.slice(0, -1)
    })
  }, [snapshot])

  const redo = useCallback(() => {
    setFuture(f => {
      if (f.length === 0) return f
      const next = f[0]
      setHistory(h => [...h.slice(-29), snapshot()])
      setCabinet(next.cabinet)
      setComponents(next.components)
      setSelectedId(null)
      return f.slice(1)
    })
  }, [snapshot])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if (mod && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo() }
      if ((e.key === 'Delete' || e.key === 'Backspace') && document.activeElement?.tagName !== 'INPUT') {
        if (selectedId && components.find(c => c.id === selectedId)?.type !== 'box') {
          pushHistory()
          setComponents(prev => prev.filter(c => c.id !== selectedId))
          setSelectedId(null)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo, selectedId, components, pushHistory])

  // ── Sync box with cabinet dims ────────────────────────────────────────────

  useEffect(() => {
    setComponents(prev => {
      if (prev.length === 0) return prev
      return prev.map(c =>
        c.type === 'box' && c.id === prev[0].id
          ? { ...c, width: cabinet.width, height: cabinet.height, depth: cabinet.depth, position: [0, cabinet.height / 2, 0] }
          : c
      )
    })
  }, [cabinet.width, cabinet.height, cabinet.depth])

  // ── Template selection ────────────────────────────────────────────────────

  const handleTemplateSelect = (t: Template) => {
    const cab = t.cabinet
    setCabinet(cab)
    setComponents(t.buildComponents(cab))
    setSelectedId(null)
    setHistory([])
    setFuture([])
    setShowTemplates(false)
  }

  // ── Component actions ─────────────────────────────────────────────────────

  const addComponent = useCallback((type: ComponentType) => {
    pushHistory()
    const comp = defaultComponent(type, cabinet)
    setComponents(prev => [...prev, comp])
    setSelectedId(comp.id)
  }, [cabinet, pushHistory])

  const updateSelected = (field: keyof CanvasComponent, val: string | number) => {
    if (!selectedId) return
    const n = typeof val === 'number' ? val : parseFloat(val as string)
    if (isNaN(n) || n <= 0) return
    pushHistory()
    setComponents(prev => prev.map(c => c.id === selectedId ? { ...c, [field]: n } : c))
  }

  const updatePosition = (axis: 0 | 1 | 2, val: string) => {
    if (!selectedId) return
    const n = parseFloat(val)
    if (isNaN(n)) return
    pushHistory()
    setComponents(prev => prev.map(c => {
      if (c.id !== selectedId) return c
      const pos = [...c.position] as [number, number, number]
      pos[axis] = n
      return { ...c, position: pos }
    }))
  }

  const deleteSelected = () => {
    if (!selectedId) return
    pushHistory()
    setComponents(prev => prev.filter(c => c.id !== selectedId))
    setSelectedId(null)
  }

  const handleMove = useCallback((id: string, pos: [number, number, number]) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, position: pos } : c))
  }, [])

  const handleDim = (dim: 'width' | 'height' | 'depth', val: string) => {
    const n = parseFloat(val)
    if (!isNaN(n) && n > 0) {
      pushHistory()
      setCabinet(p => ({ ...p, [dim]: n }))
    }
  }

  // ── Cut list ──────────────────────────────────────────────────────────────

  const cutList = [
    { part: 'Bottom / Top', qty: 2, w: cabinet.width,       h: cabinet.depth },
    { part: 'Sides',        qty: 2, w: cabinet.depth,       h: cabinet.height },
    { part: 'Back',         qty: 1, w: cabinet.width,       h: cabinet.height },
    { part: 'Shelves',      qty: components.filter(c => c.type === 'shelf').length, w: cabinet.width - 1.5, h: cabinet.depth - 1.5 },
  ].filter(c => c.qty > 0)

  const sqFt = cutList.reduce((acc, c) => acc + c.qty * c.w * c.h, 0) / 144
  const cost = (sqFt * (selectedMaterial.price / 32)) + 25

  const downloadCutList = () => {
    const rows = [
      'Part,Qty,Width (in),Length (in)',
      ...cutList.map(c => `${c.part},${c.qty},${c.w.toFixed(3)},${c.h.toFixed(3)}`),
    ]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${cabinet.name.toLowerCase().replace(/\s+/g, '-')}-cutlist.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadGCode = () => {
    const T = 0.75 // material thickness in inches
    const lines: string[] = [
      `(KerfOS G-Code — ${cabinet.name})`,
      `(Generated: ${new Date().toLocaleDateString()})`,
      `(Cabinet: ${cabinet.width}" W × ${cabinet.height}" H × ${cabinet.depth}" D)`,
      '',
      'G20',      // inch mode
      'G90',      // absolute positioning
      'G17',      // XY plane
      '',
      'M03 S18000', // spindle on
      'G04 P2',   // dwell 2 sec
      '',
    ]

    // Build panels from cut list
    const panels: Array<{ name: string; qty: number; w: number; h: number }> = [
      { name: 'Bottom', qty: 1, w: cabinet.width - T * 2, h: cabinet.depth },
      { name: 'Top',    qty: 1, w: cabinet.width - T * 2, h: cabinet.depth },
      { name: 'Left_Side',  qty: 1, w: cabinet.depth, h: cabinet.height },
      { name: 'Right_Side', qty: 1, w: cabinet.depth, h: cabinet.height },
      { name: 'Back',  qty: 1, w: cabinet.width, h: cabinet.height },
      ...components
        .filter(c => c.type === 'shelf')
        .map((c, i) => ({ name: `Shelf_${i + 1}`, qty: 1, w: c.width, h: c.depth })),
      ...components
        .filter(c => c.type === 'divider')
        .map((c, i) => ({ name: `Divider_${i + 1}`, qty: 1, w: c.depth, h: c.height })),
      ...components
        .filter(c => c.type === 'door')
        .map((c, i) => ({ name: `Door_${i + 1}`, qty: 1, w: c.width, h: c.height })),
      ...components
        .filter(c => c.type === 'drawer')
        .map((c, i) => ({ name: `DrawerFace_${i + 1}`, qty: 1, w: c.width, h: c.height })),
    ]

    const BIT_DIA = 0.25  // 1/4" upcut spiral
    const SAFE_Z  = 1.0
    const CUT_Z   = -(T + 0.02)  // through cut
    const FEED    = 100
    const PLUNGE  = 40

    let opNum = 1
    let curX = 0.5

    for (const panel of panels) {
      const x0 = curX
      const y0 = 0.5
      const x1 = x0 + panel.w
      const y1 = y0 + panel.h

      lines.push(`(--- ${panel.name} ${panel.w.toFixed(3)}" × ${panel.h.toFixed(3)}" ---)`)
      lines.push(`(Operation ${opNum++})`)
      lines.push(`G00 Z${SAFE_Z.toFixed(4)}`)
      lines.push(`G00 X${(x0 - BIT_DIA / 2).toFixed(4)} Y${(y0 - BIT_DIA / 2).toFixed(4)}`)
      lines.push(`G01 Z${CUT_Z.toFixed(4)} F${PLUNGE}`)
      lines.push(`G01 X${(x1 + BIT_DIA / 2).toFixed(4)} F${FEED}`)
      lines.push(`G01 Y${(y1 + BIT_DIA / 2).toFixed(4)}`)
      lines.push(`G01 X${(x0 - BIT_DIA / 2).toFixed(4)}`)
      lines.push(`G01 Y${(y0 - BIT_DIA / 2).toFixed(4)}`)
      lines.push(`G00 Z${SAFE_Z.toFixed(4)}`)
      lines.push('')

      curX = x1 + 1.0 // 1" gap between parts on sheet
    }

    lines.push('(--- End of program ---)')
    lines.push('M05')          // spindle off
    lines.push('G00 X0 Y0 Z2') // home
    lines.push('M02')          // program end

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${cabinet.name.toLowerCase().replace(/\s+/g, '-')}.nc`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Template screen ───────────────────────────────────────────────────────

  if (showTemplates) return <TemplatePicker onSelect={handleTemplateSelect} />

  // ── Render ────────────────────────────────────────────────────────────────

  const canUndo = history.length > 0
  const canRedo = future.length > 0

  return (
    <div style={s.shell}>

      {/* ── Toolbar ── */}
      <div style={s.toolbar}>
        <div style={s.toolbarLeft}>
          <span style={s.toolbarTitle}>{cabinet.name}</span>
          <button onClick={() => setShowTemplates(true)} style={s.tbBtn}>Templates</button>
        </div>

        <div style={s.toolbarRight}>
          {/* View preset */}
          {(['perspective', 'front', 'top', 'side'] as ViewPreset[]).map(v => (
            <button
              key={v}
              onClick={() => setViewPreset(v)}
              style={viewPreset === v ? s.tbBtnActive : s.tbBtn}
            >
              {v === 'perspective' ? '3D' : v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}

          <div style={s.tbSep} />

          <button onClick={undo} disabled={!canUndo} title="Undo (⌘Z)"
            style={{ ...s.tbBtn, opacity: canUndo ? 1 : 0.35, cursor: canUndo ? 'pointer' : 'default' }}>
            ↩ Undo
          </button>
          <button onClick={redo} disabled={!canRedo} title="Redo (⌘⇧Z)"
            style={{ ...s.tbBtn, opacity: canRedo ? 1 : 0.35, cursor: canRedo ? 'pointer' : 'default' }}>
            ↪ Redo
          </button>

          <div style={s.tbSep} />

          <button onClick={downloadCutList} style={s.tbBtn}>Cut List ↓</button>
          <button onClick={downloadGCode} style={s.tbBtnPrimary}>Export G-Code</button>
        </div>
      </div>

      {/* ── Middle ── */}
      <div style={s.middle}>

        {/* Left: palette */}
        <div style={s.palette}>

          {/* Cabinet dims */}
          <div style={s.paletteSection}>Cabinet</div>
          <div style={s.paletteDims}>
            {(['width', 'height', 'depth'] as const).map(dim => (
              <div key={dim} style={s.paletteDimRow}>
                <span style={s.paletteDimLabel}>{dim.charAt(0).toUpperCase() + dim.slice(1)}</span>
                <input
                  style={s.paletteDimInput}
                  type="number"
                  value={cabinet[dim]}
                  onChange={e => handleDim(dim, e.target.value)}
                />
                <span style={{ fontSize: '10px', color: 'var(--k-canvas-text-muted)', flexShrink: 0 }}>″</span>
              </div>
            ))}
          </div>

          {/* Add component */}
          <div style={s.paletteSection}>Add Component</div>
          <div style={s.paletteScrollArea}>
            {PALETTE_ITEMS.map(item => (
              <div
                key={item.id}
                style={s.paletteItem}
                onClick={() => addComponent(item.id)}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
              >
                <div style={s.paletteItemLeft}>
                  <span style={{ color: 'var(--k-canvas-text-muted)', display: 'flex', flexShrink: 0 }}>
                    <PaletteIcon type={item.id} />
                  </span>
                  <div>
                    <div style={s.paletteItemLabel}>{item.label}</div>
                    <div style={s.paletteItemDesc}>{item.desc}</div>
                  </div>
                </div>
                <span style={{ fontSize: '16px', color: 'var(--k-canvas-text-muted)', lineHeight: 1, flexShrink: 0 }}>+</span>
              </div>
            ))}
          </div>

          {/* Material */}
          <div style={s.paletteSection}>Material</div>
          {MATERIALS.map(mat => (
            <div
              key={mat.id}
              onClick={() => setCabinet(p => ({ ...p, material: mat.name }))}
              style={{
                ...s.paletteItem,
                color: cabinet.material === mat.name ? 'var(--k-canvas-accent)' : 'var(--k-canvas-text)',
                background: cabinet.material === mat.name ? 'var(--k-canvas-accent-dim)' : 'transparent',
              }}
              onMouseEnter={e => { if (cabinet.material !== mat.name) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { if (cabinet.material !== mat.name) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
            >
              <span style={{ fontSize: '12px' }}>{mat.name}</span>
              <span style={{ fontSize: '10px', color: 'var(--k-canvas-text-muted)' }}>${mat.price}/sht</span>
            </div>
          ))}
        </div>

        {/* Center: canvas */}
        <div style={s.canvas} onClick={() => setSelectedId(null)}>
          <CabinetPreview
            cabinet={cabinet}
            material={selectedMaterial}
            components={components}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onMove={handleMove}
            viewPreset={viewPreset}
            violations={violations}
          />

          {/* Hint bar */}
          <div style={{ position: 'absolute', bottom: '52px', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 10 }}>
            <div style={{ padding: '4px 12px', background: 'rgba(10,14,28,0.75)', backdropFilter: 'blur(8px)', border: '1px solid var(--k-canvas-border)', borderRadius: '2px', fontSize: '10px', color: 'var(--k-canvas-text-muted)', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
              Scroll to zoom · Drag to orbit · Click to select · ⌘Z undo · Delete to remove
            </div>
          </div>
        </div>

        {/* Right: properties panel */}
        <div style={s.panel}>
          <div style={s.panelHeader}>
            <span>{selectedComp ? selectedComp.name : 'Properties'}</span>
            {selectedComp && selectedComp.type !== 'box' && (
              <span onClick={deleteSelected} style={{ fontSize: '10px', color: 'var(--k-canvas-accent)', cursor: 'pointer', letterSpacing: '0.04em' }}>DELETE</span>
            )}
          </div>

          <div style={s.panelBody}>
            {selectedComp ? (
              /* ── Selected component ── */
              <>
                <p style={s.sectionLabel}>Dimensions</p>

                <label style={s.fieldLabel}>Width (in)</label>
                <input style={s.input} type="number" step="0.125" value={selectedComp.width}
                  onChange={e => updateSelected('width', e.target.value)} />

                {selectedComp.type !== 'shelf' && selectedComp.type !== 'toe-kick' && (
                  <>
                    <label style={s.fieldLabel}>Height (in)</label>
                    <input style={s.input} type="number" step="0.125" value={selectedComp.height}
                      onChange={e => updateSelected('height', e.target.value)} />
                  </>
                )}

                {selectedComp.type !== 'door' && selectedComp.type !== 'drawer' && selectedComp.type !== 'toe-kick' && (
                  <>
                    <label style={s.fieldLabel}>Depth (in)</label>
                    <input style={s.input} type="number" step="0.125" value={selectedComp.depth}
                      onChange={e => updateSelected('depth', e.target.value)} />
                  </>
                )}

                {selectedComp.type !== 'box' && (
                  <>
                    <div style={s.divider} />
                    <p style={s.sectionLabel}>Position</p>

                    {(selectedComp.type === 'shelf' || selectedComp.type === 'drawer') && (
                      <>
                        <label style={s.fieldLabel}>Height from floor (in)</label>
                        <input style={s.input} type="number" step="0.5"
                          value={Math.round(selectedComp.position[1] * 10) / 10}
                          onChange={e => updatePosition(1, e.target.value)} />
                      </>
                    )}

                    {selectedComp.type === 'divider' && (
                      <>
                        <label style={s.fieldLabel}>Offset from center (in)</label>
                        <input style={s.input} type="number" step="0.5"
                          value={Math.round(selectedComp.position[0] * 10) / 10}
                          onChange={e => updatePosition(0, e.target.value)} />
                      </>
                    )}

                    {selectedComp.type === 'door' && (
                      <p style={s.mutedText}>Door is auto-positioned at the front face. Adjust width and height above to fit your opening.</p>
                    )}

                    {selectedComp.type === 'toe-kick' && (
                      <p style={s.mutedText}>Toe kick is anchored to the cabinet base.</p>
                    )}

                    {selectedComp.type !== 'toe-kick' && selectedComp.type !== 'door' && (
                      <button onClick={deleteSelected} style={s.deleteBtn}>Remove component</button>
                    )}
                  </>
                )}
              </>
            ) : (
              /* ── Cabinet overview ── */
              <>
                <p style={s.sectionLabel}>Cabinet</p>

                <label style={s.fieldLabel}>Name</label>
                <input style={s.input} type="text" value={cabinet.name}
                  onChange={e => setCabinet(p => ({ ...p, name: e.target.value }))} />

                <label style={s.fieldLabel}>Material</label>
                <select style={s.select} value={cabinet.material}
                  onChange={e => setCabinet(p => ({ ...p, material: e.target.value }))}>
                  {MATERIALS.map(m => <option key={m.id} value={m.name}>{m.name} (${m.price}/sht)</option>)}
                </select>

                <div style={s.divider} />
                <p style={s.sectionLabel}>Cut List</p>

                {cutList.map((cut, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--k-canvas-text-muted)' }}>{cut.qty}× {cut.part}</span>
                    <span style={{ fontSize: '11px', color: 'var(--k-canvas-text)', fontVariantNumeric: 'tabular-nums' }}>{cut.w.toFixed(2)}″ × {cut.h.toFixed(2)}″</span>
                  </div>
                ))}
                <button onClick={downloadCutList} style={s.ghostBtn}>⬇ Download cut list (.csv)</button>

                <div style={s.divider} />
                <p style={s.sectionLabel}>Components ({components.length})</p>

                {components.map(c => (
                  <ComponentListItem
                    key={c.id}
                    comp={c}
                    isSelected={selectedId === c.id}
                    onClick={() => setSelectedId(c.id)}
                  />
                ))}

                <div style={s.divider} />
                <AIRail cabinet={cabinet} selectedComp={selectedComp} />
              </>
            )}
          </div>
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div style={s.bottomBar}>
        <div style={s.bottomStat}><span>Components</span><span style={s.bottomStatValue}>{components.length}</span></div>
        <div style={s.bottomStat}><span>Material</span><span style={s.bottomStatValue}>{selectedMaterial.name}</span></div>
        <div style={s.bottomStat}><span>Est. Cost</span><span style={s.bottomStatValue}>${cost.toFixed(2)}</span></div>
        <div style={s.bottomStat}><span>Size</span><span style={s.bottomStatValue}>{cabinet.width}″ × {cabinet.height}″ × {cabinet.depth}″</span></div>
        <button onClick={downloadGCode} style={s.exportBtn}>Export G-Code ▾</button>
      </div>

    </div>
  )
}

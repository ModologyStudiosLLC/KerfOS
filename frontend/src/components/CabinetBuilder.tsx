'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'

const CabinetPreview = dynamic(() => import('./CabinetPreview'), { ssr: false })

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
  // Legacy field used by CutListExporter — kept for compatibility
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

const PALETTE_ITEMS: { id: ComponentType; label: string }[] = [
  { id: 'box',      label: 'Box' },
  { id: 'door',     label: 'Door' },
  { id: 'drawer',   label: 'Drawer' },
  { id: 'shelf',    label: 'Shelf' },
  { id: 'divider',  label: 'Divider' },
  { id: 'toe-kick', label: 'Toe Kick' },
]

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
      return {
        id: uid(), type, name: 'Door',
        width: cab.width - 1.5, height: cab.height - 1.5, depth: 0.75,
        position: [0, cab.height / 2, cab.depth / 2 + 0.5],
      }
    case 'drawer':
      return {
        id: uid(), type, name: 'Drawer',
        width: cab.width - 1.5, height: 6, depth: 0.75,
        position: [0, 6, cab.depth / 2 + 0.5],
      }
    case 'shelf':
      return {
        id: uid(), type, name: 'Shelf',
        width: cab.width - 1.5, height: 0.75, depth: cab.depth - 1.5,
        position: [0, cab.height / 2, 0],
      }
    case 'divider':
      return {
        id: uid(), type, name: 'Divider',
        width: 0.75, height: cab.height - 1.5, depth: cab.depth - 1.5,
        position: [0, cab.height / 2, 0],
      }
    case 'toe-kick':
      return {
        id: uid(), type, name: 'Toe Kick',
        width: cab.width, height: 4, depth: 0.75,
        position: [0, 2, -cab.depth / 2 + 0.375],
      }
    case 'box':
    default:
      return {
        id: uid(), type: 'box', name: 'Cabinet Box',
        width: cab.width, height: cab.height, depth: cab.depth,
        position: [0, cab.height / 2, 0],
      }
  }
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = {
  shell: {
    display: 'flex', flexDirection: 'column' as const,
    height: 'calc(100vh - 64px)',
    background: 'var(--k-canvas-bg)', color: 'var(--k-canvas-text)',
    fontFamily: 'var(--font-inter), system-ui, sans-serif',
  },
  toolbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px', height: '44px',
    borderBottom: '1px solid var(--k-canvas-border)',
    background: 'var(--k-canvas-surface)', flexShrink: 0,
  },
  toolbarTitle: {
    fontFamily: 'var(--font-sora), Sora, sans-serif',
    fontSize: '13px', fontWeight: 600, letterSpacing: '-0.01em',
    color: 'var(--k-canvas-text)',
  },
  toolbarActions: { display: 'flex', gap: '6px' },
  tbBtn: {
    padding: '4px 12px', fontSize: '11px', fontWeight: 500,
    border: '1px solid var(--k-canvas-border)', background: 'transparent',
    color: 'var(--k-canvas-text-muted)', cursor: 'pointer', borderRadius: '3px',
  },
  tbBtnPrimary: {
    padding: '4px 12px', fontSize: '11px', fontWeight: 600,
    border: '1px solid var(--k-canvas-accent)', background: 'var(--k-canvas-accent)',
    color: '#fff', cursor: 'pointer', borderRadius: '3px',
  },
  middle: { display: 'flex', flex: 1, overflow: 'hidden' },
  palette: {
    width: '200px', flexShrink: 0,
    borderRight: '1px solid var(--k-canvas-border)',
    background: 'var(--k-canvas-surface)',
    display: 'flex', flexDirection: 'column' as const, overflow: 'hidden',
  },
  paletteHeader: {
    padding: '10px 14px', fontSize: '10px', fontWeight: 600,
    letterSpacing: '0.08em', textTransform: 'uppercase' as const,
    color: 'var(--k-canvas-text-muted)',
    borderBottom: '1px solid var(--k-canvas-border)',
  },
  paletteItem: {
    padding: '9px 14px', fontSize: '13px', color: 'var(--k-canvas-text)',
    cursor: 'pointer', borderBottom: '1px solid var(--k-canvas-border)',
    userSelect: 'none' as const,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  canvas: { flex: 1, overflow: 'hidden', position: 'relative' as const },
  panel: {
    width: '260px', flexShrink: 0,
    borderLeft: '1px solid var(--k-canvas-border)',
    background: 'var(--k-canvas-surface)',
    display: 'flex', flexDirection: 'column' as const, overflow: 'hidden',
  },
  panelHeader: {
    padding: '10px 14px', fontSize: '10px', fontWeight: 600,
    letterSpacing: '0.08em', textTransform: 'uppercase' as const,
    color: 'var(--k-canvas-text-muted)',
    borderBottom: '1px solid var(--k-canvas-border)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  panelBody: { flex: 1, overflowY: 'auto' as const, padding: '14px' },
  fieldLabel: {
    fontSize: '11px', fontWeight: 500, color: 'var(--k-canvas-text-muted)',
    marginBottom: '5px', display: 'block',
  },
  input: {
    width: '100%', padding: '6px 8px', fontSize: '13px',
    background: 'var(--k-canvas-bg)', border: '1px solid var(--k-canvas-border)',
    color: 'var(--k-canvas-text)', borderRadius: '3px', outline: 'none',
    marginBottom: '12px',
  },
  select: {
    width: '100%', padding: '6px 8px', fontSize: '13px',
    background: 'var(--k-canvas-bg)', border: '1px solid var(--k-canvas-border)',
    color: 'var(--k-canvas-text)', borderRadius: '3px', outline: 'none',
    marginBottom: '12px',
  },
  divider: { height: '1px', background: 'var(--k-canvas-border)', margin: '12px 0' },
  sectionLabel: {
    fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    color: 'var(--k-canvas-text-muted)', marginBottom: '10px',
  },
  deleteBtn: {
    width: '100%', padding: '6px', fontSize: '11px', fontWeight: 500,
    background: 'transparent', border: '1px solid rgba(196,93,44,0.3)',
    color: 'var(--k-canvas-accent)', cursor: 'pointer', borderRadius: '3px',
    marginTop: '8px',
  },
  bottomBar: {
    display: 'flex', alignItems: 'center', gap: '24px',
    padding: '0 20px', height: '40px',
    borderTop: '1px solid var(--k-canvas-border)',
    background: 'var(--k-canvas-surface)', flexShrink: 0, fontSize: '12px',
  },
  bottomStat: { display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--k-canvas-text-muted)' },
  bottomStatValue: { color: 'var(--k-canvas-text)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' as const },
  exportBtn: {
    marginLeft: 'auto', padding: '4px 14px', fontSize: '11px', fontWeight: 600,
    background: 'var(--k-canvas-accent)', color: '#fff',
    border: 'none', borderRadius: '3px', cursor: 'pointer',
  },
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CabinetBuilder() {
  const [cabinet, setCabinet] = useState<Cabinet>({
    id: 1, name: 'Base Cabinet',
    width: 36, height: 34.5, depth: 24,
    material: 'Birch Plywood',
  })

  const [components, setComponents] = useState<CanvasComponent[]>(() => [
    defaultComponent('box', { id: 1, name: 'Base Cabinet', width: 36, height: 34.5, depth: 24, material: 'Birch Plywood' })
  ])

  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedMaterial = MATERIALS.find(m => m.name === cabinet.material) ?? MATERIALS[0]
  const selectedComp = components.find(c => c.id === selectedId) ?? null

  // Keep the first box component in sync with cabinet dimensions
  useEffect(() => {
    setComponents(prev => prev.map(c =>
      c.type === 'box' && c.id === prev[0].id
        ? { ...c, width: cabinet.width, height: cabinet.height, depth: cabinet.depth, position: [0, cabinet.height / 2, 0] }
        : c
    ))
  }, [cabinet.width, cabinet.height, cabinet.depth])

  const addComponent = useCallback((type: ComponentType) => {
    const comp = defaultComponent(type, cabinet)
    setComponents(prev => [...prev, comp])
    setSelectedId(comp.id)
  }, [cabinet])

  const updateSelected = (field: keyof CanvasComponent, val: string) => {
    if (!selectedId) return
    const n = parseFloat(val)
    if (isNaN(n) || n <= 0) return
    setComponents(prev => prev.map(c => c.id === selectedId ? { ...c, [field]: n } : c))
  }

  const deleteSelected = () => {
    if (!selectedId) return
    setComponents(prev => prev.filter(c => c.id !== selectedId))
    setSelectedId(null)
  }

  const handleMove = useCallback((id: string, pos: [number, number, number]) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, position: pos } : c))
  }, [])

  const handleDim = (dim: 'width' | 'height' | 'depth', val: string) => {
    const n = parseFloat(val)
    if (!isNaN(n) && n > 0) setCabinet(p => ({ ...p, [dim]: n }))
  }

  const cutList = [
    { part: 'Bottom / Top', qty: 2, w: cabinet.width,       h: cabinet.depth },
    { part: 'Sides',        qty: 2, w: cabinet.depth,       h: cabinet.height },
    { part: 'Back',         qty: 1, w: cabinet.width,       h: cabinet.height },
    { part: 'Shelves',      qty: 2, w: cabinet.width - 1.5, h: cabinet.depth - 1.5 },
  ]
  const sqFt = cutList.reduce((s, c) => s + c.qty * c.w * c.h, 0) / 144
  const cost  = (sqFt * (selectedMaterial.price / 32)) + 25

  const panelTitle = selectedComp
    ? `${selectedComp.name}`
    : 'Properties'

  return (
    <div style={s.shell}>

      {/* Toolbar */}
      <div style={s.toolbar}>
        <span style={s.toolbarTitle}>KerfOS — {cabinet.name}</span>
        <div style={s.toolbarActions}>
          <button style={s.tbBtn}>Undo</button>
          <button style={s.tbBtn}>Redo</button>
          <button style={s.tbBtnPrimary}>Export</button>
        </div>
      </div>

      {/* Middle row */}
      <div style={s.middle}>

        {/* Left palette */}
        <div style={s.palette}>
          <div style={s.paletteHeader}>Add Component</div>
          {PALETTE_ITEMS.map(item => (
            <div
              key={item.id}
              style={s.paletteItem}
              onClick={() => addComponent(item.id)}
            >
              <span>{item.label}</span>
              <span style={{ fontSize: '16px', color: 'var(--k-canvas-text-muted)', lineHeight: 1 }}>+</span>
            </div>
          ))}

          <div style={{ ...s.paletteHeader, marginTop: 'auto' }}>Material</div>
          {MATERIALS.map(mat => (
            <div
              key={mat.id}
              onClick={() => setCabinet(p => ({ ...p, material: mat.name }))}
              style={{
                ...s.paletteItem,
                color: cabinet.material === mat.name ? 'var(--k-canvas-accent)' : 'var(--k-canvas-text)',
                background: cabinet.material === mat.name ? 'var(--k-canvas-accent-dim)' : 'transparent',
              }}
            >
              <span>{mat.name}</span>
            </div>
          ))}
        </div>

        {/* Center canvas */}
        <div
          style={s.canvas}
          onClick={() => setSelectedId(null)}
        >
          <CabinetPreview
            cabinet={cabinet}
            material={selectedMaterial}
            components={components}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onMove={handleMove}
          />
        </div>

        {/* Right panel */}
        <div style={s.panel}>
          <div style={s.panelHeader}>
            <span>{panelTitle}</span>
            {selectedComp && selectedComp.type !== 'box' && (
              <span
                onClick={deleteSelected}
                style={{ fontSize: '11px', color: 'var(--k-canvas-accent)', cursor: 'pointer' }}
              >
                Delete
              </span>
            )}
          </div>
          <div style={s.panelBody}>

            {selectedComp ? (
              /* ── Selected component properties ── */
              <>
                <p style={s.sectionLabel}>Dimensions (inches)</p>

                <label style={s.fieldLabel}>Width</label>
                <input style={s.input} type="number" value={selectedComp.width}
                  onChange={e => updateSelected('width', e.target.value)} />

                <label style={s.fieldLabel}>Height</label>
                <input style={s.input} type="number" value={selectedComp.height}
                  onChange={e => updateSelected('height', e.target.value)} />

                <label style={s.fieldLabel}>Depth</label>
                <input style={s.input} type="number" value={selectedComp.depth}
                  onChange={e => updateSelected('depth', e.target.value)} />

                <div style={s.divider} />
                <p style={s.sectionLabel}>Position (inches)</p>

                {(['x', 'y', 'z'] as const).map((axis, i) => (
                  <div key={axis}>
                    <label style={s.fieldLabel}>{axis.toUpperCase()}</label>
                    <input
                      style={s.input}
                      type="number"
                      value={Math.round(selectedComp.position[i])}
                      onChange={e => {
                        const n = parseFloat(e.target.value)
                        if (isNaN(n)) return
                        setComponents(prev => prev.map(c => {
                          if (c.id !== selectedId) return c
                          const pos = [...c.position] as [number, number, number]
                          pos[i] = n
                          return { ...c, position: pos }
                        }))
                      }}
                    />
                  </div>
                ))}
              </>
            ) : (
              /* ── Cabinet properties ── */
              <>
                <p style={s.sectionLabel}>Cabinet Dimensions</p>

                <label style={s.fieldLabel}>Width</label>
                <input style={s.input} type="number" value={cabinet.width}
                  onChange={e => handleDim('width', e.target.value)} />

                <label style={s.fieldLabel}>Height</label>
                <input style={s.input} type="number" value={cabinet.height}
                  onChange={e => handleDim('height', e.target.value)} />

                <label style={s.fieldLabel}>Depth</label>
                <input style={s.input} type="number" value={cabinet.depth}
                  onChange={e => handleDim('depth', e.target.value)} />

                <div style={s.divider} />
                <p style={s.sectionLabel}>Material</p>

                <select style={s.select} value={cabinet.material}
                  onChange={e => setCabinet(p => ({ ...p, material: e.target.value }))}>
                  {MATERIALS.map(m => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>

                <div style={s.divider} />
                <p style={s.sectionLabel}>Cut List</p>

                {cutList.map((cut, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--k-canvas-text-muted)' }}>
                      {cut.qty}× {cut.part}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--k-canvas-text)', fontVariantNumeric: 'tabular-nums' }}>
                      {cut.w.toFixed(1)}" × {cut.h.toFixed(1)}"
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div style={s.bottomBar}>
        <div style={s.bottomStat}>
          <span>Components</span>
          <span style={s.bottomStatValue}>{components.length}</span>
        </div>
        <div style={s.bottomStat}>
          <span>Material</span>
          <span style={s.bottomStatValue}>{selectedMaterial.name}</span>
        </div>
        <div style={s.bottomStat}>
          <span>Est. Cost</span>
          <span style={s.bottomStatValue}>${cost.toFixed(2)}</span>
        </div>
        <button style={s.exportBtn}>Export ▾</button>
      </div>

    </div>
  )
}

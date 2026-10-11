'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Plus, Trash2, Download } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface CatalogMaterial {
  id: string
  name: string
  category: string
  price_per_sq_ft: number
  price_per_sheet: number | null
  thickness: number
  supplier: string
}

interface Part {
  id: string
  name: string
  width: string
  height: string
  qty: string
  material_id: string
}

interface LineItem {
  material_id: string
  material_name: string
  sheets_needed: number
  price_per_sheet: number | null
  sq_ft_used: number
  subtotal: number
}

interface Quote {
  line_items: LineItem[]
  materials_subtotal: number
  waste_factor_pct: number
  tax_rate_pct: number
  tax: number
  total: number
  part_count: number
  notes: string
}

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

const EMPTY_PART = (): Part => ({ id: uid(), name: '', width: '', height: '', qty: '1', material_id: '' })

export default function QuotePage() {
  const [catalog, setCatalog] = useState<CatalogMaterial[]>([])
  const [parts, setParts] = useState<Part[]>([EMPTY_PART()])
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/materials`)
      .then(r => r.json())
      .then(d => setCatalog(d.materials))
      .catch(() => {})
  }, [])

  const addPart = () => setParts(p => [...p, EMPTY_PART()])

  const removePart = (id: string) =>
    setParts(p => p.length === 1 ? p : p.filter(x => x.id !== id))

  const updatePart = (id: string, field: keyof Part, value: string) =>
    setParts(p => p.map(x => x.id === id ? { ...x, [field]: value } : x))

  const calculate = useCallback(async () => {
    setError(null)
    const valid = parts.filter(p => p.name && p.width && p.height && p.qty && p.material_id)
    if (!valid.length) { setError('Add at least one complete part.'); return }

    setLoading(true)
    try {
      const body = valid.map(p => ({
        name: p.name,
        width: parseFloat(p.width),
        height: parseFloat(p.height),
        qty: parseInt(p.qty),
        material_id: p.material_id,
      }))
      const res = await fetch(`${API_BASE}/api/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Quote failed')
      }
      setQuote(await res.json())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [parts])

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 40px' }}>
      <PageHeader
        crumbs={[{ label: 'kerfos', href: '/' }, { label: 'tools', href: '/tools' }, { label: 'instant quote' }]}
        title="Instant Quote"
        subtitle="Enter your cut list and get a materials cost estimate in seconds."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
        {/* Cut list table */}
        <div className="k-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>Parts</span>
            <button onClick={addPart} className="k-btn k-btn-ghost k-btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Plus size={14} /> Add part
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px 72px 52px 200px 32px', gap: '6px', marginBottom: '8px' }}>
            {['Name', 'W (in)', 'H (in)', 'Qty', 'Material', ''].map(h => (
              <span key={h} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--k-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
            ))}
          </div>

          {parts.map(part => (
            <div key={part.id} style={{ display: 'grid', gridTemplateColumns: '1fr 72px 72px 52px 200px 32px', gap: '6px', marginBottom: '6px' }}>
              <input
                className="k-input"
                placeholder="Side panel"
                value={part.name}
                onChange={e => updatePart(part.id, 'name', e.target.value)}
              />
              <input
                className="k-input"
                placeholder="23.5"
                type="number"
                value={part.width}
                onChange={e => updatePart(part.id, 'width', e.target.value)}
              />
              <input
                className="k-input"
                placeholder="30"
                type="number"
                value={part.height}
                onChange={e => updatePart(part.id, 'height', e.target.value)}
              />
              <input
                className="k-input"
                placeholder="2"
                type="number"
                min="1"
                value={part.qty}
                onChange={e => updatePart(part.id, 'qty', e.target.value)}
              />
              <select
                className="k-input"
                value={part.material_id}
                onChange={e => updatePart(part.id, 'material_id', e.target.value)}
              >
                <option value="">Select material</option>
                {['sheet_goods', 'hardwood', 'composite'].map(cat => (
                  <optgroup key={cat} label={cat.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}>
                    {catalog.filter(m => m.category === cat).map(m => (
                      <option key={m.id} value={m.id}>{m.name} — ${m.price_per_sq_ft.toFixed(2)}/sf</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <button
                onClick={() => removePart(part.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--k-text-muted)', padding: '4px', display: 'flex', alignItems: 'center' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {error && (
            <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', fontSize: '13px', color: '#ef4444' }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
            <button
              onClick={calculate}
              disabled={loading}
              className="k-btn k-btn-primary"
            >
              {loading ? 'Calculating…' : 'Get Quote'}
            </button>
          </div>
        </div>

        {/* Quote summary */}
        <div>
          {quote ? (
            <div className="k-card" style={{ padding: '24px' }}>
              <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>Quote Summary</div>

              <div style={{ marginBottom: '16px' }}>
                {quote.line_items.map(li => (
                  <div key={li.material_id} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--k-border)' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{li.material_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--k-text-muted)', marginTop: '3px' }}>
                      {li.sheets_needed} sheet{li.sheets_needed !== 1 ? 's' : ''} · {li.sq_ft_used} sq ft used
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--k-amber)', marginTop: '4px' }}>
                      ${li.subtotal.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--k-text-muted)' }}>Materials ({quote.waste_factor_pct}% waste incl.)</span>
                <span>${quote.materials_subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
                <span style={{ color: 'var(--k-text-muted)' }}>Tax ({quote.tax_rate_pct.toFixed(0)}%)</span>
                <span>${quote.tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '18px', paddingTop: '12px', borderTop: '2px solid var(--k-border)' }}>
                <span>Total</span>
                <span style={{ color: 'var(--k-amber)' }}>${quote.total.toFixed(2)}</span>
              </div>

              <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--k-text-muted)' }}>
                {quote.part_count} parts · {quote.notes}
              </div>

              <button
                className="k-btn k-btn-ghost"
                style={{ width: '100%', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                title="Upgrade to Maker to export PDF"
                disabled
              >
                <Download size={14} /> Export PDF
                <span style={{ fontSize: '10px', background: 'var(--k-amber)', color: 'white', padding: '1px 6px', borderRadius: '99px', marginLeft: '4px' }}>Maker</span>
              </button>
            </div>
          ) : (
            <div className="k-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--k-text-muted)' }}>
              <div style={{ fontSize: '13px' }}>Add your parts and click<br />"Get Quote" to see pricing.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import type { Cabinet, CanvasComponent } from '@/components/CabinetBuilder'

const CabinetPreview = dynamic(() => import('@/components/CabinetPreview'), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100%', background: 'var(--k-canvas-bg)' }} />,
})

/* ─── Demo data for hero ──────────────────────────────────────────────────── */
const DEMO_CABINET: Cabinet = {
  id: 1, name: 'Kitchen Base Cabinet',
  width: 24, height: 34.5, depth: 23.75, material: 'plywood',
}
const DEMO_COMPONENTS: CanvasComponent[] = [
  { id: 'd1', type: 'box',     name: 'Cabinet Box',   width: 24,   height: 34.5, depth: 23.75, position: [0, 17.25, 0] },
  { id: 'd2', type: 'shelf',   name: 'Lower Shelf',   width: 22.5, height: 0.75, depth: 21.5,  position: [0, 10,    0] },
  { id: 'd3', type: 'shelf',   name: 'Upper Shelf',   width: 22.5, height: 0.75, depth: 21.5,  position: [0, 22,    0] },
  { id: 'd4', type: 'divider', name: 'Center Divider',width: 0.75, height: 33,   depth: 21.5,  position: [5, 17.25, 0] },
]

/* ─── Scroll Progress Bar ─────────────────────────────────────────────────── */
function ScrollBar() {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const update = () => {
      const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      setWidth(pct)
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  return <div className="k-scroll-bar" style={{ width: `${width}%` }} />
}


/* ─── Feature row visual: Blueprint ──────────────────────────────────────── */
function BlueprintVisual() {
  return (
    <div style={{ background: '#0a0e1c', borderRadius: '6px', overflow: 'hidden', position: 'relative', aspectRatio: '5/4', border: '1px solid rgba(196,93,44,0.14)' }}>
      <svg width="100%" height="100%" viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
        <defs>
          <pattern id="bp-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0L0 0 0 20" fill="none" stroke="rgba(196,93,44,0.07)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="400" height="320" fill="url(#bp-grid)"/>
        {/* Cabinet face frame */}
        <rect x="90" y="32" width="220" height="240" stroke="#c45d2c" strokeWidth="1.5" fill="rgba(196,93,44,0.04)" rx="1"/>
        {/* Framing members */}
        <rect x="90" y="32" width="220" height="18" fill="rgba(196,93,44,0.10)" stroke="#c45d2c" strokeWidth="1"/>
        <rect x="90" y="254" width="220" height="18" fill="rgba(196,93,44,0.10)" stroke="#c45d2c" strokeWidth="1"/>
        <rect x="90" y="50" width="16" height="204" fill="rgba(196,93,44,0.07)" stroke="#c45d2c" strokeWidth="1"/>
        <rect x="294" y="50" width="16" height="204" fill="rgba(196,93,44,0.07)" stroke="#c45d2c" strokeWidth="1"/>
        {/* Center stile */}
        <line x1="200" y1="50" x2="200" y2="254" stroke="#c45d2c" strokeWidth="1.5"/>
        {/* Door openings (dashed) */}
        <rect x="108" y="52" width="89" height="200" stroke="rgba(232,201,154,0.35)" strokeWidth="1" strokeDasharray="5 3" fill="none"/>
        <rect x="203" y="52" width="89" height="200" stroke="rgba(232,201,154,0.35)" strokeWidth="1" strokeDasharray="5 3" fill="none"/>
        {/* Width dim */}
        <line x1="90" y1="294" x2="310" y2="294" stroke="rgba(232,201,154,0.55)" strokeWidth="0.8"/>
        <line x1="90" y1="289" x2="90" y2="299" stroke="rgba(232,201,154,0.55)" strokeWidth="0.8"/>
        <line x1="310" y1="289" x2="310" y2="299" stroke="rgba(232,201,154,0.55)" strokeWidth="0.8"/>
        <text x="200" y="292" fill="#e8c99a" fontSize="9" textAnchor="middle" fontFamily="monospace" opacity="0.8">24.00"</text>
        {/* Height dim */}
        <line x1="56" y1="32" x2="56" y2="272" stroke="rgba(232,201,154,0.55)" strokeWidth="0.8"/>
        <line x1="51" y1="32" x2="61" y2="32" stroke="rgba(232,201,154,0.55)" strokeWidth="0.8"/>
        <line x1="51" y1="272" x2="61" y2="272" stroke="rgba(232,201,154,0.55)" strokeWidth="0.8"/>
        <text x="38" y="156" fill="#e8c99a" fontSize="9" textAnchor="middle" fontFamily="monospace" opacity="0.8" transform="rotate(-90 38 156)">34.50"</text>
        {/* Part labels */}
        <text x="96" y="46" fill="rgba(232,201,154,0.45)" fontSize="7" fontFamily="monospace">TOP RAIL</text>
        <text x="96" y="78" fill="rgba(232,201,154,0.45)" fontSize="7" fontFamily="monospace">L STILE</text>
        <text x="153" y="156" fill="rgba(232,201,154,0.5)" fontSize="8" fontFamily="monospace" textAnchor="middle">DOOR L</text>
        <text x="247" y="156" fill="rgba(232,201,154,0.5)" fontSize="8" fontFamily="monospace" textAnchor="middle">DOOR R</text>
        {/* Depth annotation */}
        <line x1="310" y1="50" x2="348" y2="22" stroke="rgba(196,93,44,0.4)" strokeWidth="0.8" strokeDasharray="3 2"/>
        <text x="352" y="20" fill="rgba(232,201,154,0.55)" fontSize="8" fontFamily="monospace">23.75"D</text>
      </svg>
      <div style={{ position: 'absolute', top: '12px', left: '12px', padding: '4px 10px', background: 'rgba(10,14,28,0.8)', border: '1px solid rgba(196,93,44,0.2)', borderRadius: '2px' }}>
        <span style={{ fontFamily: 'monospace', fontSize: '9px', color: 'rgba(232,201,154,0.7)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Face Frame — Front View</span>
      </div>
    </div>
  )
}

/* ─── Feature row visual: Nesting / board yield ───────────────────────────── */
function NestingVisual() {
  // Simulated nested rectangles on a 4×8 sheet
  const pieces = [
    { x: 8,   y: 8,   w: 140, h: 96,  label: 'Side L',   color: 'rgba(196,93,44,0.70)' },
    { x: 156, y: 8,   w: 140, h: 96,  label: 'Side R',   color: 'rgba(196,93,44,0.60)' },
    { x: 8,   y: 112, w: 288, h: 48,  label: 'Back',     color: 'rgba(196,93,44,0.45)' },
    { x: 8,   y: 168, w: 136, h: 52,  label: 'Bottom',   color: 'rgba(196,93,44,0.55)' },
    { x: 152, y: 168, w: 72,  h: 52,  label: 'Shelf',    color: 'rgba(196,93,44,0.40)' },
    { x: 232, y: 168, w: 64,  h: 52,  label: 'Shelf',    color: 'rgba(196,93,44,0.35)' },
    { x: 8,   y: 228, w: 86,  h: 60,  label: 'Door L',   color: 'rgba(196,93,44,0.50)' },
    { x: 102, y: 228, w: 86,  h: 60,  label: 'Door R',   color: 'rgba(196,93,44,0.48)' },
    { x: 196, y: 228, w: 100, h: 28,  label: 'Top Rail', color: 'rgba(196,93,44,0.38)' },
    { x: 196, y: 260, w: 100, h: 28,  label: 'Btm Rail', color: 'rgba(196,93,44,0.35)' },
  ]
  return (
    <div style={{ background: '#0d0906', borderRadius: '6px', overflow: 'hidden', position: 'relative', aspectRatio: '5/4', border: '1px solid rgba(196,93,44,0.14)' }}>
      <svg width="100%" height="100%" viewBox="0 0 312 296" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', padding: '8px' }}>
        {/* Sheet outline */}
        <rect x="4" y="4" width="304" height="288" stroke="rgba(196,93,44,0.35)" strokeWidth="1" fill="rgba(196,93,44,0.04)" rx="1"/>
        {/* Sheet label */}
        <text x="156" y="298" fill="rgba(196,93,44,0.4)" fontSize="8" fontFamily="monospace" textAnchor="middle">48.00" × 96.00" — 3/4" Plywood</text>
        {/* Pieces */}
        {pieces.map((p, i) => (
          <g key={i}>
            <rect x={p.x + 4} y={p.y + 4} width={p.w} height={p.h} fill={p.color} stroke="rgba(232,201,154,0.15)" strokeWidth="0.5" rx="0.5"/>
            <text x={p.x + 4 + p.w / 2} y={p.y + 4 + p.h / 2 + 3} fill="rgba(232,201,154,0.75)" fontSize="7.5" textAnchor="middle" fontFamily="monospace">{p.label}</text>
          </g>
        ))}
      </svg>
      {/* Yield badge */}
      <div style={{ position: 'absolute', top: '12px', right: '12px', padding: '6px 14px', background: 'rgba(10,14,28,0.9)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '3px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-sora), Sora, sans-serif', fontSize: '20px', fontWeight: 700, color: '#06b6d4', letterSpacing: '-0.04em', lineHeight: 1 }}>93.7%</div>
        <div style={{ fontFamily: 'monospace', fontSize: '8px', color: 'rgba(245,240,235,0.4)', marginTop: '2px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Board yield</div>
      </div>
    </div>
  )
}

/* ─── Feature row visual: G-code terminal ────────────────────────────────── */
function GcodeVisual() {
  const lines = [
    { prefix: 'G0',  body: ' X0.000 Y0.000 Z5.000',    color: '#06b6d4' },
    { prefix: 'G1',  body: ' Z-0.750 F100',             color: '#06b6d4' },
    { prefix: 'G1',  body: ' X24.000 F300',             color: '#e8c99a' },
    { prefix: 'G1',  body: ' Y34.500 F300',             color: '#e8c99a' },
    { prefix: 'G1',  body: ' X0.000 F300',              color: '#e8c99a' },
    { prefix: 'G1',  body: ' Y0.000 F300',              color: '#e8c99a' },
    { prefix: 'G0',  body: ' Z5.000',                   color: '#06b6d4' },
    { prefix: '; →', body: ' Cut: Bottom — pass 1/3',   color: 'rgba(245,240,235,0.28)' },
    { prefix: 'G0',  body: ' X1.875 Y1.875 Z5.000',    color: '#06b6d4' },
    { prefix: 'G1',  body: ' Z-0.750 F100',             color: '#06b6d4' },
    { prefix: 'G1',  body: ' X22.125 F300',             color: '#e8c99a' },
    { prefix: 'G1',  body: ' Y32.625 F300',             color: '#e8c99a' },
  ]
  const formats = ['GRBL', 'SBP', 'FANUC', 'Mach3', 'LinuxCNC']
  return (
    <div style={{ background: '#090c1a', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(6,182,212,0.12)', fontFamily: 'var(--font-mono), JetBrains Mono, monospace' }}>
      {/* Terminal title bar */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {['#e25f5f','#f3c343','#4ec94e'].map((c, i) => (
          <span key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c, opacity: 0.7, flexShrink: 0 }} />
        ))}
        <span style={{ fontSize: '10px', color: 'rgba(245,240,235,0.3)', letterSpacing: '0.04em', marginLeft: '6px' }}>kitchen-base-cabinet.nc</span>
      </div>
      {/* Code lines */}
      <div style={{ padding: '16px 18px', fontSize: '11px', lineHeight: 1.85 }}>
        {lines.map((l, i) => (
          <div key={i} style={{ display: 'flex', gap: '4px' }}>
            <span style={{ color: 'rgba(245,240,235,0.2)', userSelect: 'none', minWidth: '22px', textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
            <span style={{ marginLeft: '10px', color: l.color, opacity: l.prefix.startsWith(';') ? 1 : 0.95 }}>
              <span style={{ color: l.prefix.startsWith(';') ? 'rgba(245,240,235,0.28)' : '#c084fc' }}>{l.prefix}</span>
              {l.body}
            </span>
          </div>
        ))}
      </div>
      {/* Format chips */}
      <div style={{ padding: '10px 18px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {formats.map(f => (
          <span key={f} style={{ padding: '2px 8px', borderRadius: '2px', fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em', background: 'rgba(6,182,212,0.10)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.18)' }}>{f}</span>
        ))}
      </div>
    </div>
  )
}

/* ─── Ticker items ────────────────────────────────────────────────────────── */
const TICKER_ITEMS = [
  'Cabinet Builder', 'Cut List Generator', 'Advanced Nesting', 'G-Code Export',
  'Shapeoko', 'X-Carve', 'ShopBot', 'GRBL', 'OBJ / STL / 3MF', 'DXF Export',
  'Board Yield Optimizer', 'Scrap Tracker', 'Hardware Finder', 'Style Presets',
  'Design Doctor', 'Cost Optimizer', 'Material Selector', 'Edge Banding',
]

/* ─── Compatible machines ─────────────────────────────────────────────────── */
const MACHINES = [
  { name: 'Shapeoko',   fmt: 'GRBL' },
  { name: 'X-Carve',    fmt: 'GRBL' },
  { name: 'ShopBot',    fmt: 'SBP' },
  { name: 'Openbuilds', fmt: 'GRBL' },
  { name: 'Avid CNC',   fmt: 'FANUC' },
  { name: 'Mach3/4',    fmt: 'G-code' },
]

/* ─── Pricing tiers ───────────────────────────────────────────────────────── */
const PLANS = [
  {
    name: 'Free',
    price: 0,
    desc: 'Try it with no credit card.',
    features: ['3 projects', 'Basic templates', 'Cut list generation', 'GRBL G-code export', 'Community support'],
    cta: 'Get started free',
    highlighted: false,
  },
  {
    name: 'Hobbyist',
    price: 9,
    desc: 'For serious weekend builders.',
    features: ['Unlimited projects', 'All cabinet templates', 'Waste optimization', 'All CNC formats', '3D exports (OBJ, STL, DXF)', 'Email support'],
    cta: 'Start Hobbyist',
    highlighted: true,
  },
  {
    name: 'Pro',
    price: 29,
    desc: 'For YouTubers and small shops.',
    features: ['Everything in Hobbyist', 'Advanced non-guillotine nesting', 'Live hardware pricing', 'Team collaboration (3 seats)', 'Priority support', 'API access'],
    cta: 'Start Pro',
    highlighted: false,
  },
  {
    name: 'Shop',
    price: 79,
    desc: 'Full production shop.',
    features: ['Everything in Pro', 'Unlimited team members', 'Custom export branding', 'Dedicated account manager', 'Phone support', 'Custom integrations'],
    cta: 'Talk to us',
    highlighted: false,
  },
]

/* ─── Main Page ───────────────────────────────────────────────────────────── */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'KerfOS',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'CNC cabinet design software. Design parametric cabinets, generate cut lists, and export G-code for ShopBot, Shapeoko, X-Carve, and any GRBL machine.',
  url: 'https://kerfos.com',
  creator: { '@type': 'Organization', name: 'Modology Studios', url: 'https://modologystudios.com' },
}

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ScrollBar />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="hero-dark hero-section" style={{
        minHeight: 'calc(100vh - 60px)',
        background: '#0a0e1c',
        position: 'relative',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
      }}>
        {/* Animated grid overlay */}
        <div className="hero-grid-bg" aria-hidden="true" />

        {/* Left: editorial copy */}
        <div className="hero-copy" style={{
          padding: '80px 0 80px 60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
          maxWidth: '640px',
        }}>
          {/* Eyebrow badge */}
          <div className="fade-up fade-up-1" style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '4px 12px', borderRadius: '2px',
              border: '1px solid rgba(6,182,212,0.25)',
              background: 'rgba(6,182,212,0.06)',
              fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#06b6d4',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#06b6d4', display: 'inline-block', flexShrink: 0 }} />
              Free to start — no credit card
            </span>
          </div>

          {/* Headline */}
          <h1 className="fade-up fade-up-2" style={{
            fontFamily: 'var(--font-sora), Sora, sans-serif',
            fontSize: 'clamp(44px, 5.5vw, 80px)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1.02,
            color: '#f5f0eb',
            marginBottom: '28px',
          }}>
            CNC cabinet<br />
            software for<br />
            <span style={{ color: '#06b6d4' }}>woodworkers<br />
            who ship.</span>
          </h1>

          {/* Subtext */}
          <p className="fade-up fade-up-3" style={{
            fontSize: '17px',
            lineHeight: 1.7,
            color: 'rgba(245,240,235,0.55)',
            maxWidth: '440px',
            marginBottom: '40px',
          }}>
            Design cabinets, generate precise cut lists, and send G-code to your CNC
            in minutes — not days. No $10,000 license. No 40-hour training video.
          </p>

          {/* CTAs */}
          <div className="fade-up fade-up-4" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '48px' }}>
            <Link href="/design/builder" className="k-btn k-btn-lg" style={{
              background: '#06b6d4', color: '#0a0e1c', fontWeight: 700,
              border: 'none',
            }}>
              Start building free →
            </Link>
            <Link href="/community/gallery" className="k-btn k-btn-lg" style={{
              background: 'rgba(245,240,235,0.06)',
              color: 'rgba(245,240,235,0.8)',
              border: '1px solid rgba(245,240,235,0.12)',
            }}>
              See what people build
            </Link>
          </div>

          {/* Value props strip */}
          <div className="fade-up fade-up-5" style={{
            display: 'flex',
            gap: '32px',
            paddingTop: '28px',
            borderTop: '1px solid rgba(245,240,235,0.08)',
          }}>
            {[
              { val: '$0',   label: 'Free to start' },
              { val: '100%', label: 'Browser-based' },
              { val: '6+',   label: 'CNC formats' },
            ].map(s => (
              <div key={s.label}>
                <div style={{
                  fontFamily: 'var(--font-sora), Sora, sans-serif',
                  fontSize: '26px', fontWeight: 700,
                  letterSpacing: '-0.04em', color: '#f5f0eb', lineHeight: 1,
                }}>{s.val}</div>
                <div style={{ fontSize: '11px', color: 'rgba(245,240,235,0.4)', marginTop: '4px', letterSpacing: '0.02em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: 3D canvas — full height, no border-radius, bleeds to edge */}
        <div className="hero-canvas" style={{ position: 'relative', borderLeft: '1px solid rgba(196,93,44,0.12)', overflow: 'hidden' }}>
          <CabinetPreview
            cabinet={DEMO_CABINET}
            material={null}
            components={DEMO_COMPONENTS}
            selectedId={null}
            onSelect={() => {}}
            onMove={() => {}}
            autoRotate
          />
          {/* Live demo badge */}
          <div style={{
            position: 'absolute', top: '16px', left: '16px',
            background: 'rgba(10,14,28,0.8)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(6,182,212,0.2)',
            padding: '5px 12px', borderRadius: '2px',
            display: 'flex', alignItems: 'center', gap: '7px',
            pointerEvents: 'none', zIndex: 10,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#06b6d4', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(245,240,235,0.7)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Live demo · drag to orbit
            </span>
          </div>
          {/* Open builder CTA */}
          <div style={{ position: 'absolute', bottom: '60px', right: '16px', zIndex: 10 }}>
            <Link href="/design/builder" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px',
              background: 'rgba(6,182,212,0.12)',
              color: '#06b6d4',
              border: '1px solid rgba(6,182,212,0.25)',
              backdropFilter: 'blur(10px)',
              borderRadius: '2px',
              fontSize: '12px', fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 150ms ease',
              letterSpacing: '0.01em',
            }}>
              Open builder →
            </Link>
          </div>
          {/* Measurement annotations */}
          <div style={{
            position: 'absolute', top: '16px', right: '16px',
            display: 'flex', flexDirection: 'column', gap: '4px',
            pointerEvents: 'none', zIndex: 10,
          }}>
            {[{ label: 'W', val: '24.00"' }, { label: 'H', val: '34.50"' }, { label: 'D', val: '23.75"' }].map(d => (
              <div key={d.label} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(10,14,28,0.75)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(196,93,44,0.15)',
                padding: '3px 8px', borderRadius: '2px',
              }}>
                <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(232,201,154,0.5)', letterSpacing: '0.06em' }}>{d.label}</span>
                <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '11px', fontWeight: 500, color: '#e8c99a' }}>{d.val}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TICKER STRIP ─────────────────────────────────────────────── */}
      <div
        style={{
          borderBottom: '1px solid var(--k-border)',
          padding: '14px 0',
          background: '#080b17',
          overflow: 'hidden',
        }}
      >
        <div className="k-ticker-wrap">
          <div className="k-ticker">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span
                key={i}
                style={{
                  padding: '0 20px',
                  fontSize: '12px',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: i % 6 === 0 ? '#06b6d4' : 'rgba(245,240,235,0.3)',
                  whiteSpace: 'nowrap',
                }}
              >
                {item}
                {i % 3 === 2 && <span style={{ marginLeft: '20px', color: 'var(--k-border-strong)', opacity: 0.5 }}>—</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── COMPATIBLE CNC ───────────────────────────────────────────── */}
      <section style={{ padding: '56px 40px', maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
        <p className="k-label" style={{ marginBottom: '24px' }}>Exports G-code for</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {MACHINES.map(({ name, fmt }) => (
            <div
              key={name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                background: 'var(--k-surface)',
                border: '1px solid var(--k-border-mid)',
                borderRadius: 'var(--k-r-sm)',
                cursor: 'default',
                transition: 'border-color 200ms ease, background 200ms ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(6,182,212,0.4)'
                ;(e.currentTarget as HTMLDivElement).style.background = 'var(--k-bg-subtle)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--k-border-mid)'
                ;(e.currentTarget as HTMLDivElement).style.background = 'var(--k-surface)'
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--k-ink-2)' }}>{name}</span>
              <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '10px', fontWeight: 500, letterSpacing: '0.04em', color: 'var(--k-amber)', background: 'var(--k-amber-soft)', padding: '2px 6px', borderRadius: '2px' }}>{fmt}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURE ROWS ─────────────────────────────────────────────── */}
      <section style={{ padding: '96px 0' }}>

        {/* Feature 1: Cabinet Builder */}
        <div className="feat-row" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center', marginBottom: '112px' }}>
          <div>
            <p className="k-label" style={{ marginBottom: '14px' }}>Design</p>
            <h2 style={{ fontFamily: 'var(--font-sora), Sora, sans-serif', fontSize: 'clamp(24px, 2.8vw, 36px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.12, color: 'var(--k-ink)', marginBottom: '20px' }}>
              Parametric cabinet design that thinks in inches
            </h2>
            <p style={{ fontSize: '16px', lineHeight: 1.75, color: 'var(--k-ink-3)', marginBottom: '32px', maxWidth: '420px' }}>
              Define dimensions once — KerfOS generates every part, every joint, and every cut automatically. Framed or frameless, inset or overlay.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Part list generated from your dimensions', 'Framed & frameless construction modes', 'Hardware hole patterns included', 'Build modular runs of any width'].map(item => (
                <li key={item} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px', fontSize: '14px', color: 'var(--k-ink-2)' }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--k-amber-soft)', border: '1px solid rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.8 6.8L7.5 2" stroke="var(--k-amber-dark)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/design/builder" className="k-btn k-btn-primary" style={{ marginTop: '28px' }}>
              Try the builder →
            </Link>
          </div>
          <BlueprintVisual />
        </div>

        {/* Feature 2: Board Yield — reversed */}
        <div style={{ background: 'var(--k-surface)', borderTop: '1px solid var(--k-border)', borderBottom: '1px solid var(--k-border)', padding: '96px 40px', marginBottom: '0' }}>
          <div className="feat-row feat-row-reverse" style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
            <NestingVisual />
            <div>
              <p className="k-label" style={{ marginBottom: '14px' }}>Optimize</p>
              <h2 style={{ fontFamily: 'var(--font-sora), Sora, sans-serif', fontSize: 'clamp(24px, 2.8vw, 36px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.12, color: 'var(--k-ink)', marginBottom: '20px' }}>
                Waste less. Know your yield before the first cut.
              </h2>
              <p style={{ fontSize: '16px', lineHeight: 1.75, color: 'var(--k-ink-3)', marginBottom: '32px', maxWidth: '420px' }}>
                Advanced non-guillotine nesting fits your parts into fewer sheets. See exactly what you need to buy before you touch your material.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {['93%+ average board yield', 'Grain-direction aware packing', 'Scrap tracking and re-use', 'Multi-sheet projects with one click'].map(item => (
                  <li key={item} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px', fontSize: '14px', color: 'var(--k-ink-2)' }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--k-amber-soft)', border: '1px solid rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.8 6.8L7.5 2" stroke="var(--k-amber-dark)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/optimize" className="k-btn k-btn-primary" style={{ marginTop: '28px' }}>
                See optimizer →
              </Link>
            </div>
          </div>
        </div>

        {/* Feature 3: G-Code Export */}
        <div className="feat-row" style={{ maxWidth: '1280px', margin: '0 auto', padding: '96px 40px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          <div>
            <p className="k-label" style={{ marginBottom: '14px' }}>Export</p>
            <h2 style={{ fontFamily: 'var(--font-sora), Sora, sans-serif', fontSize: 'clamp(24px, 2.8vw, 36px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.12, color: 'var(--k-ink)', marginBottom: '20px' }}>
              G-Code for whatever's in the shop
            </h2>
            <p style={{ fontSize: '16px', lineHeight: 1.75, color: 'var(--k-ink-3)', marginBottom: '32px', maxWidth: '420px' }}>
              Pick your post-processor and export in seconds. Shapeoko, X-Carve, ShopBot, Mach3 — if it speaks G-code, KerfOS speaks back.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['GRBL, SBP, FANUC, Mach3, LinuxCNC', 'Tool change and depth pass support', 'DXF, OBJ, STL 3D exports', 'One-click cut list PDF'].map(item => (
                <li key={item} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px', fontSize: '14px', color: 'var(--k-ink-2)' }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--k-amber-soft)', border: '1px solid rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.8 6.8L7.5 2" stroke="var(--k-amber-dark)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <GcodeVisual />
        </div>

      </section>

      {/* ── VS MICROVELLUM ───────────────────────────────────────────── */}
      <section style={{ padding: '80px 40px', background: 'var(--k-surface)', borderTop: '1px solid var(--k-border)', borderBottom: '1px solid var(--k-border)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p className="k-label" style={{ marginBottom: '12px', textAlign: 'center' }}>Why KerfOS</p>
          <h2 className="k-heading-lg" style={{ textAlign: 'center', marginBottom: '48px' }}>
            The honest comparison
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '32px', alignItems: 'stretch' }} className="compare-grid">
            {/* KerfOS column */}
            <div>
              <div style={{ fontFamily: 'var(--font-sora), Sora, sans-serif', fontWeight: 700, fontSize: '20px', letterSpacing: '-0.03em', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>KerfOS</span>
                <span className="k-badge k-badge-amber" style={{ fontWeight: 600 }}>You&apos;re here</span>
              </div>
              {[
                ['Starts free', '0 training required'],
                ['Web-based — works anywhere', 'Runs in your browser'],
                ['From $9/month', 'No per-seat enterprise license'],
                ['Designed for CNC hobbyists', 'Shop-class learning curve: none'],
                ['G-code for every major CNC', 'Not locked to one machine brand'],
              ].map(([a, b]) => (
                <div key={a} style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--k-amber-soft)', border: '1px solid rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.2 7.2L8 3" stroke="#0e7490" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--k-ink)', letterSpacing: '-0.01em' }}>{a}</div>
                    <div style={{ fontSize: '12px', color: 'var(--k-ink-3)', marginTop: '1px' }}>{b}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '1px', flex: 1, background: 'var(--k-border-mid)' }} />
            </div>

            {/* Microvellum column */}
            <div>
              <div style={{ fontFamily: 'var(--font-sora), Sora, sans-serif', fontWeight: 600, fontSize: '20px', letterSpacing: '-0.03em', color: 'var(--k-ink-3)', marginBottom: '24px' }}>
                Microvellum
              </div>
              {[
                ['$3,500–7,000+ license', 'Plus annual maintenance fees'],
                ['AutoCAD dependency', 'Required as a base platform'],
                ['40+ hour training', 'Video library + certification tracks'],
                ['Enterprise-first design', 'Built for production shops of 10+'],
                ['Windows only', 'On-premise installation required'],
              ].map(([a, b]) => (
                <div key={a} style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(0,0,0,0.04)', border: '1px solid var(--k-border-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3 3L7 7M7 3L3 7" stroke="var(--k-ink-4)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--k-ink-2)', letterSpacing: '-0.01em' }}>{a}</div>
                    <div style={{ fontSize: '12px', color: 'var(--k-ink-4)', marginTop: '1px' }}>{b}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '96px 40px', background: 'var(--k-bg-subtle)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p className="k-label" style={{ marginBottom: '12px' }}>Pricing</p>
            <h2 className="k-heading-lg">
              Pay for what you use.{' '}
              <span style={{ color: 'var(--k-ink-3)', fontWeight: 400 }}>Cancel anytime.</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', alignItems: 'start' }} className="pricing-grid">
            {PLANS.map((plan) => {
              const dark = plan.highlighted
              return (
                <div
                  key={plan.name}
                  style={{
                    padding: '28px 24px',
                    borderRadius: '4px',
                    border: dark ? 'none' : '1px solid var(--k-border)',
                    background: dark ? '#0a0e1c' : 'var(--k-surface)',
                    boxShadow: dark ? '0 20px 60px rgba(10,14,28,0.25)' : 'var(--k-shadow-xs)',
                    position: 'relative',
                    marginTop: dark ? '-12px' : '0',
                    paddingTop: dark ? '36px' : '28px',
                    paddingBottom: dark ? '36px' : '28px',
                  } as React.CSSProperties}
                >
                  {dark && (
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '2px',
                        background: 'rgba(6,182,212,0.15)',
                        border: '1px solid rgba(6,182,212,0.25)',
                        fontSize: '10px', fontWeight: 700,
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                        color: '#06b6d4',
                      }}>Most popular</span>
                    </div>
                  )}

                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      fontFamily: 'var(--font-sora), Sora, sans-serif',
                      fontWeight: 700, fontSize: '15px',
                      letterSpacing: '-0.02em', marginBottom: '4px',
                      color: dark ? '#f5f0eb' : 'var(--k-ink)',
                    }}>{plan.name}</div>
                    <div style={{ fontSize: '12px', color: dark ? 'rgba(245,240,235,0.45)' : 'var(--k-ink-4)' }}>{plan.desc}</div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <span style={{
                      fontFamily: 'var(--font-sora), Sora, sans-serif',
                      fontWeight: 700, fontSize: '40px',
                      letterSpacing: '-0.04em',
                      color: dark ? '#f5f0eb' : 'var(--k-ink)',
                    }}>
                      {plan.price === 0 ? 'Free' : `$${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span style={{ fontSize: '13px', color: dark ? 'rgba(245,240,235,0.4)' : 'var(--k-ink-4)', marginLeft: '4px' }}>/mo</span>
                    )}
                  </div>

                  <Link
                    href="/design/builder"
                    style={{
                      display: 'inline-flex',
                      width: '100%',
                      justifyContent: 'center',
                      marginBottom: '24px',
                      padding: '10px 16px',
                      borderRadius: '3px',
                      fontSize: '13px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'opacity 150ms ease',
                      background: dark ? '#06b6d4' : 'transparent',
                      color: dark ? '#0a0e1c' : 'var(--k-ink-2)',
                      border: dark ? 'none' : '1px solid var(--k-border-mid)',
                    }}
                  >
                    {plan.cta}
                  </Link>

                  <div style={{ borderTop: `1px solid ${dark ? 'rgba(245,240,235,0.08)' : 'var(--k-border)'}`, paddingTop: '16px' }}>
                    {plan.features.map((f) => (
                      <div key={f} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ marginTop: '2px', flexShrink: 0 }}>
                          <path d="M2.5 6.5L5.5 9.5L10.5 3.5"
                            stroke={dark ? '#06b6d4' : 'var(--k-ink-3)'}
                            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span style={{ fontSize: '13px', lineHeight: 1.5, color: dark ? 'rgba(245,240,235,0.65)' : 'var(--k-ink-2)' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────── */}
      <section style={{ padding: '80px 40px', background: 'var(--k-ink)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: 'var(--font-sora), Sora, sans-serif',
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              color: 'var(--k-bg)',
              marginBottom: '20px',
            }}
          >
            Your first cut list is 10 minutes away
          </h2>
          <p style={{ fontSize: '17px', color: 'rgba(248,247,244,0.6)', lineHeight: 1.65, marginBottom: '36px', maxWidth: '480px', margin: '0 auto 36px' }}>
            Free to start. No credit card. Works in the browser on any machine — even out in the shop on an iPad.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/design/builder" className="k-btn k-btn-amber k-btn-lg">
              Open the builder
            </Link>
            <Link
              href="/community/gallery"
              className="k-btn k-btn-lg"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--k-bg)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              Browse the gallery
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer style={{ padding: '48px 40px 40px', borderTop: '1px solid var(--k-border)', background: 'var(--k-bg)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px' }} className="footer-grid">
          <div>
            <div style={{ fontFamily: 'var(--font-sora), Sora, sans-serif', fontWeight: 700, fontSize: '18px', letterSpacing: '-0.04em', marginBottom: '10px', display: 'flex', alignItems: 'baseline', gap: '1px' }}>
              <span style={{ color: '#0a0e1c' }}>Kerf</span>
              <span style={{ color: '#06b6d4', fontWeight: 400 }}>OS</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--k-ink-3)', lineHeight: 1.65, maxWidth: '260px' }}>
              Precision cabinet software for woodworkers who know what a kerf is.
            </p>
          </div>
          {[
            { title: 'Product', links: [['Cabinet Builder', '/design/builder'], ['Cut List', '/optimize/cutlist'], ['G-Code Export', '/export/gcode'], ['Pricing', '/pricing']] },
            { title: 'Learn', links: [['Gallery', '/community/gallery'], ['Templates', '/design/templates'], ['Hardware Finder', '/hardware/finder'], ['Community', '/community']] },
            { title: 'Company', links: [['About', '/about'], ['Changelog', '/changelog'], ['Support', '/support'], ['Privacy', '/privacy']] },
          ].map((col) => (
            <div key={col.title}>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--k-ink-4)', marginBottom: '16px' }}>{col.title}</div>
              {col.links.map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  style={{ display: 'block', fontSize: '13px', color: 'var(--k-ink-3)', textDecoration: 'none', marginBottom: '8px', transition: 'color 120ms ease' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--k-ink)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--k-ink-3)' }}
                >
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div
          style={{
            maxWidth: '1280px',
            margin: '40px auto 0',
            paddingTop: '24px',
            borderTop: '1px solid var(--k-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '12px', color: 'var(--k-ink-4)' }}>© 2026 KerfOS. All rights reserved.</span>
          <span className="k-mono" style={{ fontSize: '11px', color: 'var(--k-ink-4)' }}>
            kerf /kərf/ n. — the slot made by a cutting tool
          </span>
        </div>
      </footer>

      {/* ── Responsive overrides ──────────────────────────────────────── */}
      <style>{`
        @media (max-width: 900px) {
          /* Hero */
          .hero-section { grid-template-columns: 1fr !important; min-height: auto !important; }
          .hero-canvas { display: none !important; }
          .hero-copy { padding: 56px 24px 48px !important; max-width: 100% !important; }

          /* Feature rows */
          .feat-row { grid-template-columns: 1fr !important; gap: 40px !important; padding-left: 24px !important; padding-right: 24px !important; margin-bottom: 0 !important; }
          .feat-row-reverse > *:first-child { order: 2; }
          .feat-row-reverse > *:last-child { order: 1; }

          /* Grids */
          .bento-grid { grid-template-columns: 1fr !important; }
          .bento-grid > div[style*="span 2"] { grid-column: span 1 !important; }
          .compare-grid { grid-template-columns: 1fr !important; }
          .compare-grid > div:nth-child(2) { display: none !important; }
          .pricing-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; }

          /* Section padding */
          section[style*="padding: '96px 0'"] { padding: 48px 0 !important; }
          section[style*="padding: '96px 40px'"] { padding: 48px 24px !important; }
          section[style*="padding: '80px 40px'"] { padding: 48px 24px !important; }
          section[style*="padding: '56px 40px'"] { padding: 32px 24px !important; }
        }
        @media (max-width: 600px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
          .hero-copy { padding: 40px 20px 36px !important; }
          .feat-row { padding-left: 20px !important; padding-right: 20px !important; gap: 32px !important; }
        }
      `}</style>
    </>
  )
}

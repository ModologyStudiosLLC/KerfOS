'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    label: 'Design',
    href: '/design',
    children: [
      { label: 'Cabinet Builder', href: '/design/builder' },
      { label: 'Style Presets', href: '/design/presets' },
      { label: 'Templates', href: '/design/templates' },
      { label: 'Sketch Import', href: '/design/sketch' },
      { label: 'AR Scanner', href: '/design/ar-scanner' },
    ],
  },
  {
    label: 'Materials',
    href: '/materials',
    children: [
      { label: 'Material Selector', href: '/materials/selector' },
      { label: 'Multi-Material', href: '/materials/multi' },
      { label: 'Edge Banding', href: '/materials/edge-banding' },
    ],
  },
  {
    label: 'Optimize',
    href: '/optimize',
    children: [
      { label: 'Cut List', href: '/optimize/cutlist' },
      { label: 'Nesting', href: '/optimize/nesting' },
      { label: 'Cost Optimizer', href: '/optimize/cost' },
      { label: 'Design Doctor', href: '/optimize/doctor' },
      { label: 'Scrap Tracker', href: '/optimize/scrap' },
      { label: 'Board Yield', href: '/optimize/yield' },
    ],
  },
  {
    label: 'Export',
    href: '/export',
    children: [
      { label: 'G-Code', href: '/export/gcode' },
      { label: '3D Export', href: '/export/3d' },
    ],
  },
  {
    label: 'Hardware',
    href: '/hardware',
    children: [
      { label: 'Hardware Finder', href: '/hardware/finder' },
      { label: 'Recommendations', href: '/hardware/recommendations' },
    ],
  },
  {
    label: 'Community',
    href: '/community',
    children: [
      { label: 'Gallery', href: '/community/gallery' },
      { label: 'Brag Sheet', href: '/community/brag-sheet' },
    ],
  },
]

function KerfOSLogo() {
  return (
    <Link href="/" className="flex items-center gap-3 group" aria-label="KerfOS home">
      {/* Logomark: two stacked panels with a precision kerf cut */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Top panel */}
        <rect x="2" y="2" width="28" height="12" rx="2.5" fill="#141414" />
        {/* Bottom panel */}
        <rect x="2" y="18" width="28" height="12" rx="2.5" fill="#141414" />
        {/* Kerf cut line — amber precision accent */}
        <rect x="2" y="15" width="28" height="2" rx="1" fill="#E8A030" />
        {/* CNC path indicator on top panel */}
        <circle cx="22" cy="8" r="2" fill="#E8A030" />
        <path d="M8 8 L18 8" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
      </svg>
      {/* Wordmark */}
      <div className="flex items-baseline gap-0.5">
        <span
          style={{
            fontFamily: 'var(--font-sora), Sora, sans-serif',
            fontWeight: 700,
            fontSize: '18px',
            letterSpacing: '-0.04em',
            color: '#141414',
            lineHeight: 1,
          }}
        >
          Kerf
        </span>
        <span
          style={{
            fontFamily: 'var(--font-sora), Sora, sans-serif',
            fontWeight: 400,
            fontSize: '18px',
            letterSpacing: '-0.02em',
            color: '#787878',
            lineHeight: 1,
          }}
        >
          OS
        </span>
      </div>
    </Link>
  )
}

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: scrolled ? 'rgba(248, 247, 244, 0.88)' : 'var(--k-bg)',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--k-border)' : '1px solid transparent',
        transition: 'background-color 200ms ease, border-color 200ms ease, backdrop-filter 200ms ease',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        {/* Logo */}
        <KerfOSLogo />

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1" style={{ flex: 1 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 10px',
                    borderRadius: 'var(--k-r-sm)',
                    fontSize: '13px',
                    fontWeight: isActive ? 500 : 400,
                    letterSpacing: '-0.01em',
                    color: isActive ? 'var(--k-ink)' : 'var(--k-ink-2)',
                    background: isActive ? 'var(--k-surface-2)' : 'transparent',
                    transition: 'color 120ms ease, background 120ms ease',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--k-ink)'
                      e.currentTarget.style.background = 'var(--k-surface-2)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--k-ink-2)'
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  {item.label}
                  {item.children && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.5, marginTop: 1 }}>
                      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </Link>

                {/* Dropdown */}
                {item.children && activeDropdown === item.label && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      left: 0,
                      minWidth: '180px',
                      background: 'var(--k-surface)',
                      border: '1px solid var(--k-border)',
                      borderRadius: 'var(--k-r-md)',
                      boxShadow: 'var(--k-shadow-lg)',
                      padding: '6px',
                      zIndex: 200,
                    }}
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        style={{
                          display: 'block',
                          padding: '7px 12px',
                          borderRadius: 'var(--k-r-xs)',
                          fontSize: '13px',
                          color: 'var(--k-ink-2)',
                          letterSpacing: '-0.01em',
                          textDecoration: 'none',
                          transition: 'color 100ms ease, background 100ms ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--k-ink)'
                          e.currentTarget.style.background = 'var(--k-bg-subtle)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--k-ink-2)'
                          e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Right: auth CTAs */}
        <div className="hidden md:flex items-center gap-2">
          <button
            style={{
              padding: '7px 14px',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--k-ink-2)',
              background: 'transparent',
              border: 'none',
              borderRadius: 'var(--k-r-sm)',
              cursor: 'pointer',
              letterSpacing: '-0.01em',
              transition: 'color 120ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--k-ink)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--k-ink-2)' }}
          >
            Sign in
          </button>
          <Link
            href="/pricing"
            className="k-btn k-btn-primary k-btn-sm"
          >
            Start free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          style={{
            width: '36px',
            height: '36px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <span style={{
            display: 'block', width: '18px', height: '1.5px',
            background: 'var(--k-ink)',
            transform: mobileOpen ? 'translateY(6.5px) rotate(45deg)' : 'none',
            transition: 'transform 200ms var(--k-ease)',
            transformOrigin: 'center',
          }} />
          <span style={{
            display: 'block', width: '18px', height: '1.5px',
            background: 'var(--k-ink)',
            opacity: mobileOpen ? 0 : 1,
            transition: 'opacity 150ms ease',
          }} />
          <span style={{
            display: 'block', width: '18px', height: '1.5px',
            background: 'var(--k-ink)',
            transform: mobileOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none',
            transition: 'transform 200ms var(--k-ease)',
            transformOrigin: 'center',
          }} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          style={{
            position: 'absolute',
            top: '60px',
            left: 0,
            right: 0,
            background: 'var(--k-surface)',
            borderBottom: '1px solid var(--k-border)',
            boxShadow: 'var(--k-shadow-md)',
            padding: '16px 24px 24px',
            zIndex: 99,
          }}
        >
          {navItems.map((item) => (
            <div key={item.href} style={{ marginBottom: '4px' }}>
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'block',
                  padding: '8px 0',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: 'var(--k-ink)',
                  textDecoration: 'none',
                  letterSpacing: '-0.01em',
                }}
              >
                {item.label}
              </Link>
              {item.children && (
                <div style={{ paddingLeft: '12px', borderLeft: '2px solid var(--k-border)', marginBottom: '8px' }}>
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: 'block',
                        padding: '5px 0',
                        fontSize: '13px',
                        color: 'var(--k-ink-3)',
                        textDecoration: 'none',
                      }}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--k-border)', paddingTop: '16px', marginTop: '8px', display: 'flex', gap: '10px' }}>
            <button className="k-btn k-btn-ghost" style={{ flex: 1 }}>Sign in</button>
            <Link href="/pricing" className="k-btn k-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              Start free
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

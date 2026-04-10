'use client'

import Link from 'next/link'
import { type ReactNode } from 'react'

interface Crumb {
  label: string
  href?: string
}

interface PageHeaderProps {
  crumbs: Crumb[]
  title: string
  subtitle?: string
  action?: ReactNode
}

export function PageHeader({ crumbs, title, subtitle, action }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: '40px' }}>
      {/* Breadcrumb */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '20px',
        }}
        aria-label="Breadcrumb"
      >
        {crumbs.map((crumb, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {i > 0 && (
              <span style={{ color: 'var(--k-border-strong)', fontSize: '12px' }}>/</span>
            )}
            {crumb.href ? (
              <Link
                href={crumb.href}
                style={{
                  fontFamily: 'var(--font-mono), monospace',
                  fontSize: '11px',
                  color: 'var(--k-ink-4)',
                  textDecoration: 'none',
                  letterSpacing: '0.01em',
                  transition: 'color 100ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--k-ink-2)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--k-ink-4)' }}
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                style={{
                  fontFamily: 'var(--font-mono), monospace',
                  fontSize: '11px',
                  color: 'var(--k-ink-2)',
                  letterSpacing: '0.01em',
                }}
              >
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      {/* Title row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        <div>
          <h1
            className="k-heading-lg"
            style={{ marginBottom: subtitle ? '8px' : 0 }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: '15px',
                color: 'var(--k-ink-3)',
                lineHeight: 1.6,
                maxWidth: '480px',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div style={{ flexShrink: 0, paddingTop: '4px' }}>
            {action}
          </div>
        )}
      </div>

      {/* Divider */}
      <div
        style={{
          height: '1px',
          background: 'var(--k-border)',
          marginTop: '28px',
        }}
      />
    </div>
  )
}

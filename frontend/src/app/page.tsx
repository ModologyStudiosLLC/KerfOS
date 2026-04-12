'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function ComingSoon() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) setSubmitted(true)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--k-bg)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Subtle top accent line */}
      <div style={{ height: '3px', background: 'var(--k-amber)', flexShrink: 0 }} />

      {/* Nav */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        height: '64px',
        borderBottom: '1px solid var(--k-border)',
        background: 'var(--k-surface)',
      }}>
        <Image
          src="/kerfos-logo.svg"
          alt="KerfOS"
          width={110}
          height={28}
          priority
        />
        <Link
          href="/login"
          style={{
            fontSize: '13px',
            color: 'var(--k-ink-2)',
            textDecoration: 'none',
            padding: '6px 14px',
            border: '1px solid var(--k-border-mid)',
            borderRadius: 'var(--k-r-md)',
            transition: 'border-color 0.15s, color 0.15s',
          }}
        >
          Sign in
        </Link>
      </nav>

      {/* Hero */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        textAlign: 'center',
      }}>
        {/* Mark */}
        <Image
          src="/kerfos-mark.svg"
          alt=""
          width={56}
          height={56}
          style={{ marginBottom: '32px' }}
        />

        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--k-amber-soft)',
          border: '1px solid var(--k-amber-glow)',
          borderRadius: 'var(--k-r-full)',
          padding: '4px 12px',
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--k-amber)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '24px',
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--k-amber)',
            display: 'inline-block',
          }} />
          Coming Soon
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 64px)',
          fontWeight: 700,
          color: 'var(--k-ink)',
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          marginBottom: '20px',
          maxWidth: '700px',
        }}>
          Cabinet design software built for the shop floor.
        </h1>

        <p style={{
          fontSize: '17px',
          color: 'var(--k-ink-2)',
          lineHeight: 1.65,
          maxWidth: '520px',
          marginBottom: '48px',
        }}>
          KerfOS is a 3D cabinet builder with live cut lists, material pricing,
          and DFM checking — designed for professional woodworkers and cabinet shops.
          We&apos;re putting the finishing touches on.
        </p>

        {/* Email capture */}
        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              gap: '8px',
              width: '100%',
              maxWidth: '420px',
            }}
          >
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 14px',
                fontSize: '14px',
                border: '1px solid var(--k-border-mid)',
                borderRadius: 'var(--k-r-md)',
                background: 'var(--k-surface)',
                color: 'var(--k-ink)',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: 600,
                background: 'var(--k-amber)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--k-r-md)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Notify me
            </button>
          </form>
        ) : (
          <div style={{
            padding: '12px 24px',
            background: 'var(--k-amber-soft)',
            border: '1px solid var(--k-amber-glow)',
            borderRadius: 'var(--k-r-md)',
            fontSize: '14px',
            color: 'var(--k-amber-dark)',
            fontWeight: 500,
          }}>
            You&apos;re on the list. We&apos;ll reach out when we launch.
          </div>
        )}

        <p style={{
          fontSize: '12px',
          color: 'var(--k-ink-4)',
          marginTop: '12px',
        }}>
          No spam. Launch notification only.
        </p>
      </main>

      {/* Feature strip */}
      <div style={{
        borderTop: '1px solid var(--k-border)',
        background: 'var(--k-surface)',
        padding: '32px 40px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'clamp(24px, 5vw, 80px)',
          flexWrap: 'wrap',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          {[
            ['3D Canvas', 'Build and visualize your cabinet assembly in real time'],
            ['Live Cut Lists', 'Optimized sheet layouts and export-ready PDFs'],
            ['Material Pricing', 'See your job cost as you design, not after'],
            ['Design Doctor', 'Catch fabrication problems before you cut'],
          ].map(([title, desc]) => (
            <div key={title} style={{ textAlign: 'center', maxWidth: '180px' }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--k-ink)',
                marginBottom: '4px',
              }}>
                {title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--k-ink-3)', lineHeight: 1.5 }}>
                {desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--k-border)',
        padding: '16px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: 'var(--k-ink-4)',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <span>© 2026 KerfOS. All rights reserved.</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link href="/privacy" style={{ color: 'var(--k-ink-4)', textDecoration: 'none' }}>Privacy</Link>
          <Link href="/terms"   style={{ color: 'var(--k-ink-4)', textDecoration: 'none' }}>Terms</Link>
        </div>
      </footer>
    </div>
  )
}

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Boxes, Scissors, FileOutput, Check } from 'lucide-react'
import PricingPage from '@/components/Pricing'

const STATS: [string, string][] = [
  ['Free', 'to start, no card required'],
  ['$0', 'vs. a $10,000 enterprise license'],
  ['<5 min', 'from design to G-code'],
]

const SHOWCASE: {
  icon: typeof Boxes
  eyebrow: string
  title: string
  body: string
  href: string
  cta: string
  image: string
  alt: string
}[] = [
  {
    icon: Boxes,
    eyebrow: 'Design',
    title: 'Build in 3D, not in your head.',
    body: 'Drag together boxes, faces, and hardware on a live parametric model. Every joint, reveal, and overlay updates in real time — no CAD license, no learning curve.',
    href: '/design/builder',
    cta: 'Open the builder',
    image: '/images/landing/workshop.jpg',
    alt: 'Craftsman marking up cabinet panel pieces on a workshop bench',
  },
  {
    icon: Scissors,
    eyebrow: 'Optimize',
    title: 'Know your cut list before you touch the saw.',
    body: 'KerfOS packs your sheet goods automatically, flags fabrication problems with Design Doctor, and prices the job against real material costs — before you commit a single board.',
    href: '/optimize/cutlist',
    cta: 'See the optimizer',
    image: '/images/landing/cnc-cut.jpg',
    alt: 'Close-up of a CNC router bit cutting a precise groove into a wood panel',
  },
  {
    icon: FileOutput,
    eyebrow: 'Fabricate',
    title: 'Export straight to your CNC.',
    body: 'G-code, DXF, PDF cut sheets, and shopping lists generated from the same model — so what you built on screen is exactly what shows up in the shop.',
    href: '/export/gcode',
    cta: 'View export options',
    image: '/images/landing/hero-kitchen.jpg',
    alt: 'Finished built-in cabinets installed in a modern kitchen',
  },
]

export default function Home() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) setSubmitted(true)
  }

  return (
    <div style={{ background: 'var(--k-bg)' }}>
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section
        style={{
          borderBottom: '1px solid var(--k-border)',
          background:
            'radial-gradient(1200px 600px at 100% -10%, var(--k-amber-soft), transparent 60%)',
        }}
      >
        <div
          className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-12 px-6 py-16 md:grid-cols-2 md:gap-10 md:px-10 md:py-24"
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--k-amber-soft)',
                border: '1px solid var(--k-amber-glow)',
                borderRadius: 'var(--k-r-full)',
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--k-amber-dark)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '24px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--k-amber)',
                  display: 'inline-block',
                }}
              />
              Early access — new tools shipping weekly
            </div>

            <h1
              className="k-heading"
              style={{
                fontSize: 'clamp(38px, 5.2vw, 60px)',
                letterSpacing: '-0.04em',
                marginBottom: '20px',
              }}
            >
              Cabinet design software built for the shop floor.
            </h1>

            <p
              style={{
                fontSize: '18px',
                color: 'var(--k-ink-2)',
                lineHeight: 1.65,
                maxWidth: '480px',
                marginBottom: '32px',
              }}
            >
              KerfOS is a 3D cabinet builder with live cut lists, material pricing, and
              fabrication checks — so DIY woodworkers and small shops can skip the
              enterprise CAD and get straight to cutting.
            </p>

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/register" className="k-btn k-btn-amber k-btn-lg">
                Get early access — it&apos;s free
              </Link>
              <Link href="/design/builder" className="k-btn k-btn-ghost k-btn-lg">
                Try the builder
              </Link>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--k-ink-4)' }}>
              No credit card. Free tier is permanent, not a trial.
            </p>
          </div>

          <div
            style={{
              position: 'relative',
              borderRadius: 'var(--k-r-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--k-shadow-float)',
              border: '1px solid var(--k-border)',
              aspectRatio: '4 / 3',
            }}
          >
            <Image
              src="/images/landing/hero-kitchen.jpg"
              alt="Custom cabinetry installed in a modern kitchen, designed in KerfOS"
              fill
              sizes="(max-width: 900px) 100vw, 560px"
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        </div>

        {/* Stat strip */}
        <div style={{ borderTop: '1px solid var(--k-border)', background: 'var(--k-surface)' }}>
          <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-6 py-8 sm:flex-row sm:justify-between md:px-10">
            {STATS.map(([value, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span
                  className="k-heading"
                  style={{ fontSize: '26px', letterSpacing: '-0.02em' }}
                >
                  {value}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--k-ink-3)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── Showcase ───────────────────────── */}
      <section className="mx-auto max-w-[1280px] px-6 py-20 md:px-10 md:py-28">
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p className="k-label" style={{ marginBottom: '16px' }}>
            From sketch to sawdust
          </p>
          <h2
            className="k-heading"
            style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', letterSpacing: '-0.03em' }}
          >
            One model, from first draft to finished cut.
          </h2>
        </div>

        <div className="flex flex-col gap-20 md:gap-28">
          {SHOWCASE.map((item, i) => {
            const Icon = item.icon
            const reversed = i % 2 === 1
            return (
              <div
                key={item.title}
                className={`grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16 ${
                  reversed ? 'md:[&>*:first-child]:order-2' : ''
                }`}
              >
                <div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--k-r-lg)',
                      background: 'var(--k-amber-soft)',
                      color: 'var(--k-amber-dark)',
                      marginBottom: '20px',
                    }}
                  >
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <p className="k-label" style={{ marginBottom: '12px' }}>
                    {item.eyebrow}
                  </p>
                  <h3
                    className="k-heading"
                    style={{ fontSize: 'clamp(22px, 2.4vw, 28px)', marginBottom: '16px' }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '16px',
                      color: 'var(--k-ink-2)',
                      lineHeight: 1.65,
                      marginBottom: '24px',
                      maxWidth: '440px',
                    }}
                  >
                    {item.body}
                  </p>
                  <Link
                    href={item.href}
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--k-ink)',
                      textDecoration: 'none',
                      borderBottom: '1px solid var(--k-border-strong)',
                      paddingBottom: '2px',
                    }}
                  >
                    {item.cta} →
                  </Link>
                </div>

                <div
                  style={{
                    position: 'relative',
                    borderRadius: 'var(--k-r-xl)',
                    overflow: 'hidden',
                    border: '1px solid var(--k-border)',
                    boxShadow: 'var(--k-shadow-md)',
                    aspectRatio: '4 / 3',
                  }}
                >
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 900px) 100vw, 560px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ───────────────────────── Why KerfOS ───────────────────────── */}
      <section
        style={{ borderTop: '1px solid var(--k-border)', background: 'var(--k-surface)' }}
      >
        <div className="mx-auto max-w-[1280px] px-6 py-20 md:px-10 md:py-24">
          <div
            className="grid grid-cols-1 gap-10 md:grid-cols-2"
          >
            <div>
              <p className="k-label" style={{ marginBottom: '16px' }}>
                Why not just use Microvellum
              </p>
              <h2
                className="k-heading"
                style={{ fontSize: 'clamp(26px, 3vw, 36px)', letterSpacing: '-0.03em', maxWidth: '420px' }}
              >
                Built for the one-person shop, not the enterprise sales call.
              </h2>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                'No $10,000 seat license or training course required',
                'Runs in the browser — no install, no dongle, no IT ticket',
                'Cut lists and G-code generated from the same model you designed',
                'Design Doctor catches fabrication mistakes before they cost material',
              ].map((line) => (
                <li
                  key={line}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: 'var(--k-amber-soft)',
                      color: 'var(--k-amber-dark)',
                      marginTop: '1px',
                    }}
                  >
                    <Check size={13} strokeWidth={3} />
                  </span>
                  <span style={{ fontSize: '15px', color: 'var(--k-ink-2)', lineHeight: 1.6 }}>
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ───────────────────────── Pricing ───────────────────────── */}
      <section id="pricing" style={{ borderTop: '1px solid var(--k-border)' }}>
        <PricingPage />
      </section>

      {/* ───────────────────────── Final CTA ───────────────────────── */}
      <section
        style={{
          borderTop: '1px solid var(--k-border)',
          background: 'var(--k-ink)',
        }}
      >
        <div className="mx-auto max-w-[720px] px-6 py-20 text-center md:px-10">
          <h2
            className="k-heading"
            style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', color: 'var(--k-bg)', marginBottom: '16px' }}
          >
            Get early access.
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(248,247,244,0.65)', marginBottom: '32px' }}>
            Join now and we&apos;ll email you the moment new tools ship — plus a free account the day you&apos;re ready to design.
          </p>

          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              className="mx-auto flex max-w-[420px] flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: '1px solid rgba(248,247,244,0.18)',
                  borderRadius: 'var(--k-r-md)',
                  background: 'rgba(248,247,244,0.06)',
                  color: 'var(--k-bg)',
                  outline: 'none',
                }}
              />
              <button type="submit" className="k-btn k-btn-amber">
                Notify me
              </button>
            </form>
          ) : (
            <div
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid var(--k-amber-glow)',
                borderRadius: 'var(--k-r-md)',
                fontSize: '14px',
                color: 'var(--k-amber)',
                fontWeight: 500,
              }}
            >
              You&apos;re on the list. We&apos;ll reach out when we launch.
            </div>
          )}
        </div>
      </section>

      {/* ───────────────────────── Footer ───────────────────────── */}
      <footer
        style={{
          borderTop: '1px solid var(--k-border)',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: 'var(--k-ink-4)',
          flexWrap: 'wrap',
          gap: '8px',
        }}
        className="md:px-10"
      >
        <span>© 2026 KerfOS. All rights reserved.</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link href="/about" style={{ color: 'var(--k-ink-4)', textDecoration: 'none' }}>About</Link>
          <Link href="/community" style={{ color: 'var(--k-ink-4)', textDecoration: 'none' }}>Community</Link>
          <Link href="/privacy" style={{ color: 'var(--k-ink-4)', textDecoration: 'none' }}>Privacy</Link>
          <Link href="/terms" style={{ color: 'var(--k-ink-4)', textDecoration: 'none' }}>Terms</Link>
        </div>
      </footer>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CopilotKit } from '@copilotkit/react-core'
import { CopilotChat } from '@copilotkit/react-ui'
import '@copilotkit/react-ui/styles.css'
import { PageHeader } from '@/components/PageHeader'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const PAID_TIERS = ['maker', 'shop', 'pro']

type Access = { status: 'loading' | 'signed-out' | 'free' } | { status: 'paid'; token: string }

export default function AssistantPage() {
  const [access, setAccess] = useState<Access>({ status: 'loading' })

  useEffect(() => {
    let token: string | null = null
    try {
      token = localStorage.getItem('auth_token')
    } catch {
      // storage unavailable: treat as signed out
    }
    if (!token) {
      setAccess({ status: 'signed-out' })
      return
    }
    fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => {
        if (!user) setAccess({ status: 'signed-out' })
        else if (PAID_TIERS.includes(user.tier)) setAccess({ status: 'paid', token: token as string })
        else setAccess({ status: 'free' })
      })
      .catch(() => setAccess({ status: 'signed-out' }))
  }, [])

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'kerfos', href: '/' }, { label: 'tools', href: '/tools' }, { label: 'assistant' }]}
        title="Assistant"
        subtitle="Ask for a quote or compare materials. Prices and sheet counts come from KerfOS, not the model."
      />
      {access.status === 'loading' && <p>Checking your account...</p>}
      {access.status === 'signed-out' && (
        <p>
          <Link href="/login">Sign in</Link> to use the assistant.
        </p>
      )}
      {access.status === 'free' && (
        <p>
          The assistant is included with paid plans. <Link href="/pricing">See plans</Link>.
        </p>
      )}
      {access.status === 'paid' && (
        <CopilotKit
          runtimeUrl="/api/copilotkit"
          agent="kerfos_assistant"
          headers={{ Authorization: `Bearer ${access.token}` }}
        >
          <div style={{ height: '70vh', maxWidth: 820 }}>
            <CopilotChat
              labels={{
                title: 'KerfOS Assistant',
                initial: 'Ask me to quote a base cabinet, or compare two materials.',
              }}
            />
          </div>
        </CopilotKit>
      )}
    </div>
  )
}

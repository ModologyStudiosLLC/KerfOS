'use client'

import { CopilotKit } from '@copilotkit/react-core'
import { CopilotChat } from '@copilotkit/react-ui'
import '@copilotkit/react-ui/styles.css'
import { PageHeader } from '@/components/PageHeader'

export default function AssistantPage() {
  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'kerfos', href: '/' }, { label: 'tools', href: '/tools' }, { label: 'assistant' }]}
        title="Assistant"
        subtitle="Ask for a quote or compare materials. Prices and sheet counts come from KerfOS, not the model."
      />
      <CopilotKit runtimeUrl="/api/copilotkit" agent="kerfos_assistant">
        <div style={{ height: '70vh', maxWidth: 820 }}>
          <CopilotChat
            labels={{
              title: 'KerfOS Assistant',
              initial: 'Ask me to quote a base cabinet, or compare two materials.',
            }}
          />
        </div>
      </CopilotKit>
    </div>
  )
}

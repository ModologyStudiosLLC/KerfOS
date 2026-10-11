import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime'
import { LangGraphHttpAgent } from '@copilotkit/runtime/langgraph'
import { NextRequest } from 'next/server'

const API_BASE = process.env.KERFOS_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const PAID_TIERS = new Set(['maker', 'shop', 'pro'])

const agent = new LangGraphHttpAgent({
  url: process.env.KERFOS_AGENT_URL || 'http://localhost:8123',
  headers: { 'x-agent-secret': process.env.AGENT_SHARED_SECRET || '' },
})

// The assistant spends model credits, so only signed-in users on a paid plan get through.
async function requirePaidUser(req: NextRequest): Promise<Response | null> {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return new Response('Sign in required', { status: 401 })

  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: auth }, cache: 'no-store' })
  } catch {
    return new Response('Could not verify your account', { status: 503 })
  }
  if (!res.ok) return new Response('Sign in required', { status: 401 })

  const user = await res.json()
  if (!PAID_TIERS.has(user.tier)) return new Response('A paid plan is required', { status: 403 })
  return null
}

export const POST = async (req: NextRequest) => {
  if (process.env.ASSISTANT_ENABLED !== 'true' || !process.env.AGENT_SHARED_SECRET) {
    return new Response('Assistant is not enabled', { status: 503 })
  }
  const denied = await requirePaidUser(req)
  if (denied) return denied

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    endpoint: '/api/copilotkit',
    serviceAdapter: new ExperimentalEmptyAdapter(),
    runtime: new CopilotRuntime({ agents: { kerfos_assistant: agent } }),
  })
  return handleRequest(req)
}

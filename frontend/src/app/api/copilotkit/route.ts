import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime'
import { LangGraphHttpAgent } from '@copilotkit/runtime/langgraph'
import { NextRequest } from 'next/server'

const agent = new LangGraphHttpAgent({
  url: process.env.KERFOS_AGENT_URL || 'http://localhost:8123',
  headers: { 'x-agent-secret': process.env.AGENT_SHARED_SECRET || '' },
})

export const POST = async (req: NextRequest) => {
  // The assistant spends model credits, so it stays off until configured (and is meant to sit behind login).
  if (process.env.ASSISTANT_ENABLED !== 'true' || !process.env.AGENT_SHARED_SECRET) {
    return new Response('Assistant is not enabled', { status: 503 })
  }
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    endpoint: '/api/copilotkit',
    serviceAdapter: new ExperimentalEmptyAdapter(),
    runtime: new CopilotRuntime({ agents: { kerfos_assistant: agent } }),
  })
  return handleRequest(req)
}

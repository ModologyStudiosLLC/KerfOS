import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime'
import { LangGraphHttpAgent } from '@copilotkit/runtime/langgraph'
import { NextRequest } from 'next/server'

const agent = new LangGraphHttpAgent({
  url: process.env.KERFOS_AGENT_URL || 'http://localhost:8123',
})

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    endpoint: '/api/copilotkit',
    serviceAdapter: new ExperimentalEmptyAdapter(),
    runtime: new CopilotRuntime({ agents: { kerfos_assistant: agent } }),
  })
  return handleRequest(req)
}

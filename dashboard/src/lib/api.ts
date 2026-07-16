import { demoAgents, demoDashboard, demoLogs, demoTemplates } from './demoData'
import type { Agent, AgentTemplate, CreateAgentInput, DashboardData, LogEntry } from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Errore API ${response.status}`)
  }
  return response.json() as Promise<T>
}

const wait = (ms = 260) => new Promise((resolve) => window.setTimeout(resolve, ms))

export const api = {
  async dashboard(): Promise<DashboardData> {
    if (isDemoMode) { await wait(); return demoDashboard }
    return request('/dashboard')
  },
  async agents(): Promise<Agent[]> {
    if (isDemoMode) { await wait(); return demoAgents }
    return request('/agents')
  },
  async agent(name: string): Promise<Agent> {
    if (isDemoMode) {
      await wait()
      const agent = demoAgents.find((item) => item.name === name)
      if (!agent) throw new Error('Agente non trovato')
      return agent
    }
    return request(`/agents/${encodeURIComponent(name)}`)
  },
  async templates(): Promise<AgentTemplate[]> {
    if (isDemoMode) { await wait(); return demoTemplates }
    return request('/templates')
  },
  async logs(): Promise<LogEntry[]> {
    if (isDemoMode) { await wait(); return demoLogs }
    return request('/logs')
  },
  async createAgent(input: CreateAgentInput): Promise<{ name: string; status: string }> {
    if (isDemoMode) { await wait(900); return { name: input.name, status: 'provisioning' } }
    return request('/agents', { method: 'POST', body: JSON.stringify(input) })
  },
  async restartAgent(name: string): Promise<{ status: string }> {
    if (isDemoMode) { await wait(700); return { status: 'restarting' } }
    return request(`/agents/${encodeURIComponent(name)}/restart`, { method: 'POST' })
  },
}

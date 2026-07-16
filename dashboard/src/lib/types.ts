export type AgentStatus = 'online' | 'offline' | 'unconfigured'
export type LogLevel = 'info' | 'warn' | 'error'

export interface TokenUsage {
  today: number
  week: number
  month: number
}

export interface Agent {
  name: string
  displayName: string
  template: string
  status: AgentStatus
  provider: string
  telegramUsername?: string
  lastActivityAt?: string
  createdAt: string
  tokenUsage: TokenUsage
  estimatedCostMonth: number
  soul?: string
  cronJobs?: CronJob[]
}

export interface CronJob {
  id: string
  name: string
  schedule: string
  enabled: boolean
  lastRun?: string
}

export interface AgentTemplate {
  name: string
  displayName: string
  description: string
  icon: string
  color: string
  language: string
  version: string
  agentsCount: number
  soulPreview: string
  files: string[]
}

export interface LogEntry {
  id: string
  timestamp: string
  agentName: string
  level: LogLevel
  message: string
}

export interface UsagePoint {
  date: string
  tokens: number
}

export interface DashboardData {
  agents: Agent[]
  recentLogs: LogEntry[]
  usage: UsagePoint[]
}

export interface CreateAgentInput {
  name: string
  template: string
  telegramToken: string
  provider: string
}

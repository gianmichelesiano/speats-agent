import type { AgentStatus } from './types'

export const formatCompactNumber = (value: number) => new Intl.NumberFormat('it-CH', {
  notation: 'compact', maximumFractionDigits: 1,
}).format(value)

export const formatCurrency = (value: number) => new Intl.NumberFormat('it-CH', {
  style: 'currency', currency: 'CHF', minimumFractionDigits: 2,
}).format(value)

export const formatRelativeTime = (value?: string) => {
  if (!value) return 'Mai'
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60_000)
  if (minutes < 1) return 'Adesso'
  if (minutes < 60) return `${minutes} min fa`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h fa`
  return `${Math.round(hours / 24)} g fa`
}

export const formatDate = (value: string) => new Intl.DateTimeFormat('it-CH', {
  day: '2-digit', month: 'short', year: 'numeric',
}).format(new Date(value))

export const formatLogTime = (value: string) => new Intl.DateTimeFormat('it-CH', {
  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
}).format(new Date(value))

export const statusLabel = (status: AgentStatus) => ({
  online: 'Online', offline: 'Offline', unconfigured: 'Da configurare',
})[status]

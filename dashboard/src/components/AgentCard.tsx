import { ArrowUpRight, Bot, MessageCircle, MoreHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Agent } from '../lib/types'
import { formatCompactNumber, formatCurrency, formatRelativeTime, statusLabel } from '../lib/format'

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <article className="agent-card">
      <div className="agent-card-top">
        <div className={`agent-avatar template-${agent.template}`}><Bot size={21} /></div>
        <span className={`status-badge status-${agent.status}`}><i />{statusLabel(agent.status)}</span>
        <button className="ghost-icon" aria-label={`Azioni per ${agent.displayName}`}><MoreHorizontal size={18} /></button>
      </div>
      <div className="agent-card-title">
        <div>
          <h3>{agent.displayName}</h3>
          <p>{agent.name}</p>
        </div>
        <span className="template-tag">{agent.template}</span>
      </div>
      <div className="agent-card-meta">
        <div><span>Ultima attività</span><strong>{formatRelativeTime(agent.lastActivityAt)}</strong></div>
        <div><span>Provider</span><strong>{agent.provider}</strong></div>
      </div>
      <div className="usage-row">
        <div><span>Token questo mese</span><strong>{formatCompactNumber(agent.tokenUsage.month)}</strong></div>
        <div><span>Costo stimato</span><strong>{formatCurrency(agent.estimatedCostMonth)}</strong></div>
      </div>
      <div className="agent-card-footer">
        {agent.telegramUsername ? (
          <a href={`https://t.me/${agent.telegramUsername}`} target="_blank" rel="noreferrer"><MessageCircle size={15} /> @{agent.telegramUsername}</a>
        ) : <span className="muted-link"><MessageCircle size={15} /> Telegram non collegato</span>}
        <Link to={`/agent/${agent.name}`} aria-label={`Apri ${agent.displayName}`}><ArrowUpRight size={18} /></Link>
      </div>
    </article>
  )
}

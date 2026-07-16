import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Calendar, Check, Clock3, Copy, ExternalLink, Play, Power, RotateCw, Terminal, Zap } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Link, useParams } from 'react-router-dom'
import remarkGfm from 'remark-gfm'
import { EmptyState } from '../components/EmptyState'
import { api } from '../lib/api'
import { formatCompactNumber, formatCurrency, formatDate, formatRelativeTime, statusLabel } from '../lib/format'

export function AgentDetailPage() {
  const { name = '' } = useParams()
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)
  const { data: agent, isLoading, error } = useQuery({ queryKey: ['agent', name], queryFn: () => api.agent(name), refetchInterval: 10_000 })
  const restart = useMutation({ mutationFn: () => api.restartAgent(name), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agent', name] }) })

  if (isLoading) return <div className="skeleton detail-skeleton" />
  if (error || !agent) return <EmptyState title="Agente non trovato" message="Il profilo richiesto non è disponibile o non è stato ancora sincronizzato." />

  const copyName = async () => { await navigator.clipboard.writeText(agent.name); setCopied(true); window.setTimeout(() => setCopied(false), 1400) }

  return (
    <div className="page-stack">
      <Link to="/agents" className="back-link"><ArrowLeft size={15} /> Torna agli agenti</Link>
      <section className="agent-hero">
        <div className={`agent-hero-mark template-${agent.template}`}>{agent.displayName.slice(0, 2).toUpperCase()}</div>
        <div className="agent-hero-copy">
          <div className="agent-title-line"><h2>{agent.displayName}</h2><span className={`status-badge status-${agent.status}`}><i />{statusLabel(agent.status)}</span></div>
          <button className="copy-slug" onClick={copyName}>{agent.name} {copied ? <Check size={13} /> : <Copy size={13} />}</button>
          <div className="agent-inline-meta"><span><Calendar size={14} /> Creato {formatDate(agent.createdAt)}</span><span><Clock3 size={14} /> Attivo {formatRelativeTime(agent.lastActivityAt)}</span><span><Zap size={14} /> {agent.provider}</span></div>
        </div>
        <div className="agent-hero-actions">
          {agent.telegramUsername && <a className="button button-secondary" href={`https://t.me/${agent.telegramUsername}`} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Telegram</a>}
          <button className="button button-primary" onClick={() => restart.mutate()} disabled={restart.isPending}><RotateCw size={16} className={restart.isPending ? 'is-spinning' : ''} /> {restart.isPending ? 'Riavvio…' : 'Riavvia gateway'}</button>
        </div>
      </section>

      <section className="detail-stats">
        <div><span>Token oggi</span><strong>{formatCompactNumber(agent.tokenUsage.today)}</strong></div>
        <div><span>Token settimana</span><strong>{formatCompactNumber(agent.tokenUsage.week)}</strong></div>
        <div><span>Token mese</span><strong>{formatCompactNumber(agent.tokenUsage.month)}</strong></div>
        <div><span>Costo stimato</span><strong>{formatCurrency(agent.estimatedCostMonth)}</strong></div>
      </section>

      <section className="detail-grid">
        <article className="panel soul-panel">
          <div className="panel-header"><div><span className="section-kicker">Live configuration</span><h2>SOUL.md</h2></div><span className="read-only-pill">sola lettura</span></div>
          <div className="markdown-preview"><ReactMarkdown remarkPlugins={[remarkGfm]}>{agent.soul ?? 'Nessun SOUL.md disponibile.'}</ReactMarkdown></div>
        </article>

        <div className="detail-side-stack">
          <article className="panel runtime-panel">
            <div className="panel-header"><div><span className="section-kicker">Runtime</span><h2>Gateway</h2></div><Power size={19} /></div>
            <dl className="definition-list">
              <div><dt>Stato</dt><dd><span className={`tiny-dot status-${agent.status}`} />{statusLabel(agent.status)}</dd></div>
              <div><dt>Unit</dt><dd>hermes-gateway-{agent.name}</dd></div>
              <div><dt>Profilo</dt><dd>~/.hermes/profiles/{agent.name}</dd></div>
              <div><dt>Provider</dt><dd>{agent.provider}</dd></div>
            </dl>
            <button className="terminal-command"><Terminal size={15} /><code>journalctl -f</code><ExternalLink size={14} /></button>
          </article>

          <article className="panel cron-panel">
            <div className="panel-header"><div><span className="section-kicker">Automation</span><h2>Cron jobs</h2></div><span className="count-pill">{agent.cronJobs?.length ?? 0}</span></div>
            <div className="cron-list">
              {agent.cronJobs?.length ? agent.cronJobs.map((job) => (
                <div className="cron-item" key={job.id}><span className={job.enabled ? 'cron-state is-enabled' : 'cron-state'}><Play size={12} /></span><div><strong>{job.name}</strong><small>{job.schedule}</small></div><button className="ghost-icon"><MoreDots /></button></div>
              )) : <p className="inline-empty">Nessun job configurato.</p>}
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}

function MoreDots() { return <span aria-hidden="true">•••</span> }

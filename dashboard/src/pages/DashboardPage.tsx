import { useQuery } from '@tanstack/react-query'
import { Activity, ArrowRight, Bot, CircleDollarSign, Plus, Radio, Sparkles } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { Link } from 'react-router-dom'
import { AgentCard } from '../components/AgentCard'
import { EmptyState } from '../components/EmptyState'
import { LogStream } from '../components/LogStream'
import { api } from '../lib/api'
import { formatCompactNumber, formatCurrency } from '../lib/format'

export function DashboardPage({ agentsOnly = false }: { agentsOnly?: boolean }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: api.dashboard,
    refetchInterval: 30_000,
  })

  if (isLoading) return <DashboardSkeleton />
  if (error || !data) return <EmptyState title="Dashboard non disponibile" message="Verifica che il backend FastAPI e PostgreSQL siano attivi." />

  const totalTokens = data.agents.reduce((sum, agent) => sum + agent.tokenUsage.month, 0)
  const totalCost = data.agents.reduce((sum, agent) => sum + agent.estimatedCostMonth, 0)
  const online = data.agents.filter((agent) => agent.status === 'online').length

  return (
    <div className="page-stack">
      {!agentsOnly && (
        <>
          <section className="metrics-grid" aria-label="Riepilogo flotta">
            <Metric icon={<Bot />} label="Agenti totali" value={String(data.agents.length)} note="2 template attivi" />
            <Metric icon={<Radio />} label="Online adesso" value={`${online}/${data.agents.length}`} note="Tutti i gateway nominali" accent />
            <Metric icon={<Activity />} label="Token · luglio" value={formatCompactNumber(totalTokens)} note="+12.4% sul mese scorso" />
            <Metric icon={<CircleDollarSign />} label="Costo stimato" value={formatCurrency(totalCost)} note="Budget mensile: CHF 120" />
          </section>

          <section className="dashboard-feature-grid">
            <article className="panel usage-panel">
              <div className="panel-header">
                <div><span className="section-kicker">Consumo aggregato</span><h2>Attività negli ultimi 7 giorni</h2></div>
                <div className="chart-total"><strong>4.62M</strong><span>token</span></div>
              </div>
              <div className="usage-chart" aria-label="Grafico consumo token">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.usage} margin={{ top: 18, right: 4, left: 4, bottom: 0 }}>
                    <defs>
                      <linearGradient id="usageFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d8ff5f" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#d8ff5f" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#7d8178', fontSize: 11 }} dy={8} />
                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#4b5049', strokeDasharray: '3 4' }} />
                    <Area type="monotone" dataKey="tokens" stroke="#d8ff5f" strokeWidth={2} fill="url(#usageFill)" activeDot={{ r: 4, fill: '#10120f', stroke: '#d8ff5f', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="panel pulse-panel">
              <div className="panel-header"><div><span className="section-kicker">System pulse</span><h2>Ultima attività</h2></div><span className="live-pill"><i /> live</span></div>
              <LogStream logs={data.recentLogs.slice(0, 4)} compact />
              <Link className="panel-link" to="/logs">Apri tutti i log <ArrowRight size={15} /></Link>
            </article>
          </section>
        </>
      )}

      <section>
        <div className="section-heading">
          <div><span className="section-kicker">Agent fleet</span><h2>{agentsOnly ? 'Tutti gli agenti' : 'I tuoi agenti'}</h2><p>Stato operativo, attività e consumi in un solo colpo d’occhio.</p></div>
          <Link className="button button-secondary" to="/agent/new"><Plus size={16} /> Crea agente</Link>
        </div>
        <div className="agents-grid">
          {data.agents.map((agent) => <AgentCard agent={agent} key={agent.name} />)}
          <Link to="/agent/new" className="new-agent-card">
            <span><Sparkles size={20} /></span><strong>Configura un nuovo agente</strong><small>Da template a gateway operativo</small>
          </Link>
        </div>
      </section>
    </div>
  )
}

function Metric({ icon, label, value, note, accent = false }: { icon: React.ReactNode; label: string; value: string; note: string; accent?: boolean }) {
  return <article className={`metric-card ${accent ? 'is-accent' : ''}`}><div className="metric-icon">{icon}</div><span>{label}</span><strong>{value}</strong><small>{note}</small></article>
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return <div className="chart-tooltip"><span>{label}</span><strong>{formatCompactNumber(payload[0].value)} token</strong></div>
}

function DashboardSkeleton() {
  return <div className="page-stack"><div className="metrics-grid">{[1,2,3,4].map((n) => <div className="skeleton metric-card" key={n} />)}</div><div className="skeleton feature-skeleton" /></div>
}

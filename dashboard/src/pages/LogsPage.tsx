import { useQuery } from '@tanstack/react-query'
import { Download, Filter, Pause, Play, Search, TerminalSquare } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { LogStream } from '../components/LogStream'
import { api } from '../lib/api'
import type { LogLevel } from '../lib/types'

export function LogsPage() {
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState<LogLevel | 'all'>('all')
  const [paused, setPaused] = useState(false)
  const { data = [], error } = useQuery({ queryKey: ['logs'], queryFn: api.logs, refetchInterval: paused ? false : 5_000 })
  const filtered = useMemo(() => data.filter((log) => (level === 'all' || log.level === level) && `${log.agentName} ${log.message}`.toLowerCase().includes(query.toLowerCase())), [data, level, query])
  if (error) return <EmptyState title="Log non raggiungibili" message="Il backend non può leggere journalctl o il database degli eventi." />

  return <div className="page-stack">
    <section className="logs-toolbar">
      <div className="log-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cerca messaggio o agente…" /></div>
      <div className="level-filter"><Filter size={15} /><select value={level} onChange={(event) => setLevel(event.target.value as LogLevel | 'all')}><option value="all">Tutti i livelli</option><option value="info">INFO</option><option value="warn">WARN</option><option value="error">ERROR</option></select></div>
      <button className={`button button-secondary ${paused ? '' : 'is-live'}`} onClick={() => setPaused((value) => !value)}>{paused ? <Play size={15} /> : <Pause size={15} />}{paused ? 'Riprendi' : 'In pausa'}</button>
      <button className="icon-button" aria-label="Esporta log"><Download size={17} /></button>
    </section>
    <section className="terminal-panel">
      <div className="terminal-head"><div><TerminalSquare size={16} /><span>journal gateway stream</span></div><div className="terminal-dots"><i /><i /><i /></div><span>{filtered.length} eventi</span></div>
      <LogStream logs={filtered} />
      {!filtered.length && <div className="terminal-empty">Nessun evento corrisponde ai filtri.</div>}
    </section>
  </div>
}

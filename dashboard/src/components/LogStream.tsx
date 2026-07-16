import type { LogEntry } from '../lib/types'
import { formatLogTime } from '../lib/format'

export function LogStream({ logs, compact = false }: { logs: LogEntry[]; compact?: boolean }) {
  return (
    <div className={`log-stream ${compact ? 'is-compact' : ''}`}>
      {logs.map((log) => (
        <div className="log-line" key={log.id}>
          <time>{formatLogTime(log.timestamp)}</time>
          <span className={`log-level level-${log.level}`}>{log.level.toUpperCase()}</span>
          <span className="log-agent">{log.agentName}</span>
          <p>{log.message}</p>
        </div>
      ))}
    </div>
  )
}

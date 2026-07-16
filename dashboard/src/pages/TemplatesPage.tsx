import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, FileCode2, Layers3, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { api } from '../lib/api'

export function TemplatesPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['templates'], queryFn: api.templates })
  if (isLoading) return <div className="templates-grid">{[1,2,3].map((n) => <div className="skeleton template-card" key={n} />)}</div>
  if (error || !data) return <EmptyState title="Template non disponibili" message="Controlla il percorso della template library nel backend." />

  return (
    <div className="page-stack">
      <section className="intro-row"><div><p>La sorgente unica per personalità, sicurezza e automazioni. Le modifiche qui si propagano solo dopo un deploy esplicito.</p></div><Link className="button button-primary" to="/agent/new"><Plus size={16} /> Usa un template</Link></section>
      <section className="templates-grid">
        {data.map((template) => (
          <article className="template-card" key={template.name}>
            <div className="template-card-head"><span className="template-monogram" style={{ '--template-color': template.color } as React.CSSProperties}>{template.icon}</span><span className="version-pill">v{template.version}</span></div>
            <div><h2>{template.displayName}</h2><p>{template.description}</p></div>
            <div className="template-facts"><span>{template.language}</span><span>{template.agentsCount} agenti</span></div>
            <blockquote>{template.soulPreview}</blockquote>
            <div className="file-chips">{template.files.map((file) => <span key={file}><FileCode2 size={12} />{file}</span>)}</div>
            <div className="template-card-footer"><button className="button button-quiet"><Layers3 size={15} /> Anteprima</button><Link className="circle-link" to={`/agent/new?template=${template.name}`}><ArrowUpRight size={17} /></Link></div>
          </article>
        ))}
      </section>
    </div>
  )
}

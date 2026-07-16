import {
  Bot,
  Boxes,
  Command,
  FileClock,
  LayoutDashboard,
  Menu,
  Plus,
  RefreshCw,
  Server,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { isDemoMode } from '../lib/api'

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/agents', label: 'Agenti', icon: Bot },
  { to: '/templates', label: 'Template', icon: Boxes },
  { to: '/logs', label: 'Live logs', icon: FileClock },
]

const pageTitles: Record<string, { eyebrow: string; title: string }> = {
  '/': { eyebrow: 'Control plane', title: 'Buonasera, Gianmichele.' },
  '/agents': { eyebrow: 'Fleet', title: 'Tutti gli agenti' },
  '/templates': { eyebrow: 'Configuration', title: 'Template library' },
  '/logs': { eyebrow: 'Observability', title: 'Live logs' },
  '/agent/new': { eyebrow: 'Provisioning', title: 'Nuovo agente' },
}

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const heading = location.pathname.startsWith('/agent/') && location.pathname !== '/agent/new'
    ? { eyebrow: 'Agent detail', title: location.pathname.split('/').pop()?.replaceAll('-', ' ') ?? 'Agente' }
    : pageTitles[location.pathname] ?? pageTitles['/']

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="brand-row">
          <NavLink to="/" className="brand" onClick={() => setMobileOpen(false)}>
            <span className="brand-mark" aria-hidden="true"><span>S</span></span>
            <span><strong>speats</strong><small>agent operations</small></span>
          </NavLink>
          <button className="icon-button mobile-only" onClick={() => setMobileOpen(false)} aria-label="Chiudi menu"><X size={18} /></button>
        </div>

        <nav className="primary-nav" aria-label="Navigazione principale">
          <span className="nav-section-label">Workspace</span>
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setMobileOpen(false)}>
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              <span className="nav-indicator" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-spacer" />
        <div className="server-card">
          <div className="server-card-head"><Server size={17} /><span>speats-01</span><i /></div>
          <dl>
            <div><dt>Network</dt><dd>Tailscale</dd></div>
            <div><dt>Region</dt><dd>Zurich</dd></div>
          </dl>
        </div>
        <div className="operator-row">
          <span className="avatar">GM</span>
          <span><strong>Gianmichele</strong><small>Administrator</small></span>
          <Command size={16} />
        </div>
      </aside>

      {mobileOpen && <button className="sidebar-scrim" onClick={() => setMobileOpen(false)} aria-label="Chiudi navigazione" />}

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-heading">
            <button className="icon-button menu-button" onClick={() => setMobileOpen(true)} aria-label="Apri menu"><Menu size={20} /></button>
            <div><span>{heading.eyebrow}</span><h1>{heading.title}</h1></div>
          </div>
          <div className="topbar-actions">
            {isDemoMode && <span className="demo-pill">Demo data</span>}
            <span className="sync-status"><i /> Aggiornato ora</span>
            <button className="icon-button" aria-label="Aggiorna pagina" onClick={() => window.location.reload()}><RefreshCw size={17} /></button>
            <NavLink className="button button-primary" to="/agent/new"><Plus size={17} /> Nuovo agente</NavLink>
          </div>
        </header>
        <div className="page-content"><Outlet /></div>
      </main>
    </div>
  )
}

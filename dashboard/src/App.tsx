import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import './App.css'

const AgentDetailPage = lazy(() => import('./pages/AgentDetailPage').then((module) => ({ default: module.AgentDetailPage })))
const CreateAgentPage = lazy(() => import('./pages/CreateAgentPage').then((module) => ({ default: module.CreateAgentPage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const LogsPage = lazy(() => import('./pages/LogsPage').then((module) => ({ default: module.LogsPage })))
const TemplatesPage = lazy(() => import('./pages/TemplatesPage').then((module) => ({ default: module.TemplatesPage })))

export default function App() {
  return (
    <Suspense fallback={<div className="route-loader"><span /></div>}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="agents" element={<DashboardPage agentsOnly />} />
          <Route path="agent/new" element={<CreateAgentPage />} />
          <Route path="agent/:name" element={<AgentDetailPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="logs" element={<LogsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

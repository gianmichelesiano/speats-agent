import type { Agent, AgentTemplate, DashboardData, LogEntry, UsagePoint } from './types'

const now = Date.now()
const minutesAgo = (minutes: number) => new Date(now - minutes * 60_000).toISOString()
const daysAgo = (days: number) => new Date(now - days * 86_400_000).toISOString()

export const demoAgents: Agent[] = [
  {
    name: 'toppharm-muhen',
    displayName: 'TopPharm Muhen',
    template: 'farmacia',
    status: 'online',
    provider: 'DeepSeek V3',
    telegramUsername: 'toppharm_muhen_bot',
    lastActivityAt: minutesAgo(2),
    createdAt: daysAgo(94),
    tokenUsage: { today: 148_240, week: 921_500, month: 3_482_900 },
    estimatedCostMonth: 18.42,
    soul: `# TopPharm Muhen\n\nDu bist der digitale Assistent der **TopPharm Apotheke Muhen**. Du antwortest freundlich, präzise und je nach Sprache des Kunden auf Deutsch oder Italienisch.\n\n## Absolute Grenzen\n\n- Keine Diagnose stellen\n- Bei Notfällen sofort auf 144 verweisen\n- Gesundheitsdaten niemals ausserhalb des Gesprächs teilen\n\n## Tonalität\n\nRuhig, kompetent und menschlich. Kurze Antworten, klare nächste Schritte.`,
    cronJobs: [
      { id: 'reviews', name: 'Review monitor', schedule: 'Ogni giorno · 08:00', enabled: true, lastRun: minutesAgo(186) },
      { id: 'expiry', name: 'Scadenze settimanali', schedule: 'Lunedì · 07:30', enabled: true, lastRun: daysAgo(3) },
    ],
  },
  {
    name: 'laqualita',
    displayName: 'La Qualità',
    template: 'ristorante',
    status: 'online',
    provider: 'Claude Sonnet',
    telegramUsername: 'laqualita_assistant_bot',
    lastActivityAt: minutesAgo(14),
    createdAt: daysAgo(51),
    tokenUsage: { today: 82_610, week: 544_200, month: 2_106_440 },
    estimatedCostMonth: 27.18,
    soul: `# La Qualità\n\nSei l'assistente digitale del ristorante **La Qualità**. Aiuti gli ospiti con prenotazioni, menu e allergeni in italiano e tedesco.\n\n## Regole\n\n- Conferma sempre data, ora e numero di persone\n- Per allergie gravi invita a parlare con lo staff\n- Non promettere disponibilità senza conferma`,
    cronJobs: [
      { id: 'booking-digest', name: 'Riepilogo prenotazioni', schedule: 'Ogni giorno · 16:00', enabled: true, lastRun: minutesAgo(1330) },
    ],
  },
  {
    name: 'farmacia-bernardi',
    displayName: 'Farmacia Bernardi',
    template: 'farmacia',
    status: 'offline',
    provider: 'DeepSeek V3',
    telegramUsername: 'bernardi_help_bot',
    lastActivityAt: minutesAgo(163),
    createdAt: daysAgo(18),
    tokenUsage: { today: 0, week: 184_900, month: 619_300 },
    estimatedCostMonth: 4.16,
    soul: '# Farmacia Bernardi\n\nAssistente bilingue per informazioni, disponibilità e primo orientamento.',
    cronJobs: [],
  },
  {
    name: 'studio-rossi',
    displayName: 'Studio Rossi',
    template: 'consulenza',
    status: 'unconfigured',
    provider: 'OpenAI GPT-5',
    lastActivityAt: daysAgo(4),
    createdAt: daysAgo(4),
    tokenUsage: { today: 0, week: 0, month: 0 },
    estimatedCostMonth: 0,
    soul: '# Studio Rossi\n\nProfilo in attesa di configurazione Telegram.',
    cronJobs: [],
  },
]

export const demoLogs: LogEntry[] = [
  { id: '1', timestamp: minutesAgo(2), agentName: 'toppharm-muhen', level: 'info', message: 'Risposta inviata · 482 token · 1.8s' },
  { id: '2', timestamp: minutesAgo(5), agentName: 'toppharm-muhen', level: 'info', message: 'Nuovo messaggio Telegram ricevuto' },
  { id: '3', timestamp: minutesAgo(14), agentName: 'laqualita', level: 'info', message: 'Prenotazione inoltrata allo staff' },
  { id: '4', timestamp: minutesAgo(31), agentName: 'laqualita', level: 'warn', message: 'Timeout del provider, retry completato' },
  { id: '5', timestamp: minutesAgo(163), agentName: 'farmacia-bernardi', level: 'error', message: 'Gateway terminato con exit code 1' },
  { id: '6', timestamp: minutesAgo(195), agentName: 'toppharm-muhen', level: 'info', message: 'Job “Review monitor” completato' },
]

export const demoUsage: UsagePoint[] = [
  { date: '10 lug', tokens: 421_000 },
  { date: '11 lug', tokens: 568_000 },
  { date: '12 lug', tokens: 492_000 },
  { date: '13 lug', tokens: 718_000 },
  { date: '14 lug', tokens: 654_000 },
  { date: '15 lug', tokens: 842_000 },
  { date: '16 lug', tokens: 931_000 },
]

export const demoTemplates: AgentTemplate[] = [
  {
    name: 'farmacia',
    displayName: 'Farmacia',
    description: 'Triage prudente, disponibilità prodotti e comunicazione bilingue per farmacie svizzere.',
    icon: 'Rx',
    color: '#a8f5cf',
    language: 'IT · DE',
    version: '2.1',
    agentsCount: 2,
    soulPreview: 'Assistente bilingue con limiti clinici assoluti e procedure di escalation.',
    files: ['SOUL.md', 'skills.md', 'cron.md', 'onboarding.md', 'template.config.yaml'],
  },
  {
    name: 'ristorante',
    displayName: 'Ristorante',
    description: 'Prenotazioni, menu, allergeni e richieste degli ospiti con passaggio fluido allo staff.',
    icon: 'QL',
    color: '#ffca8a',
    language: 'IT · DE',
    version: '1.4',
    agentsCount: 1,
    soulPreview: 'Accoglienza calda e precisa, con conferma strutturata delle prenotazioni.',
    files: ['SOUL.md', 'cron.md', 'onboarding.md', 'template.config.yaml'],
  },
  {
    name: 'consulenza',
    displayName: 'Consulenza',
    description: 'Base flessibile per studi professionali e flussi operativi su misura.',
    icon: 'CO',
    color: '#a9c4ff',
    language: 'IT · DE · EN',
    version: 'Bozza',
    agentsCount: 1,
    soulPreview: 'Template in preparazione: knowledge base, intake e follow-up automatici.',
    files: ['SOUL.md'],
  },
]

export const demoDashboard: DashboardData = {
  agents: demoAgents,
  recentLogs: demoLogs,
  usage: demoUsage,
}

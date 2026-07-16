import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Bot, Check, CheckCircle2, Copy, KeyRound, LockKeyhole, Rocket, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api, isDemoMode } from '../lib/api'
import type { CreateAgentInput } from '../lib/types'

const steps = ['Identità', 'Connessioni', 'Verifica']

export function CreateAgentPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<CreateAgentInput>({ name: '', template: searchParams.get('template') ?? 'farmacia', telegramToken: '', provider: 'deepseek' })
  const { data: templates = [] } = useQuery({ queryKey: ['templates'], queryFn: api.templates })
  const createAgent = useMutation({
    mutationFn: api.createAgent,
    onSuccess: ({ name }) => {
      if (!isDemoMode) window.setTimeout(() => navigate(`/agent/${name}`), 1200)
    },
  })
  const selectedTemplate = templates.find((item) => item.name === form.template)
  const slugIsValid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.name)
  const canContinue = step === 0 ? slugIsValid && Boolean(form.template) : step === 1 ? form.telegramToken.length > 12 : true

  const update = (key: keyof CreateAgentInput, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const submit = (event: FormEvent) => { event.preventDefault(); if (step < 2) setStep((value) => value + 1); else createAgent.mutate(form) }

  if (createAgent.isSuccess) return <ProvisioningState name={form.name} />

  return (
    <div className="create-layout">
      <section className="create-main">
        <Link to="/agents" className="back-link"><ArrowLeft size={15} /> Annulla e torna agli agenti</Link>
        <div className="create-heading"><span className="section-kicker">Guided provisioning</span><h2>Metti online un agente.</h2><p>La configurazione viene validata, salvata in PostgreSQL e applicata al profilo Hermes in background.</p></div>
        <ol className="stepper">
          {steps.map((label, index) => <li className={index === step ? 'is-current' : index < step ? 'is-done' : ''} key={label}><span>{index < step ? <Check size={14} /> : index + 1}</span><strong>{label}</strong></li>)}
        </ol>

        <form className="provision-form" onSubmit={submit}>
          {step === 0 && (
            <div className="form-section">
              <div className="field-group"><label htmlFor="agent-name">Nome profilo</label><p>Slug univoco usato da Hermes, systemd e PostgreSQL.</p><div className={`input-shell ${form.name && !slugIsValid ? 'has-error' : ''}`}><Bot size={18} /><input id="agent-name" autoFocus value={form.name} onChange={(event) => update('name', event.target.value.toLowerCase().replaceAll(' ', '-'))} placeholder="farmacia-bernardi" /></div>{form.name && !slugIsValid && <small className="field-error">Usa solo lettere minuscole, numeri e trattini.</small>}</div>
              <div className="field-group"><label>Template operativo</label><p>Definisce personalità, limiti di sicurezza, onboarding e cron.</p><div className="template-selector">{templates.map((template) => <button type="button" className={form.template === template.name ? 'is-selected' : ''} onClick={() => update('template', template.name)} key={template.name}><span className="template-monogram" style={{ '--template-color': template.color } as React.CSSProperties}>{template.icon}</span><span><strong>{template.displayName}</strong><small>{template.language} · v{template.version}</small></span><i>{form.template === template.name && <Check size={14} />}</i></button>)}</div></div>
            </div>
          )}

          {step === 1 && (
            <div className="form-section">
              <div className="field-group"><label htmlFor="telegram-token">Token Telegram</label><p>Ricevuto da @BotFather. Viene passato al processo via environment e non compare mai nei log.</p><div className="input-shell"><KeyRound size={18} /><input id="telegram-token" type="password" autoFocus value={form.telegramToken} onChange={(event) => update('telegramToken', event.target.value)} placeholder="1234567890:AA…" autoComplete="off" /></div><div className="security-note"><LockKeyhole size={15} /><span>Il token non viene restituito dalle API né persistito in chiaro nel database.</span></div></div>
              <div className="field-group"><label htmlFor="provider">Provider LLM</label><p>Il modello predefinito potrà essere modificato in seguito dal dettaglio agente.</p><select id="provider" value={form.provider} onChange={(event) => update('provider', event.target.value)}><option value="deepseek">DeepSeek V3</option><option value="anthropic">Claude Sonnet</option><option value="openai">OpenAI GPT-5</option></select></div>
            </div>
          )}

          {step === 2 && (
            <div className="review-section">
              <div className="review-card"><span className="review-icon"><Bot size={20} /></span><div><small>Profilo</small><strong>{form.name}</strong></div><button type="button" onClick={() => setStep(0)}>Modifica</button></div>
              <div className="review-card"><span className="review-icon"><Rocket size={20} /></span><div><small>Template</small><strong>{selectedTemplate?.displayName ?? form.template} · {form.provider}</strong></div><button type="button" onClick={() => setStep(1)}>Modifica</button></div>
              <div className="security-checklist"><div><ShieldCheck size={19} /><span><strong>Security policy applicata</strong><small>Terminal, file write, delegation e code execution disabilitati.</small></span></div><div><CheckCircle2 size={19} /><span><strong>Path validato</strong><small>Il profilo resta confinato nella directory Hermes configurata.</small></span></div><div><KeyRound size={19} /><span><strong>Secret protetto</strong><small>Token Telegram escluso da database, audit e output del processo.</small></span></div></div>
            </div>
          )}

          {createAgent.error && <div className="form-error">Creazione non riuscita: {createAgent.error.message}</div>}
          <div className="form-actions"><button type="button" className="button button-secondary" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}>Indietro</button><button type="submit" className="button button-primary" disabled={!canContinue || createAgent.isPending}>{step === 2 ? <><Rocket size={16} /> Crea agente</> : <>Continua <ArrowRight size={16} /></>}</button></div>
        </form>
      </section>

      <aside className="create-preview">
        <div className="preview-orbit"><span className="orbit-ring ring-one" /><span className="orbit-ring ring-two" /><span className="preview-bot"><Bot size={31} /></span><i className="orbit-dot dot-one" /><i className="orbit-dot dot-two" /></div>
        <span className="section-kicker">Provisioning preview</span><h3>{form.name || 'nuovo-agente'}</h3><p>{selectedTemplate?.description ?? 'Scegli un template per vedere il profilo operativo.'}</p>
        <dl><div><dt>Runtime</dt><dd>Hermes · isolated</dd></div><div><dt>Network</dt><dd>Tailscale only</dd></div><div><dt>Storage</dt><dd>PostgreSQL + profile FS</dd></div><div><dt>Deploy target</dt><dd>speats-01</dd></div></dl>
      </aside>
    </div>
  )
}

function ProvisioningState({ name }: { name: string }) {
  const [copied, setCopied] = useState(false)
  const command = useMemo(() => `hermes profile inspect ${name}`, [name])
  return <div className="provisioning-state"><span className="success-orbit"><Check size={30} /></span><span className="section-kicker">Provisioning started</span><h2>{name} sta prendendo vita.</h2><p>Il job è stato accodato. Puoi lasciare questa pagina: stato e log rimangono disponibili nella dashboard.</p><button onClick={async () => { await navigator.clipboard.writeText(command); setCopied(true) }} className="command-copy"><code>{command}</code>{copied ? <Check size={16} /> : <Copy size={16} />}</button></div>
}

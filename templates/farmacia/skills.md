# Skills da installare per template farmacia

## Skills Hermes
Da installare con: `hermes skills install <nome>`

### Obbligatorie
| Skill | ID | Perché |
|-------|-----|--------|
| pharmacy-ai-assistant | (locale) | DB farmaci, triage, VaxCheck, Swissmedic |
| swiss-pharma-database | (locale) | Database farmaci svizzero PostgreSQL |
| hermes-agent | (built-in) | Configurazione Hermes |

### Raccomandate
| Skill | ID | Perché |
|-------|-----|--------|
| obsidian | (built-in) | Note e documentazione |
| google-workspace | (built-in) | Email, calendario |
| nano-pdf | (built-in) | Report PDF |
| ocr-and-documents | (built-in) | Scansione documenti |

### Facoltative (a seconda del cliente)
| Skill | ID | Perché |
|-------|-----|--------|
| spotify | (built-in) | Musica in farmacia |
| maps | (built-in) | Ricerca farmacie vicine |
| web-summary | (built-in) | Riassunto news/articoli |

## MCP Servers (da abilitare in config.yaml)
- Odoo MCP → CRM contatti farmacia
- (futuro) Pharma MCP → tool personalizzati

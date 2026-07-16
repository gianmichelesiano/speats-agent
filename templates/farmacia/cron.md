# Cron di default per template farmacia

## Giornalieri (8:00)
```
Check scadenze farmaci in scadenza nei prossimi 30 giorni
Report: lista prodotti + magazzino
```

## Settimanali (lunedì 9:00)
```
Riepilogo settimana: turni, scadenze, aggiornamenti Swissmedic
```

## Mensili (1° del mese 9:00)
```
Report mensile: prodotti più venduti, scadenze imminenti
Check aggiornamenti normativi Swissmedic
```

## Configurazione consigliata
```yaml
- schedule: "0 8 * * *"     # Ogni giorno 8:00
  prompt: "Controlla scadenze farmaci nei prossimi 30 giorni e riassumi"
  deliver: "origin"

- schedule: "0 9 * * 1"     # Ogni lunedì 9:00
  prompt: "Riepilogo settimanale farmacia"
  deliver: "origin"
```

# Cron di default per template ristorante

## Giornalieri (9:00)
```
Check recensioni Google/TripAdvisor del ristorante
```

## Settimanali (lunedì 10:00)
```
Riepilogo settimana: recensioni, prenotazioni, social
```

## Configurazione
```yaml
- schedule: "0 9 * * *"
  prompt: "Controlla recensioni online del ristorante e riassumi"
  deliver: origin
```

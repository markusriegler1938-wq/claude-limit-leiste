# Limit-Leiste für Claude Code

Eine Leiste direkt über dem Eingabefeld, die immer zeigt, wie viel du verbraucht hast:

```
Kontext ██░░░░░░░░ 9 %   5-Std-Limit █░░░░░░░░░ 9 % Reset 16:10 Uhr   Wochenlimit ██░░░░░░░░ 19 % Reset Do 04:00
```

- **Kontext**: wie voll das Gedächtnis des aktuellen Chats ist
- **5-Std-Limit**: Verbrauch im laufenden 5-Stunden-Fenster, mit Reset-Uhrzeit
- **Wochenlimit**: Verbrauch in der laufenden Woche, mit Reset-Tag und -Uhrzeit
- Farben: grün bis 60 %, gelb bis 85 %, rot darüber
- Zeiten in deutscher Zeit (Europe/Berlin)
- Aktualisiert sich nach jeder Antwort von selbst

Läuft in der Claude-Desktop-App (Code-Tab) und im Terminal. In der Handy-App wird die Leiste nicht angezeigt.

## Installation

**Claude-Desktop-App (Windows/Mac):** Klick auf **+** neben dem Eingabefeld → **Plugins** → **Add marketplace** und `markusriegler1938-wq/claude-limit-leiste` eintragen → dann **Add plugin** bei `limit-band`.

**Im Terminal (Claude Code):**

```
/plugin install limit-band --marketplace markusriegler1938-wq/claude-limit-leiste
```

Danach die Frage `Add marketplace?` mit `y` bestätigen und den Bereich **user** mit Enter wählen.

Aus einer normalen Kommandozeile:

```
claude plugin install limit-band --marketplace markusriegler1938-wq/claude-limit-leiste
```

# Osna-Limo Disposition

Browserbasierte Fahrzeug-Disposition für Osna-Limo.

## Ziel

- Plattformunabhängig auf macOS und Windows im Browser nutzbar
- Google Calendar bleibt die Datenquelle
- **Nur lesender Zugriff auf Google Calendar**
- Keine Erstellung, Bearbeitung oder Löschung von Google-Terminen über die Dispo
- Eine feste Spalte je Fahrzeug
- Fahrzeuge ohne Termin werden nach rechts sortiert
- Einzelne Fahrzeugspalten können minimiert werden
- Einstellbare Spaltenbreite, Zeilenhöhe und Schriftgröße
- Kompaktmodus

## Aktueller Stand

Die Oberfläche verwendet derzeit einen echten Kalender-Snapshot vom **05.04.2025** als Testdaten. Die Live-Anbindung an Google Calendar folgt als nächster Schritt.

## Google-Berechtigung

Für die Live-Version ist ausschließlich der OAuth-Scope `https://www.googleapis.com/auth/calendar.readonly` vorgesehen.

## Dateien

- `index.html` – Oberfläche
- `styles.css` – Design und Layout
- `app.js` – Anzeige- und Sortierlogik

## Hosting

Die Anwendung ist für GitHub Pages vorgesehen.

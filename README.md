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

Die Oberfläche ist für die Live-Anbindung an Google Calendar vorbereitet. Nach dem Verbinden lädt sie die Termine des ausgewählten Tages direkt aus den Fahrzeugkalendern und übernimmt die Google-Kalenderfarben.

Die Fahrzeugkalender werden nach ihren Kalendernamen erkannt; ihre internen Google-Kalender-IDs werden nicht im öffentlichen Repository gespeichert.

## Google-Berechtigung

Die Anwendung fordert ausschließlich diesen OAuth-Scope an:

`https://www.googleapis.com/auth/calendar.readonly`

Damit ist der Zugriff auf das Anzeigen/Herunterladen von Kalenderdaten beschränkt. Im Anwendungscode existieren nur lesende `GET`-Abfragen gegen die Google Calendar API.

## Einmalige Google-Cloud-Einrichtung

1. Google Cloud Projekt erstellen bzw. auswählen.
2. **Google Calendar API** aktivieren.
3. OAuth-Zustimmungsbildschirm konfigurieren.
4. Bei einer App im Testmodus das Osna-Limo-Google-Konto als Testnutzer hinzufügen.
5. OAuth-Client vom Typ **Web application** erstellen.
6. Als **Authorized JavaScript origin** eintragen:
   `https://osna-limo.github.io`
7. Die erzeugte Client-ID in `config.js` als `googleClientId` eintragen.

Es wird **kein Client Secret** in GitHub benötigt oder gespeichert.

## Dateien

- `index.html` – Oberfläche und Google-Verbindungsbutton
- `styles.css` – Design und Layout
- `app.js` – Anzeige-, Sortier- und reine Lese-Logik für Google Calendar
- `config.js` – öffentliche Google OAuth Client-ID

## Hosting

GitHub Pages:

`https://osna-limo.github.io/osna-limo-dispo/`

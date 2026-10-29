# Baker Al Daood – Portfolio

Persönliche Portfolio-Webseite (HTML, CSS, JavaScript – ohne Build-Schritt).

## Features
- Premium dark UI: Glassmorphism (Frosted Glass), Aurora-Hintergrund in Cyan/Teal, Glow-Akzente, Film-Grain
- Interaktionen: Spotlight auf Karten, 3D-Tilt am Porträt, Tech-Marquee
- Modernes Dark-Design mit Light-Mode-Umschalter (wird gespeichert)
- Sticky Glas-Navigation, mobiles Menü, aktiver Link beim Scrollen
- Hero, Über mich, Erfahrung (Timeline), Ausbildung, Kenntnisse, Sprachen, Projekte, Kontakt
- Scroll-Animationen, Fortschrittsbalken und animierte Kennzahlen (respektiert `prefers-reduced-motion`)
- Responsive und barrierearm (Skip-Link, Fokus-Stile, ARIA)

## Struktur
```
index.html   Inhalt
css/style.css  Design-Tokens und Styles
js/main.js   Navigation, Theme, Animationen
pics/        Bilder
```
Lokal ansehen: `index.html` im Browser öffnen.

## Design
Figma-Entwurf (Desktop, Tokens als Variablen): https://www.figma.com/design/ytUW6Rs69TszW7AUu7ydh3

## GitHub-Aktivität
Das Widget liest `data/github-activity.json`. Die Datei wird täglich von `.github/workflows/github-activity.yml`
(über `scripts/update_activity.py`) aktualisiert und kann über **Actions → Update GitHub activity → Run workflow** manuell gestartet werden.
Ist die Datei nicht erreichbar, nutzt das Widget die GitHub-API und zuletzt den eingebauten Snapshot.

# FoodWatcher

Een simpele, installeerbare webapp die per dag laat zien wat je moet eten, gebaseerd op het 4-weken cyclusmenu uit `4-weken_cyclusmenu.pdf`. Geen account, geen server: alles draait lokaal in je browser.

Live: https://kwesje.github.io/FoodWatcher/

## Gebruik

1. Open de link hierboven op je telefoon.
2. Tik op **"Toevoegen aan beginscherm"** (Chrome: menu ⋮ → "App installeren" / "Toevoegen aan startscherm") zodat de app als icoon op je telefoon staat en los van de browser opent.
3. Stel eenmalig in wanneer je laatste menstruatie is begonnen. De app rekent vanaf die datum automatisch de cyclusdag (1–28) uit en toont de bijbehorende week en fase. Na dag 28 begint de teller vanzelf weer bij dag 1 — tik op "wijzigen" zodra een nieuwe cyclus start.
4. Op het **Vandaag**-scherm zie je ontbijt, lunch, snack en diner van de huidige dag, met kcal/eiwit. Met de pijltjes blader je naar andere dagen.
5. Tik op een maaltijd voor het volledige recept (ingrediënten, bereiding, bewaartips).
6. Vink maaltijden af met de rondje-knop; dit wordt per kalenderdag onthouden.
7. Onder **Boodschappen** vind je de boodschappenlijst van de huidige cyclusweek, ook afvinkbaar.

Al je gegevens (startdatum, afgevinkte maaltijden, boodschappenlijst) worden alleen lokaal op je toestel opgeslagen (`localStorage`) — er is geen account en niets wordt gedeeld.

## Ontwikkelen

Geen build-stap: platte HTML/CSS/JS-modules.

```
scripts/dev-server.ps1   # lokale server, http://localhost:8080
```

Start 'm met:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/dev-server.ps1
```

### Structuur

- `index.html`, `css/styles.css` — app-shell en styling
- `js/data.js` — alle menudata (weken, dagen, recepten, boodschappenlijsten) uit de PDF
- `js/cycle.js`, `js/menu.js` — cyclusdag-berekening en koppeling aan de menudata
- `js/checkoff.js`, `js/shopping.js` — afvink-status in `localStorage`
- `js/app.js` — rendering en simpele hash-router (`#/`, `#/recipe/:slug`, `#/shopping`)
- `manifest.json`, `sw.js`, `icons/` — PWA-installeerbaarheid en offline-ondersteuning
- `scripts/generate-icons.ps1` — genereert de app-iconen (geen externe tools nodig)

### Deployen

Elke push naar `main` wordt automatisch gepubliceerd via GitHub Pages. De service worker gebruikt een network-first strategie, dus een nieuwe deploy is direct zichtbaar zodra je verbinding hebt; offline valt de app terug op de laatst gecachete versie.

# Ice Frocks Warehouse OS — Handoff-Dokument

**Stand:** Juni 2026  
**Repo:** https://github.com/chefkoch007/lagersoftware-webapp  
**Live-URL:** Cloudflare Pages (auto-deploy aus `main`)

---

## 1. Projektübersicht

Eine browserbasierte Warehouse-Management-Demo-App für Ice Frocks GmbH. Ziel ist ein überzeugender Präsentations-Flow: QR-Code auf einem Etikett scannen (iPad) → Desktop zeigt sofort die Buchung und die Tabelle aktualisiert sich. Kein Backend-Server, keine Datenbank, kein Build-Prozess.

---

## 2. Tech-Stack

| Schicht | Technologie |
|---|---|
| Frontend | Vanilla React 18 · JSX im Browser transpiliert via Babel Standalone |
| Styling | Inline-CSS + CSS-Variablen in `index.html` |
| Fonts | Inter (Sans) · JetBrains Mono (Mono) via Google Fonts CDN |
| QR-Generierung | `qrcodejs@1.0.0` (cdnjs CDN) → `window.QRCode` |
| QR-Scan (Kamera) | `html5-qrcode@2.3.8` (unpkg CDN) → `window.Html5Qrcode` |
| Excel-Export | SheetJS `xlsx@0.20.3` (cdn.sheetjs.com) → `window.XLSX` |
| Cross-Device-Sync | Cloudflare Pages Function + KV-Namespace `SCAN_KV` |
| Hosting | Cloudflare Pages (Static + Functions) |

### Warum kein Build?
Die App lief bereits als Pure-HTML-Projekt. Babel Standalone im Browser erlaubt JSX ohne Webpack/Vite. CDN-Scripts werden als `type="text/babel"` eingebunden. Vorteil: sofort deploybar als statisches Verzeichnis.

---

## 3. Datei-Struktur

```
app/
├── index.html                  # Einstiegspunkt, alle CSS-Variablen, CDN-Imports
├── wrangler.toml               # CF Pages Config (KV-Binding im Dashboard, nicht hier)
├── functions/
│   └── api/
│       └── scan.js             # CF Pages Function — KV-Relay für Cross-Device-Sync
└── src/
    ├── icons.jsx               # Icon-Komponenten (SVG-Wrapper)
    ├── state.jsx               # Globaler State (StoreProvider + useStore)
    ├── header.jsx              # Top-Navigation + Tab-Bar
    ├── simulator.jsx           # Demo-Sidebar (Scan-Simulator für Desktop)
    ├── app.jsx                 # App-Shell, Routing, Cross-Device-Polling
    ├── screen-dashboard.jsx    # Tab: Dashboard
    ├── screen-scan.jsx         # Tab: Lager-Scan (Kamera)
    ├── screen-production.jsx   # Tab: Produktion / Wareneingang
    ├── screen-table.jsx        # Tab: Tabellen-Ansicht (Excel-Ersatz)
    └── screen-labels.jsx       # Tab: Etiketten / QR-Code-Generator
```

---

## 4. Globaler State (`src/state.jsx`)

Alles läuft durch einen einzigen React-Context (`StoreCtx`). Es gibt keinen externen Store. Alle Screens lesen mit `useStore()`.

### Wichtige State-Felder

| Feld | Typ | Beschreibung |
|---|---|---|
| `PRODUCTS` | konstant | 6 Produkte (A–F) mit Code, Name, Farbe, Einheit |
| `fullOrders` | Array | Aufträge (Lieferscheine LS-2026-xxxx) |
| `inventory` | Objekt | Bestandsbewegungen pro Tag und Produkt (KW 21) |
| `charges` | Array | Chargenhistorie (Wareneingänge) |
| `scanLog` | Array | Log jedes echten Scans in dieser Session |
| `lastScan` | Objekt | Letzter Scan-Status (idle / ok / undo) |
| `activeOrder` | Objekt | Aktiver Auftrag für Scan-Buchungen |
| `labelTarget` | Objekt | Aktuell im Etiketten-Tab angezeigtes Produkt + Charge |
| `feed` | Array | Live-Feed-Zeilen (Monospace-Log) |
| `kpi` | Objekt | Fehlmengen, Eingang, Ausgang, On-Time-Rate |

### Wichtige Funktionen

| Funktion | Auslöser | Effekte |
|---|---|---|
| `simulateScan({ product, mode, order, qty, chargeNr, mhd })` | Kamera-Scan, Demo-Simulator, Cross-Device-Poll | Aktualisiert `lastScan`, `kpi.ausgang`, `inventory.days[4].abg`, `scanLog`, `feed`, `activity`; Flash-Effekt in Tabelle |
| `undoLastScan()` | "Rückgängig"-Button | Setzt `lastScan.ok = false`; revertiert `inventory.abg` |
| `bookWareneingang({ artikel, menge, unit, chargeNr, datum })` | Produktions-Tab | Aktualisiert `inventory.days[3].zug`, fügt Charge ein |
| `exportToExcel()` | Button in Tabellen-Ansicht | Schreibt 5-Sheet-XLSX: Aufträge / Bestand / Fehlmengen / Chargen / Scan-Log |
| `resetState()` | Demo-Simulator | Setzt alle State-Felder auf Initialwerte zurück |

### Chargennummer-Format

```
IF-JJJJ-MMTT-<Artikel><Schicht>
Beispiel: IF-2026-0627-A1
```

Generiert von `buildChargeNr({ artikel, year, month, day, schicht })`.

---

## 5. QR-Code-System (Kern-Feature der Demo)

### QR-Inhalt

```
<Chargennummer>|<MHD>
Beispiel: IF-2026-0627-A1|12/2026
```

Zwei Felder, getrennt durch `|`. Der Scan-Tab splittet diesen String und extrahiert beide Werte.

### Generierung (screen-labels.jsx)

- Bibliothek: `window.QRCode` (qrcodejs)
- `useEffect` abhängig von `[chargeNr, mhd]` → QR wird automatisch neu gerendert wenn eines der beiden sich ändert
- Ausgabe: Canvas → `toDataURL("image/png")` → `<img>` im Label-Preview und im Drucktemplate

### Scan (screen-scan.jsx)

- Bibliothek: `window.Html5Qrcode` mit `facingMode: "environment"` (Rückkamera iPad)
- `parseQrPayload(raw)` splittet `|`, extrahiert `chargeNr` + `mhd`, matcht Produkt via Regex `/-([A-F])\d?$/`
- Nach Scan: `simulateScan(...)` lokal + POST an `/api/scan`

---

## 6. Cross-Device-Synchronisation

### Ablauf

```
iPad (Scan-Tab)          CF KV (SCAN_KV)         Desktop
     │                        │                      │
     ├─ POST /api/scan ───────►│                      │
     │  { productCode, qty,   │                      │
     │    chargeNr, mhd,      │◄── GET /api/scan ────┤ (alle 2s)
     │    deviceId, ts }      │                      │
     │                        ├── Datensatz ─────────►│
     │                        │                      ├─ simulateScan()
     │                        │                      │  (nur wenn ts > lastTs
     │                        │                      │   AND deviceId ≠ eigene)
```

### CF Pages Function (`functions/api/scan.js`)

- `GET /api/scan` → gibt letzten KV-Eintrag zurück (oder `null`)
- `POST /api/scan` → schreibt in `SCAN_KV` mit TTL 1 Stunde
- CORS-Header für alle Origins (`*`)

### KV-Binding

Das KV-Namespace `SCAN_KV` ist **im Cloudflare Pages Dashboard** eingerichtet:  
**Settings → Functions → KV namespace bindings → Variable: `SCAN_KV`**

Es steht nichts davon in `wrangler.toml` — das ist gewollt, um Deployment-Fehler durch falsche Namespace-IDs zu vermeiden.

### Device-ID

Jeder Browser-Tab bekommt beim ersten Start eine zufällige ID in `sessionStorage` (`wh_did`). Der Desktop ignoriert Scan-Events, die seine eigene `deviceId` tragen, um doppelte Buchungen zu verhindern.

---

## 7. Features im Überblick

### Dashboard (`/` → Tab "Dashboard")

- 4 KPI-Kacheln: Fehlmengen, Wareneingänge, Warenausgänge, Pünktlichkeitsrate
- Sparklines (SVG) pro KPI
- Aktivitäts-Feed (letzte 20 Ereignisse)
- Bestandsbalken-Diagramm pro Produkt
- Fehlmengen-Warnliste → Klick öffnet Tabellen-Ansicht

### Scan (`/` → Tab "Lager-Scan")

- Mengen-Stepper (1–999)
- "Kamera starten" → öffnet Rückkamera via `html5-qrcode`
- Nach Scan: Ergebnis-Karte (Produkt, Menge, Auftrag, MHD)
- "Rückgängig"-Button storniert die letzte Buchung
- Live-Feed zeigt alle Scan-Ereignisse in Mono-Font

### Produktion (`/` → Tab "Produktion / Wareneingang")

- Formular: Produkt, Datum, Schicht, Menge, Einheit
- Erzeugt Chargennummer live während Eingabe
- "Buchen" → `bookWareneingang()` → Bestand wird erhöht, Charge eingetragen
- Shortcut "Label drucken" → springt zu Etiketten-Tab mit vorausgefülltem Produkt

### Tabellen-Ansicht (`/` → Tab "Tabellen-Ansicht")

5 Sheets (Excel-Optik):

| Sheet | Inhalt |
|---|---|
| Aufträge KW 21 | Alle Lieferscheine mit Produktmengen, Status, Spedition |
| Bestand KW 21 | Tagesweise Anfangs-/Endbestand pro Produkt, Fehlmengen-Highlighting |
| Chargen | Alle Wareneingänge (manuell + via Produktions-Tab) |
| Fehlmengen | Gefiltert aus Bestand: nur Zeilen unter Mindestbestand |
| **Scan-Log** | **Jeder QR-Scan dieser Session mit Timestamp, Charge, MHD** |

- Suche, Status-Filter, Spalten-Sortierung
- Flash-Effekt auf Zeile bei neu gebuchtem Auftrag
- Excel-Export (5 Sheets): Button "Excel exportieren"

### Etiketten (`/` → Tab "Etiketten")

- Produktauswahl → Chargennummer wird automatisch generiert und befüllt
- MHD-Feld → verändert den QR-Code sofort
- QR-Code Vorschau in Echtzeit (Live-Render via qrcodejs)
- Label-Größe: S / M / L
- Optionen: QR anzeigen, MHD aufdrucken, Schwarz-Weiß
- "Drucken · N×" → öffnet Browser-Druckdialog, alle Kopien auf einmal

### Demo-Simulator (Sidebar)

Immer sichtbar (ausklappbar). Für Desktop-Demos ohne echtes iPad:

- **1-Klick Simulationen**: je ein Button pro Produkt, triggert `simulateScan`
- **Manueller Barcode**: Chargennummer-Text eingeben → simuliert Scan
- **State Reset**: setzt alles auf Demo-Initialwerte zurück
- **Live-Feed** der letzten Scan-Events

---

## 8. Demo-Ablauf (Schritt für Schritt)

1. **Desktop öffnet** die Live-URL (z.B. `lagersoftware.pages.dev`)
2. Im Tab **"Etiketten"**: Produkt auswählen, MHD eintragen → QR-Code wird angezeigt
3. **"Drucken"** → Label mit echtem QR drucken (oder QR direkt vom Screen abfotografieren)
4. **iPad öffnet dieselbe URL** im Tab **"Lager-Scan"**
5. iPad: Menge einstellen (z.B. 4 Karton), dann **"Kamera starten"**
6. QR-Code scannen → iPad zeigt Bestätigungs-Karte (Produkt A · 4 Karton · Auftrag LS-xxxx)
7. **Desktop:** nach maximal 2 Sekunden erscheint Toast-Notification, Scan-Tab und Tabelle aktualisieren sich automatisch — ohne Seiten-Reload

---

## 9. Deployment

### Erstmalig

1. Repo auf GitHub forken / clonen
2. Cloudflare Pages → "Create project" → Git-Repo verbinden
3. Build-Einstellungen: kein Build-Command, Output-Verzeichnis: `.`
4. Settings → Functions → KV namespace bindings → `SCAN_KV` auf ein KV-Namespace zeigen lassen (vorher unter KV in CF erstellen)
5. Jeder Push auf `main` deployed automatisch

### Laufender Betrieb

```bash
git add src/...
git commit -m "..."
git push origin main   # → CF Pages deployt automatisch
```

### Lokale Entwicklung

Für reine UI-Arbeit reicht ein einfacher HTTP-Server:

```bash
cd app
npx serve .
# oder: python3 -m http.server 3000
```

Cross-Device-Sync (KV) funktioniert lokal **nicht** — dafür ist die Cloudflare-URL nötig. Der Polling-Fehler wird still ignoriert.

---

## 10. Produktkatalog (fest im Code)

| Code | Name | Einheit | Kartons/Palette | Mindestbestand |
|---|---|---|---|---|
| A | Würfel Klassik 2,5 kg | Palette | 96 | 48 |
| B | Würfel XL 4 kg | Palette | 72 | 240 |
| C | Crushed Ice 5 kg | Karton | 12 | 24 |
| D | Hohlkugel-Eis 2 kg | Karton | 12 | 96 |
| E | Mini-Cubes 2,5 kg | Palette | 96 | 36 |
| F | Stangeneis 10 kg | Karton | 8 | 120 |

Produkte sind hardcoded in `state.jsx`. Für echte Verwendung müsste das aus einer API/DB kommen.

---

## 11. Bekannte Einschränkungen

| Einschränkung | Grund | Workaround |
|---|---|---|
| Kein persistenter State | Kein Backend / keine DB | Demo-Daten überleben keinen Page-Reload |
| Scan-Log nur In-Session | State lebt im Browser-RAM | Excel-Export vor Reload sichert den Log |
| KV TTL 1 Stunde | CF KV-Eintrag läuft ab | Für Demo ausreichend; POST setzt TTL zurück |
| Bestand "heute" = Freitag (Index 4) | Demo-Daten sind KW 21 · Mai 2026 | `inventory.days[4]` ist hardcoded als Buchungstag |
| Kein Auth | Demo-Kontext | Keine Nutzerverwaltung vorgesehen |
| Kein Mobile-Layout | Viewport `width=1440` | iPad im Landscape-Modus empfohlen |
| `wrangler.toml` ohne KV-Sektion | KV-ID im Dashboard konfiguriert | Bei `wrangler dev` lokal schlägt KV fehl |

---

## 12. Mögliche Erweiterungen

- **Persistenz**: Cloudflare D1 (SQLite) statt KV → State überlebt Reload
- **Auth**: Cloudflare Access vor der Pages-URL → einfaches SSO
- **Echte Bestands-API**: KV oder D1 als Source of Truth für Inventory
- **Multi-Tenant**: Lager-ID im QR-Code kodieren
- **Druckoptimierung**: Label-PDF via `jsPDF` statt Browser-Druckdialog
- **Build-Prozess**: Vite + TypeScript für größere Codebase

---

## 13. Abhängigkeiten (alle via CDN, kein `package.json`)

```
react@18.3.1                  → unpkg
react-dom@18.3.1              → unpkg
@babel/standalone@7.29.0      → unpkg
xlsx@0.20.3                   → cdn.sheetjs.com
qrcodejs@1.0.0                → cdnjs.cloudflare.com
html5-qrcode@2.3.8            → unpkg
Inter + JetBrains Mono        → fonts.googleapis.com
```

Kein `node_modules`, kein Lock-File, kein Bundler.

function Simulator() {
  const { simulateScan, simOpen, setSimOpen, feed, PRODUCTS, activeOrder, scanMode, kpi, resetState } = useStore();
  const [manual, setManual] = React.useState("");

  function triggerManual() {
    const match = manual.match(/-([A-F])\d?$/i);
    let prod = PRODUCTS[0];
    if (match) { const found = PRODUCTS.find(p => p.code === match[1].toUpperCase()); if (found) prod = found; }
    simulateScan({ product: prod });
    setManual("");
  }

  if (!simOpen) {
    return (
      <aside className="sim collapsed">
        <div className="sim-head">
          <button className="sim-toggle" onClick={() => setSimOpen(true)} title="Demo-Simulator öffnen">
            <Icon.Bolt size={16} />
          </button>
          <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 11, color: "#8B95AE", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>
            Demo-Sim
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="sim">
      <div className="sim-head">
        <div className="sim-title">
          <span className="led" />
          Demo-Simulator
          <span className="pill" style={{ background: "rgba(255,255,255,0.08)", color: "#E5EAF5" }}>LIVE</span>
        </div>
        <button className="sim-toggle" onClick={() => setSimOpen(false)} title="Einklappen">
          <Icon.PanelR size={16} />
        </button>
      </div>

      <div className="sim-body">
        <div style={{ fontSize: 12, color: "#A8B1C7", lineHeight: 1.5 }}>
          Jeder Klick aktualisiert KPIs, Aktivitäts-Historie, Tabellen und Label-Vorschau in Echtzeit.
        </div>

        <div className="sim-section">
          <h4>Modus &amp; Auftrag</h4>
          <div style={{ display: "flex", gap: 8 }}>
            <div className="sim-stat" style={{ flex: 1 }}>
              <span>Modus</span><b>{scanMode === "palette" ? "Palette" : "Karton"}</b>
            </div>
            <div className="sim-stat" style={{ flex: 1 }}>
              <span>Auftrag</span><b style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>{activeOrder?.id?.slice(-4)}</b>
            </div>
          </div>
        </div>

        <div className="sim-section">
          <h4>1-Klick Simulationen</h4>
          <div className="sim-row">
            {PRODUCTS.map(p => (
              <button key={p.code} className="sim-btn" onClick={() => simulateScan({ product: p })}>
                <div className="sb-prod">
                  Produkt {p.code}
                  <span className="swatch" style={{ background: p.color }} />
                </div>
                <div className="sb-kind">{p.unit === "Palette" ? "Palette" : "Karton"} · {p.name.split(" ")[0]}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="sim-section">
          <h4>Manueller Barcode / QR</h4>
          <div className="sim-input-wrap">
            <input
              className="sim-input"
              placeholder="IF-2026-0521-A1"
              value={manual}
              onChange={e => setManual(e.target.value)}
              onKeyDown={e => e.key === "Enter" && triggerManual()}
            />
            <button className="sim-flash" onClick={triggerManual}>
              <Icon.Bolt size={18} /> SCAN AUSLÖSEN
            </button>
          </div>
        </div>

        <div className="sim-section">
          <h4>Live-Feed</h4>
          <div className="sim-feed">
            {feed.map((l, i) => (
              <div key={i} className={`line ${l.level || ""}`}>
                <span className="ts">[{l.ts}]</span>{l.text}
              </div>
            ))}
            {feed.length === 0 && <div className="line">Bereit · keine Aktivität</div>}
          </div>
        </div>

        <div className="sim-section">
          <h4>Aktuelle Zähler</h4>
          <div className="sim-row" style={{ flexDirection: "column", gap: 6 }}>
            <div className="sim-stat"><span>Fehlmengen</span><b style={{ color: kpi.fehlmengen > 0 ? "#F87171" : "#6FE39B" }}>{kpi.fehlmengen}</b></div>
            <div className="sim-stat"><span>Eingänge heute</span><b>{kpi.eingang}</b></div>
            <div className="sim-stat"><span>Ausgänge heute</span><b>{kpi.ausgang}</b></div>
            <div className="sim-stat"><span>Pünktlichkeit</span><b>{kpi.onTime} %</b></div>
          </div>
        </div>

        <div className="sim-section">
          <h4>Demo-Steuerung</h4>
          <button
            onClick={resetState}
            style={{ width: "100%", padding: "10px", borderRadius: 10, background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.4)", color: "#F87171", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}>
            <Icon.Refresh size={15} /> State zurücksetzen
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────
//  Full Demo-Screen (Tab: DEMO-SIMULATOR)
// ─────────────────────────────────────────────
function ScreenDemo() {
  const { simulateScan, PRODUCTS, feed, resetState } = useStore();

  return (
    <>
      <div className="screen-head">
        <div>
          <span className="greet">Steuerungs-Konsole für Vorführer</span>
          <h1>Demo-Simulator <span style={{ fontWeight: 500, color: "var(--muted)" }}>· Realtime Cross-Screen</span></h1>
        </div>
        <div className="head-actions">
          <span className="pill"><span className="dot" style={{ background: "var(--green)" }} />Verbunden · localhost</span>
          <button className="btn danger" onClick={resetState}><Icon.Refresh size={15} /> State zurücksetzen</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Scanner console */}
        <div className="card card-pad" style={{ background: "linear-gradient(180deg, #0B1220 0%, #161E33 100%)", color: "#E5EAF5", borderColor: "#1f2740" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 12px var(--green)", display: "inline-block" }} />
            <span style={{ fontWeight: 600, fontSize: 15 }}>Scanner-Konsole</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#8B95AE", marginLeft: "auto" }}>BT-LX42 · 100 %</span>
          </div>

          <div style={{ fontSize: 12, color: "#A8B1C7", lineHeight: 1.6, marginBottom: 20 }}>
            Jeder Klick simuliert einen zufälligen Scanner-Event und aktualisiert alle Screens in Echtzeit.
          </div>

          <button
            className="sim-flash"
            style={{ width: "100%", fontSize: 16, padding: "18px 0", borderRadius: 14 }}
            onClick={() => simulateScan({ product: PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)] })}
          >
            <Icon.Bolt size={22} /> ZUFALLS-SCAN AUSLÖSEN
          </button>

          <div style={{ marginTop: 20 }}>
            <div className="card card-pad" style={{ background: "#0B1220", border: "1px solid #1f2740" }}>
              <div className="card-title" style={{ marginBottom: 10 }}>
                <div><h3 style={{ color: "#E5EAF5" }}>Live-Feed</h3><span className="sub">Bus-Events</span></div>
                <span className="pill dark">{feed.length}</span>
              </div>
              <div className="sim-feed" style={{ maxHeight: 220 }}>
                {feed.map((l, i) => (
                  <div key={i} className={`line ${l.level || ""}`}>
                    <span className="ts">[{l.ts}]</span>{l.text}
                  </div>
                ))}
                {feed.length === 0 && <div className="line">Bereit · keine Aktivität</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Live monitor */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card card-pad">
            <div className="card-title">
              <div><h3>Realtime-Effekt-Karte</h3>
                <span className="sub">Welche Screens reagieren auf einen Scan?</span></div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { s: "Dashboard · KPIs",       icon: <Icon.Chart size={14} />,   what: "Eingang/Ausgang, Fehlmengen, Spark-Lines" },
                { s: "Dashboard · Aktivität",  icon: <Icon.Layers size={14} />,  what: "Neuer Eintrag oben mit Zeitstempel »gerade«" },
                { s: "Tabellen-Ansicht",        icon: <Icon.Table size={14} />,   what: "Auftragszeile flasht blau · Endbestand −1" },
                { s: "Label-Generator",         icon: <Icon.Tag size={14} />,     what: "Vorschau übernimmt Produkt & neue Charge" },
                { s: "Lager-Scan",              icon: <Icon.Scanner size={14} />, what: "Bestätigungsfeld + Zuletzt-gescannt-Strip" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: "var(--card-2)", border: "1px solid var(--line-2)" }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--blue-50)", color: "var(--blue)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{r.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{r.s}</div>
                    <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{r.what}</div>
                  </div>
                  <span className="pill green"><span className="dot" />aktiv</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card card-pad" style={{ borderColor: "rgba(220,38,38,0.3)" }}>
            <div className="card-title">
              <div><h3>Demo-Steuerung</h3><span className="sub">State auf Initialwerte zurücksetzen</span></div>
            </div>
            <button
              onClick={resetState}
              style={{ width: "100%", padding: "12px", borderRadius: 10, background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.35)", color: "#F87171", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}>
              <Icon.Refresh size={15} /> State zurücksetzen
            </button>
          </div>
        </div>
      </div>

      <div className="anno" style={{ marginTop: 16 }}>
        <span className="star">i</span>
        <div>
          Der <b>Zufalls-Scan</b> wählt zufällig eines der 6 Produkte und aktualisiert alle Screens live.
          Der Button <b>„State zurücksetzen"</b> stellt alle Demo-Daten auf den Initialzustand zurück.
        </div>
      </div>
    </>
  );
}

window.Simulator = Simulator;
window.ScreenDemo = ScreenDemo;

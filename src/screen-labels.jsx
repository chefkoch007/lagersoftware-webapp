// Deterministic pseudo-QR based on a seed string
function qrCells(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  const cells = [], N = 21;
  for (let i = 0; i < N * N; i++) { h = Math.imul(h ^ (h >>> 13), 1597334677); cells.push((h & 0xff) > 120); }
  const setFinder = (r0, c0) => {
    for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
      const inOuter = r === 0 || r === 6 || c === 0 || c === 6;
      const inInner = (r >= 2 && r <= 4 && c >= 2 && c <= 4);
      cells[(r0 + r) * N + (c0 + c)] = inOuter || inInner;
      if ((r === 1 || r === 5) && c >= 1 && c <= 5) cells[(r0 + r) * N + (c0 + c)] = false;
      if ((c === 1 || c === 5) && r >= 1 && r <= 5) cells[(r0 + r) * N + (c0 + c)] = false;
    }
  };
  setFinder(0, 0); setFinder(0, N - 7); setFinder(N - 7, 0);
  return cells;
}

function ScreenLabels() {
  const { labelTarget, setLabelTarget, PRODUCTS, showToast } = useStore();
  const [product, setProductLocal]   = React.useState(labelTarget.product);
  const [chargeNr, setChargeLocal]   = React.useState(labelTarget.chargeNr);
  const [copies, setCopies]          = React.useState(8);
  const [size, setSize]              = React.useState("M");
  const [showCode, setShowCode]      = React.useState(true);
  const [showMHD, setShowMHD]        = React.useState(true);
  const [bw, setBw]                  = React.useState(true);
  const [mhd, setMhd]               = React.useState("12/2026");
  const [isPrinting, setIsPrinting]  = React.useState(false);

  // Sync with global labelTarget when simulator changes it
  React.useEffect(() => {
    setProductLocal(labelTarget.product);
    setChargeLocal(labelTarget.chargeNr);
  }, [labelTarget.product, labelTarget.chargeNr]);

  const cells = qrCells(`${product.code}-${chargeNr}`);

  function persist() {
    setLabelTarget({ product, chargeNr });
    showToast("Label gespeichert · verknüpft mit globalem State");
  }

  function handleReset() {
    setProductLocal(PRODUCTS[0]);
    setChargeLocal("IF-2026-0521-A1");
    setMhd("12/2026");
  }

  // ── Print handler ────────────────────────────
  function handlePrint() {
    const zone = document.getElementById("print-zone");
    if (!zone) return;

    const labelWidth = size === "L" ? 420 : size === "M" ? 360 : 280;

    // Build HTML for N copies
    let html = "";
    for (let i = 0; i < copies; i++) {
      html += `
        <div style="width:${labelWidth}px; background:white; border:1px solid #E6E9EF; border-radius:12px; padding:22px; font-family:'JetBrains Mono',monospace; margin:8px; display:inline-block; vertical-align:top; page-break-inside:avoid;">
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px; color:#5A6477; text-transform:uppercase; letter-spacing:0.1em; border-bottom:1px dashed #E6E9EF; padding-bottom:10px; margin-bottom:14px;">
            <span>Ice Frocks · Charge</span>
            ${showMHD ? `<span>MHD ${mhd}</span>` : ""}
          </div>
          <div style="display:flex; align-items:center; gap:14px;">
            <span style="width:46px; height:46px; border-radius:10px; background:${bw ? "#0B1220" : product.color}; color:#fff; font-weight:700; font-size:22px; display:inline-flex; align-items:center; justify-content:center;">${product.code}</span>
            <div>
              <div style="font-family:Inter,sans-serif; font-weight:700; font-size:22px; letter-spacing:-0.02em; color:#0B1220;">Produkt ${product.code}</div>
              <div style="font-family:Inter,sans-serif; color:#5A6477; font-size:13px; margin-top:2px;">${product.name}</div>
            </div>
          </div>
          <div style="margin-top:14px; font-size:11px; color:#5A6477; text-transform:uppercase; letter-spacing:0.08em;">
            Charge-Nr.
            <div style="font-weight:600; font-size:18px; color:#0B1220; letter-spacing:0.04em; margin-top:2px;">${chargeNr}</div>
          </div>
          ${showCode ? `<div style="margin-top:16px; border:1px solid #E6E9EF; border-radius:8px; padding:8px; display:grid; grid-template-columns:repeat(21,1fr); gap:1px; background:#fff;">${cells.map(on => `<span style="background:${on ? "#0B1220" : "transparent"}; border-radius:1px; aspect-ratio:1; display:block;"></span>`).join("")}</div>` : ""}
          <div style="display:flex; justify-content:space-between; margin-top:12px; font-size:10px; color:#5A6477; text-transform:uppercase; letter-spacing:0.08em;">
            <span>SKU IF-${product.code}-2026</span>
            <span>Ice Frocks GmbH</span>
          </div>
        </div>
      `;
    }

    zone.innerHTML = html;
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        zone.innerHTML = "";
        setIsPrinting(false);
        showToast(`${copies} Label${copies !== 1 ? "s" : ""} gedruckt`);
      }, 500);
    }, 100);
  }

  const labelWidth = size === "L" ? 420 : size === "M" ? 360 : 280;

  return (
    <>
      <div className="screen-head">
        <div>
          <span className="greet">Label-Generator · QR mit Charge-Verknüpfung</span>
          <h1>Etiketten erstellen &amp; drucken</h1>
        </div>
        <div className="head-actions">
          <button className="btn"><Icon.Layers size={15} /> Vorlagen</button>
          <button className="btn primary" onClick={handlePrint} disabled={isPrinting}>
            <Icon.Print size={15} /> {isPrinting ? "Wird gedruckt…" : `Drucken · ${copies}×`}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Form panel */}
        <div className="card card-pad">
          <div className="card-title">
            <div>
              <h3>Label-Daten</h3>
              <span className="sub">Automatisch aus letztem Scan / Charge übernommen</span>
            </div>
            <span className="pill blue"><Icon.Sparkle size={11} /> Live verknüpft</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="field">
              <label>Produkt</label>
              <select value={product.code} onChange={e => setProductLocal(PRODUCTS.find(p => p.code === e.target.value))}>
                {PRODUCTS.map(p => <option key={p.code} value={p.code}>{p.code} · {p.name}</option>)}
              </select>
            </div>

            <div className="field">
              <label>Chargennummer</label>
              <input value={chargeNr} onChange={e => setChargeLocal(e.target.value)} style={{ fontFamily: "var(--font-mono)", fontWeight: 600, letterSpacing: "0.04em" }} />
              <span className="hint">Format: IF-JJJJ-MMTT-&lt;Artikel&gt;&lt;Schicht&gt;</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field">
                <label>Anzahl Kopien</label>
                <input type="number" min={1} max={500} value={copies} onChange={e => setCopies(Math.max(1, Number(e.target.value)))} />
              </div>
              <div className="field">
                <label>MHD (Monat/Jahr)</label>
                <input value={mhd} onChange={e => setMhd(e.target.value)} placeholder="12/2026" />
              </div>
            </div>

            <div className="field">
              <label>Label-Größe</label>
              <div className="seg" style={{ padding: 3, height: 42, alignItems: "stretch" }}>
                {[["S", "70×40 mm"], ["M", "100×70 mm"], ["L", "150×100 mm"]].map(([s, lbl]) => (
                  <button key={s} className={size === s ? "on" : ""} onClick={() => setSize(s)} style={{ flex: 1, height: "100%" }}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 18, marginTop: 4, flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, cursor: "pointer" }}>
                <input type="checkbox" checked={showCode} onChange={e => setShowCode(e.target.checked)} style={{ accentColor: "var(--blue)", width: 16, height: 16 }} />
                QR-Code anzeigen
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, cursor: "pointer" }}>
                <input type="checkbox" checked={bw} onChange={e => setBw(e.target.checked)} style={{ accentColor: "var(--blue)", width: 16, height: 16 }} />
                Schwarz-Weiß-Druck
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, cursor: "pointer" }}>
                <input type="checkbox" checked={showMHD} onChange={e => setShowMHD(e.target.checked)} style={{ accentColor: "var(--blue)", width: 16, height: 16 }} />
                MHD aufdrucken
              </label>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button className="btn" onClick={handleReset}>
                <Icon.Refresh size={15} /> Zurücksetzen
              </button>
              <button className="btn" onClick={persist}>
                <Icon.Check size={15} /> Speichern
              </button>
              <button className="btn primary" onClick={handlePrint} disabled={isPrinting} style={{ marginLeft: "auto" }}>
                <Icon.Print size={15} /> {copies}× Drucken
              </button>
            </div>
          </div>
        </div>

        {/* Preview panel */}
        <div className="card card-pad" style={{
          background:
            "linear-gradient(0deg,rgba(11,18,32,0.02),rgba(11,18,32,0.02))," +
            "repeating-linear-gradient(45deg, var(--bg-2) 0 12px, transparent 12px 24px)," +
            "var(--card)",
          display: "flex", flexDirection: "column", alignItems: "center"
        }}>
          <div className="card-title" style={{ alignSelf: "stretch" }}>
            <div>
              <h3>Vorschau · Hochauflösend</h3>
              <span className="sub">Maßstabsgetreu · bereit zum Drucken</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span className="pill">{size === "S" ? "70×40 mm" : size === "M" ? "100×70 mm" : "150×100 mm"}</span>
              <span className="pill dark">{copies}× Kopien</span>
            </div>
          </div>

          {/* Label preview (screen only) */}
          <div className="label-paper" id="label-preview-inner" style={{ marginTop: 10, width: labelWidth }}>
            <div className="lp-head">
              <span>Ice Frocks · Charge</span>
              {showMHD && <span>MHD {mhd}</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ width: 46, height: 46, borderRadius: 10, background: bw ? "var(--ink)" : product.color, color: "#fff", fontWeight: 700, fontSize: 22, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                {product.code}
              </span>
              <div>
                <div className="lp-prod">Produkt {product.code}</div>
                <div className="lp-name">{product.name}</div>
              </div>
            </div>
            <div className="lp-charge">
              Charge-Nr.
              <b>{chargeNr}</b>
            </div>
            {showCode && (
              <div className="qr" style={{ marginTop: 16 }}>
                {cells.map((on, i) => <span key={i} className={on ? "" : "off"} />)}
              </div>
            )}
            <div className="lp-foot">
              <span>SKU IF-{product.code}-2026</span>
              <span>Ice Frocks GmbH · Hannover</span>
            </div>
          </div>

          <button className="btn dark lg" style={{ marginTop: 20 }} onClick={handlePrint} disabled={isPrinting}>
            <Icon.Print size={16} /> {isPrinting ? "Wird gedruckt…" : `${copies}× Drucken`}
          </button>

          <div style={{ marginTop: 14, fontSize: 11.5, color: "var(--muted)", textAlign: "center", lineHeight: 1.6 }}>
            Öffnet den Browser-Druckdialog.<br />
            Alle {copies} Kopien werden auf einmal ausgegeben.
          </div>
        </div>
      </div>
    </>
  );
}

window.ScreenLabels = ScreenLabels;

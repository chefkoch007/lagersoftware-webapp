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
  const [qrDataUrl, setQrDataUrl]    = React.useState(null);

  // Sync with global labelTarget when simulator changes it
  React.useEffect(() => {
    setProductLocal(labelTarget.product);
    setChargeLocal(labelTarget.chargeNr);
  }, [labelTarget.product, labelTarget.chargeNr]);

  // Generate real scannable QR code whenever chargeNr changes
  // qrcodejs writes into a temp div — we pull the canvas data URL out of it
  React.useEffect(() => {
    if (typeof QRCode === "undefined") return;
    const div = document.createElement("div");
    new QRCode(div, {
      text: chargeNr,
      width: 220,
      height: 220,
      colorDark: "#0B1220",
      colorLight: "#FFFFFF",
      correctLevel: QRCode.CorrectLevel.M,
    });
    const canvas = div.querySelector("canvas");
    if (canvas) setQrDataUrl(canvas.toDataURL("image/png"));
  }, [chargeNr]);

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
    const qrImg = showCode && qrDataUrl
      ? `<img src="${qrDataUrl}" alt="QR" style="width:100%;border-radius:8px;border:1px solid #E6E9EF;display:block;margin-top:16px;" />`
      : "";

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
          ${qrImg}
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
          <button className="btn primary" onClick={handlePrint} disabled={isPrinting || !qrDataUrl}>
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
              <label>Chargennummer (= QR-Code-Inhalt)</label>
              <input value={chargeNr} onChange={e => setChargeLocal(e.target.value)} style={{ fontFamily: "var(--font-mono)", fontWeight: 600, letterSpacing: "0.04em" }} />
              <span className="hint">Format: IF-JJJJ-MMTT-&lt;Artikel&gt;&lt;Schicht&gt; · wird direkt in den QR kodiert</span>
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
              <button className="btn primary" onClick={handlePrint} disabled={isPrinting || !qrDataUrl} style={{ marginLeft: "auto" }}>
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
              <h3>Vorschau · Echter QR-Code</h3>
              <span className="sub">Echtzeit generiert · mit iOS-Kamera scanbar</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span className="pill">{size === "S" ? "70×40 mm" : size === "M" ? "100×70 mm" : "150×100 mm"}</span>
              <span className="pill dark">{copies}× Kopien</span>
            </div>
          </div>

          {/* Label preview */}
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
              <div style={{ marginTop: 16 }}>
                {qrDataUrl
                  ? <img src={qrDataUrl} alt="QR-Code" style={{ width: "100%", borderRadius: 8, border: "1px solid var(--line)", display: "block" }} />
                  : <div style={{ width: "100%", aspectRatio: "1", background: "var(--bg-2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--muted)" }}>QR wird generiert…</div>
                }
              </div>
            )}
            <div className="lp-foot">
              <span>SKU IF-{product.code}-2026</span>
              <span>Ice Frocks GmbH · Hannover</span>
            </div>
          </div>

          <button className="btn dark lg" style={{ marginTop: 20 }} onClick={handlePrint} disabled={isPrinting || !qrDataUrl}>
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

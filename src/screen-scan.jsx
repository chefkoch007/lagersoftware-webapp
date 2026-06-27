function getDeviceId() {
  let id = sessionStorage.getItem("wh_did");
  if (!id) {
    id = Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem("wh_did", id);
  }
  return id;
}

function ScreenScan() {
  const { lastScan, activeOrder, setActiveOrder, scanMode, setScanMode, undoLastScan, ORDERS, PRODUCTS, feed, simulateScan, showToast } = useStore();

  // Hidden input ref – captures hardware scanner keystrokes
  const scanInputRef = React.useRef(null);
  const [scanBuffer, setScanBuffer]   = React.useState("");
  const [scanFlash, setScanFlash]     = React.useState(false);
  const [cameraActive, setCameraActive] = React.useState(false);
  const scannerRef = React.useRef(null);

  // Auto-focus the hidden input on mount and whenever tab becomes active
  React.useEffect(() => {
    const focus = () => { if (scanInputRef.current && !cameraActive) scanInputRef.current.focus(); };
    focus();
    const timer = setInterval(focus, 3000);
    return () => clearInterval(timer);
  }, [cameraActive]);

  // Cleanup camera on unmount
  React.useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  // Parse a scan code like "IF-2026-0521-A1" → product A
  function parseScanCode(code) {
    const clean = code.trim().toUpperCase();
    const directMatch = PRODUCTS.find(p => clean === p.code);
    if (directMatch) return directMatch;
    const chargeMatch = clean.match(/-([A-F])\d?$/);
    if (chargeMatch) return PRODUCTS.find(p => p.code === chargeMatch[1]) || null;
    for (const p of PRODUCTS) {
      if (clean.includes(p.code)) return p;
    }
    return null;
  }

  function handleScanKey(e) {
    if (e.key === "Enter") {
      const code = scanBuffer.trim();
      setScanBuffer("");
      if (!code) return;
      processScan(code);
    } else if (e.key.length === 1) {
      setScanBuffer(b => b + e.key);
    }
  }

  function processScan(code) {
    const product = parseScanCode(code);
    if (!product) {
      showToast(`Unbekannter Code: ${code}`, "warn");
      return;
    }
    setScanFlash(true);
    setTimeout(() => setScanFlash(false), 600);
    simulateScan({ product, mode: scanMode, order: activeOrder });
  }

  function handleManualScan(productCode) {
    const product = PRODUCTS.find(p => p.code === productCode);
    if (!product) return;
    setScanFlash(true);
    setTimeout(() => setScanFlash(false), 600);
    simulateScan({ product, mode: scanMode, order: activeOrder });
    if (scanInputRef.current) scanInputRef.current.focus();
  }

  // ── Camera scanning ────────────────────────────
  function startCamera() {
    if (!window.Html5Qrcode) {
      showToast("Kamera-Bibliothek noch nicht geladen — kurz warten", "warn");
      return;
    }
    setCameraActive(true);

    setTimeout(() => {
      const scanner = new Html5Qrcode("qr-camera-div");
      scannerRef.current = scanner;

      scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          // Process locally (shows confirmation on this device)
          processScan(decodedText);
          // Post to CF KV so desktop gets notified
          postScanToApi(decodedText);
          // Stop camera after successful scan
          scanner.stop()
            .then(() => { scannerRef.current = null; setCameraActive(false); })
            .catch(() => {});
        },
        () => {} // QR not found yet — ignore
      ).catch(() => {
        showToast("Kamera-Zugriff verweigert — Berechtigung im Browser prüfen", "warn");
        scannerRef.current = null;
        setCameraActive(false);
      });
    }, 150);
  }

  function stopCamera() {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setCameraActive(false);
  }

  function postScanToApi(code) {
    const product = parseScanCode(code);
    if (!product) return;
    fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productCode: product.code,
        chargeNr: code,
        mode: scanMode,
        orderId: activeOrder.id,
        deviceId: getDeviceId(),
        ts: Date.now(),
      }),
    }).catch(() => {}); // Silently ignore if no CF Function running (local dev)
  }

  return (
    <>
      {/* Hidden input that captures hardware scanner */}
      <input
        ref={scanInputRef}
        style={{ position: "fixed", top: 0, left: 0, width: 1, height: 1, opacity: 0, pointerEvents: "none", zIndex: -1 }}
        value={scanBuffer}
        onChange={e => setScanBuffer(e.target.value)}
        onKeyDown={handleScanKey}
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className="screen-head">
        <div>
          <span className="greet">iPad-Modus · Lager-Halle NRD · Tor 02</span>
          <h1>Lager-Scan</h1>
        </div>
        <div className="head-actions">
          <span className="pill green"><span className="dot" />Scanner verbunden · BT-LX42</span>
          {!cameraActive
            ? <button className="btn primary" onClick={startCamera}>
                <Icon.Scanner size={15} /> Kamera-Scan starten
              </button>
            : <button className="btn danger" onClick={stopCamera}>
                <Icon.Close size={15} /> Kamera beenden
              </button>
          }
        </div>
      </div>

      <div className="ipad">
        <div className="ipad-screen" style={{ padding: 28 }}>

          {/* Mode toggle + Order picker */}
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, marginBottom: 24 }}>
            <div className="card card-pad" style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 10, fontWeight: 600 }}>Scanner-Modus</div>
              <div className="seg" style={{ padding: 6 }}>
                <button
                  className={scanMode === "palette" ? "on" : ""}
                  onClick={() => { setScanMode("palette"); if (!cameraActive) scanInputRef.current?.focus(); }}
                  style={{ height: 48, padding: "0 22px", fontSize: 14 }}>
                  <Icon.Pallet size={16} /> &nbsp;Palette scannen
                </button>
                <button
                  className={scanMode === "karton" ? "on" : ""}
                  onClick={() => { setScanMode("karton"); if (!cameraActive) scanInputRef.current?.focus(); }}
                  style={{ height: 48, padding: "0 22px", fontSize: 14 }}>
                  <Icon.Box size={16} /> &nbsp;Einzel-Karton
                </button>
              </div>
            </div>

            <div className="card card-pad" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", fontWeight: 600 }}>Aktive Lieferscheinnummer / Bestellung</div>
                <span className="pill blue"><span className="dot" />{activeOrder.kw}</span>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 22, letterSpacing: "0.04em", color: "var(--ink)" }}>{activeOrder.id}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
                    {activeOrder.spedition} · {activeOrder.target || activeOrder.zielort} · {activeOrder.date || activeOrder.bestelldatum}
                  </div>
                </div>
                <select
                  className="btn"
                  style={{ height: 44, paddingLeft: 14, paddingRight: 14 }}
                  value={activeOrder.id}
                  onChange={e => {
                    const o = ORDERS.find(o => o.id === e.target.value);
                    if (o) setActiveOrder(o);
                    if (!cameraActive) scanInputRef.current?.focus();
                  }}
                >
                  {ORDERS.map(o => (
                    <option key={o.id} value={o.id}>{o.id} · {o.spedition}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Main scan confirmation panel */}
          <div className="card" style={{
            padding: 28,
            borderColor: lastScan.ok ? "#CCEAD7" : "#F2C9C9",
            background: lastScan.ok
              ? (scanFlash ? "linear-gradient(135deg,#D0F5E0,#FFFFFF)" : "linear-gradient(135deg,#F4FBF7,#FFFFFF)")
              : "linear-gradient(135deg,#FFF7F7,#FFFFFF)",
            transition: "background 0.3s"
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                  <span className={`pill ${lastScan.ok ? "green" : "red"}`} style={{ height: 28, fontSize: 13, padding: "0 14px" }}>
                    {lastScan.ok
                      ? <><Icon.Check size={14} /> &nbsp;Erfolgreich erfasst</>
                      : <><Icon.Close size={14} /> &nbsp;Buchung zurückgenommen</>}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{lastScan.when} Uhr</span>
                </div>
                <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1, display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ width: 64, height: 64, borderRadius: 14, background: lastScan.product.color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700 }}>
                    {lastScan.product.code}
                  </span>
                  <span>Produkt {lastScan.product.code}</span>
                </div>
                <div style={{ fontSize: 18, color: "var(--ink-2)", marginTop: 8 }}>{lastScan.product.name}</div>
                <div style={{ display: "flex", gap: 24, marginTop: 22 }}>
                  <Stat label="Menge" value={`${lastScan.qty} ${lastScan.unit}`} />
                  <Stat label="Auftrag" value={lastScan.order} mono />
                  <Stat label="Tor" value="02 · NRD" />
                  <Stat label="Modus" value={scanMode === "palette" ? "Palette" : "Karton"} />
                </div>
              </div>

              {/* Scanner viewport — animiert ODER Kamera */}
              <div className="scan-viewport" style={{ position: "relative" }}>

                {/* Kamera-Div — immer im DOM, sichtbar wenn cameraActive */}
                <div
                  id="qr-camera-div"
                  style={{
                    position: "absolute", inset: 0, zIndex: 10,
                    display: cameraActive ? "block" : "none",
                    overflow: "hidden", borderRadius: 18,
                    background: "#000",
                  }}
                />

                {/* Animierter Scan-Viewport wenn Kamera aus */}
                {!cameraActive && (
                  <>
                    <div className="grid" />
                    <div className="scan-frame">
                      <div className="c1" /><div className="c2" /><div className="c3" /><div className="c4" />
                    </div>
                    <div className="scan-line" />
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
                      <button
                        onClick={startCamera}
                        style={{
                          background: "var(--blue)", color: "#fff", border: "none", borderRadius: 14,
                          padding: "14px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 10,
                          boxShadow: "0 8px 24px -8px rgba(47,90,243,0.7)",
                        }}
                      >
                        <Icon.Scanner size={18} /> Kamera starten
                      </button>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        oder Hardware-Scanner verwenden
                      </span>
                    </div>
                  </>
                )}

                {/* Kamera aktiv — Schließen-Button */}
                {cameraActive && (
                  <button
                    onClick={stopCamera}
                    style={{
                      position: "absolute", top: 10, right: 10, zIndex: 20,
                      background: "rgba(0,0,0,0.6)", color: "#fff", border: "none",
                      borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6,
                    }}
                  >
                    <Icon.Close size={12} /> Schließen
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick-scan product buttons */}
          <div style={{ marginTop: 22 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", fontWeight: 600, marginBottom: 12 }}>
              Schnell-Scan · Produkt direkt auswählen
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
              {PRODUCTS.map(p => (
                <button
                  key={p.code}
                  onClick={() => handleManualScan(p.code)}
                  style={{
                    background: lastScan.product?.code === p.code && lastScan.ok
                      ? "var(--blue-50)" : "var(--card)",
                    border: `1px solid ${lastScan.product?.code === p.code && lastScan.ok ? "var(--blue)" : "var(--line)"}`,
                    borderRadius: 12, padding: "12px 8px", display: "flex", flexDirection: "column",
                    alignItems: "center", gap: 6, transition: "all 0.15s", cursor: "pointer"
                  }}
                >
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: p.color, color: "#fff", fontWeight: 700, fontSize: 16, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    {p.code}
                  </span>
                  <span style={{ fontSize: 10.5, color: "var(--muted)", textAlign: "center", lineHeight: 1.3 }}>{p.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Last scan + Undo strip */}
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr auto", gap: 14, alignItems: "center", padding: "18px 22px", borderRadius: 18, background: "var(--ink)", color: "#fff", boxShadow: "var(--sh-2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8B95AE", fontWeight: 600 }}>Zuletzt gescannt</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 24, height: 24, borderRadius: 6, background: lastScan.product.color, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                  {lastScan.product.code}
                </span>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{lastScan.product.name}</span>
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#8B95AE" }}>
                {lastScan.unit} · 1× · {lastScan.when}
              </span>
              {!lastScan.ok && <span className="pill amber" style={{ fontSize: 10.5, height: 20 }}>zurückgenommen</span>}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn danger lg" onClick={undoLastScan} disabled={!lastScan.ok}>
                <Icon.Undo size={16} /> Rückgängig
              </button>
            </div>
          </div>

          {/* Live feed */}
          <div style={{ marginTop: 16, borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)" }}>
            <div style={{ padding: "10px 16px", background: "var(--card-2)", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 8 }}>
              <span className="led" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 8px var(--green)", display: "inline-block" }} />
              <span style={{ fontWeight: 600, fontSize: 12.5 }}>Live-Feed · Scanner-Protokoll</span>
              <span className="pill" style={{ marginLeft: "auto" }}>{feed.length} Einträge</span>
            </div>
            <div className="sim-feed" style={{ maxHeight: 130, background: "#0B1220", border: "none", borderRadius: 0 }}>
              {feed.map((l, i) => (
                <div key={i} className={`line ${l.level || ""}`}>
                  <span className="ts">[{l.ts}]</span>{l.text}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

function Stat({ label, value, mono }) {
  return (
    <div>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4, fontFamily: mono ? "var(--font-mono)" : "inherit", letterSpacing: mono ? "0.04em" : "-0.01em" }}>{value}</div>
    </div>
  );
}

window.ScreenScan = ScreenScan;
window.Stat = Stat;

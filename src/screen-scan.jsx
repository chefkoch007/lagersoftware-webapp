function getDeviceId() {
  let id = sessionStorage.getItem("wh_did");
  if (!id) {
    id = Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem("wh_did", id);
  }
  return id;
}

function ScreenScan() {
  const { lastScan, activeOrder, PRODUCTS, feed, simulateScan, undoLastScan, showToast } = useStore();

  const [qty, setQty]                   = React.useState(1);
  const [cameraActive, setCameraActive] = React.useState(false);
  const [scanFlash, setScanFlash]       = React.useState(false);
  const scannerRef = React.useRef(null);

  // Cleanup camera on unmount
  React.useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  function parseQrPayload(raw) {
    const parts = raw.trim().split("|");
    const chargeNr = parts[0].trim();
    const mhd = parts[1]?.trim() || "";
    const clean = chargeNr.toUpperCase();
    const directMatch = PRODUCTS.find(p => clean === p.code);
    if (directMatch) return { product: directMatch, chargeNr, mhd };
    const chargeMatch = clean.match(/-([A-F])\d?$/);
    if (chargeMatch) {
      const product = PRODUCTS.find(p => p.code === chargeMatch[1]) || null;
      return { product, chargeNr, mhd };
    }
    for (const p of PRODUCTS) {
      if (clean.includes(p.code)) return { product: p, chargeNr, mhd };
    }
    return { product: null, chargeNr, mhd };
  }

  function triggerScan(raw) {
    const { product, chargeNr, mhd } = parseQrPayload(raw);
    if (!product) {
      showToast(`Unbekannter Code: ${raw}`, "warn");
      return;
    }
    setScanFlash(true);
    setTimeout(() => setScanFlash(false), 800);
    simulateScan({ product, mode: "karton", order: activeOrder, qty, chargeNr, mhd });
  }

  function startCamera() {
    if (!window.Html5Qrcode) {
      showToast("Kamera-Bibliothek noch nicht geladen", "warn");
      return;
    }
    setCameraActive(true);
    setTimeout(() => {
      const scanner = new Html5Qrcode("qr-camera-div");
      scannerRef.current = scanner;
      scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          triggerScan(decodedText);
          // Post to CF KV so desktop gets notified
          const { product, chargeNr: parsedCharge, mhd: parsedMhd } = parseQrPayload(decodedText);
          if (product) {
            fetch("/api/scan", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productCode: product.code,
                chargeNr: parsedCharge,
                mhd: parsedMhd,
                mode: "karton",
                qty,
                orderId: activeOrder.id,
                deviceId: getDeviceId(),
                ts: Date.now(),
              }),
            }).catch(() => {});
          }
          scanner.stop()
            .then(() => { scannerRef.current = null; setCameraActive(false); })
            .catch(() => {});
        },
        () => {}
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

  const isIdle    = lastScan.idle;
  const scanned   = lastScan.ok === true;

  return (
    <>
      <div className="screen-head">
        <div>
          <span className="greet">Lager-Halle NRD · Tor 02</span>
          <h1>Lager-Scan</h1>
        </div>
        <div className="head-actions">
          <span className="pill green"><span className="dot" />Scanner bereit</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 900 }}>

        {/* LEFT — Menge + Kamera */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Menge */}
          <div className="card card-pad">
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", fontWeight: 600, marginBottom: 14 }}>
              Menge (vor dem Scan einstellen)
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                style={{
                  width: 52, height: 52, borderRadius: 12, border: "1px solid var(--line)",
                  background: "var(--bg-2)", fontSize: 24, fontWeight: 600, cursor: "pointer", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>−</button>
              <input
                type="number"
                min={1}
                max={999}
                value={qty}
                onChange={e => setQty(Math.max(1, Number(e.target.value) || 1))}
                style={{
                  flex: 1, height: 52, textAlign: "center", border: "1px solid var(--line)",
                  borderRadius: 12, fontSize: 28, fontWeight: 700,
                  fontFamily: "var(--font-mono)", background: "var(--card)",
                }}
              />
              <button
                onClick={() => setQty(q => Math.min(999, q + 1))}
                style={{
                  width: 52, height: 52, borderRadius: 12, border: "1px solid var(--line)",
                  background: "var(--bg-2)", fontSize: 24, fontWeight: 600, cursor: "pointer", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>+</button>
            </div>
          </div>

          {/* Kamera */}
          <div
            className="card"
            style={{
              flex: 1,
              minHeight: 300,
              position: "relative",
              overflow: "hidden",
              background: cameraActive ? "#000" : "linear-gradient(180deg, #0E1428 0%, #1A2342 100%)",
              borderColor: scanFlash ? "var(--green)" : undefined,
              transition: "border-color 0.3s",
            }}
          >
            {/* Camera div (always in DOM) */}
            <div
              id="qr-camera-div"
              style={{
                position: "absolute", inset: 0, zIndex: 10,
                display: cameraActive ? "block" : "none",
                overflow: "hidden",
              }}
            />

            {/* Idle state */}
            {!cameraActive && (
              <>
                <div style={{
                  position: "absolute", inset: 0,
                  backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }} />
                {/* Scan frame corners */}
                <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 180, height: 180 }}>
                  {[
                    { top: -2, left: -2, borderTop: "3px solid var(--blue)", borderLeft: "3px solid var(--blue)", borderTopLeftRadius: 14 },
                    { top: -2, right: -2, borderTop: "3px solid var(--blue)", borderRight: "3px solid var(--blue)", borderTopRightRadius: 14 },
                    { bottom: -2, left: -2, borderBottom: "3px solid var(--blue)", borderLeft: "3px solid var(--blue)", borderBottomLeftRadius: 14 },
                    { bottom: -2, right: -2, borderBottom: "3px solid var(--blue)", borderRight: "3px solid var(--blue)", borderBottomRightRadius: 14 },
                  ].map((s, i) => (
                    <div key={i} style={{ position: "absolute", width: 28, height: 28, ...s }} />
                  ))}
                  <div style={{
                    position: "absolute", left: 4, right: 4, height: 2,
                    background: "linear-gradient(90deg, transparent, var(--blue) 50%, transparent)",
                    boxShadow: "0 0 12px var(--blue)",
                    animation: "scanLine 2.2s ease-in-out infinite",
                  }} />
                </div>

                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16,
                }}>
                  <button
                    onClick={startCamera}
                    style={{
                      background: "var(--blue)", color: "#fff", border: "none", borderRadius: 16,
                      padding: "16px 36px", fontSize: 17, fontWeight: 700, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 12,
                      boxShadow: "0 8px 32px -8px rgba(47,90,243,0.8)",
                    }}
                  >
                    <Icon.Scanner size={20} /> Kamera starten
                  </button>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    QR-Code aus Etiketten-Tab scannen
                  </span>
                </div>
              </>
            )}

            {/* Camera active — close button */}
            {cameraActive && (
              <button
                onClick={stopCamera}
                style={{
                  position: "absolute", top: 12, right: 12, zIndex: 20,
                  background: "rgba(0,0,0,0.65)", color: "#fff", border: "none",
                  borderRadius: 10, padding: "8px 14px", fontSize: 13, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                <Icon.Close size={13} /> Schließen
              </button>
            )}
          </div>
        </div>

        {/* RIGHT — Ergebnis + Feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Letzter Scan — Idle / Ergebnis */}
          {isIdle ? (
            <div className="card card-pad" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, minHeight: 220, textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon.Scanner size={26} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink-2)" }}>Bereit zum Scannen</div>
              <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
                Menge einstellen, dann<br />QR-Code mit der Kamera erfassen.
              </div>
            </div>
          ) : (
            <div
              className="card card-pad"
              style={{
                background: scanned
                  ? (scanFlash ? "linear-gradient(135deg,#D0F5E0,#fff)" : "linear-gradient(135deg,#F4FBF7,#fff)")
                  : "linear-gradient(135deg,#FFF7F7,#fff)",
                borderColor: scanned ? "#CCEAD7" : "#F2C9C9",
                transition: "background 0.4s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span className={`pill ${scanned ? "green" : "red"}`} style={{ height: 26, fontSize: 12, padding: "0 12px" }}>
                  {scanned ? <><Icon.Check size={13} /> &nbsp;Erfolgreich erfasst</> : <><Icon.Close size={13} /> &nbsp;Zurückgenommen</>}
                </span>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{lastScan.when} Uhr</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                <span style={{
                  width: 56, height: 56, borderRadius: 14, flexShrink: 0,
                  background: lastScan.product.color, color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, fontWeight: 700,
                }}>
                  {lastScan.product.code}
                </span>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>Produkt {lastScan.product.code}</div>
                  <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 2 }}>{lastScan.product.name}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
                <div style={{ background: "var(--bg-2)", borderRadius: 10, padding: "10px 14px" }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", fontWeight: 600 }}>Menge</div>
                  <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{lastScan.qty} {lastScan.unit}</div>
                </div>
                <div style={{ background: "var(--bg-2)", borderRadius: 10, padding: "10px 14px" }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", fontWeight: 600 }}>Auftrag</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4, fontFamily: "var(--font-mono)" }}>{lastScan.order}</div>
                </div>
              </div>

              <button className="btn danger" style={{ width: "100%", justifyContent: "center" }} onClick={undoLastScan} disabled={!scanned}>
                <Icon.Undo size={15} /> Rückgängig
              </button>
            </div>
          )}

          {/* Live Feed */}
          <div className="card" style={{ flex: 1, overflow: "hidden" }}>
            <div style={{
              padding: "12px 16px", background: "var(--card-2)",
              borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 8px var(--green)", display: "inline-block" }} />
              <span style={{ fontWeight: 600, fontSize: 13 }}>Live-Feed</span>
            </div>
            <div className="sim-feed" style={{ maxHeight: 220, background: "#0B1220", border: "none", borderRadius: 0 }}>
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

window.ScreenScan = ScreenScan;

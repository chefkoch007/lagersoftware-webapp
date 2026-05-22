function ScreenProduction() {
  const { bookWareneingang, setTab, setLabelTarget, PRODUCTS } = useStore();

  const [artikel, setArtikel]     = React.useState("A");
  const [year, setYear]           = React.useState(2026);
  const [month, setMonth]         = React.useState(5);
  const [day, setDay]             = React.useState(21);
  const [schicht, setSchicht]     = React.useState("1");
  const [menge, setMenge]         = React.useState(48);
  const [unit, setUnit]           = React.useState("Karton");
  const [holiday, setHoliday]     = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const chargeNr  = buildChargeNr({ artikel, year, month, day, schicht });
  const product   = PRODUCTS.find(p => p.code === artikel);
  const monthName = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"][month - 1];

  function handleBuchen() {
    if (!menge || menge <= 0) return;
    bookWareneingang({ artikel, menge, unit, chargeNr, datum: `${day}.${String(month).padStart(2,"0")}.${year}` });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  function handleReset() {
    setArtikel("A");
    setMenge(48);
    setUnit("Karton");
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
    setDay(now.getDate());
    setSchicht("1");
    setHoliday(false);
    setSubmitted(false);
  }

  function handleVorschauLabel() {
    const prod = PRODUCTS.find(p => p.code === artikel);
    if (prod) {
      setLabelTarget({ product: prod, chargeNr });
      setTab("labels");
    }
  }

  return (
    <>
      <div className="screen-head">
        <div>
          <span className="greet">Produktionszugang · manuelle oder Scan-Erfassung</span>
          <h1>Produktion / Wareneingang</h1>
        </div>
        <div className="head-actions">
          <button className="btn">
            <Icon.Calendar size={15} /> {monthName} {year}
          </button>
          <button className="btn" onClick={() => setTab("scan")}>
            <Icon.Scanner size={15} /> Zu Scan-Modus
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 1000, margin: "0 auto" }}>
        {/* Form card */}
        <div className="card card-pad">
          <div className="card-title">
            <div>
              <h3>Wareneingang erfassen</h3>
              <span className="sub">Produktion · auch Sonn- &amp; Feiertage zulässig</span>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--muted)", cursor: "pointer" }}>
              <input type="checkbox" checked={holiday} onChange={e => setHoliday(e.target.checked)} style={{ accentColor: "var(--blue)", width: 16, height: 16 }} />
              Sonderschicht
            </label>
          </div>

          {/* Artikel + Menge */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12, marginBottom: 18 }}>
            <div className="field">
              <label>Artikel / Produkt</label>
              <select value={artikel} onChange={e => setArtikel(e.target.value)}>
                {PRODUCTS.map(p => <option key={p.code} value={p.code}>{p.code} · {p.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Menge</label>
              <input type="number" min={1} value={menge} onChange={e => setMenge(Math.max(1, Number(e.target.value)))} />
            </div>
            <div className="field">
              <label>Einheit</label>
              <select value={unit} onChange={e => setUnit(e.target.value)}>
                <option>Karton</option>
                <option>Palette</option>
                <option>Einzelstück</option>
              </select>
            </div>
          </div>

          {/* Chargennummer group */}
          <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 18, background: "var(--card-2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Chargennummer · automatisch generiert</div>
                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>Format: IF-JJJJ-MMTT-&lt;Artikel&gt;&lt;Schicht&gt;</div>
              </div>
              <span className="pill blue"><Icon.Sparkle size={11} /> Auto</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 14 }}>
              <div className="field">
                <label>Artikel-Nr.</label>
                <input value={artikel} readOnly style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontWeight: 600 }} />
              </div>
              <div className="field">
                <label>Jahr</label>
                <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} style={{ textAlign: "center", fontFamily: "var(--font-mono)" }} />
              </div>
              <div className="field">
                <label>Monat</label>
                <input type="number" min={1} max={12} value={month} onChange={e => setMonth(Number(e.target.value))} style={{ textAlign: "center", fontFamily: "var(--font-mono)" }} />
              </div>
              <div className="field">
                <label>Tag</label>
                <input type="number" min={1} max={31} value={day} onChange={e => setDay(Number(e.target.value))} style={{ textAlign: "center", fontFamily: "var(--font-mono)" }} />
              </div>
              <div className="field">
                <label>Schicht</label>
                <select value={schicht} onChange={e => setSchicht(e.target.value)} style={{ textAlign: "center" }}>
                  <option value="1">Schicht 1</option>
                  <option value="2">Schicht 2</option>
                  <option value="3">Schicht 3</option>
                </select>
              </div>
            </div>

            <div className="charge-preview">
              <div className="label">Generierte Chargennummer</div>
              <div className="nr">{chargeNr}</div>
              <div className="parts">
                <span>IF</span>
                <span className="hi">-{year}</span>
                <span className="hi">-{String(month).padStart(2,"0")}{String(day).padStart(2,"0")}</span>
                <span className="hi">-{artikel}{schicht}</span>
              </div>
            </div>
          </div>

          {/* Wochenwechsel note */}
          {holiday && (
            <div className="anno" style={{ marginTop: 14 }}>
              <span className="star">i</span>
              <div>Sonderschicht aktiv: Zugang wird dem nächsten regulären Werktag zugerechnet. Wochenwechsel-Logik: Endbestand Sa → Anfangsbestand Mo wird automatisch übernommen.</div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" }}>
            <button className="btn" onClick={handleReset}>
              <Icon.Refresh size={15} /> Zurücksetzen
            </button>
            <button className="btn" onClick={handleVorschauLabel}>
              <Icon.Tag size={15} /> Vorschau Label
            </button>
            <button
              className={`btn ${submitted ? "success" : "primary"}`}
              onClick={handleBuchen}
              disabled={!menge || menge <= 0}
            >
              {submitted
                ? <><Icon.Check size={15} /> Gebucht!</>
                : <><Icon.Check size={15} /> Wareneingang buchen</>
              }
            </button>
          </div>
        </div>

        {/* Right: Preview + recent inventory */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Product preview card */}
          <div className="card card-pad">
            <div className="card-title">
              <h3>Vorschau · Produkt &amp; Menge</h3>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <span style={{ width: 56, height: 56, borderRadius: 14, background: product?.color, color: "#fff", fontWeight: 700, fontSize: 26, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                {artikel}
              </span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}>{product?.name}</div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>Einheit: {product?.unit} · {product?.boxes} Kartons/Palette</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: "var(--card-2)", border: "1px solid var(--line)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--muted)", fontWeight: 600, letterSpacing: "0.06em" }}>Zugang (Kartons)</div>
                <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4, color: "var(--green)" }}>
                  +{unit === "Palette" ? menge * (product?.boxes || 1) : menge}
                </div>
              </div>
              <div style={{ background: "var(--card-2)", border: "1px solid var(--line)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--muted)", fontWeight: 600, letterSpacing: "0.06em" }}>Buchung als</div>
                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{menge} {unit}</div>
              </div>
            </div>
            <div style={{ marginTop: 14, padding: "12px 14px", background: "var(--blue-50)", border: "1px solid var(--blue-100)", borderRadius: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--blue-700)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Charge-Nr.</div>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 16, color: "var(--ink)", letterSpacing: "0.04em" }}>{chargeNr}</div>
            </div>
          </div>

          {/* Recent charges mini list */}
          <div className="card card-pad">
            <div className="card-title">
              <h3>Letzte Buchungen heute</h3>
              <span className="pill blue">Do, 21.05.</span>
            </div>
            {[
              { time: "06:15", artikel: "B", menge: 72, unit: "Karton", charge: "IF-2026-0521-B1" },
              { time: "06:00", artikel: "A", menge: 48, unit: "Karton", charge: "IF-2026-0521-A1" },
              { time: "05:45", artikel: "E", menge: 96, unit: "Karton", charge: "IF-2026-0521-E1" },
            ].map((e, i) => {
              const p = PRODUCTS.find(pr => pr.code === e.artikel);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < 2 ? "1px dashed var(--line-2)" : "none" }}>
                  <span style={{ width: 28, height: 28, borderRadius: 7, background: p?.color, color: "#fff", fontWeight: 700, fontSize: 13, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{e.artikel}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{e.menge} {e.unit} · {p?.name}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>{e.charge}</div>
                  </div>
                  <span style={{ fontSize: 11.5, color: "var(--muted)" }}>{e.time} Uhr</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

window.ScreenProduction = ScreenProduction;

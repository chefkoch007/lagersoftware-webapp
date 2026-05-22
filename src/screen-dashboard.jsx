function ScreenDashboard() {
  const { kpi, activity, inventory, fehlmengenList, setTab, PRODUCTS } = useStore();
  const today = new Date();
  const dayName = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"][today.getDay()];
  const dateStr = today.toLocaleDateString("de-DE", { day: "numeric", month: "long" });

  return (
    <>
      <div className="screen-head">
        <div>
          <span className="greet">Guten Morgen, Ice Frocks User</span>
          <h1>Lagerübersicht · {dayName}, {dateStr}</h1>
        </div>
        <div className="head-actions">
          <button className="btn">
            <Icon.Calendar size={15} /> KW 21 · 18. – 24. Mai
            <Icon.ChevronD size={14} />
          </button>
          <button className="btn primary" onClick={() => setTab("production")}>
            <Icon.Plus size={15} /> Wareneingang erfassen
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-grid">
        <div className="kpi warn" style={{ cursor: "pointer" }} onClick={() => setTab("table")}>
          <div className="label">
            <div className="iconbox"><Icon.Alert size={15} /></div>
            Aktuelle Fehlmengen
          </div>
          <div className="val">
            {fehlmengenList.length || kpi.fehlmengen}
            <span className="unit">Einträge</span>
          </div>
          <div className="delta down"><Icon.ArrowUp size={12} /> +1 ggü. gestern</div>
          <KPISpark color="#DC2626" data={[3, 2, 4, 3, 4, 5, fehlmengenList.length || kpi.fehlmengen]} />
        </div>

        <div className="kpi">
          <div className="label">
            <div className="iconbox"><Icon.Box size={15} /></div>
            Heutige Wareneingänge
          </div>
          <div className="val">
            {kpi.eingang}
            <span className="unit">Einheiten</span>
          </div>
          <div className="delta up"><Icon.ArrowUp size={12} /> +12,4 % ggü. Vortag</div>
          <KPISpark color="#2F5AF3" data={[40, 55, 60, 80, 72, 100, kpi.eingang]} />
        </div>

        <div className="kpi">
          <div className="label">
            <div className="iconbox"><Icon.Truck size={15} /></div>
            Heutige Warenausgänge
          </div>
          <div className="val">
            {kpi.ausgang}
            <span className="unit">Einheiten</span>
          </div>
          <div className="delta down"><Icon.ArrowDown size={12} /> −3,1 % ggü. Vortag</div>
          <KPISpark color="#0B1220" data={[110, 120, 95, 88, 92, 84, kpi.ausgang]} />
        </div>

        <div className="kpi">
          <div className="label">
            <div className="iconbox"><Icon.Sparkle size={15} /></div>
            Liefer-Pünktlichkeit
          </div>
          <div className="val">
            {kpi.onTime}
            <span className="unit">%</span>
          </div>
          <div className="delta up"><Icon.ArrowUp size={12} /> +0,8 pp</div>
          <KPISpark color="#16A34A" data={[92, 93, 91, 94, 95, 96, kpi.onTime]} />
        </div>
      </div>

      {/* Bar chart + Activity */}
      <div className="grid-cards">
        <div className="card card-pad">
          <div className="card-title">
            <div>
              <h3>Fehlmengen-Erkennung · Wochenverlauf</h3>
              <span className="sub">Anfangs- vs. Endbestand pro Tag (KW 21)</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span className="pill"><span className="dot" style={{ background: "var(--ink)" }} />Anfang</span>
              <span className="pill blue"><span className="dot" />Ende</span>
              <span className="pill red"><span className="dot" />Fehlmenge</span>
            </div>
          </div>
          <BarChartLive inventory={inventory} />
        </div>

        <div className="card card-pad">
          <div className="card-title">
            <div>
              <h3>Aktivitäts-Historie</h3>
              <span className="sub">Letzte Aktionen</span>
            </div>
            <button className="btn ghost" style={{ height: 32, padding: "0 12px" }} onClick={() => setTab("table")}>Alle</button>
          </div>
          <div className="activity">
            {activity.slice(0, 7).map(a => (
              <ActivityItem key={a.id} a={a} />
            ))}
          </div>
        </div>
      </div>

      {/* Fehlmengen warning strip */}
      {fehlmengenList.length > 0 && (
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span className="pulse-dot" />
            <span style={{ fontWeight: 600, fontSize: 13 }}>
              {fehlmengenList.length} Fehlmenge{fehlmengenList.length !== 1 ? "n" : ""} erkannt
            </span>
            <button className="btn" style={{ height: 30, padding: "0 12px", fontSize: 12 }} onClick={() => setTab("table")}>
              Zur Tabelle
            </button>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {fehlmengenList.slice(0, 6).map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--red-50)", border: "1px solid #F2C9C9", borderRadius: 10, padding: "10px 14px" }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: f.product.color, color: "#fff", fontWeight: 700, fontSize: 14, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{f.product.code}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 12.5, color: "var(--ink)" }}>{f.product.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--red)" }}>{f.day} · Bestand {f.end} / Min. {f.min} · <b>−{f.diff}</b></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bestand-Übersicht */}
      <div style={{ marginTop: 20 }}>
        <div className="card card-pad">
          <div className="card-title">
            <div>
              <h3>Bestand-Snapshot · heute (Do, 21.05.)</h3>
              <span className="sub">Produkt-Endbestand nach Tagesdurchlauf</span>
            </div>
            <button className="btn" onClick={() => setTab("table")} style={{ height: 32, padding: "0 12px", fontSize: 12 }}>
              <Icon.Table size={14} /> Details
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
            {PRODUCTS.map(p => {
              const d    = inventory.days[3][p.code];   // Thursday = index 3
              const end  = d ? d.anf - d.abg + d.zug : 0;
              const min  = MIN_STOCK[p.code];
              const pct  = Math.min(100, Math.round((end / (min * 2)) * 100));
              const warn = end < min;
              const low  = end < min * 1.3 && !warn;
              return (
                <div key={p.code} style={{ background: warn ? "var(--red-50)" : low ? "var(--amber-50)" : "var(--card-2)", border: `1px solid ${warn ? "#F2C9C9" : low ? "#F3D690" : "var(--line)"}`, borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ width: 24, height: 24, borderRadius: 6, background: p.color, color: "#fff", fontWeight: 700, fontSize: 12, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{p.code}</span>
                    <span style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name.split(" ")[0]}</span>
                    {warn && <span className="pill red" style={{ height: 18, fontSize: 10 }}>!</span>}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: warn ? "var(--red)" : "var(--ink)" }}>{end}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Min: {min}</div>
                  <div style={{ marginTop: 8, height: 4, borderRadius: 999, background: "var(--line)", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 999, width: `${pct}%`, background: warn ? "var(--red)" : low ? "var(--amber)" : "var(--green)", transition: "width 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function ActivityItem({ a }) {
  const colors = { in: "var(--green)", out: "var(--blue)", warn: "var(--red)", prod: "var(--violet)", info: "var(--muted-2)" };
  return (
    <div className="activity-item">
      <span className="ai-dot" style={{ background: colors[a.kind] || "var(--muted-2)" }} />
      <div className="ai-body">
        <div className="ai-action" dangerouslySetInnerHTML={{ __html: a.action.replace(/Produkt (\w)/g, "Produkt <b>$1</b>").replace(/Charge ([\w-]+)/g, "Charge <b>$1</b>") }} />
        <div className="ai-meta">
          <span>{a.who}</span>
          <span className="sep">·</span>
          <span>{a.target}</span>
          <span className="sep">·</span>
          <span>{a.ts || "—"}</span>
        </div>
      </div>
    </div>
  );
}

function KPISpark({ data, color }) {
  const w = 90, h = 30;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / Math.max(1, max - min)) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const fillPts = `0,${h} ${pts} ${w},${h}`;
  const gid = `g${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#${gid})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}

function BarChartLive({ inventory }) {
  const max = Math.max(...inventory.days.map(d => {
    let anf = 0;
    PRODUCTS.forEach(p => { const s = d[p.code]; if (s) anf += s.anf; });
    return anf;
  }), 1);
  return (
    <div className="bars">
      {inventory.days.map(d => {
        let anf = 0, end = 0, fehl = 0;
        PRODUCTS.forEach(p => {
          const s = d[p.code];
          if (!s) return;
          anf += s.anf;
          const e = s.anf - s.abg + s.zug;
          end += e;
          if (e < MIN_STOCK[p.code]) fehl += (MIN_STOCK[p.code] - e);
        });
        return (
          <div className="bar-col" key={d.day}>
            <div className="bar-group">
              <div className="bar"    style={{ height: `${Math.min(100, (anf / max) * 100)}%` }} title={`Anfang: ${anf}`} />
              <div className="bar b2" style={{ height: `${Math.min(100, (end / max) * 100)}%` }} title={`Ende: ${end}`} />
              {fehl > 0 && <div className="bar danger" style={{ height: `${Math.max(14, (fehl / max) * 100)}%`, flex: 0.4 }} title={`Fehlmenge: ${fehl}`} />}
            </div>
            <span className="lbl">{d.day}</span>
          </div>
        );
      })}
    </div>
  );
}

window.ScreenDashboard = ScreenDashboard;
window.ActivityItem    = ActivityItem;
window.KPISpark        = KPISpark;

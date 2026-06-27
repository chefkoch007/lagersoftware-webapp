function ScreenTable() {
  const { rows, flashRowId, ORDERS, PRODUCTS, inventory, charges, fehlmengenList, scanLog, clearScanLog, exportToExcel } = useStore();
  const [search, setSearch]       = React.useState("");
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [activeSheet, setActiveSheet] = React.useState("scanlog");
  const [sortCol, setSortCol]     = React.useState(null);
  const [sortDir, setSortDir]     = React.useState("asc");
  const [filterStatus, setFilterStatus] = React.useState("all");

  const statusMap = {
    "geliefert":       { label: "Geliefert",       cls: "green"  },
    "in-tour":         { label: "In Tour",         cls: "blue"   },
    "kommissioniert":  { label: "Kommissioniert",  cls: "violet" },
    "offen":           { label: "Offen",           cls: "amber"  },
    "ruhetag":         { label: "Ruhetag",         cls: "gray"   },
  };

  function toggleSort(col) {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  }

  const SortBtn = ({ col, children }) => (
    <span style={{ cursor: "pointer", userSelect: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
      onClick={() => toggleSort(col)}>
      {children}
      {sortCol === col
        ? <Icon.ArrowUp size={10} style={{ transform: sortDir === "desc" ? "rotate(180deg)" : "none", opacity: 1 }} />
        : <Icon.Sort size={10} style={{ opacity: 0.35 }} />}
    </span>
  );

  // ── Sheet: Aufträge ─────────────────────────
  const filteredOrders = React.useMemo(() => {
    let list = [...ORDERS];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.spedition.toLowerCase().includes(q) ||
        (o.firma || "").toLowerCase().includes(q) ||
        (o.zielort || "").toLowerCase().includes(q) ||
        (o.target || "").toLowerCase().includes(q)
      );
    }
    if (filterStatus !== "all") list = list.filter(o => o.status === filterStatus);
    if (sortCol) {
      list.sort((a, b) => {
        const av = a[sortCol] ?? ""; const bv = b[sortCol] ?? "";
        const cmp = String(av).localeCompare(String(bv), "de");
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [ORDERS, search, filterStatus, sortCol, sortDir]);

  // ── Sheet: Bestand ─────────────────────────
  const bestandRows = React.useMemo(() => {
    const out = [];
    inventory.days.forEach(day => {
      PRODUCTS.forEach(p => {
        const d = day[p.code];
        if (!d) return;
        const end = d.anf - d.abg + d.zug;
        const min = MIN_STOCK[p.code];
        out.push({ day: day.day, date: day.date, product: p, ...d, end, min, warn: end < min, low: end < min * 1.3 && end >= min });
      });
    });
    return out;
  }, [inventory]);

  const selOrder = selectedRow ? ORDERS.find(o => o.id === selectedRow) : null;
  const selRow   = selectedRow ? rows.find(r => r.id === selectedRow) : null;
  const namebox  = selOrder ? `A${ORDERS.indexOf(selOrder) + 2}` : selRow ? `A${rows.indexOf(selRow) + 2}` : "A1";
  const formula  = selOrder
    ? `${selOrder.kw}  ·  ${selOrder.id}  →  ${selOrder.firma || selOrder.target}  ·  Status: ${statusMap[selOrder.status]?.label || selOrder.status}`
    : "Zeile auswählen, um Details zu sehen.";

  return (
    <>
      <div className="screen-head">
        <div>
          <span className="greet">Scan-Log · geräteübergreifend &amp; dauerhaft</span>
          <h1>Erfasste Scans</h1>
        </div>
        <div className="head-actions">
          <button className="btn danger" onClick={clearScanLog} disabled={scanLog.length === 0}>
            <Icon.Close size={15} /> Scan-Log leeren
          </button>
          <button className="btn dark" onClick={exportToExcel}>
            <Icon.Excel size={15} /> Excel exportieren
          </button>
        </div>
      </div>

      {/* Excel Shell */}
      <div className="xls-shell">
        {/* Formula bar */}
        <div className="xls-formulabar" style={{ height: 34 }}>
          <div className="xls-namebox">
            <span>A1</span>
            <Icon.ChevronD size={11} />
          </div>
          <div className="xls-fx">ƒx</div>
          <div className="xls-content">
            <span className="eq">=</span>Live-Scan-Protokoll · jeder QR-Scan landet automatisch hier
          </div>
        </div>

        {/* Grid */}
        <div className="xls-scroll">
          <SheetScanLog scanLog={scanLog} />
        </div>

        {/* Sheet tabs */}
        <div className="xls-tabs">
          <button className="on">
            Scan-Log {scanLog.length > 0 && <span style={{ marginLeft: 4, background: "var(--blue)", color: "#fff", borderRadius: 999, padding: "1px 5px", fontSize: 9, fontWeight: 700 }}>{scanLog.length}</span>}
          </button>
        </div>

        {/* Status bar */}
        <div className="xls-status">
          <span><b>{scanLog.length}</b> Scans · geräteübergreifend &amp; dauerhaft gespeichert</span>
          <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 10.5 }}>
            Scan-Log · Excel-Export bereit
          </span>
        </div>
      </div>
    </>
  );
}

// ── Sub-sheets ──────────────────────────────────

function SheetAuftraege({ rows, selectedRow, setSelectedRow, flashRowId, statusMap, SortBtn }) {
  const colLetters = "ABCDEFGHIJKLMNOPQRSTUVWX".split("").slice(0, 19);
  return (
    <table className="xls">
      <thead className="col-letters">
        <tr>
          <th className="rownum"></th>
          {colLetters.map(l => <th key={l}>{l}</th>)}
        </tr>
      </thead>
      <thead className="group-row">
        <tr>
          <th className="rownum"></th>
          <th colSpan={7} style={{ textAlign: "left", paddingLeft: 10 }}>Stammdaten</th>
          <th colSpan={6} style={{ textAlign: "left", paddingLeft: 10 }}>Produkte (Kartons)</th>
          <th colSpan={3} style={{ textAlign: "left", paddingLeft: 10 }}>Logistik</th>
          <th colSpan={3} style={{ textAlign: "left", paddingLeft: 10 }}>Status &amp; Verwaltung</th>
        </tr>
      </thead>
      <thead className="col-names">
        <tr>
          <th className="rownum">#</th>
          <th style={{ width: 50 }}><SortBtn col="kw">KW</SortBtn></th>
          <th style={{ width: 100 }}><SortBtn col="bestelldatum">Bestell-Datum</SortBtn></th>
          <th style={{ width: 120 }}>Bestell-Nr.</th>
          <th style={{ width: 120 }}><SortBtn col="spedition">Spedition</SortBtn></th>
          <th style={{ width: 160 }}><SortBtn col="firma">Firma</SortBtn></th>
          <th style={{ width: 160 }}><SortBtn col="zielort">Zielort</SortBtn></th>
          <th style={{ width: 160 }}>Lieferung Ist</th>
          {PRODUCTS.map(p => (
            <th key={p.code} className="center sub" style={{ width: 54 }}>
              <span className="pcode" style={{ background: p.color }}>{p.code}</span>
            </th>
          ))}
          <th style={{ width: 90 }}><SortBtn col="summePaletten">Pal.</SortBtn></th>
          <th style={{ width: 100 }}>Gew. (kg)</th>
          <th style={{ width: 70 }}>Tour</th>
          <th style={{ width: 130 }}>Status</th>
          <th style={{ width: 80 }}>MHD</th>
          <th style={{ width: 220 }}>Bemerkung</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((o, idx) => {
          const isSel   = selectedRow === o.id;
          const isFlash = flashRowId === o.id;
          return (
            <tr key={o.id} className={`${isFlash ? "flash" : ""} ${isSel ? "selected" : ""}`} onClick={() => setSelectedRow(o.id)}>
              <td className="rownum">{idx + 2}</td>
              <td className="center"><span className="xs-pill gray">{o.kw}</span></td>
              <td className="mono">{o.bestelldatum}</td>
              <td className="mono" style={{ color: "var(--muted)" }}>{o.bestellnr}</td>
              <td>{o.spedition}</td>
              <td style={{ fontWeight: 500 }}>{o.firma}</td>
              <td>{o.zielort || o.target}</td>
              <td className="mono" style={{ color: "var(--muted)", fontSize: 11.5 }}>{o.lieferungIst || "—"}</td>
              {PRODUCTS.map(p => (
                <td key={p.code} className="num" style={{ color: o.produkte?.[p.code] > 0 ? "var(--ink)" : "var(--faint)" }}>
                  {o.produkte?.[p.code] || ""}
                </td>
              ))}
              <td className="num">{o.summePaletten}</td>
              <td className="num">{o.gewichtNetto?.toLocaleString("de-DE")}</td>
              <td className="mono" style={{ color: "var(--muted)" }}>{o.tour || "—"}</td>
              <td><span className={`xs-pill ${statusMap[o.status]?.cls || "gray"}`}><span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />{statusMap[o.status]?.label || o.status}</span></td>
              <td className="center mono" style={{ color: "var(--muted)" }}>{o.mhd || "—"}</td>
              <td style={{ color: "var(--muted)", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.bemerkung || "—"}</td>
            </tr>
          );
        })}
        {Array.from({ length: 5 }).map((_, i) => (
          <tr key={`e${i}`}>
            <td className="rownum">{rows.length + 2 + i}</td>
            {Array.from({ length: 19 }).map((_, j) => <td key={j}></td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SheetBestand({ rows, selectedRow, setSelectedRow }) {
  return (
    <table className="xls">
      <thead className="col-letters">
        <tr>
          <th className="rownum"></th>
          {"ABCDEFGHI".split("").map(l => <th key={l}>{l}</th>)}
        </tr>
      </thead>
      <thead className="col-names">
        <tr>
          <th className="rownum">#</th>
          <th style={{ width: 50 }}>Tag</th>
          <th style={{ width: 100 }}>Datum</th>
          <th style={{ width: 190 }}>Produkt</th>
          <th className="center" style={{ width: 100 }}>Anfangsbestand</th>
          <th className="center" style={{ width: 80 }}>Abgang</th>
          <th className="center" style={{ width: 80 }}>Zugang</th>
          <th className="center" style={{ width: 100 }}>Endbestand</th>
          <th className="center" style={{ width: 100 }}>Mindestbestand</th>
          <th style={{ width: 120 }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, idx) => {
          const id = `${r.day}-${r.product.code}`;
          const isSel = selectedRow === id;
          return (
            <tr key={id} className={isSel ? "selected" : ""} onClick={() => setSelectedRow(id)}>
              <td className="rownum">{idx + 2}</td>
              <td className="center"><span className="xs-pill gray">{r.day}</span></td>
              <td className="mono">{r.date}</td>
              <td>
                <span className="pcode" style={{ background: r.product.color }}>{r.product.code}</span>
                {r.product.name}
              </td>
              <td className="num">{r.anf}</td>
              <td className={`num ${r.abg > 0 ? "neg" : ""}`}>{r.abg > 0 ? `−${r.abg}` : "0"}</td>
              <td className={`num ${r.zug > 0 ? "pos" : ""}`}>{r.zug > 0 ? `+${r.zug}` : "0"}</td>
              <td className={`num ${r.warn ? "danger-cell" : r.low ? "warn-cell" : ""}`} style={{ fontWeight: 600 }}>{r.end}</td>
              <td className="num" style={{ color: "var(--muted)" }}>{r.min}</td>
              <td>
                {r.warn
                  ? <span className="xs-pill red"><span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />Fehlmenge</span>
                  : r.low
                    ? <span className="xs-pill amber">Niedrig</span>
                    : <span className="xs-pill green">OK</span>}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function SheetChargen({ charges, selectedRow, setSelectedRow }) {
  return (
    <table className="xls">
      <thead className="col-letters">
        <tr>
          <th className="rownum"></th>
          {"ABCDEFG".split("").map(l => <th key={l}>{l}</th>)}
        </tr>
      </thead>
      <thead className="col-names">
        <tr>
          <th className="rownum">#</th>
          <th style={{ width: 200 }}>Charge-Nr.</th>
          <th style={{ width: 80 }}>Produkt</th>
          <th style={{ width: 160 }}>Datum / Uhrzeit</th>
          <th className="center" style={{ width: 80 }}>Schicht</th>
          <th className="num" style={{ width: 80 }}>Menge</th>
          <th style={{ width: 90 }}>Einheit</th>
          <th style={{ width: 160 }}>Operator</th>
        </tr>
      </thead>
      <tbody>
        {charges.map((c, idx) => {
          const p = PRODUCTS.find(pr => pr.code === c.produkt);
          return (
            <tr key={c.nr} className={selectedRow === c.nr ? "selected" : ""} onClick={() => setSelectedRow(c.nr)}>
              <td className="rownum">{idx + 2}</td>
              <td className="mono" style={{ fontWeight: 600 }}>{c.nr}</td>
              <td>
                <span className="pcode" style={{ background: p?.color || "#ccc" }}>{c.produkt}</span>
                {p?.name || c.produkt}
              </td>
              <td className="mono">{c.datum}</td>
              <td className="center"><span className="xs-pill blue">S{c.schicht}</span></td>
              <td className="num">{c.menge}</td>
              <td>{c.unit}</td>
              <td>{c.operator}</td>
            </tr>
          );
        })}
        {charges.length === 0 && (
          <tr><td className="rownum">2</td><td colSpan={7} style={{ color: "var(--muted)", textAlign: "center", padding: "20px 0" }}>Keine Chargen vorhanden</td></tr>
        )}
      </tbody>
    </table>
  );
}

function SheetFehlmengen({ fehlmengenList }) {
  return (
    <table className="xls">
      <thead className="col-letters">
        <tr>
          <th className="rownum"></th>
          {"ABCDEF".split("").map(l => <th key={l}>{l}</th>)}
        </tr>
      </thead>
      <thead className="col-names">
        <tr>
          <th className="rownum">#</th>
          <th style={{ width: 60 }}>Tag</th>
          <th style={{ width: 100 }}>Datum</th>
          <th style={{ width: 190 }}>Produkt</th>
          <th className="num" style={{ width: 120 }}>Endbestand</th>
          <th className="num" style={{ width: 120 }}>Mindestbestand</th>
          <th className="num" style={{ width: 120 }}>Fehlmenge</th>
        </tr>
      </thead>
      <tbody>
        {fehlmengenList.map((f, idx) => (
          <tr key={idx}>
            <td className="rownum">{idx + 2}</td>
            <td className="center"><span className="xs-pill gray">{f.day}</span></td>
            <td className="mono">{f.date}</td>
            <td>
              <span className="pcode" style={{ background: f.product.color }}>{f.product.code}</span>
              {f.product.name}
            </td>
            <td className="num danger-cell" style={{ fontWeight: 600 }}>{f.end}</td>
            <td className="num">{f.min}</td>
            <td className="num neg" style={{ fontWeight: 700 }}>−{f.diff}</td>
          </tr>
        ))}
        {fehlmengenList.length === 0 && (
          <tr>
            <td className="rownum">2</td>
            <td colSpan={6} style={{ color: "var(--green)", textAlign: "center", padding: "20px 0", fontWeight: 500 }}>
              ✓ Keine Fehlmengen in KW 21
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function SheetScanLog({ scanLog }) {
  return (
    <table className="xls">
      <thead className="col-letters">
        <tr>
          <th className="rownum"></th>
          {"ABCDEFGHI".split("").map(l => <th key={l}>{l}</th>)}
        </tr>
      </thead>
      <thead className="col-names">
        <tr>
          <th className="rownum">#</th>
          <th style={{ width: 160 }}>Zeitstempel</th>
          <th style={{ width: 70 }}>Uhrzeit</th>
          <th style={{ width: 80 }}>Produkt</th>
          <th style={{ width: 180 }}>Produkt-Name</th>
          <th className="num" style={{ width: 80 }}>Menge</th>
          <th style={{ width: 90 }}>Einheit</th>
          <th style={{ width: 150 }}>Auftrag</th>
          <th style={{ width: 180 }}>Charge-Nr.</th>
          <th style={{ width: 90 }}>MHD</th>
        </tr>
      </thead>
      <tbody>
        {scanLog.map((s, idx) => {
          const p = PRODUCTS.find(pr => pr.code === s.productCode);
          const color = p?.color || s.color || "#ccc";
          const name  = p?.name || s.productName || "";
          const d = new Date(s.ts);
          const valid   = !isNaN(d.getTime());
          const tsLabel = valid ? d.toLocaleString("de-DE") : "";
          const when    = valid ? d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "";
          return (
            <tr key={s.id}>
              <td className="rownum">{idx + 2}</td>
              <td className="mono" style={{ color: "var(--muted)", fontSize: 11 }}>{tsLabel}</td>
              <td className="mono" style={{ fontWeight: 600 }}>{when}</td>
              <td>
                <span className="pcode" style={{ background: color }}>{s.productCode}</span>
              </td>
              <td>{name}</td>
              <td className="num" style={{ fontWeight: 700 }}>{s.qty}</td>
              <td>{s.unit}</td>
              <td className="mono" style={{ color: "var(--muted)" }}>{s.orderId || "—"}</td>
              <td className="mono" style={{ fontWeight: 600, color: "var(--blue)" }}>{s.chargeNr || "—"}</td>
              <td className="center mono" style={{ color: "var(--muted)" }}>{s.mhd || "—"}</td>
            </tr>
          );
        })}
        {scanLog.length === 0 && (
          <tr>
            <td className="rownum">2</td>
            <td colSpan={9} style={{ color: "var(--muted)", textAlign: "center", padding: "32px 0", fontSize: 13 }}>
              Noch keine Scans · QR-Code im Scan-Tab erfassen (geräteübergreifend &amp; dauerhaft)
            </td>
          </tr>
        )}
        {Array.from({ length: Math.max(0, 5 - scanLog.length) }).map((_, i) => (
          <tr key={`e${i}`}>
            <td className="rownum">{scanLog.length + 2 + i}</td>
            {Array.from({ length: 9 }).map((_, j) => <td key={j}></td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

window.ScreenTable = ScreenTable;

// ─────────────────────────────────────────────
//  PRODUCT CATALOG
// ─────────────────────────────────────────────
const PRODUCTS = [
  { code: "A", name: "Würfel Klassik 2,5 kg",  color: "#2F5AF3", unit: "Palette", boxes: 96  },
  { code: "B", name: "Würfel XL 4 kg",          color: "#3E7BFF", unit: "Palette", boxes: 72  },
  { code: "C", name: "Crushed Ice 5 kg",        color: "#0B1220", unit: "Karton",  boxes: 12  },
  { code: "D", name: "Hohlkugel-Eis 2 kg",      color: "#1B2333", unit: "Karton",  boxes: 12  },
  { code: "E", name: "Mini-Cubes 2,5 kg",       color: "#7F94C8", unit: "Palette", boxes: 96  },
  { code: "F", name: "Stangeneis 10 kg",        color: "#A8B7D8", unit: "Karton",  boxes: 8   },
];

// Minimum stock thresholds per product (Kartons)
const MIN_STOCK = { A: 48, B: 240, C: 24, D: 96, E: 36, F: 120 };

// ─────────────────────────────────────────────
//  FULL ORDERS (Sheet 1)
// ─────────────────────────────────────────────
const FULL_ORDERS_INITIAL = [
  {
    id: "LS-2026-0148", kw: "KW 21", bestelldatum: "15.05.2026", bestellnr: "B-2026-0295",
    spedition: "Dachser", firma: "Metro AG", zielort: "Frankfurt am Main",
    abholungSoll: "18.05.2026 08:00", abholungIst: "18.05.2026 08:34",
    lieferungSoll: "18.05.2026 14:00", lieferungIst: "18.05.2026 14:12",
    produkte: { A: 4, B: 8, C: 0, D: 12, E: 0, F: 0 },
    summePaletten: 12, gewichtNetto: 3240, status: "geliefert",
    target: "Metro Frankfurt", date: "18.05.2026",
    tour: "TR-2148", mhd: "12/2026", bemerkung: "Vollständige Übergabe Tor 02",
  },
  {
    id: "LS-2026-0149", kw: "KW 21", bestelldatum: "15.05.2026", bestellnr: "B-2026-0296",
    spedition: "DB Schenker", firma: "EDEKA Nord GmbH", zielort: "Hamburg",
    abholungSoll: "18.05.2026 09:00", abholungIst: "18.05.2026 09:18",
    lieferungSoll: "18.05.2026 16:00", lieferungIst: "18.05.2026 16:22",
    produkte: { A: 2, B: 12, C: 6, D: 0, E: 4, F: 0 },
    summePaletten: 14, gewichtNetto: 2800, status: "geliefert",
    target: "EDEKA Hamburg-NRD", date: "18.05.2026",
    tour: "TR-2149", mhd: "12/2026", bemerkung: "Spedition 20 Min verspätet",
  },
  {
    id: "LS-2026-0150", kw: "KW 21", bestelldatum: "16.05.2026", bestellnr: "B-2026-0297",
    spedition: "Kühne+Nagel", firma: "REWE Süd GmbH", zielort: "München",
    abholungSoll: "19.05.2026 07:30", abholungIst: "19.05.2026 07:45",
    lieferungSoll: "19.05.2026 15:30", lieferungIst: "19.05.2026 14:55",
    produkte: { A: 6, B: 0, C: 8, D: 4, E: 2, F: 12 },
    summePaletten: 16, gewichtNetto: 3650, status: "in-tour",
    target: "REWE München-SÜD", date: "19.05.2026",
    tour: "TR-2150", mhd: "12/2026", bemerkung: "Tour läuft · ETA 14:20",
  },
  {
    id: "LS-2026-0151", kw: "KW 21", bestelldatum: "17.05.2026", bestellnr: "B-2026-0298",
    spedition: "Dachser", firma: "Hilton Hotels Deutschland", zielort: "Berlin",
    abholungSoll: "20.05.2026 08:00", abholungIst: "",
    lieferungSoll: "21.05.2026 10:00", lieferungIst: "",
    produkte: { A: 0, B: 6, C: 4, D: 8, E: 0, F: 24 },
    summePaletten: 8, gewichtNetto: 1920, status: "kommissioniert",
    target: "Hilton Berlin", date: "19.05.2026",
    tour: "TR-2151", mhd: "01/2027", bemerkung: "Kommissionierung Halle B",
  },
  {
    id: "LS-2026-0152", kw: "KW 21", bestelldatum: "18.05.2026", bestellnr: "B-2026-0299",
    spedition: "Hellmann", firma: "Bar-Konsortium GmbH", zielort: "Stuttgart",
    abholungSoll: "20.05.2026 09:00", abholungIst: "",
    lieferungSoll: "21.05.2026 09:00", lieferungIst: "",
    produkte: { A: 8, B: 4, C: 0, D: 0, E: 6, F: 0 },
    summePaletten: 10, gewichtNetto: 2400, status: "offen",
    target: "Bar-Konsortium Stuttgart", date: "20.05.2026",
    tour: "TR-2152", mhd: "01/2027", bemerkung: "Wartet auf Freigabe Disposition",
  },
  {
    id: "LS-2026-0153", kw: "KW 21", bestelldatum: "19.05.2026", bestellnr: "B-2026-0300",
    spedition: "DHL Freight", firma: "Kaufland AG", zielort: "Nürnberg",
    abholungSoll: "21.05.2026 10:00", abholungIst: "",
    lieferungSoll: "22.05.2026 08:00", lieferungIst: "",
    produkte: { A: 0, B: 0, C: 12, D: 16, E: 0, F: 8 },
    summePaletten: 6, gewichtNetto: 1440, status: "offen",
    target: "Kaufland Nürnberg-SÜD", date: "21.05.2026",
    tour: "TR-2153", mhd: "01/2027", bemerkung: "Neukunde · Erstlieferung",
  },
];

// ─────────────────────────────────────────────
//  INVENTORY STATE (Sheet 2) – KW 21
// ─────────────────────────────────────────────
const initialInventory = () => ({
  kw: "21",
  weekLabel: "KW 21 · 18.–24. Mai 2026",
  days: [
    {
      day: "Mo", date: "18.05.2026",
      A: { anf: 120, abg: 8,  zug: 0  },
      B: { anf: 960, abg: 48, zug: 0  },
      C: { anf: 80,  abg: 12, zug: 0  },
      D: { anf: 480, abg: 32, zug: 0  },
      E: { anf: 100, abg: 16, zug: 0  },
      F: { anf: 600, abg: 24, zug: 0  },
    },
    {
      day: "Di", date: "19.05.2026",
      A: { anf: 112, abg: 12, zug: 0  },
      B: { anf: 912, abg: 48, zug: 0  },
      C: { anf: 68,  abg: 8,  zug: 0  },
      D: { anf: 448, abg: 24, zug: 0  },
      E: { anf: 84,  abg: 12, zug: 0  },
      F: { anf: 576, abg: 24, zug: 0  },
    },
    {
      day: "Mi", date: "20.05.2026",
      A: { anf: 100, abg: 16, zug: 0  },
      B: { anf: 864, abg: 60, zug: 0  },
      C: { anf: 60,  abg: 8,  zug: 20 },
      D: { anf: 424, abg: 24, zug: 48 },
      E: { anf: 72,  abg: 48, zug: 0  },  // end=24 < MIN 36 → Fehlmenge
      F: { anf: 552, abg: 32, zug: 0  },
    },
    {
      day: "Do", date: "21.05.2026",
      A: { anf: 84,  abg: 12, zug: 48 },
      B: { anf: 804, abg: 48, zug: 0  },
      C: { anf: 72,  abg: 55, zug: 0  },  // end=17 < MIN 24 → Fehlmenge
      D: { anf: 448, abg: 20, zug: 0  },
      E: { anf: 60,  abg: 42, zug: 0  },  // end=18 < MIN 36 → Fehlmenge
      F: { anf: 520, abg: 28, zug: 0  },
    },
    {
      day: "Fr", date: "22.05.2026",
      A: { anf: 120, abg: 16, zug: 0  },
      B: { anf: 756, abg: 48, zug: 0  },
      C: { anf: 64,  abg: 46, zug: 0  },  // end=18 < MIN 24 → Fehlmenge
      D: { anf: 428, abg: 24, zug: 0  },
      E: { anf: 60,  abg: 38, zug: 0  },  // end=22 < MIN 36 → Fehlmenge
      F: { anf: 492, abg: 24, zug: 0  },
    },
    {
      day: "Sa", date: "23.05.2026",
      A: { anf: 104, abg: 0,  zug: 0  },
      B: { anf: 708, abg: 0,  zug: 0  },
      C: { anf: 56,  abg: 38, zug: 0  },  // end=18 < MIN 24 → Fehlmenge
      D: { anf: 404, abg: 0,  zug: 0  },
      E: { anf: 56,  abg: 0,  zug: 0  },
      F: { anf: 468, abg: 0,  zug: 0  },
    },
  ],
});

// ─────────────────────────────────────────────
//  CHARGE NUMBER GENERATOR
// ─────────────────────────────────────────────
function buildChargeNr({ artikel, year, month, day, schicht }) {
  const yy = String(year).padStart(4, "0");
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  const sh = String(schicht || "1");
  return `IF-${yy}-${mm}${dd}-${(artikel || "X")}${sh}`;
}

// ─────────────────────────────────────────────
//  INITIAL ROWS (keep for table backward compat)
// ─────────────────────────────────────────────
const initialRows = () => [
  { id: "r1", day: "Mo", date: "18.05.", kw: "21", order: "LS-2026-0148", spedition: "Dachser",     A: { anf: 12, end: 8  }, B: { anf: 96, end: 84 }, C: { anf: 8,  end: 6  }, D: { anf: 48, end: 40 }, E: { anf: 10, end: 7  }, F: { anf: 60, end: 56 }, status: "geliefert"     },
  { id: "r2", day: "Di", date: "19.05.", kw: "21", order: "LS-2026-0149", spedition: "DB Schenker", A: { anf: 8,  end: 5  }, B: { anf: 84, end: 72 }, C: { anf: 6,  end: 4  }, D: { anf: 40, end: 32 }, E: { anf: 7,  end: 4  }, F: { anf: 56, end: 48 }, status: "geliefert"     },
  { id: "r3", day: "Mi", date: "20.05.", kw: "21", order: "LS-2026-0150", spedition: "Kühne+Nagel", A: { anf: 5,  end: 2  }, B: { anf: 72, end: 60 }, C: { anf: 4,  end: 2  }, D: { anf: 32, end: 28 }, E: { anf: 4,  end: 2  }, F: { anf: 48, end: 40 }, status: "in-tour"      },
  { id: "r4", day: "Do", date: "21.05.", kw: "21", order: "LS-2026-0151", spedition: "Dachser",     A: { anf: 2,  end: 1  }, B: { anf: 60, end: 56 }, C: { anf: 2,  end: 1  }, D: { anf: 28, end: 24 }, E: { anf: 2,  end: 0  }, F: { anf: 40, end: 36 }, status: "kommissioniert" },
  { id: "r5", day: "Fr", date: "22.05.", kw: "21", order: "LS-2026-0152", spedition: "Hellmann",    A: { anf: 1,  end: 0  }, B: { anf: 56, end: 48 }, C: { anf: 1,  end: 0  }, D: { anf: 24, end: 20 }, E: { anf: 0,  end: 0  }, F: { anf: 36, end: 32 }, status: "offen"        },
  { id: "r6", day: "Sa", date: "23.05.", kw: "21", order: "—",            spedition: "—",            A: { anf: 0,  end: 0  }, B: { anf: 48, end: 48 }, C: { anf: 0,  end: 0  }, D: { anf: 20, end: 20 }, E: { anf: 0,  end: 0  }, F: { anf: 32, end: 32 }, status: "ruhetag"      },
];

// ─────────────────────────────────────────────
//  INITIAL ACTIVITY FEED
// ─────────────────────────────────────────────
const initialActivity = () => [
  { id: 1, ts: "vor 2 Min.",   who: "Ice Frocks User", action: "Produkt A · 2 Paletten ausgebucht",            kind: "out",  target: "LS-2026-0148" },
  { id: 2, ts: "vor 8 Min.",   who: "Ice Frocks User", action: "Produkt B · 12 Kartons gescannt",              kind: "in",   target: "LS-2026-0149" },
  { id: 3, ts: "vor 14 Min.",  who: "System",           action: "Warnung — Produkt E unter Mindestbestand",    kind: "warn", target: "Lager-NRD"    },
  { id: 4, ts: "vor 22 Min.",  who: "Ice Frocks User", action: "Charge IF-2026-0521-A1 erzeugt",               kind: "prod", target: "Produktion"   },
  { id: 5, ts: "vor 31 Min.",  who: "Lukas K.",         action: "Wareneingang · 4 Paletten Produkt C",         kind: "in",   target: "RAMP-02"      },
  { id: 6, ts: "vor 47 Min.",  who: "System",           action: "Inventur abgeschlossen · Block H03",          kind: "info", target: "Lager-NRD"    },
];

// ─────────────────────────────────────────────
//  CHARGE HISTORY (for Labels / Table tab)
// ─────────────────────────────────────────────
const initialCharges = () => [
  { nr: "IF-2026-0521-A1", produkt: "A", datum: "21.05.2026 06:00", schicht: "1", menge: 48, unit: "Karton", operator: "Ice Frocks User" },
  { nr: "IF-2026-0521-B1", produkt: "B", datum: "21.05.2026 06:15", schicht: "1", menge: 72, unit: "Karton", operator: "Ice Frocks User" },
  { nr: "IF-2026-0520-C2", produkt: "C", datum: "20.05.2026 14:00", schicht: "2", menge: 20, unit: "Karton", operator: "Lukas K."        },
  { nr: "IF-2026-0520-D2", produkt: "D", datum: "20.05.2026 14:30", schicht: "2", menge: 48, unit: "Karton", operator: "Lukas K."        },
  { nr: "IF-2026-0519-A1", produkt: "A", datum: "19.05.2026 07:00", schicht: "1", menge: 96, unit: "Karton", operator: "Ice Frocks User" },
];

// ─────────────────────────────────────────────
//  CONTEXT + STORE PROVIDER
// ─────────────────────────────────────────────
const StoreCtx = React.createContext(null);

function StoreProvider({ children }) {
  const [tab, setTab]           = React.useState("dashboard");
  const [simOpen, setSimOpen]   = React.useState(true);

  // Core data
  const [fullOrders, setFullOrders]   = React.useState(FULL_ORDERS_INITIAL);
  const [inventory, setInventory]     = React.useState(initialInventory());
  const [rows, setRows]               = React.useState(initialRows());
  const [activity, setActivity]       = React.useState(initialActivity());
  const [charges, setCharges]         = React.useState(initialCharges());

  // KPI (derived + manual increment from actions)
  const [kpi, setKpi] = React.useState({ fehlmengen: 3, eingang: 124, ausgang: 87, onTime: 96.4 });

  // Scan state — idle: true = nothing scanned yet
  const [lastScan, setLastScan]       = React.useState({
    when: null, product: PRODUCTS[0], qty: 1, unit: "Karton", order: "", chargeNr: "", mhd: "", ok: null, idle: true,
  });
  const [activeOrder, setActiveOrder] = React.useState(FULL_ORDERS_INITIAL[0]);
  const [scanMode, setScanMode]       = React.useState("palette");
  const [feed, setFeed]               = React.useState([
    { ts: "10:42:11", text: "READY · Scanner verbunden (BT)", level: "ok" },
    { ts: "10:42:08", text: "Auftrag LS-2026-0148 aktiviert",  level: "ok" },
  ]);

  // Labels
  const [labelTarget, setLabelTarget] = React.useState({
    product: PRODUCTS[0],
    chargeNr: "IF-2026-0521-A1",
  });

  // Scan-Log (jeder echte Scan wird hier eingetragen)
  const [scanLog, setScanLog] = React.useState([]);

  // Flash + toast
  const [flashRowId, setFlashRowId]   = React.useState(null);
  const [toast, setToast]             = React.useState(null);

  // Search
  const [searchQuery, setSearchQuery] = React.useState("");

  // ── Helpers ────────────────────────────────
  function showToast(msg, kind = "ok") {
    setToast({ msg, kind, id: Date.now() });
    setTimeout(() => setToast(null), 2800);
  }

  function pushActivity(entry) {
    setActivity(a => [{ id: Date.now(), ...entry }, ...a].slice(0, 20));
  }

  function pushFeed(text, level = "ok") {
    const ts = new Date().toTimeString().slice(0, 8);
    setFeed(f => [{ ts, text, level }, ...f].slice(0, 40));
  }

  // ── Simulate Scan ──────────────────────────
  function simulateScan({ product, mode = scanMode, order = activeOrder, qty = 1, chargeNr: scanChargeNr = "", mhd: scanMhd = "" }) {
    const unit   = mode === "palette" ? "Palette" : "Karton";
    const safeQty = Math.max(1, Number(qty) || 1);
    const when   = new Date().toTimeString().slice(0, 5);
    const ts     = Date.now();

    setLastScan({ when, product, qty: safeQty, unit, order: order.id, chargeNr: scanChargeNr, mhd: scanMhd, ok: true, idle: false });
    setKpi(k => ({
      ...k,
      ausgang: k.ausgang + safeQty,
      fehlmengen: Math.max(0, k.fehlmengen - (Math.random() > 0.65 ? 1 : 0)),
    }));
    pushActivity({ who: "Ice Frocks User", action: `Produkt ${product.code} · ${safeQty} ${unit}${safeQty !== 1 ? "n" : ""} ausgebucht`, kind: "out", target: order.id, ts: "gerade" });
    pushFeed(`SCAN OK · ${product.code} · ${safeQty}× ${unit} · ${order.id}`);

    // Push to scan log (visible in Tabellen-Ansicht → Scan-Log)
    setScanLog(log => [{
      id: ts,
      ts: new Date().toLocaleString("de-DE"),
      when,
      product,
      qty: safeQty,
      unit,
      orderId: order.id,
      chargeNr: scanChargeNr,
      mhd: scanMhd,
    }, ...log].slice(0, 100));

    // Update table row
    const row = rows.find(r => r.order === order.id);
    if (row) {
      setRows(rs => rs.map(r => r.id === row.id
        ? { ...r, [product.code]: { anf: r[product.code].anf, end: Math.max(0, r[product.code].end - safeQty) } }
        : r));
      setFlashRowId(order.id);
      setTimeout(() => setFlashRowId(null), 1200);
    }

    // Update inventory (today = Fr, index 4)
    setInventory(inv => {
      const days = inv.days.map((d, i) => {
        if (i !== 4) return d;
        const prev = d[product.code] || { anf: 0, abg: 0, zug: 0 };
        return { ...d, [product.code]: { ...prev, abg: prev.abg + safeQty } };
      });
      return { ...inv, days };
    });

    // Sync label target
    const now = new Date();
    setLabelTarget({
      product,
      chargeNr: buildChargeNr({ artikel: product.code, year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate(), schicht: 1 }),
    });

    showToast(`Produkt ${product.code} · ${safeQty}× ${unit} erfasst`);
  }

  // ── Undo Last Scan ─────────────────────────
  function undoLastScan() {
    if (!lastScan || !lastScan.ok) { showToast("Nichts rückgängig zu machen", "warn"); return; }
    setLastScan(ls => ({ ...ls, ok: false, idle: false }));
    setKpi(k => ({ ...k, ausgang: Math.max(0, k.ausgang - 1) }));
    pushActivity({
      who: "Ice Frocks User",
      action: `Rückgängig: ${lastScan.product?.code} · ${lastScan.unit} — Eintrag korrigiert`,
      kind: "warn", target: lastScan.order, ts: "gerade",
    });
    pushFeed(`UNDO · ${lastScan.product?.code} · letzten Scan zurückgenommen`, "warn");

    // Revert inventory
    setInventory(inv => {
      const days = inv.days.map((d, i) => {
        if (i !== 4) return d;
        const code = lastScan.product?.code;
        if (!code) return d;
        const prev = d[code] || { anf: 0, abg: 0, zug: 0 };
        return { ...d, [code]: { ...prev, abg: Math.max(0, prev.abg - 1) } };
      });
      return { ...inv, days };
    });

    showToast("Buchung rückgängig gemacht · in Historie protokolliert", "warn");
  }

  // ── Book Wareneingang (Production) ─────────
  function bookWareneingang({ artikel, menge, unit, chargeNr, datum }) {
    const product = PRODUCTS.find(p => p.code === artikel);
    if (!product || menge <= 0) { showToast("Ungültige Eingabe", "warn"); return; }

    const baseQty = unit === "Palette" ? menge * product.boxes : menge;
    const today   = datum || new Date().toLocaleDateString("de-DE");

    // Update inventory zugang for "Do" (today in demo = Thu, index 3)
    setInventory(inv => {
      const days = inv.days.map((d, i) => {
        if (i !== 3) return d;
        const prev = d[artikel] || { anf: 0, abg: 0, zug: 0 };
        return { ...d, [artikel]: { ...prev, zug: prev.zug + baseQty } };
      });
      return { ...inv, days };
    });

    // Update KPI
    setKpi(k => ({ ...k, eingang: k.eingang + menge }));

    // Log activity + charge
    const newCharge = {
      nr: chargeNr,
      produkt: artikel,
      datum: new Date().toLocaleString("de-DE"),
      schicht: chargeNr.slice(-1),
      menge,
      unit,
      operator: "Ice Frocks User",
    };
    setCharges(c => [newCharge, ...c].slice(0, 50));

    pushActivity({
      who: "Ice Frocks User",
      action: `Wareneingang · Produkt ${artikel} · ${menge} ${unit} · Charge ${chargeNr}`,
      kind: "in", target: "Produktion", ts: "gerade",
    });
    pushFeed(`EINGANG OK · ${artikel} · ${menge} ${unit} · ${chargeNr}`);
    setLabelTarget({ product, chargeNr });
    showToast(`Wareneingang gebucht: ${menge} ${unit} Produkt ${artikel}`);
  }

  // ── Excel Export ───────────────────────────
  function exportToExcel() {
    if (typeof XLSX === "undefined") {
      showToast("Excel-Export nicht verfügbar", "warn");
      return;
    }
    const wb = XLSX.utils.book_new();

    // Sheet 1: Aufträge
    const s1Headers = [
      "KW","Bestelldatum","Bestell-Nr.","Spedition","Firma","Zielort",
      "Abholung Soll","Abholung Ist","Lieferung Soll","Lieferung Ist",
      "Prod.A","Prod.B","Prod.C","Prod.D","Prod.E","Prod.F",
      "Summe Pal.","Gew. netto (kg)","Status"
    ];
    const s1Rows = fullOrders.map(o => [
      o.kw, o.bestelldatum, o.bestellnr, o.spedition, o.firma, o.zielort,
      o.abholungSoll, o.abholungIst, o.lieferungSoll, o.lieferungIst,
      o.produkte.A, o.produkte.B, o.produkte.C, o.produkte.D, o.produkte.E, o.produkte.F,
      o.summePaletten, o.gewichtNetto, o.status,
    ]);
    const ws1 = XLSX.utils.aoa_to_sheet([s1Headers, ...s1Rows]);
    ws1["!cols"] = s1Headers.map(() => ({ wch: 18 }));
    XLSX.utils.book_append_sheet(wb, ws1, "Aufträge KW 21");

    // Sheet 2: Bestand
    const s2Headers = ["Tag","Datum","Produkt","Anfangsbestand","Abgang","Zugang","Endbestand","Mindestbestand","Status"];
    const s2Rows = [];
    inventory.days.forEach(day => {
      PRODUCTS.forEach(p => {
        const d = day[p.code];
        if (!d) return;
        const end = d.anf - d.abg + d.zug;
        const min = MIN_STOCK[p.code];
        s2Rows.push([
          day.day, day.date, `${p.code} · ${p.name}`,
          d.anf, d.abg, d.zug, end, min,
          end < min ? "FEHLMENGE" : end < min * 1.2 ? "WARNUNG" : "OK",
        ]);
      });
    });
    const ws2 = XLSX.utils.aoa_to_sheet([s2Headers, ...s2Rows]);
    ws2["!cols"] = s2Headers.map(() => ({ wch: 16 }));
    XLSX.utils.book_append_sheet(wb, ws2, "Bestand KW 21");

    // Sheet 3: Fehlmengen-Log
    const s3Headers = ["Tag","Datum","Produkt","Endbestand","Mindestbestand","Fehlmenge"];
    const s3Rows = [];
    inventory.days.forEach(day => {
      PRODUCTS.forEach(p => {
        const d = day[p.code];
        if (!d) return;
        const end = d.anf - d.abg + d.zug;
        const min = MIN_STOCK[p.code];
        if (end < min) {
          s3Rows.push([day.day, day.date, `${p.code} · ${p.name}`, end, min, min - end]);
        }
      });
    });
    if (s3Rows.length === 0) s3Rows.push(["Keine Fehlmengen in KW 21", "", "", "", "", ""]);
    const ws3 = XLSX.utils.aoa_to_sheet([s3Headers, ...s3Rows]);
    XLSX.utils.book_append_sheet(wb, ws3, "Fehlmengen KW 21");

    // Sheet 4: Chargen
    const s4Headers = ["Charge-Nr.","Produkt","Datum","Schicht","Menge","Einheit","Operator"];
    const s4Rows = charges.map(c => [c.nr, c.produkt, c.datum, c.schicht, c.menge, c.unit, c.operator]);
    const ws4 = XLSX.utils.aoa_to_sheet([s4Headers, ...s4Rows]);
    XLSX.utils.book_append_sheet(wb, ws4, "Chargen");

    // Sheet 5: Scan-Log
    const s5Headers = ["Zeitstempel","Uhrzeit","Produkt","Produkt-Name","Menge","Einheit","Auftrag","Charge-Nr.","MHD"];
    const s5Rows = scanLog.map(s => [s.ts, s.when, s.product.code, s.product.name, s.qty, s.unit, s.orderId, s.chargeNr, s.mhd]);
    if (s5Rows.length === 0) s5Rows.push(["Noch kein Scan in dieser Session", "", "", "", "", "", "", "", ""]);
    const ws5 = XLSX.utils.aoa_to_sheet([s5Headers, ...s5Rows]);
    ws5["!cols"] = s5Headers.map(() => ({ wch: 18 }));
    XLSX.utils.book_append_sheet(wb, ws5, "Scan-Log");

    XLSX.writeFile(wb, "IceFrocks_Lagerdaten_KW21.xlsx");
    showToast("Excel-Datei exportiert · 5 Sheets");
  }

  // ── Reset State ────────────────────────────
  function resetState() {
    setFullOrders(FULL_ORDERS_INITIAL);
    setInventory(initialInventory());
    setRows(initialRows());
    setActivity(initialActivity());
    setCharges(initialCharges());
    setKpi({ fehlmengen: 3, eingang: 124, ausgang: 87, onTime: 96.4 });
    setLastScan({ when: null, product: PRODUCTS[0], qty: 1, unit: "Karton", order: "", ok: null, idle: true });
    setScanLog([]);
    setActiveOrder(FULL_ORDERS_INITIAL[0]);
    setScanMode("palette");
    setFeed([{ ts: "00:00:00", text: "STATE RESET · Initialdaten wiederhergestellt", level: "warn" }]);
    setLabelTarget({ product: PRODUCTS[0], chargeNr: "IF-2026-0521-A1" });
    setTab("dashboard");
    showToast("Demo-State zurückgesetzt · alle Daten auf Initialwerte");
  }

  // ── Computed Fehlmengen ────────────────────
  const fehlmengenList = React.useMemo(() => {
    const list = [];
    inventory.days.forEach(day => {
      PRODUCTS.forEach(p => {
        const d = day[p.code];
        if (!d) return;
        const end = d.anf - d.abg + d.zug;
        if (end < MIN_STOCK[p.code]) {
          list.push({ day: day.day, date: day.date, product: p, end, min: MIN_STOCK[p.code], diff: MIN_STOCK[p.code] - end });
        }
      });
    });
    return list;
  }, [inventory]);

  // derive ORDERS from fullOrders (backward compat with scan screen)
  const ORDERS = fullOrders;

  const value = {
    PRODUCTS, MIN_STOCK, ORDERS, FULL_ORDERS: fullOrders,
    tab, setTab,
    simOpen, setSimOpen,
    kpi, setKpi,
    inventory, setInventory,
    rows, setRows,
    activity,
    charges,
    lastScan, setLastScan,
    activeOrder, setActiveOrder,
    scanMode, setScanMode,
    feed,
    labelTarget, setLabelTarget,
    flashRowId,
    fehlmengenList,
    searchQuery, setSearchQuery,
    scanLog,
    simulateScan, undoLastScan, bookWareneingang, exportToExcel, resetState,
    toast, showToast,
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

function useStore() { return React.useContext(StoreCtx); }

window.StoreProvider   = StoreProvider;
window.useStore        = useStore;
window.PRODUCTS        = PRODUCTS;
window.MIN_STOCK       = MIN_STOCK;
window.buildChargeNr   = buildChargeNr;

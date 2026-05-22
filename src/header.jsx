function Header() {
  const { tab, setTab, kpi } = useStore();

  const tabs = [
  { id: "dashboard", label: "Dashboard / Analytics" },
  { id: "scan", label: "Lager-Scan", sub: "iPad" },
  { id: "production", label: "Produktion / Wareneingang" },
  { id: "table", label: "Tabellen-Ansicht", sub: "Excel-Ersatz" },
  { id: "labels", label: "Label-Generator" }];


  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <div className="logo-mark"></div>
          <span>Ice Frocks<span style={{ color: "var(--muted-2)", fontWeight: 500 }}> · Warehouse OS</span></span>
        </div>

        <div className="search">
          <Icon.Search className="search-icon" size={16} />
          <input placeholder="Suche nach Produkten, Bestellungen, Chargen..." />
          <span className="search-kbd">⌘K</span>
        </div>

        <div className="header-actions">
          <button className="icon-btn" title="Einstellungen"><Icon.Settings size={18} /></button>
          <button className="icon-btn" title={`${kpi.fehlmengen} Fehlmengen-Warnungen`}>
            <Icon.Bell size={18} />
            {kpi.fehlmengen > 0 && <span className="dot" />}
          </button>
          <div className="user-pill">
            <div className="avatar">IF</div>
            <div className="meta">
              <span className="name">Ice Frocks User</span>
              <span className="role">Lagerleitung</span>
            </div>
            <Icon.ChevronD size={14} className="" />
          </div>
        </div>
      </div>

      <nav className="tabs" role="tablist">
        {tabs.map((t) =>
        <button
          key={t.id}
          className={`tab ${tab === t.id ? "active" : ""}`}
          onClick={() => setTab(t.id)}
          role="tab"
          aria-selected={tab === t.id}>
          
            {t.label}
            {t.sub && <span className="badge">{t.sub}</span>}
            {t.id === "dashboard" && tab !== "dashboard" && kpi.fehlmengen > 0 &&
          <span className="badge">{kpi.fehlmengen}</span>
          }
          </button>
        )}
        <button
          className={`tab demo ${tab === "demo" ? "active" : ""}`}
          onClick={() => setTab("demo")}>
          
          <Icon.Bolt size={13} /> DEMO-SIMULATOR
        </button>
      </nav>
    </header>);

}

window.Header = Header;
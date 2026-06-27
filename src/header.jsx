function Header() {
  const { tab, setTab } = useStore();

  // Reduzierte Demo-Oberfläche: nur diese 3 Tabs.
  // (Dashboard, Produktion/Wareneingang und Demo-Simulator bleiben im Code,
  //  sind aber bewusst nicht verlinkt — für mehr Übersicht in der Demo.)
  const tabs = [
  { id: "labels", label: "Label-Generator" },
  { id: "scan", label: "Lager-Scan", sub: "iPad" },
  { id: "table", label: "Scan-Log", sub: "Excel" }];


  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <div className="logo-mark"></div>
          <span>Ice Frocks<span style={{ color: "var(--muted-2)", fontWeight: 500 }}> · Warehouse OS</span></span>
        </div>

        <div style={{ flex: 1 }} />

        <div className="header-actions">
          <div className="user-pill">
            <div className="avatar">IF</div>
            <div className="meta">
              <span className="name">Ice Frocks User</span>
              <span className="role">Lagerleitung</span>
            </div>
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
          </button>
        )}
      </nav>
    </header>);

}

window.Header = Header;
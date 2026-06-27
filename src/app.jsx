function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}

function AppShell() {
  const store = useStore();
  const { tab, toast } = store;

  // Keep a ref to the latest store so polling callback always has fresh values
  const storeRef = React.useRef(store);
  React.useEffect(() => { storeRef.current = store; }, [store]);

  // Cross-device sync: poll the shared scan log every 2 seconds.
  // The server (CF KV) holds the single source of truth — the full list. We:
  //   1. mirror it into local state so the table is identical on every device
  //      and survives reloads (we fetch immediately on mount),
  //   2. fire the live "notification + inventory" effect once for each NEW scan
  //      that came from a *different* device.
  // Dedup is by the record's unique id (set on the scanning device), so no clock
  // comparison is involved — a skewed phone clock can't drop a scan anymore.
  React.useEffect(() => {
    let active = true;
    const seen = new Set();  // ids we've already applied effects for
    let primed = false;      // first poll just adopts the existing log, no replay

    async function poll() {
      if (!active) return;
      try {
        const myDeviceId = sessionStorage.getItem("wh_did") || "";
        const res = await fetch("/api/scan", { cache: "no-store" });
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list)) {
            const { setScanLog, applyScanEffects } = storeRef.current;
            // 1) mirror the shared log into the table (consistent + persistent)
            setScanLog(list);

            // 2) replay effects for genuinely new entries from other devices
            for (const rec of list) {
              if (seen.has(rec.id)) continue;
              seen.add(rec.id);
              if (primed && rec.deviceId !== myDeviceId) {
                applyScanEffects(rec);
              }
            }
            primed = true;
          }
        }
      } catch {
        // Silently ignore — CF Function not reachable in local dev
      }
      if (active) setTimeout(poll, 2000);
    }

    poll(); // fetch the existing log immediately on load
    return () => { active = false; };
  }, []);

  const screens = {
    dashboard:  <ScreenDashboard />,
    scan:       <ScreenScan />,
    production: <ScreenProduction />,
    table:      <ScreenTable />,
    labels:     <ScreenLabels />,
    demo:       <ScreenDemo />,
  };

  return (
    <div className="app">
      <Header />
      <main className="main">
        {screens[tab] || screens.dashboard}
      </main>

      <div className={`toast ${toast ? "show" : ""}`}>
        {toast?.kind === "warn"
          ? <span className="warn-ic"><Icon.Alert size={11} /></span>
          : <span className="ok"><Icon.Check size={12} /></span>
        }
        {toast?.msg}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

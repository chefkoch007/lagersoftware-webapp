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

  // Cross-device sync: poll /api/scan every 2 seconds
  // When iPad scans a QR and posts to CF KV, desktop picks it up here
  React.useEffect(() => {
    let active = true;
    const lastTs = { current: Date.now() }; // ignore scans that happened before page load

    async function poll() {
      if (!active) return;
      try {
        const myDeviceId = sessionStorage.getItem("wh_did") || "";
        const res = await fetch("/api/scan");
        if (res.ok) {
          const data = await res.json();
          // Only process if: newer than our baseline AND from a different device
          if (data && data.ts > lastTs.current && data.deviceId !== myDeviceId) {
            lastTs.current = data.ts;
            const { PRODUCTS, simulateScan } = storeRef.current;
            const product = PRODUCTS.find(p => p.code === data.productCode);
            if (product) {
              simulateScan({ product, mode: data.mode || "karton" });
            }
          }
        }
      } catch {
        // Silently ignore — CF Function not running in local dev
      }
      if (active) setTimeout(poll, 2000);
    }

    setTimeout(poll, 2000); // first poll after 2s
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

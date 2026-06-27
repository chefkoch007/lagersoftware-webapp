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

  // Cross-device sync: poll /api/scan every 2 seconds.
  // When the iPad/phone scans a QR and posts to CF KV, the desktop picks it up here.
  //
  // IMPORTANT: we must NOT compare the scan's timestamp against our own local clock
  // (Date.now()). The scan ts is set on a *different* device whose clock may be ahead
  // or behind ours by seconds or minutes — comparing across clocks silently drops scans.
  // Instead we track the server ts of the record we last handled and only react when a
  // *different* ts shows up. On the first successful poll we just adopt whatever is
  // currently stored as the baseline, so we don't replay an old scan on page load.
  React.useEffect(() => {
    let active = true;
    let lastSeenTs = null;  // server ts of the record we have already processed
    let primed = false;     // have we established the baseline yet?

    async function poll() {
      if (!active) return;
      try {
        const myDeviceId = sessionStorage.getItem("wh_did") || "";
        const res = await fetch("/api/scan", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data && data.ts) {
            if (!primed) {
              // First poll — adopt current record as baseline, do not replay it
              lastSeenTs = data.ts;
              primed = true;
            } else if (data.ts !== lastSeenTs) {
              lastSeenTs = data.ts;
              // Ignore our own scans (we already booked them locally)
              if (data.deviceId !== myDeviceId) {
                const { PRODUCTS, simulateScan } = storeRef.current;
                const product = PRODUCTS.find(p => p.code === data.productCode);
                if (product) {
                  simulateScan({ product, mode: data.mode || "karton", qty: data.qty || 1, chargeNr: data.chargeNr || "", mhd: data.mhd || "" });
                }
              }
            }
          } else {
            primed = true; // KV empty — baseline established, nothing to replay
          }
        }
      } catch {
        // Silently ignore — CF Function not reachable in local dev
      }
      if (active) setTimeout(poll, 2000);
    }

    poll(); // start immediately so the baseline is set without a 2s gap
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

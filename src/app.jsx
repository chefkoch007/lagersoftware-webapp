function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}

function AppShell() {
  const { tab, toast } = useStore();

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

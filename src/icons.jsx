// Minimal hand-crafted icon set (stroke 1.6, 20x20-style geometry on 24px viewBox)
// All icons use currentColor.
const I = ({ children, size = 16, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none"
       stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
       className={className} aria-hidden="true">
    {children}
  </svg>
);

const Icon = {
  Search:   (p) => <I {...p}><circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.5-3.5"/></I>,
  Bell:     (p) => <I {...p}><path d="M6 17V11a6 6 0 1 1 12 0v6"/><path d="M4.5 17h15"/><path d="M10 20.5a2 2 0 0 0 4 0"/></I>,
  Settings: (p) => <I {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06A2 2 0 1 1 4.17 16.9l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06A2 2 0 1 1 7 4.17l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09c0 .67.4 1.27 1 1.55a1.7 1.7 0 0 0 1.87-.34l.06-.06A2 2 0 1 1 19.83 7l-.06.06a1.7 1.7 0 0 0-.34 1.87V9c.27.6.87 1 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z"/></I>,
  Arrow:    (p) => <I {...p}><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></I>,
  ArrowUp:  (p) => <I {...p}><path d="M7 11l5-5 5 5"/><path d="M12 6v14"/></I>,
  ArrowDown:(p) => <I {...p}><path d="M7 13l5 5 5-5"/><path d="M12 18V4"/></I>,
  Plus:     (p) => <I {...p}><path d="M12 5v14M5 12h14"/></I>,
  Chevron:  (p) => <I {...p}><path d="m9 6 6 6-6 6"/></I>,
  ChevronD: (p) => <I {...p}><path d="m6 9 6 6 6-6"/></I>,
  Check:    (p) => <I {...p}><path d="m5 12 5 5L20 7"/></I>,
  Close:    (p) => <I {...p}><path d="M6 6l12 12M6 18 18 6"/></I>,
  Pallet:   (p) => <I {...p}><rect x="3" y="5" width="18" height="9" rx="1"/><path d="M3 17h18M5 17v3M12 17v3M19 17v3M6 8h4M6 11h4M14 8h4M14 11h4"/></I>,
  Box:      (p) => <I {...p}><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/></I>,
  Truck:    (p) => <I {...p}><path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></I>,
  Factory:  (p) => <I {...p}><path d="M3 21V9l5 3V9l5 3V9l5 3v9z"/><path d="M3 21h18"/><path d="M8 17h2M13 17h2"/></I>,
  Chart:    (p) => <I {...p}><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/></I>,
  Table:    (p) => <I {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16M15 4v16"/></I>,
  Tag:      (p) => <I {...p}><path d="M3 12V4h8l10 10-8 8z"/><circle cx="8" cy="8" r="1.6"/></I>,
  Alert:    (p) => <I {...p}><path d="M10.3 3.8 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0z"/><path d="M12 9v5M12 17.5v.1"/></I>,
  Excel:    (p) => <I {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m9 9 6 6M15 9l-6 6"/></I>,
  Print:    (p) => <I {...p}><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="9" rx="2"/><path d="M6 14h12v7H6z"/><circle cx="18" cy="12" r=".7" fill="currentColor"/></I>,
  Undo:     (p) => <I {...p}><path d="M3 7v6h6"/><path d="M21 17a8 8 0 0 0-14-5L3 13"/></I>,
  Bolt:     (p) => <I {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></I>,
  Calendar: (p) => <I {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></I>,
  Filter:   (p) => <I {...p}><path d="M3 5h18l-7 9v6l-4-2v-4z"/></I>,
  Sort:     (p) => <I {...p}><path d="M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3"/></I>,
  Dot3:     (p) => <I {...p}><circle cx="6" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="18" cy="12" r="1.4" fill="currentColor"/></I>,
  Layers:   (p) => <I {...p}><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5M3 18l9 5 9-5"/></I>,
  Scanner:  (p) => <I {...p}><path d="M4 7V5a2 2 0 0 1 2-2h2M20 7V5a2 2 0 0 0-2-2h-2M4 17v2a2 2 0 0 0 2 2h2M20 17v2a2 2 0 0 1-2 2h-2M3 12h18"/></I>,
  Sparkle:  (p) => <I {...p}><path d="M12 3v6M12 15v6M3 12h6M15 12h6"/></I>,
  PanelR:   (p) => <I {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/></I>,
  Refresh:  (p) => <I {...p}><path d="M21 12a9 9 0 1 1-3.5-7.1"/><path d="M21 4v5h-5"/></I>,
};

window.Icon = Icon;

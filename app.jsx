// ─── BYLO APP SHELL ─────────────────────────────────────────────────────────
const { useState: useStateApp, useEffect: useEffectApp } = React;

function App() {
  // Hash-based routing so refresh/back works
  const parseHash = () => {
    const h = (window.location.hash || '#/').replace(/^#\/?/, '');
    if (!h) return 'landing';
    if (['landing', 'chat', 'onboarding', 'dashboard'].includes(h)) return h;
    return 'landing';
  };
  const [route, setRoute] = useStateApp(parseHash());

  useEffectApp(() => {
    injectGlobalStyles();
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (to) => {
    window.location.hash = '#/' + to;
    setRoute(to);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <>
      {route === 'landing'    && <Landing    onNavigate={navigate} />}
      {route === 'chat'       && <ChatScreen onNavigate={navigate} />}
      {route === 'onboarding' && <Onboarding onNavigate={navigate} />}
      {route === 'dashboard'  && <Dashboard  onNavigate={navigate} />}
      <RouteSwitcher current={route} onNavigate={navigate} />
    </>
  );
}

// Floating route switcher — visible only during demo, helps jump between screens
function RouteSwitcher({ current, onNavigate }) {
  const routes = [
    { id: 'landing',    label: 'Landing',     icon: 'home' },
    { id: 'chat',       label: 'Chat',        icon: 'chat' },
    { id: 'onboarding', label: 'Onboarding',  icon: 'settings' },
    { id: 'dashboard',  label: 'Dashboard',   icon: 'grid' },
  ];
  return (
    <div style={{
      position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 200,
      background: 'rgba(15,20,25,0.92)', backdropFilter: 'blur(10px)',
      color: COLORS.white, borderRadius: 999, padding: 3,
      display: 'flex', gap: 2, boxShadow: SHADOWS.md,
      fontFamily: FONTS.body,
    }}>
      <span style={{
        fontFamily: FONTS.mono, fontSize: 10, color: 'rgba(255,255,255,0.5)',
        padding: '0 8px 0 10px', display: 'flex', alignItems: 'center',
        letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>demo</span>
      {routes.map(r => (
        <button key={r.id} onClick={() => onNavigate(r.id)} title={r.label} style={{
          border: 'none', background: current === r.id ? COLORS.green : 'transparent',
          color: COLORS.white, padding: '6px 11px', borderRadius: 999, cursor: 'pointer',
          fontSize: 11.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5,
          transition: 'background 150ms',
        }}>
          <Icon name={r.icon} size={12} color={COLORS.white} />
          {r.label}
        </button>
      ))}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

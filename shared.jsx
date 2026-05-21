// ─── BYLO SHARED MODULE ─────────────────────────────────────────────────────
// Design tokens, mock data, and icon library shared across all screens.

const COLORS = {
  ink:       '#0F1419',
  green:     '#00C46A',
  greenSoft: '#E8F9F1',
  greenDeep: '#00A357',
  mist:      '#F4F6F8',
  stone:     '#6B7280',
  stoneSoft: '#9CA3AF',
  line:      '#E5E7EB',
  warn:      '#DC2626',
  warnSoft:  '#FEF2F2',
  warnAmber: '#F59E0B',
  amber:     '#F59E0B',
  amberSoft: '#FEF3C7',
  purple:    '#7C3AED',
  purpleSoft:'#EDE9FE',
  blue:      '#3B82F6',
  blueSoft:  '#EFF6FF',
  white:     '#FFFFFF',
  chatBg:    '#EDE7DD', // soft warm neutral for chat backdrop
};

const FONTS = {
  display: "'Manrope', system-ui, sans-serif",
  body:    "'Inter', system-ui, sans-serif",
  mono:    "'JetBrains Mono', ui-monospace, monospace",
};

const SHADOWS = {
  sm: '0 2px 8px -2px rgba(0,0,0,0.08)',
  md: '0 8px 24px -8px rgba(0,0,0,0.12)',
  lg: '0 20px 60px -20px rgba(0,0,0,0.18)',
  glow: '0 0 0 4px rgba(0,196,106,0.18)',
};

// ─── MOCK DATA ──────────────────────────────────────────────────────────────
// 🔌 API: GET /api/businesses?slug=donpepe  →  Business
const MOCK_BUSINESS = {
  id: 'biz_001',
  slug: 'donpepe',
  name: 'Barbería Don Pepe',
  phone: '+506 8888-0000',
  openingHours: [
    { day: 1, open: '08:00', close: '18:00' },
    { day: 2, open: '08:00', close: '18:00' },
    { day: 3, open: '08:00', close: '18:00' },
    { day: 4, open: '08:00', close: '18:00' },
    { day: 5, open: '08:00', close: '18:00' },
    { day: 6, open: '09:00', close: '15:00' },
  ],
};

// 🔌 API: GET /api/services?businessId=biz_001  →  Service[]
const MOCK_SERVICES = [
  { id: 'svc_001', businessId: 'biz_001', name: 'Corte clásico',    durationMin: 30, basePrice: 8000,  description: 'Corte tijera o máquina',           avifySku: 'BYLO-CORTE-CLASICO' },
  { id: 'svc_002', businessId: 'biz_001', name: 'Corte + barba',    durationMin: 45, basePrice: 12000, description: 'Corte completo con perfilado',     avifySku: 'BYLO-CORTE-BARBA' },
  { id: 'svc_003', businessId: 'biz_001', name: 'Degradé',          durationMin: 40, basePrice: 9000,  description: 'Fade o degradé con máquina',       avifySku: 'BYLO-DEGRADE' },
  { id: 'svc_004', businessId: 'biz_001', name: 'Diseño de barba',  durationMin: 30, basePrice: 7000,  description: 'Solo barba, sin corte',            avifySku: 'BYLO-BARBA' },
];

const _now = Date.now();
// 🔌 API: GET /api/bookings?businessId=biz_001  →  Booking[]
const MOCK_BOOKINGS = [
  {
    id: 'book_001', slotId: 'slot_101', serviceId: 'svc_002', customerId: 'cust_001',
    quotedPrice: 14000, status: 'pending', createdAt: new Date(_now - 1000*60*2).toISOString(),
    customer: { name: 'Carlos Rodríguez', phone: '+506 8765-4321' },
    service: { name: 'Corte + barba' },
    slot: { startAt: new Date(_now + 1000*60*60*3).toISOString() },
  },
  {
    id: 'book_002', slotId: 'slot_102', serviceId: 'svc_001', customerId: 'cust_002',
    quotedPrice: 8000, status: 'confirmed', avifyOrderId: 'AVF-00123', createdAt: new Date(_now - 1000*60*30).toISOString(),
    customer: { name: 'María González', phone: '+506 8111-2222' },
    service: { name: 'Corte clásico' },
    slot: { startAt: new Date(_now + 1000*60*60).toISOString() },
  },
  {
    id: 'book_003', slotId: 'slot_103', serviceId: 'svc_003', customerId: 'cust_003',
    quotedPrice: 9000, status: 'pending', createdAt: new Date(_now - 1000*60*5).toISOString(),
    customer: { name: 'Andrés Mora', phone: '+506 8333-4444' },
    service: { name: 'Degradé' },
    slot: { startAt: new Date(_now + 1000*60*60*5).toISOString() },
  },
  {
    id: 'book_004', slotId: 'slot_104', serviceId: 'svc_004', customerId: 'cust_004',
    quotedPrice: 7000, status: 'confirmed', avifyOrderId: 'AVF-00124', createdAt: new Date(_now - 1000*60*90).toISOString(),
    customer: { name: 'Luis Vargas', phone: '+506 8222-7777' },
    service: { name: 'Diseño de barba' },
    slot: { startAt: new Date(_now + 1000*60*60*2).toISOString() },
  },
];

// 🔌 API: GET /api/slots?businessId=biz_001&from=today  →  Slot[]
const MOCK_SLOTS = [
  { id: 'slot_201', businessId: 'biz_001', resourceId: 'res_001', startAt: new Date(_now + 1000*60*60*1).toISOString(),  endAt: new Date(_now + 1000*60*90).toISOString(),  status: 'available' },
  { id: 'slot_202', businessId: 'biz_001', resourceId: 'res_001', startAt: new Date(_now + 1000*60*60*2).toISOString(),  endAt: new Date(_now + 1000*60*150).toISOString(), status: 'available' },
  { id: 'slot_203', businessId: 'biz_001', resourceId: 'res_001', startAt: new Date(_now + 1000*60*60*4).toISOString(),  endAt: new Date(_now + 1000*60*270).toISOString(), status: 'available' },
];

// Random names for realtime simulated bookings
const SAMPLE_NEW_BOOKINGS = [
  { name: 'Sofía Chinchilla', phone: '+506 8444-1010', service: 'Corte + barba',   price: 14000, serviceId: 'svc_002' },
  { name: 'Diego Salazar',     phone: '+506 8777-3434', service: 'Degradé',         price: 9000,  serviceId: 'svc_003' },
  { name: 'Ana Pérez',         phone: '+506 8121-9090', service: 'Corte clásico',   price: 8000,  serviceId: 'svc_001' },
  { name: 'Juan Méndez',       phone: '+506 8090-5544', service: 'Diseño de barba', price: 7000,  serviceId: 'svc_004' },
  { name: 'Marcela Quirós',    phone: '+506 8654-2211', service: 'Corte + barba',   price: 12000, serviceId: 'svc_002' },
];

// ─── ICONS (original SVG, lineal, 1.5 stroke) ───────────────────────────────
const Icon = ({ name, size = 18, color = 'currentColor', strokeWidth = 1.75, style }) => {
  const props = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round',
    style,
  };
  const paths = {
    check:       <polyline points="4 12 10 18 20 6" />,
    checkDouble: <g><polyline points="3 12 8 17 16 7" /><polyline points="10 17 14 17 22 7" /></g>,
    x:           <g><path d="M5 5l14 14" /><path d="M19 5L5 19" /></g>,
    plus:        <g><path d="M12 5v14" /><path d="M5 12h14" /></g>,
    minus:       <path d="M5 12h14" />,
    arrow:       <g><path d="M5 12h14" /><polyline points="13 6 19 12 13 18" /></g>,
    arrowLeft:   <g><path d="M19 12H5" /><polyline points="11 18 5 12 11 6" /></g>,
    chevron:     <polyline points="9 6 15 12 9 18" />,
    chevronDown: <polyline points="6 9 12 15 18 9" />,
    calendar:    <g><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18" /><path d="M8 3v4" /><path d="M16 3v4" /></g>,
    clock:       <g><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 16 14" /></g>,
    bell:        <g><path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5 2 6H4c.5-1 2-2 2-6z" /><path d="M10 20a2 2 0 0 0 4 0" /></g>,
    send:        <g><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4z" /></g>,
    user:        <g><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></g>,
    users:       <g><circle cx="9" cy="8" r="3.5" /><path d="M2 20c0-3 3-5 7-5s7 2 7 5" /><path d="M16 11a3 3 0 0 0 0-6" /><path d="M22 20c0-2.5-2-4-4-4.5" /></g>,
    phone:       <path d="M22 17v3a2 2 0 0 1-2 2c-9 0-17-8-17-17a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2c0 1.5.3 3 .7 4a2 2 0 0 1-.5 2L9 12a14 14 0 0 0 5 5l1-1a2 2 0 0 1 2-.5c1 .4 2.5.7 4 .7a2 2 0 0 1 2 2z" />,
    settings:    <g><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></g>,
    list:        <g><line x1="8" y1="6"  x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="4" cy="6"  r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></g>,
    grid:        <g><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></g>,
    copy:        <g><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></g>,
    link:        <g><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></g>,
    sparkles:    <g><path d="M12 3l1.5 4 4 1.5-4 1.5L12 14l-1.5-4-4-1.5 4-1.5z" /><path d="M19 14l.7 2 2 .7-2 .7L19 20l-.7-2-2-.7 2-.7z" /></g>,
    shield:      <g><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z" /><polyline points="9 12 11 14 15 10" /></g>,
    zap:         <polygon points="13 2 4 14 11 14 10 22 20 10 13 10 13 2" />,
    chat:        <path d="M21 12c0 4-4 7-9 7-1.5 0-3-.3-4.3-.8L3 20l1.2-4A7 7 0 0 1 3 12c0-4 4-7 9-7s9 3 9 7z" />,
    scissors:    <g><circle cx="6" cy="6"  r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4"  x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></g>,
    paw:         <g><circle cx="6" cy="10" r="2" /><circle cx="10" cy="5" r="2" /><circle cx="14" cy="5" r="2" /><circle cx="18" cy="10" r="2" /><path d="M16 17a4 4 0 0 1-8 0c0-2 1.5-3 4-3s4 1 4 3z" /></g>,
    camera:      <g><rect x="3" y="6" width="18" height="14" rx="2" /><circle cx="12" cy="13" r="3.5" /><path d="M9 6l2-2h2l2 2" /></g>,
    wrench:      <path d="M14 5a4 4 0 1 0 5 5l-2 1 1-3-3 1 1-2a4 4 0 0 0-2-2zM12 9L4 17a2 2 0 0 0 3 3l8-8" />,
    palette:     <g><path d="M12 3a9 9 0 0 0 0 18c1 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.5-1-.3-.4-.5-.7-.5-1.2 0-.8.7-1.5 1.5-1.5H17a4 4 0 0 0 4-4 8 8 0 0 0-9-9z" /><circle cx="7"  cy="10" r="1" /><circle cx="11" cy="6"  r="1" /><circle cx="16" cy="8"  r="1" /></g>,
    inbox:       <g><polyline points="3 13 8 13 10 16 14 16 16 13 21 13" /><path d="M5 5h14l2 8v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6z" /></g>,
    home:        <g><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-3v-7H10v7H5a2 2 0 0 1-2-2z" /></g>,
    menu:        <g><line x1="4" y1="7"  x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></g>,
    moreVert:    <g><circle cx="12" cy="5" r="1.2" /><circle cx="12" cy="12" r="1.2" /><circle cx="12" cy="19" r="1.2" /></g>,
    verified:    <g><path d="M12 2l2.4 1.6L17 3l1 2.6 2.4 1.4-.6 2.8L21 12l-1.2 2.2.6 2.8L18 18.4 17 21l-2.6-.4L12 22l-2.4-1.4L7 21l-1-2.6-2.4-1.4.6-2.8L3 12l1.2-2.2L3.6 7 6 5.6 7 3l2.6.4z" /><polyline points="8 12 11 15 16 9" /></g>,
    smile:       <g><circle cx="12" cy="12" r="9" /><path d="M8 14c1 1.5 2.5 2 4 2s3-.5 4-2" /><line x1="9" y1="10" x2="9" y2="10" /><line x1="15" y1="10" x2="15" y2="10" /></g>,
    paperclip:   <path d="M21 11l-9 9a5 5 0 1 1-7-7l9-9a3.5 3.5 0 1 1 5 5l-9 9a2 2 0 1 1-3-3l8-8" />,
    mic:         <g><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><line x1="12" y1="18" x2="12" y2="22" /></g>,
    eye:         <g><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></g>,
    dot:         <circle cx="12" cy="12" r="3" />,
    download:    <g><path d="M12 4v12" /><polyline points="6 10 12 16 18 10" /><path d="M4 20h16" /></g>,
    pin:         <g><path d="M12 2v6" /><path d="M8 8h8l-1 6H9z" /><path d="M12 14v8" /></g>,
  };
  return <svg {...props}>{paths[name] || null}</svg>;
};

// ─── HELPERS ────────────────────────────────────────────────────────────────
const formatCRC = (n) => `₡${n.toLocaleString('es-CR')}`;
const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', hour12: false });
};
const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('es-CR', { weekday: 'short', day: 'numeric', month: 'short' });
};
const relativeTime = (iso) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)   return 'hace instantes';
  if (diff < 3600) return `hace ${Math.floor(diff/60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff/3600)} h`;
  return `hace ${Math.floor(diff/86400)} d`;
};

// ─── SHARED UI ─────────────────────────────────────────────────────────────
const Logo = ({ size = 22, color = COLORS.ink }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: FONTS.display, fontWeight: 800, fontSize: size, color, letterSpacing: '-0.04em', lineHeight: 1 }}>
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size * 1.5, height: size * 1.5, borderRadius: '50%',
      overflow: 'hidden', flexShrink: 0,
      border: `1.5px solid ${COLORS.line}`,
      background: COLORS.white,
    }}>
      <img src="logo.png" alt="Bylo" style={{ width: '85%', height: '85%', objectFit: 'contain', display: 'block' }} />
    </span>
    bylo
  </span>
);

const Kicker = ({ children, color = COLORS.stone }) => (
  <div style={{
    fontFamily: FONTS.mono, fontSize: 11, letterSpacing: '0.16em',
    textTransform: 'uppercase', color, fontWeight: 500,
  }}>{children}</div>
);

const Button = ({ children, onClick, variant = 'primary', size = 'md', icon, disabled, style = {}, type = 'button' }) => {
  const sizes = {
    sm: { padding: '8px 14px',  fontSize: 13, gap: 6 },
    md: { padding: '12px 20px', fontSize: 14, gap: 8 },
    lg: { padding: '16px 26px', fontSize: 15, gap: 10 },
  };
  const variants = {
    primary:   { background: COLORS.ink,   color: COLORS.white, border: `1px solid ${COLORS.ink}` },
    secondary: { background: COLORS.white, color: COLORS.ink,   border: `1px solid ${COLORS.line}` },
    ghost:     { background: 'transparent',color: COLORS.ink,   border: '1px solid transparent' },
    green:     { background: COLORS.green, color: COLORS.white, border: `1px solid ${COLORS.green}` },
    danger:    { background: COLORS.white, color: COLORS.warn,  border: `1px solid ${COLORS.warnSoft}` },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{
        ...sizes[size], ...variants[variant], ...style,
        fontFamily: FONTS.body, fontWeight: 600, borderRadius: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 120ms ease, background 200ms ease, box-shadow 200ms ease',
      }}
      onMouseDown={e => !disabled && (e.currentTarget.style.transform = 'translateY(1px)')}
      onMouseUp={e => (e.currentTarget.style.transform = 'translateY(0)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      {children}
      {icon && <Icon name={icon} size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
    </button>
  );
};

const Badge = ({ children, color = 'stone', icon }) => {
  const tones = {
    stone:  { bg: COLORS.mist,      fg: COLORS.stone },
    green:  { bg: COLORS.greenSoft, fg: COLORS.greenDeep },
    amber:  { bg: '#FFF7E6',        fg: '#B45309' },
    red:    { bg: COLORS.warnSoft,  fg: COLORS.warn },
    ink:    { bg: COLORS.ink,       fg: COLORS.white },
  };
  const t = tones[color] || tones.stone;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600,
      fontFamily: FONTS.body, background: t.bg, color: t.fg,
      letterSpacing: '-0.005em',
    }}>
      {icon && <Icon name={icon} size={11} strokeWidth={2.2} />}
      {children}
    </span>
  );
};

const Avatar = ({ name, size = 40, bg = COLORS.ink, color = COLORS.white }) => {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FONTS.display, fontWeight: 700, fontSize: size * 0.38,
      flexShrink: 0, letterSpacing: '-0.02em',
    }}>{initials}</div>
  );
};

// Inject global CSS once
const injectGlobalStyles = () => {
  if (document.getElementById('bylo-global')) return;
  const s = document.createElement('style');
  s.id = 'bylo-global';
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: ${COLORS.white}; color: ${COLORS.ink}; font-family: ${FONTS.body}; -webkit-font-smoothing: antialiased; }
    button { font-family: ${FONTS.body}; }
    input, textarea, select { font-family: ${FONTS.body}; }
    ::selection { background: ${COLORS.greenSoft}; color: ${COLORS.ink}; }
    @keyframes bylo-fadeup { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes bylo-pop   { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
    @keyframes bylo-dot   { 0%, 60%, 100% { transform: translateY(0); opacity: .4; } 30% { transform: translateY(-4px); opacity: 1; } }
    @keyframes bylo-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(15,20,25,0.25); } 50% { box-shadow: 0 0 0 8px rgba(15,20,25,0); } }
    @keyframes bylo-spin  { to { transform: rotate(360deg); } }
    .bylo-fadeup { animation: bylo-fadeup 320ms cubic-bezier(.2,.7,.2,1) both; }
    .bylo-pop { animation: bylo-pop 220ms ease-out both; }
    .bylo-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.35); border-top-color: white; border-radius: 50%; animation: bylo-spin 700ms linear infinite; }
  `;
  document.head.appendChild(s);
};

Object.assign(window, {
  COLORS, FONTS, SHADOWS,
  MOCK_BUSINESS, MOCK_SERVICES, MOCK_BOOKINGS, MOCK_SLOTS, SAMPLE_NEW_BOOKINGS,
  Icon, Logo, Kicker, Button, Badge, Avatar,
  formatCRC, formatTime, formatDate, relativeTime,
  injectGlobalStyles,
});

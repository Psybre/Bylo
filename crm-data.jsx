// ─── BYLO CRM DATA + SHARED CRM HELPERS ─────────────────────────────────────
// Mock data and constants for the CRM modules (clients, calendar, loyalty).

// helper: day of this week (1=Mon...7=Sun), hour, minute → ISO string
const _setDay = (dow, h, m) => {
  const d = new Date();
  const currentDow = (d.getDay() + 6) % 7 + 1; // 1=Mon..7=Sun
  d.setDate(d.getDate() + (dow - currentDow));
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

// 🔌 API: GET /api/clients?businessId=biz_001  →  Client[]
const MOCK_CLIENTS = [
  {
    id: 'c1', name: 'Carlos Rodríguez', phone: '+506 8765-4321',
    visits: 9, nextVisitDays: 30,
    lastVisit: new Date(Date.now() - 18 * 86400000).toISOString(),
    tags: ['habla mucho', 'fútbol', 'puntual'],
    preferences: { topics: ['fútbol', 'F1'], diet: false, drinks: ['café', 'agua'], notes: 'Le gusta el degradé en los lados' },
    loyaltyPoints: 9, loyaltyGoal: 10,
    reminderDays: 30, reminderEnabled: true,
    status: 'active',
    totalSpent: 126000,
    redeemed: 0,
  },
  {
    id: 'c2', name: 'Andrés Mora', phone: '+506 8333-4444',
    visits: 4, nextVisitDays: 15,
    lastVisit: new Date(Date.now() - 10 * 86400000).toISOString(),
    tags: ['tímido', 'puntual'],
    preferences: { topics: ['básquetbol', 'música'], diet: true, drinks: ['agua'], notes: 'Prefiere silencio mientras lo atienden' },
    loyaltyPoints: 4, loyaltyGoal: 10,
    reminderDays: 15, reminderEnabled: true,
    status: 'active',
    totalSpent: 36000,
    redeemed: 0,
  },
  {
    id: 'c3', name: 'Diego Vargas', phone: '+506 8234-5678',
    visits: 12, nextVisitDays: 30,
    lastVisit: new Date(Date.now() - 5 * 86400000).toISOString(),
    tags: ['conversador', 'fútbol', 'cliente VIP'],
    preferences: { topics: ['fútbol', 'tecnología'], diet: false, drinks: ['café', 'energizante'], notes: 'Cliente desde 2023. Siempre pide lo mismo.' },
    loyaltyPoints: 2, loyaltyGoal: 10,
    reminderDays: 30, reminderEnabled: false,
    status: 'vip',
    totalSpent: 312000,
    redeemed: 1,
  },
  {
    id: 'c4', name: 'Pablo Castro', phone: '+506 8901-2345',
    visits: 2, nextVisitDays: 15,
    lastVisit: new Date(Date.now() - 25 * 86400000).toISOString(),
    tags: ['nuevo', 'curioso'],
    preferences: { topics: ['videojuegos'], diet: false, drinks: ['jugo'], notes: '' },
    loyaltyPoints: 2, loyaltyGoal: 10,
    reminderDays: 15, reminderEnabled: true,
    status: 'at_risk',
    totalSpent: 17000,
    redeemed: 0,
  },
  {
    id: 'c5', name: 'Sofía Jiménez', phone: '+506 8404-1212',
    visits: 6, nextVisitDays: 30,
    lastVisit: new Date(Date.now() - 22 * 86400000).toISOString(),
    tags: ['conversador', 'puntual', 'cine'],
    preferences: { topics: ['cine', 'viajes'], diet: true, drinks: ['agua', 'jugo'], notes: 'Alergia al perfume fuerte' },
    loyaltyPoints: 6, loyaltyGoal: 10,
    reminderDays: 30, reminderEnabled: true,
    status: 'active',
    totalSpent: 54000,
    redeemed: 0,
  },
  {
    id: 'c6', name: 'Laura Soto', phone: '+506 8222-3030',
    visits: 3, nextVisitDays: 30,
    lastVisit: new Date(Date.now() - 12 * 86400000).toISOString(),
    tags: ['exigente'],
    preferences: { topics: ['negocios'], diet: false, drinks: ['café'], notes: 'Llega siempre a la hora exacta. No le gusta esperar.' },
    loyaltyPoints: 3, loyaltyGoal: 10,
    reminderDays: 30, reminderEnabled: false,
    status: 'active',
    totalSpent: 21000,
    redeemed: 0,
  },
];

// 🔌 API: GET /api/bookings?businessId=biz_001&range=week  →  CalendarEvent[]
const MOCK_CALENDAR_WEEK = [
  { id: 'e1', clientName: 'Carlos Rodríguez', clientId: 'c1', service: 'Corte + barba',    startAt: _setDay(1, 9, 0),   duration: 45, price: 14000, status: 'confirmed', color: 'green' },
  { id: 'e2', clientName: 'Andrés Mora',      clientId: 'c2', service: 'Degradé',          startAt: _setDay(1, 11, 0),  duration: 40, price: 9000,  status: 'confirmed', color: 'green' },
  { id: 'e3', clientName: 'Diego Vargas',     clientId: 'c3', service: 'Corte clásico',    startAt: _setDay(2, 9, 30),  duration: 30, price: 8000,  status: 'confirmed', color: 'purple' },
  { id: 'e4', clientName: 'Laura Soto',       clientId: 'c6', service: 'Diseño de barba', startAt: _setDay(3, 15, 0),  duration: 30, price: 7000,  status: 'pending',   color: 'amber'  },
  { id: 'e5', clientName: 'Sofía Jiménez',    clientId: 'c5', service: 'Corte clásico',    startAt: _setDay(4, 10, 0),  duration: 30, price: 8000,  status: 'confirmed', color: 'green' },
  { id: 'e6', clientName: 'Pablo Castro',     clientId: 'c4', service: 'Corte + barba',    startAt: _setDay(5, 14, 0),  duration: 45, price: 12000, status: 'confirmed', color: 'green' },
  { id: 'e7', clientName: 'Carlos Rodríguez', clientId: 'c1', service: 'Diseño de barba', startAt: _setDay(3, 11, 30), duration: 30, price: 7000,  status: 'confirmed', color: 'green' },
  { id: 'e8', clientName: 'Diego Vargas',     clientId: 'c3', service: 'Corte + barba',    startAt: _setDay(5, 16, 30), duration: 45, price: 14000, status: 'pending',   color: 'amber'  },
];

const PERSONALITY_TAGS = [
  'habla mucho', 'tímido', 'conversador', 'callado', 'puntual', 'siempre tarde',
  'curioso', 'exigente', 'relajado', 'cliente VIP', 'nuevo', 'fiel',
];
const CONVO_TOPICS = ['fútbol', 'básquetbol', 'F1', 'música', 'tecnología', 'videojuegos', 'política', 'negocios', 'cine', 'viajes'];
const DRINK_OPTIONS = ['café', 'agua', 'energizante', 'jugo', 'refresco', 'ninguna'];

// Classification of tags into semantic categories
const TAG_TONE = {
  // positive
  'puntual':       'green',
  'conversador':   'green',
  'relajado':      'green',
  'fiel':          'green',
  'habla mucho':   'green',
  // attention
  'siempre tarde':'amber',
  'exigente':      'amber',
  // special
  'cliente VIP':   'purple',
  // neutral (default): stone
};
const tagTone = (tag) => TAG_TONE[tag] || 'stone';

const STATUS_META = {
  active:  { label: 'Activo',   color: 'green',  icon: 'dot' },
  vip:     { label: 'VIP',      color: 'purple', icon: 'sparkles' },
  at_risk: { label: 'En riesgo',color: 'red',    icon: 'bell' },
};

// Day-relative humanized label (e.g. "hace 18 días", "hoy", "en 2 días")
const daysSince = (iso) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  return Math.floor(diffMs / 86400000);
};

const daysAgoLabel = (iso) => {
  const d = daysSince(iso);
  if (d === 0) return 'hoy';
  if (d === 1) return 'ayer';
  return `hace ${d} días`;
};

// Reminder urgency: returns { tone, label, daysOverdue }
const reminderUrgency = (client) => {
  if (!client.reminderEnabled) return null;
  const d = daysSince(client.lastVisit);
  const overdue = d - client.reminderDays;
  if (overdue > 0) {
    return { tone: 'red', label: `Vencido ${overdue}d`, daysOverdue: overdue };
  }
  const remaining = -overdue;
  if (remaining <= 5)  return { tone: 'amber', label: `Pronto · ${remaining}d`, daysOverdue: overdue };
  if (remaining <= 10) return { tone: 'amber', label: `${remaining}d para volver`, daysOverdue: overdue };
  return { tone: 'green', label: `En ${remaining}d`, daysOverdue: overdue };
};

const reminderMessage = (client, businessName, slug) =>
  `¡Hola ${client.name.split(' ')[0]}! 💈 Ya pasaron ${client.reminderDays} días desde tu último corte en ${businessName}. ¿Agendamos para esta semana? bylo.app/chat/${slug}`;

// Generate a recent history for a client (mocked)
const generateClientHistory = (client, services = MOCK_SERVICES) => {
  const items = [];
  const baseDays = daysSince(client.lastVisit);
  const cadence = client.reminderDays || 30;
  for (let i = 0; i < Math.min(client.visits, 8); i++) {
    const daysAgo = baseDays + i * cadence;
    const svc = services[i % services.length];
    items.push({
      id: `h_${client.id}_${i}`,
      date: new Date(Date.now() - daysAgo * 86400000).toISOString(),
      service: svc.name,
      price: svc.basePrice,
      usedReward: client.redeemed > 0 && i === 4,
    });
  }
  return items;
};

// Color helper for calendar event blocks
const eventColor = (event) => {
  if (event.color === 'purple' || event.status === 'vip') return { bg: COLORS.purpleSoft, fg: COLORS.purple, accent: COLORS.purple };
  if (event.status === 'pending' || event.color === 'amber') return { bg: '#FFF7E6', fg: '#B45309', accent: COLORS.amber };
  return { bg: COLORS.greenSoft, fg: COLORS.greenDeep, accent: COLORS.green };
};

Object.assign(window, {
  MOCK_CLIENTS, MOCK_CALENDAR_WEEK,
  PERSONALITY_TAGS, CONVO_TOPICS, DRINK_OPTIONS,
  TAG_TONE, tagTone, STATUS_META,
  daysSince, daysAgoLabel, reminderUrgency, reminderMessage,
  generateClientHistory, eventColor,
});

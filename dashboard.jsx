// ─── BYLO DASHBOARD ─────────────────────────────────────────────────────────
const { useState: useStateDash, useEffect: useEffectDash, useRef: useRefDash } = React;

function Dashboard({ onNavigate }) {
  const [tab, setTab] = useStateDash('pending'); // pending | today | calendar | clients | loyalty | services | hours | config
  const [bookings, setBookings] = useStateDash(MOCK_BOOKINGS);
  const [highlightId, setHighlightId] = useStateDash(null);
  const [clients, setClients] = useStateDash(MOCK_CLIENTS);
  const [calendarEvents, setCalendarEvents] = useStateDash(MOCK_CALENDAR_WEEK);
  const [selectedClientId, setSelectedClientId] = useStateDash(null);
  const [openCalendarModalFor, setOpenCalendarModalFor] = useStateDash(null);
  const [toast, setToast] = useStateDash(null);
  const [celebrationKey, setCelebrationKey] = useStateDash(0);

  // Simulated realtime — every 18s a new booking shows up.
  // 🔌 REALTIME: Replace this with Supabase channel subscription.
  // supabase.channel('bookings').on('postgres_changes',
  //   { event: 'INSERT', schema: 'public', table: 'bookings', filter: `businessId=eq.${id}` },
  //   (payload) => setBookings(prev => [payload.new, ...prev])
  // ).subscribe()
  useEffectDash(() => {
    const t = setInterval(() => {
      const sample = SAMPLE_NEW_BOOKINGS[Math.floor(Math.random() * SAMPLE_NEW_BOOKINGS.length)];
      const id = `book_${Date.now()}`;
      const startHours = 2 + Math.floor(Math.random() * 6);
      const b = {
        id, slotId: `slot_${Date.now()}`, serviceId: sample.serviceId, customerId: `cust_${Date.now()}`,
        quotedPrice: sample.price, status: 'pending', createdAt: new Date().toISOString(),
        customer: { name: sample.name, phone: sample.phone },
        service: { name: sample.service },
        slot: { startAt: new Date(Date.now() + 1000 * 60 * 60 * startHours).toISOString() },
      };
      setBookings(prev => [b, ...prev]);
      setHighlightId(id);
      setTimeout(() => setHighlightId(null), 2200);
    }, 18000);
    return () => clearInterval(t);
  }, []);

  const accept = (id) => {
    // 🔌 API: PATCH /api/bookings/:id  →  { status: 'confirmed' }
    setBookings(prev => prev.map(b => b.id === id
      ? { ...b, status: 'confirmed', avifyOrderId: `AVF-${Math.floor(10000 + Math.random() * 90000)}` }
      : b));
  };

  const reject = (id) => {
    // 🔌 API: PATCH /api/bookings/:id  →  { status: 'cancelled' }
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    setTimeout(() => setBookings(prev => prev.filter(b => b.id !== id)), 300);
  };

  const pending   = bookings.filter(b => b.status === 'pending');
  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const completedLoyalty = clients.filter(c => c.loyaltyPoints >= c.loyaltyGoal).length;

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3200); };
  const celebrate = () => setCelebrationKey(k => k + 1);

  const openClient = (id) => { setSelectedClientId(id); setTab('clients'); };
  const bookFor = (client) => { setOpenCalendarModalFor(client); setTab('calendar'); };

  return (
    <div data-screen-label="04 Dashboard" style={{
      minHeight: '100vh', background: COLORS.white,
      display: 'grid', gridTemplateColumns: '240px 1fr',
    }}>
      <DashSidebar tab={tab} setTab={(t) => { setSelectedClientId(null); setTab(t); }} pendingCount={pending.length} loyaltyCount={completedLoyalty} onNavigate={onNavigate} />
      <main style={{ background: COLORS.mist, minHeight: '100vh' }}>
        <DashTopbar onNavigate={onNavigate} />
        <DemoBar onAction={(act) => {
          if (act === 'calendar') { setSelectedClientId(null); setTab('calendar'); }
          if (act === 'carlos')   { openClient('c1'); }
          if (act === 'reward')   {
            openClient('c1');
            // The client profile loyalty sub-tab handles celebration; we just nudge
            setTimeout(() => showToast('Abrí la pestaña Fidelidad de Carlos y canjeá la recompensa 🎉'), 400);
          }
          if (act === 'reminder') { openClient('c4'); setTimeout(() => showToast('Abrí la pestaña Recordatorio de Pablo (25 días sin venir) 📲'), 400); }
        }} />
        <div style={{ padding: '24px 40px 80px', maxWidth: 1180 }}>
          {tab === 'pending'  && <PendingTab  bookings={pending}   highlightId={highlightId} onAccept={accept} onReject={reject} />}
          {tab === 'today'    && <TodayTab    bookings={confirmed} />}
          {tab === 'calendar' && <CalendarFullTab
            events={calendarEvents}
            clients={clients} services={MOCK_SERVICES}
            onAddEvent={(e) => { setCalendarEvents(prev => [...prev, e]); showToast('Cita agendada'); }}
            onUpdateEvent={(id, patch) => setCalendarEvents(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e))}
            onOpenClient={openClient}
            openModalFor={openCalendarModalFor}
            clearModalFor={() => setOpenCalendarModalFor(null)}
          />}
          {tab === 'clients'  && <ClientsTab
            clients={clients} setClients={setClients}
            selectedClientId={selectedClientId} setSelectedClientId={setSelectedClientId}
            onBookAppointment={bookFor}
            onToast={showToast}
            onCelebrate={celebrate}
            businessName={MOCK_BUSINESS.name}
            slug={MOCK_BUSINESS.slug}
          />}
          {tab === 'loyalty'  && <LoyaltyTab
            clients={clients} setClients={setClients}
            onOpenClient={openClient}
            onToast={showToast}
            onCelebrate={celebrate}
          />}
          {tab === 'services' && <ServicesTab />}
          {tab === 'hours'    && <PlaceholderTab title="Horarios" body="Editá tu horario laboral. Se cargan desde el onboarding." />}
          {tab === 'config'   && <PlaceholderTab title="Configuración" body="Ajustes generales del negocio, integraciones y notificaciones." />}
        </div>
      </main>
      {toast && <ToastBanner message={toast} />}
      {celebrationKey > 0 && <ConfettiBurst key={celebrationKey} />}
    </div>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────────────────
function DashSidebar({ tab, setTab, pendingCount, loyaltyCount, onNavigate }) {
  const navItems = [
    { id: 'pending',  label: 'Pendientes',    icon: 'inbox',    badge: pendingCount },
    { id: 'today',    label: 'Hoy',           icon: 'clock' },
    { id: 'calendar', label: 'Calendario',    icon: 'calendar' },
    { id: 'clients',  label: 'Clientes',      icon: 'users' },
    { id: 'loyalty',  label: 'Fidelidad',     icon: 'sparkles', badge: loyaltyCount, badgeColor: 'red' },
    { id: 'services', label: 'Servicios',     icon: 'list' },
    { id: 'hours',    label: 'Horarios',      icon: 'clock' },
    { id: 'config',   label: 'Configuración', icon: 'settings' },
  ];
  return (
    <aside style={{
      position: 'sticky', top: 0, height: '100vh',
      background: COLORS.white, borderRight: `1px solid ${COLORS.line}`,
      padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ padding: '6px 12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo size={20} />
        <button onClick={() => onNavigate('landing')} title="Ir a landing" style={{
          border: 'none', background: 'transparent', cursor: 'pointer', color: COLORS.stoneSoft, padding: 4, display: 'flex',
        }}>
          <Icon name="home" size={16} />
        </button>
      </div>

      <div style={{
        padding: '10px 12px', borderRadius: 10, background: COLORS.mist,
        display: 'grid', gap: 4, marginBottom: 12,
      }}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: COLORS.stoneSoft, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Negocio activo
        </div>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>
          {MOCK_BUSINESS.name}
        </div>
      </div>

      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => setTab(item.id)}
          style={{
            border: 'none', cursor: 'pointer',
            background: tab === item.id ? COLORS.ink : 'transparent',
            color: tab === item.id ? COLORS.white : COLORS.stone,
            padding: '10px 12px', borderRadius: 8, textAlign: 'left',
            fontSize: 13.5, fontWeight: 500, fontFamily: FONTS.body,
            display: 'flex', alignItems: 'center', gap: 10,
            transition: 'background 150ms, color 150ms',
          }}
        >
          <Icon name={item.icon} size={16} />
          <span style={{ flex: 1 }}>{item.label}</span>
          {item.badge ? (
            <span style={{
              fontSize: 11, fontWeight: 700, fontFamily: FONTS.mono,
              background: item.badgeColor === 'red'
                ? COLORS.warn
                : (tab === item.id ? COLORS.green : COLORS.ink),
              color: COLORS.white,
              borderRadius: 999, padding: '2px 7px', minWidth: 20, textAlign: 'center',
            }}>{item.badge}</span>
          ) : null}
        </button>
      ))}

      <div style={{ marginTop: 'auto', padding: '12px', borderTop: `1px solid ${COLORS.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name="Don Pepe" size={32} bg={COLORS.greenSoft} color={COLORS.greenDeep} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Don Pepe
            </div>
            <div style={{ fontSize: 11, color: COLORS.stoneSoft }}>Plan free</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function DashTopbar({ onNavigate }) {
  return (
    <header style={{
      background: COLORS.white, borderBottom: `1px solid ${COLORS.line}`,
      padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <Kicker>Panel de control</Kicker>
        <div style={{
          fontFamily: FONTS.display, fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', marginTop: 4,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {MOCK_BUSINESS.name}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          fontFamily: FONTS.mono, fontSize: 12, color: COLORS.stone,
          padding: '8px 12px', background: COLORS.mist, borderRadius: 8,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.green,
            animation: 'bylo-pulse 1.8s infinite' }} />
          realtime activo
        </div>
        <Button size="sm" variant="secondary" icon="arrow" onClick={() => onNavigate('chat')}>
          Ver mi chat
        </Button>
      </div>
    </header>
  );
}

// ─── PENDING TAB ────────────────────────────────────────────────────────────
function PendingTab({ bookings, highlightId, onAccept, onReject }) {
  return (
    <div style={{ display: 'grid', gap: 28 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <Kicker>Inbox</Kicker>
          <h1 style={{
            fontFamily: FONTS.display, fontWeight: 800, fontSize: 38, margin: '8px 0 0',
            letterSpacing: '-0.03em', lineHeight: 1, display: 'flex', alignItems: 'center', gap: 14,
          }}>
            Citas pendientes
            <Badge color="ink">{bookings.length}</Badge>
          </h1>
          <div style={{ color: COLORS.stone, fontSize: 14.5, marginTop: 10 }}>
            Llegan automáticamente. Aceptá para confirmar y notificar a Avify.
          </div>
        </div>
        <div style={{
          fontFamily: FONTS.mono, fontSize: 11, color: COLORS.stoneSoft,
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          actualizando cada 18s · demo
        </div>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          title="Todo limpio por ahora"
          body="Cuando un cliente reserve por el chat, vas a verlo aparecer acá en tiempo real."
          icon="inbox"
        />
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {bookings.map(b => (
            <PendingCard
              key={b.id} booking={b}
              isNew={b.id === highlightId}
              onAccept={() => onAccept(b.id)}
              onReject={() => onReject(b.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PendingCard({ booking, isNew, onAccept, onReject }) {
  const [confirming, setConfirming] = useStateDash(false);
  const handleAccept = async () => {
    setConfirming(true);
    await new Promise(r => setTimeout(r, 600));
    onAccept();
    setConfirming(false);
  };
  return (
    <div className="bylo-pop" style={{
      background: COLORS.white, borderRadius: 14,
      border: `1px solid ${isNew ? COLORS.ink : COLORS.line}`,
      boxShadow: isNew ? `0 0 0 4px rgba(15,20,25,0.08)` : 'none',
      padding: 18, display: 'grid',
      gridTemplateColumns: '1fr auto auto', gap: 20, alignItems: 'center',
      transition: 'border-color 600ms ease, box-shadow 600ms ease',
    }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', minWidth: 0 }}>
        <Avatar name={booking.customer.name} size={44} bg={COLORS.mist} color={COLORS.ink} />
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>
              {booking.customer.name}
            </div>
            {isNew && <Badge color="ink">nueva</Badge>}
          </div>
          <div style={{ fontSize: 13, color: COLORS.stone, marginTop: 3, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span>{booking.service.name}</span>
            <span style={{ color: COLORS.line }}>·</span>
            <span>{formatDate(booking.slot.startAt)} · {formatTime(booking.slot.startAt)}</span>
            <span style={{ color: COLORS.line }}>·</span>
            <span style={{ fontFamily: FONTS.mono }}>{booking.customer.phone}</span>
          </div>
          <div style={{ fontSize: 11, color: COLORS.stoneSoft, marginTop: 4, fontFamily: FONTS.mono }}>
            cotizado {relativeTime(booking.createdAt)}
          </div>
        </div>
      </div>
      <div style={{ fontFamily: FONTS.display, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', textAlign: 'right' }}>
        {formatCRC(booking.quotedPrice)}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button size="sm" variant="ghost" icon="x" onClick={onReject} style={{ color: COLORS.stone }}>Rechazar</Button>
        <Button size="sm" variant="primary" icon={confirming ? null : 'check'} onClick={handleAccept} disabled={confirming}>
          {confirming ? (<><span className="bylo-spinner" style={{ marginRight: 8 }} />Confirmando…</>) : 'Aceptar'}
        </Button>
      </div>
    </div>
  );
}

// ─── TODAY TAB ──────────────────────────────────────────────────────────────
function TodayTab({ bookings }) {
  const sorted = [...bookings].sort((a, b) => new Date(a.slot.startAt) - new Date(b.slot.startAt));
  const total = sorted.reduce((sum, b) => sum + b.quotedPrice, 0);
  return (
    <div style={{ display: 'grid', gap: 28 }}>
      <div>
        <Kicker>Agenda confirmada</Kicker>
        <h1 style={{
          fontFamily: FONTS.display, fontWeight: 800, fontSize: 38, margin: '8px 0 0',
          letterSpacing: '-0.03em', lineHeight: 1,
        }}>
          Hoy
        </h1>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
      }}>
        <Stat label="Citas confirmadas" value={sorted.length} />
        <Stat label="Ingresos del día"   value={formatCRC(total)} />
        <Stat label="Próxima cita"       value={sorted[0] ? formatTime(sorted[0].slot.startAt) : '—'} />
      </div>

      {sorted.length === 0 ? (
        <EmptyState title="Nada confirmado todavía" body="Las citas aceptadas en el inbox aparecen acá." icon="clock" />
      ) : (
        <div style={{
          background: COLORS.white, borderRadius: 16, border: `1px solid ${COLORS.line}`,
          padding: 8, display: 'grid', gap: 4,
        }}>
          {sorted.map((b, i) => (
            <TodayRow key={b.id} booking={b} isLast={i === sorted.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{
      background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.line}`,
      padding: 20, display: 'grid', gap: 8,
    }}>
      <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.stoneSoft, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontFamily: FONTS.display, fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>
        {value}
      </div>
    </div>
  );
}

function TodayRow({ booking, isLast }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '88px 1fr auto auto', gap: 16,
      padding: 16, borderBottom: isLast ? 'none' : `1px solid ${COLORS.line}`,
      alignItems: 'center',
    }}>
      <div style={{
        fontFamily: FONTS.display, fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em',
        color: COLORS.ink, textAlign: 'left',
      }}>
        {formatTime(booking.slot.startAt)}
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14.5 }}>{booking.customer.name}</div>
        <div style={{ fontSize: 12.5, color: COLORS.stone, marginTop: 2, display: 'flex', gap: 10 }}>
          <span>{booking.service.name}</span>
          <span style={{ color: COLORS.line }}>·</span>
          <span style={{ fontFamily: FONTS.mono }}>{booking.customer.phone}</span>
        </div>
      </div>
      <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.ink, fontWeight: 500 }}>
        {formatCRC(booking.quotedPrice)}
      </div>
      <div>
        {booking.avifyOrderId
          ? <Badge color="green" icon="check">Avify {booking.avifyOrderId}</Badge>
          : <Badge color="stone">sin Avify</Badge>}
      </div>
    </div>
  );
}

// ─── CALENDAR TAB ───────────────────────────────────────────────────────────
function CalendarTab({ bookings }) {
  // Week view: Mon–Sun, 8:00 to 19:00
  const HOURS = Array.from({ length: 12 }, (_, i) => 8 + i); // 8..19
  const startOfWeek = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const day = (d.getDay() + 6) % 7; // make Monday=0
    d.setDate(d.getDate() - day);
    return d;
  })();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek); d.setDate(d.getDate() + i); return d;
  });

  return (
    <div style={{ display: 'grid', gap: 28 }}>
      <div>
        <Kicker>Vista semanal</Kicker>
        <h1 style={{
          fontFamily: FONTS.display, fontWeight: 800, fontSize: 38, margin: '8px 0 0',
          letterSpacing: '-0.03em', lineHeight: 1,
        }}>
          Calendario
        </h1>
      </div>
      <div style={{
        background: COLORS.white, borderRadius: 16, border: `1px solid ${COLORS.line}`,
        overflow: 'hidden',
      }}>
        {/* Header row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)',
          borderBottom: `1px solid ${COLORS.line}`,
        }}>
          <div />
          {days.map((d, i) => (
            <div key={i} style={{
              padding: 12, textAlign: 'center', borderLeft: `1px solid ${COLORS.line}`,
            }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.stoneSoft, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'][i]}
              </div>
              <div style={{ fontFamily: FONTS.display, fontSize: 18, fontWeight: 700, marginTop: 2 }}>
                {d.getDate()}
              </div>
            </div>
          ))}
        </div>
        {/* Body */}
        <div style={{
          display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', position: 'relative',
        }}>
          {/* Hour gutter */}
          <div>
            {HOURS.map(h => (
              <div key={h} style={{
                height: 56, padding: '4px 6px', fontFamily: FONTS.mono, fontSize: 10.5, color: COLORS.stoneSoft,
                borderTop: `1px solid ${COLORS.line}`, textAlign: 'right',
              }}>{h}:00</div>
            ))}
          </div>
          {days.map((d, dayIdx) => {
            const dayBookings = bookings.filter(b => {
              const bd = new Date(b.slot.startAt);
              return bd.toDateString() === d.toDateString();
            });
            return (
              <div key={dayIdx} style={{
                position: 'relative', borderLeft: `1px solid ${COLORS.line}`,
              }}>
                {HOURS.map(h => (
                  <div key={h} style={{ height: 56, borderTop: `1px solid ${COLORS.line}` }} />
                ))}
                {dayBookings.map(b => {
                  const bd = new Date(b.slot.startAt);
                  const hours = bd.getHours() + bd.getMinutes() / 60;
                  if (hours < 8 || hours > 19) return null;
                  const top = (hours - 8) * 56;
                  const isPending = b.status === 'pending';
                  return (
                    <div key={b.id} title={`${b.customer.name} · ${b.service.name}`} style={{
                      position: 'absolute', left: 4, right: 4, top: top + 2,
                      height: 50, padding: '6px 8px',
                      background: isPending ? COLORS.white : COLORS.greenSoft,
                      border: isPending ? `1.5px solid ${COLORS.warnAmber}` : `1px solid ${COLORS.green}`,
                      borderRadius: 8, fontSize: 11, lineHeight: 1.2, overflow: 'hidden',
                    }}>
                      <div style={{ fontWeight: 700, color: COLORS.ink, fontSize: 11.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {b.customer.name}
                      </div>
                      <div style={{ color: COLORS.stone, fontSize: 10.5, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {b.service.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div style={{ padding: 14, borderTop: `1px solid ${COLORS.line}`, display: 'flex', gap: 16, fontSize: 12, color: COLORS.stone }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: COLORS.greenSoft, border: `1px solid ${COLORS.green}` }} />
            Confirmadas
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: COLORS.white, border: `1.5px solid ${COLORS.warnAmber}` }} />
            Pendientes
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── SERVICES TAB ──────────────────────────────────────────────────────────
function ServicesTab() {
  return (
    <div style={{ display: 'grid', gap: 28 }}>
      <div>
        <Kicker>Catálogo</Kicker>
        <h1 style={{
          fontFamily: FONTS.display, fontWeight: 800, fontSize: 38, margin: '8px 0 0',
          letterSpacing: '-0.03em', lineHeight: 1,
        }}>
          Servicios
        </h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {MOCK_SERVICES.map(s => (
          <div key={s.id} style={{
            background: COLORS.white, borderRadius: 14, border: `1px solid ${COLORS.line}`,
            padding: 20, display: 'grid', gap: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em' }}>
                  {s.name}
                </div>
                <div style={{ fontSize: 13, color: COLORS.stone, marginTop: 4 }}>
                  {s.description}
                </div>
              </div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em' }}>
                {formatCRC(s.basePrice)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Badge color="stone" icon="clock">{s.durationMin} min</Badge>
              <Badge color="green" icon="link">{s.avifySku}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlaceholderTab({ title, body }) {
  return (
    <div style={{ display: 'grid', gap: 28 }}>
      <div>
        <h1 style={{
          fontFamily: FONTS.display, fontWeight: 800, fontSize: 38, margin: 0,
          letterSpacing: '-0.03em', lineHeight: 1,
        }}>
          {title}
        </h1>
      </div>
      <EmptyState title={`${title} próximamente`} body={body} icon="settings" />
    </div>
  );
}

function EmptyState({ title, body, icon }) {
  return (
    <div style={{
      background: COLORS.white, borderRadius: 16, border: `1px dashed ${COLORS.line}`,
      padding: 56, display: 'grid', gap: 12, justifyItems: 'center', textAlign: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14, background: COLORS.mist,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.stone,
      }}>
        <Icon name={icon} size={24} color={COLORS.stone} />
      </div>
      <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em' }}>
        {title}
      </div>
      <div style={{ color: COLORS.stone, fontSize: 14, maxWidth: 380 }}>
        {body}
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;
window.Stat = Stat;
window.EmptyState = EmptyState;

// ─── DEMO BAR (quick navigation for pitch) ──────────────────────────────────
function DemoBar({ onAction }) {
  const actions = [
    { id: 'calendar', label: 'Ver calendario',      icon: 'calendar' },
    { id: 'carlos',   label: 'Ver Carlos (9/10)',   icon: 'user' },
    { id: 'reward',   label: 'Canjear recompensa',  icon: 'sparkles' },
    { id: 'reminder', label: 'Enviar recordatorio', icon: 'bell' },
  ];
  return (
    <div style={{
      background: COLORS.ink, color: COLORS.white,
      padding: '12px 40px', display: 'flex', alignItems: 'center', gap: 14,
      borderBottom: `1px solid ${COLORS.ink}`, flexWrap: 'wrap',
    }}>
      <div style={{
        fontFamily: FONTS.mono, fontSize: 10.5, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: COLORS.greenSoft, opacity: 0.8,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <Icon name="sparkles" size={12} color={COLORS.green} />
        Demo rápida
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {actions.map(a => (
          <button key={a.id} onClick={() => onAction(a.id)} style={{
            border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)',
            color: COLORS.white, padding: '7px 12px', borderRadius: 8, cursor: 'pointer',
            fontSize: 12.5, fontWeight: 600, fontFamily: FONTS.body,
            display: 'flex', alignItems: 'center', gap: 6, transition: 'background 150ms, border-color 150ms',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,196,106,0.18)'; e.currentTarget.style.borderColor = COLORS.green; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
          >
            <Icon name={a.icon} size={13} color={COLORS.white} />
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── TOAST BANNER ───────────────────────────────────────────────────────────
function ToastBanner({ message }) {
  return (
    <div className="bylo-pop" style={{
      position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      background: COLORS.ink, color: COLORS.white,
      padding: '12px 18px', borderRadius: 999, fontSize: 13.5, fontWeight: 600,
      boxShadow: SHADOWS.lg, zIndex: 250, fontFamily: FONTS.body,
      display: 'flex', alignItems: 'center', gap: 10, maxWidth: 'calc(100% - 40px)',
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%', background: COLORS.green,
        boxShadow: '0 0 0 3px rgba(0,196,106,0.25)', flexShrink: 0,
      }} />
      {message}
    </div>
  );
}

// ─── CONFETTI BURST (CSS-only) ──────────────────────────────────────────────
function ConfettiBurst() {
  const pieces = Array.from({ length: 60 });
  const palette = [COLORS.green, COLORS.purple, COLORS.amber, COLORS.ink, COLORS.blue, '#EC4899'];
  useEffectDash(() => {
    const t = setTimeout(() => {}, 2500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 400, overflow: 'hidden',
    }}>
      <style>{`
        @keyframes bylo-confetti {
          0%   { transform: translate3d(0,0,0) rotate(0); opacity: 1; }
          100% { transform: translate3d(var(--x), var(--y), 0) rotate(var(--r)); opacity: 0; }
        }
      `}</style>
      {pieces.map((_, i) => {
        const angle = (Math.PI * 2 * i) / pieces.length + Math.random() * 0.3;
        const dist = 320 + Math.random() * 240;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        const r = (Math.random() * 720 - 360) + 'deg';
        const size = 8 + Math.random() * 6;
        const c = palette[i % palette.length];
        const isSquare = i % 3 === 0;
        return (
          <span key={i} style={{
            position: 'absolute', left: '50%', top: '50%',
            width: size, height: size * (isSquare ? 1 : 0.5),
            background: c, borderRadius: isSquare ? 2 : 999,
            '--x': `${x}px`, '--y': `${y}px`, '--r': r,
            animation: `bylo-confetti ${1100 + Math.random() * 600}ms cubic-bezier(.2,.7,.2,1) forwards`,
          }} />
        );
      })}
    </div>
  );
}

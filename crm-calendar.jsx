// ─── BYLO CRM · CALENDAR (enhanced) ─────────────────────────────────────────
// Week/Day toggle, click event → side drawer, "+ Nueva cita" modal,
// current-time red line, tooltips. Replaces the basic CalendarTab.

const { useState: useStateCal, useEffect: useEffectCal, useMemo: useMemoCal, useRef: useRefCal } = React;

const CAL_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const CAL_HOUR_START = 7;
const CAL_HOUR_END = 20;
const CAL_HOUR_HEIGHT = 56;

function CalendarFullTab({ events, clients, services, onAddEvent, onUpdateEvent, onOpenClient, openModalFor, clearModalFor }) {
  const [view, setView] = useStateCal('week'); // week | day
  const [activeEvent, setActiveEvent] = useStateCal(null);
  const [modalOpen, setModalOpen] = useStateCal(false);
  const [modalClient, setModalClient] = useStateCal(null);

  // External trigger to open "new appointment" with a preselected client
  useEffectCal(() => {
    if (openModalFor) {
      setModalClient(openModalFor);
      setModalOpen(true);
      clearModalFor();
    }
  }, [openModalFor]);

  // current week (Mon..Sun)
  const startOfWeek = useMemoCal(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    return d;
  }, []);
  const days = useMemoCal(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek); d.setDate(d.getDate() + i); return d;
  }), [startOfWeek]);
  const dayView = useMemoCal(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  }, []);

  const visibleDays = view === 'week' ? days : [dayView];

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <Kicker>Agenda</Kicker>
          <h1 style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 38, margin: '8px 0 0', letterSpacing: '-0.03em', lineHeight: 1 }}>
            Calendario
          </h1>
          <div style={{ color: COLORS.stone, fontSize: 14.5, marginTop: 10 }}>
            {events.length} citas esta semana · clic en una cita para ver detalles
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4, padding: 4, background: COLORS.white, borderRadius: 10, border: `1px solid ${COLORS.line}` }}>
            {['week', 'day'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                border: 'none', cursor: 'pointer',
                background: view === v ? COLORS.ink : 'transparent',
                color: view === v ? COLORS.white : COLORS.stone,
                padding: '7px 14px', borderRadius: 7, fontSize: 12.5, fontWeight: 600, fontFamily: FONTS.body,
                transition: 'background 150ms, color 150ms',
              }}>
                {v === 'week' ? 'Semana' : 'Día'}
              </button>
            ))}
          </div>
          <Button icon="plus" onClick={() => { setModalClient(null); setModalOpen(true); }}>Nueva cita</Button>
        </div>
      </header>

      <div style={{
        background: COLORS.white, borderRadius: 16, border: `1px solid ${COLORS.line}`,
        overflow: 'hidden', boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06)',
      }}>
        <CalendarHeaderRow days={visibleDays} view={view} />
        <CalendarBody
          days={visibleDays}
          events={events}
          onEventClick={setActiveEvent}
          view={view}
        />
        <CalendarLegend />
      </div>

      {activeEvent && (
        <EventDrawer
          event={activeEvent}
          onClose={() => setActiveEvent(null)}
          onOpenClient={(id) => { setActiveEvent(null); onOpenClient(id); }}
          onConfirm={(id) => onUpdateEvent(id, { status: 'confirmed', color: 'green' })}
          onCancel={(id) => onUpdateEvent(id, { status: 'cancelled' })}
        />
      )}

      {modalOpen && (
        <NewAppointmentModal
          clients={clients} services={services}
          presetClient={modalClient}
          onClose={() => setModalOpen(false)}
          onSave={(payload) => {
            onAddEvent(payload);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function CalendarHeaderRow({ days, view }) {
  const isToday = (d) => d.toDateString() === new Date().toDateString();
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: view === 'week' ? '64px repeat(7, 1fr)' : '64px 1fr',
      borderBottom: `1px solid ${COLORS.line}`,
    }}>
      <div />
      {days.map((d, i) => {
        const today = isToday(d);
        return (
          <div key={i} style={{
            padding: '14px 12px', textAlign: 'center',
            borderLeft: `1px solid ${COLORS.line}`,
            background: today ? COLORS.greenSoft : 'transparent',
          }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: today ? COLORS.greenDeep : COLORS.stoneSoft, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {view === 'week' ? CAL_DAYS[i] : d.toLocaleDateString('es-CR', { weekday: 'long' })}
            </div>
            <div style={{ fontFamily: FONTS.display, fontSize: view === 'week' ? 20 : 26, fontWeight: 800, marginTop: 2, letterSpacing: '-0.02em', color: today ? COLORS.greenDeep : COLORS.ink }}>
              {d.getDate()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CalendarBody({ days, events, onEventClick, view }) {
  const hours = Array.from({ length: CAL_HOUR_END - CAL_HOUR_START + 1 }, (_, i) => CAL_HOUR_START + i);
  const [now, setNow] = useStateCal(new Date());
  useEffectCal(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);
  const todayIdx = days.findIndex(d => d.toDateString() === now.toDateString());
  const nowOffset = (now.getHours() + now.getMinutes() / 60 - CAL_HOUR_START) * CAL_HOUR_HEIGHT;
  const showLine = todayIdx >= 0 && now.getHours() >= CAL_HOUR_START && now.getHours() < CAL_HOUR_END + 1;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: view === 'week' ? '64px repeat(7, 1fr)' : '64px 1fr',
      position: 'relative',
    }}>
      {/* Hour gutter */}
      <div>
        {hours.map(h => (
          <div key={h} style={{
            height: CAL_HOUR_HEIGHT, padding: '4px 8px',
            fontFamily: FONTS.mono, fontSize: 10.5, color: COLORS.stoneSoft,
            borderTop: `1px solid ${COLORS.line}`, textAlign: 'right',
          }}>{String(h).padStart(2, '0')}:00</div>
        ))}
      </div>

      {days.map((d, dayIdx) => {
        const dayEvents = events.filter(e => new Date(e.startAt).toDateString() === d.toDateString());
        return (
          <div key={dayIdx} style={{
            position: 'relative', borderLeft: `1px solid ${COLORS.line}`,
          }}>
            {/* hour cells (clickable later if you want quick-add) */}
            {hours.map(h => (
              <div key={h} style={{
                height: CAL_HOUR_HEIGHT, borderTop: `1px solid ${COLORS.line}`,
              }} />
            ))}

            {/* current-time red line */}
            {showLine && dayIdx === todayIdx && (
              <div style={{
                position: 'absolute', left: 0, right: 0, top: nowOffset, zIndex: 3, pointerEvents: 'none',
              }}>
                <div style={{
                  height: 2, background: COLORS.warn,
                  boxShadow: `0 0 0 1px rgba(220,38,38,0.15)`,
                }} />
                <div style={{
                  position: 'absolute', left: -5, top: -4,
                  width: 10, height: 10, borderRadius: '50%', background: COLORS.warn,
                  boxShadow: '0 0 0 3px rgba(220,38,38,0.18)',
                }} />
              </div>
            )}

            {/* events */}
            {dayEvents.map(e => {
              const bd = new Date(e.startAt);
              const hours = bd.getHours() + bd.getMinutes() / 60;
              if (hours < CAL_HOUR_START || hours > CAL_HOUR_END) return null;
              const top = (hours - CAL_HOUR_START) * CAL_HOUR_HEIGHT;
              const height = (e.duration / 60) * CAL_HOUR_HEIGHT - 4;
              const tones = eventColor(e);
              return (
                <button
                  key={e.id}
                  onClick={() => onEventClick(e)}
                  title={`${e.clientName} · ${e.service}`}
                  style={{
                    position: 'absolute', left: 4, right: 4, top: top + 2,
                    height, padding: '6px 8px 6px 10px',
                    background: tones.bg, color: COLORS.ink,
                    borderRadius: 6, borderLeft: `4px solid ${tones.accent}`,
                    border: 'none', borderLeft: `4px solid ${tones.accent}`,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                    fontSize: 11, lineHeight: 1.25, overflow: 'hidden',
                    textAlign: 'left', cursor: 'pointer',
                    transition: 'transform 120ms ease, box-shadow 120ms ease',
                  }}
                  onMouseEnter={ev => { ev.currentTarget.style.transform = 'scale(1.02)'; ev.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(0,0,0,0.15)'; }}
                  onMouseLeave={ev => { ev.currentTarget.style.transform = 'scale(1)'; ev.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.06)'; }}
                >
                  <div style={{ fontWeight: 700, fontSize: 11.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: COLORS.ink }}>
                    {e.clientName}
                  </div>
                  <div style={{ color: COLORS.stone, fontSize: 10.5, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {formatTime(e.startAt)} · {e.service}
                  </div>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function CalendarLegend() {
  return (
    <div style={{ padding: 14, borderTop: `1px solid ${COLORS.line}`, display: 'flex', gap: 18, fontSize: 12, color: COLORS.stone, flexWrap: 'wrap' }}>
      <LegendItem dot={COLORS.green}  bg={COLORS.greenSoft}  label="Confirmadas" />
      <LegendItem dot={COLORS.amber}  bg="#FFF7E6"           label="Pendientes" />
      <LegendItem dot={COLORS.purple} bg={COLORS.purpleSoft} label="Cliente VIP" />
      <LegendItem dot={COLORS.warn}   bg="transparent"       label="Ahora" line />
    </div>
  );
}
function LegendItem({ dot, bg, label, line }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {line ? (
        <span style={{ width: 18, height: 2, background: dot, position: 'relative' }}>
          <span style={{ position: 'absolute', left: -2, top: -3, width: 8, height: 8, borderRadius: '50%', background: dot }} />
        </span>
      ) : (
        <span style={{ width: 14, height: 14, borderRadius: 4, background: bg, borderLeft: `3px solid ${dot}` }} />
      )}
      {label}
    </span>
  );
}

// ─── EVENT DRAWER (side panel) ──────────────────────────────────────────────
function EventDrawer({ event, onClose, onOpenClient, onConfirm, onCancel }) {
  const tones = eventColor(event);
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(15,20,25,0.4)', zIndex: 300,
        animation: 'bylo-fadeup 200ms',
      }} />
      <aside style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(420px, 100vw)',
        background: COLORS.white, zIndex: 301,
        boxShadow: '-12px 0 40px -16px rgba(0,0,0,0.2)',
        display: 'grid', gridTemplateRows: 'auto 1fr auto', overflowY: 'auto',
        animation: 'bylo-drawer-in 280ms cubic-bezier(.2,.7,.2,1)',
      }}>
        <style>{`@keyframes bylo-drawer-in { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        <header style={{
          padding: 24, borderBottom: `1px solid ${COLORS.line}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <Kicker>Detalle de cita</Kicker>
            <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 24, marginTop: 6, letterSpacing: '-0.02em' }}>
              {event.clientName}
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: COLORS.mist, cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.stone }}>
            <Icon name="x" size={16} />
          </button>
        </header>

        <div style={{ padding: 24, display: 'grid', gap: 18 }}>
          <Badge color={event.status === 'pending' ? 'amber' : event.color === 'purple' ? 'purple' : 'green'} icon={event.status === 'pending' ? 'clock' : 'check'}>
            {event.status === 'pending' ? 'Pendiente de confirmar' : event.color === 'purple' ? 'Cliente VIP' : 'Confirmada'}
          </Badge>

          <div style={{ display: 'grid', gap: 12 }}>
            <DetailRow icon="scissors" label="Servicio"   value={event.service} />
            <DetailRow icon="calendar" label="Fecha"      value={formatDate(event.startAt)} />
            <DetailRow icon="clock"    label="Hora"       value={`${formatTime(event.startAt)} · ${event.duration} min`} />
            <DetailRow icon="zap"      label="Precio"     value={formatCRC(event.price)} />
          </div>

          <div style={{ padding: 14, background: COLORS.mist, borderRadius: 10, fontSize: 12, color: COLORS.stoneSoft, fontFamily: FONTS.mono, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="sparkles" size={14} />
            Borde izquierdo de color: {event.status === 'pending' ? 'pendiente' : event.color === 'purple' ? 'VIP' : 'confirmada'}
          </div>
        </div>

        <footer style={{
          padding: 20, borderTop: `1px solid ${COLORS.line}`,
          display: 'grid', gap: 8,
        }}>
          {event.status === 'pending' && (
            <Button variant="primary" icon="check" onClick={() => { onConfirm(event.id); onClose(); }}>
              Confirmar cita
            </Button>
          )}
          <Button variant="secondary" icon="user" onClick={() => onOpenClient(event.clientId)}>
            Ver perfil del cliente
          </Button>
          {event.status !== 'cancelled' && (
            <Button variant="ghost" icon="x" onClick={() => { onCancel(event.id); onClose(); }} style={{ color: COLORS.warn }}>
              Cancelar cita
            </Button>
          )}
        </footer>
      </aside>
    </>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr auto', gap: 12, alignItems: 'center' }}>
      <Icon name={icon} size={16} color={COLORS.stone} />
      <span style={{ fontSize: 13, color: COLORS.stone }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.ink, fontFamily: FONTS.mono }}>{value}</span>
    </div>
  );
}

// ─── NEW APPOINTMENT MODAL ──────────────────────────────────────────────────
function NewAppointmentModal({ clients, services, presetClient, onClose, onSave }) {
  const today = new Date();
  const defaultDate = today.toISOString().slice(0, 10);
  const [clientId, setClientId] = useStateCal(presetClient?.id || clients[0]?.id || '');
  const [serviceId, setServiceId] = useStateCal(services[0]?.id || '');
  const [date, setDate] = useStateCal(defaultDate);
  const [time, setTime] = useStateCal('10:00');

  const client = clients.find(c => c.id === clientId);
  const service = services.find(s => s.id === serviceId);

  const valid = client && service && date && time;
  const save = () => {
    if (!valid) return;
    const startAt = new Date(`${date}T${time}:00`).toISOString();
    // 🔌 API: POST /api/bookings  →  { clientId, serviceId, startAt, duration }
    onSave({
      id: `e_${Date.now()}`,
      clientName: client.name, clientId: client.id,
      service: service.name, startAt,
      duration: service.durationMin, price: service.basePrice,
      status: 'confirmed', color: client.status === 'vip' ? 'purple' : 'green',
    });
  };

  return (
    <Modal title="Nueva cita" onClose={onClose} width={520}>
      <div style={{ display: 'grid', gap: 14 }}>
        <Field label="Cliente">
          <select value={clientId} onChange={e => setClientId(e.target.value)} style={inputStyle(false)}>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>
            ))}
          </select>
        </Field>
        <Field label="Servicio">
          <select value={serviceId} onChange={e => setServiceId(e.target.value)} style={inputStyle(false)}>
            {services.map(s => (
              <option key={s.id} value={s.id}>{s.name} · {formatCRC(s.basePrice)} · {s.durationMin} min</option>
            ))}
          </select>
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Fecha">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle(false)} />
          </Field>
          <Field label="Hora">
            <input type="time" value={time} onChange={e => setTime(e.target.value)} style={inputStyle(false)} />
          </Field>
        </div>
        {client?.preferences?.drinks?.length > 0 && (
          <div style={{
            padding: 12, background: COLORS.greenSoft, borderRadius: 8,
            display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: COLORS.greenDeep,
          }}>
            <Icon name="sparkles" size={14} />
            Sugerencia: preparar <b>{client.preferences.drinks[0]}</b> para {client.name.split(' ')[0]}.
          </div>
        )}
        {client?.preferences?.diet && (
          <div style={{
            padding: 12, background: COLORS.greenSoft, borderRadius: 8,
            fontSize: 12.5, color: COLORS.greenDeep,
          }}>
            🥗 {client.name.split(' ')[0]} está en dieta — evitar snacks azucarados.
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 22 }}>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button icon="check" disabled={!valid} onClick={save}>Crear cita</Button>
      </div>
    </Modal>
  );
}

window.CalendarFullTab = CalendarFullTab;

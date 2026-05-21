// ─── BYLO CRM · CLIENTS MODULE ──────────────────────────────────────────────
// Clients list + profile with sub-tabs: Resumen, Personalidad, Preferencias,
// Recordatorio, Fidelidad, Historial.

const { useState: useStateCli, useEffect: useEffectCli, useRef: useRefCli, useMemo: useMemoCli } = React;

function ClientsTab({ clients, setClients, selectedClientId, setSelectedClientId, onBookAppointment, onToast, onCelebrate, businessName, slug }) {
  if (selectedClientId) {
    const c = clients.find(x => x.id === selectedClientId);
    if (c) return (
      <ClientProfile
        client={c}
        onBack={() => setSelectedClientId(null)}
        onUpdate={(patch) => setClients(prev => prev.map(x => x.id === c.id ? { ...x, ...patch } : x))}
        onBookAppointment={() => onBookAppointment(c)}
        onToast={onToast}
        onCelebrate={onCelebrate}
        businessName={businessName}
        slug={slug}
      />
    );
  }
  return (
    <ClientsList
      clients={clients}
      setClients={setClients}
      onSelect={(id) => setSelectedClientId(id)}
      onToast={onToast}
    />
  );
}

// ─── LIST VIEW ──────────────────────────────────────────────────────────────
function ClientsList({ clients, setClients, onSelect, onToast }) {
  const [query, setQuery] = useStateCli('');
  const [filter, setFilter] = useStateCli('all'); // all | vip | at_risk | reminder
  const [addOpen, setAddOpen] = useStateCli(false);

  const filtered = useMemoCli(() => {
    let arr = [...clients];
    if (filter === 'vip')      arr = arr.filter(c => c.status === 'vip');
    if (filter === 'at_risk')  arr = arr.filter(c => c.status === 'at_risk' || (reminderUrgency(c)?.daysOverdue > 0));
    if (filter === 'reminder') arr = arr.filter(c => c.reminderEnabled);
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(query));
    }
    return arr;
  }, [clients, query, filter]);

  const filterButtons = [
    { id: 'all',      label: 'Todos',          count: clients.length },
    { id: 'vip',      label: 'VIP',            count: clients.filter(c => c.status === 'vip').length },
    { id: 'at_risk',  label: 'En riesgo',      count: clients.filter(c => c.status === 'at_risk' || (reminderUrgency(c)?.daysOverdue > 0)).length },
    { id: 'reminder', label: 'Con recordatorio', count: clients.filter(c => c.reminderEnabled).length },
  ];

  const handleAdd = (data) => {
    const newClient = {
      id: `c_${Date.now()}`,
      name: data.name, phone: data.phone,
      visits: 0, nextVisitDays: 30,
      lastVisit: new Date().toISOString(),
      tags: [], preferences: { topics: [], diet: false, drinks: [], notes: data.notes || '' },
      loyaltyPoints: 0, loyaltyGoal: 10,
      reminderDays: 30, reminderEnabled: false,
      status: 'active', totalSpent: 0, redeemed: 0,
    };
    // 🔌 API: POST /api/clients  →  { name, phone, businessId }
    setClients(prev => [newClient, ...prev]);
    setAddOpen(false);
    onToast(`${data.name} agregado a tu CRM`);
  };

  return (
    <div style={{ display: 'grid', gap: 28 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <Kicker>CRM</Kicker>
          <h1 style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 38, margin: '8px 0 0', letterSpacing: '-0.03em', lineHeight: 1 }}>
            Clientes
          </h1>
          <div style={{ color: COLORS.stone, fontSize: 14.5, marginTop: 10 }}>
            {clients.length} clientes · {clients.filter(c => c.status === 'vip').length} VIP · {clients.filter(c => reminderUrgency(c)?.daysOverdue > 0).length} sin venir
          </div>
        </div>
        <Button icon="plus" onClick={() => setAddOpen(true)}>Nuevo cliente</Button>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center',
      }}>
        <div style={{
          background: COLORS.white, borderRadius: 10, border: `1px solid ${COLORS.line}`,
          display: 'flex', alignItems: 'center', padding: '8px 14px', gap: 10,
        }}>
          <Icon name="users" size={16} color={COLORS.stone} />
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre o teléfono…"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: COLORS.ink, background: 'transparent' }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: COLORS.stoneSoft, display: 'flex', padding: 0 }}>
              <Icon name="x" size={14} />
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4, padding: 4, background: COLORS.white, borderRadius: 10, border: `1px solid ${COLORS.line}` }}>
          {filterButtons.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              border: 'none', cursor: 'pointer',
              background: filter === f.id ? COLORS.ink : 'transparent',
              color: filter === f.id ? COLORS.white : COLORS.stone,
              padding: '7px 12px', borderRadius: 7, fontSize: 12.5, fontWeight: 600,
              fontFamily: FONTS.body, display: 'flex', alignItems: 'center', gap: 6,
              transition: 'background 150ms, color 150ms',
            }}>
              {f.label}
              <span style={{
                fontFamily: FONTS.mono, fontSize: 10.5, opacity: 0.7,
              }}>{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No se encontraron clientes" body="Cambiá los filtros o agregá un cliente nuevo." icon="users" />
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {filtered.map((c, i) => (
            <ClientRow key={c.id} client={c} onClick={() => onSelect(c.id)} delay={i * 30} />
          ))}
        </div>
      )}

      {addOpen && <NewClientModal onClose={() => setAddOpen(false)} onSave={handleAdd} />}
    </div>
  );
}

function ClientRow({ client, onClick, delay }) {
  const urg = reminderUrgency(client);
  const meta = STATUS_META[client.status];
  return (
    <button onClick={onClick} className="bylo-fadeup" style={{
      animationDelay: `${delay}ms`,
      background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.line}`,
      padding: 16, display: 'grid', gridTemplateColumns: '44px 1.4fr 1fr 1fr 1fr auto',
      gap: 16, alignItems: 'center', cursor: 'pointer', textAlign: 'left',
      transition: 'border-color 150ms, transform 150ms',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.ink; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.line; }}
    >
      <Avatar name={client.name} size={44} bg={COLORS.mist} color={COLORS.ink} />
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 15.5, letterSpacing: '-0.01em' }}>{client.name}</div>
          <Badge color={meta.color} icon={meta.icon}>{meta.label}</Badge>
        </div>
        <div style={{ fontSize: 12, color: COLORS.stoneSoft, marginTop: 3, fontFamily: FONTS.mono }}>{client.phone}</div>
      </div>
      <div style={{ display: 'grid', gap: 2 }}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 10.5, color: COLORS.stoneSoft, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Última visita</div>
        <div style={{ fontSize: 13, color: COLORS.ink }}>{daysAgoLabel(client.lastVisit)}</div>
      </div>
      <div style={{ display: 'grid', gap: 2 }}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 10.5, color: COLORS.stoneSoft, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Visitas · Gastado</div>
        <div style={{ fontSize: 13, color: COLORS.ink }}>{client.visits} · {formatCRC(client.totalSpent)}</div>
      </div>
      <LoyaltyMini points={client.loyaltyPoints} goal={client.loyaltyGoal} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {urg && <Badge color={urg.tone} icon="bell">{urg.label}</Badge>}
        <Icon name="chevron" size={16} color={COLORS.stoneSoft} />
      </div>
    </button>
  );
}

function LoyaltyMini({ points, goal }) {
  const pct = Math.min(100, (points / goal) * 100);
  const complete = points >= goal;
  return (
    <div style={{ display: 'grid', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11.5 }}>
        <span style={{ fontFamily: FONTS.mono, color: COLORS.stoneSoft, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Fidelidad</span>
        <span style={{ fontFamily: FONTS.mono, color: complete ? COLORS.greenDeep : COLORS.ink, fontWeight: 600 }}>{points}/{goal}</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: COLORS.mist, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: complete ? COLORS.green : COLORS.ink, transition: 'width 400ms ease' }} />
      </div>
    </div>
  );
}

// ─── NEW CLIENT MODAL ───────────────────────────────────────────────────────
function NewClientModal({ onClose, onSave }) {
  const [name, setName]   = useStateCli('');
  const [phone, setPhone] = useStateCli('');
  const [notes, setNotes] = useStateCli('');
  const valid = name.trim() && phone.trim();
  return (
    <Modal onClose={onClose} title="Nuevo cliente">
      <div style={{ display: 'grid', gap: 14 }}>
        <Field label="Nombre completo">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Carlos Rodríguez" style={inputStyle(false)} autoFocus />
        </Field>
        <Field label="Teléfono">
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+506 8000-0000" style={inputStyle(false)} />
        </Field>
        <Field label="Notas iniciales" hint="Opcional. Recordatorios, preferencias.">
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ej: Prefiere atención silenciosa…" rows={3}
            style={{ ...inputStyle(false), resize: 'vertical', minHeight: 70, fontFamily: FONTS.body }} />
        </Field>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 22 }}>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button icon="check" disabled={!valid} onClick={() => onSave({ name, phone, notes })}>Guardar cliente</Button>
      </div>
    </Modal>
  );
}

// ─── CLIENT PROFILE ─────────────────────────────────────────────────────────
function ClientProfile({ client, onBack, onUpdate, onBookAppointment, onToast, onCelebrate, businessName, slug }) {
  const [tab, setTab] = useStateCli('summary');
  const meta = STATUS_META[client.status];
  const tabs = [
    { id: 'summary',     label: 'Resumen',      icon: 'eye' },
    { id: 'personality', label: 'Personalidad', icon: 'users' },
    { id: 'preferences', label: 'Preferencias', icon: 'sparkles' },
    { id: 'reminder',    label: 'Recordatorio', icon: 'bell' },
    { id: 'loyalty',     label: 'Fidelidad',    icon: 'sparkles' },
    { id: 'history',     label: 'Historial',    icon: 'list' },
  ];
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <button onClick={onBack} style={{
        border: 'none', background: 'transparent', cursor: 'pointer',
        color: COLORS.stone, fontSize: 13, padding: 0,
        display: 'flex', alignItems: 'center', gap: 6, justifySelf: 'start',
      }}>
        <Icon name="arrowLeft" size={14} /> Volver a clientes
      </button>

      <header style={{
        background: COLORS.white, borderRadius: 16, border: `1px solid ${COLORS.line}`,
        padding: 28, display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'center',
      }}>
        <Avatar name={client.name} size={72} bg={COLORS.ink} color={COLORS.white} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 30, margin: 0, letterSpacing: '-0.02em' }}>
              {client.name}
            </h1>
            <Badge color={meta.color} icon={meta.icon}>{meta.label}</Badge>
          </div>
          <div style={{ fontSize: 13.5, color: COLORS.stone, marginTop: 6, fontFamily: FONTS.mono, display: 'flex', gap: 16 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="phone" size={13} />{client.phone}</span>
            <span>·</span>
            <span>{client.visits} visitas</span>
            <span>·</span>
            <span>{formatCRC(client.totalSpent)} totales</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" icon="calendar" onClick={onBookAppointment}>Agendar cita</Button>
        </div>
      </header>

      {/* Inner tabs */}
      <div style={{
        background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.line}`,
        padding: 4, display: 'flex', gap: 2, overflowX: 'auto',
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            border: 'none', cursor: 'pointer',
            background: tab === t.id ? COLORS.ink : 'transparent',
            color: tab === t.id ? COLORS.white : COLORS.stone,
            padding: '9px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: FONTS.body,
            display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
            transition: 'background 150ms, color 150ms',
          }}>
            <Icon name={t.icon} size={13} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="bylo-fadeup" key={tab}>
        {tab === 'summary'     && <SummaryTab client={client} />}
        {tab === 'personality' && <PersonalityTab client={client} onUpdate={onUpdate} onToast={onToast} />}
        {tab === 'preferences' && <PreferencesTab client={client} onUpdate={onUpdate} onToast={onToast} />}
        {tab === 'reminder'    && <ReminderTab client={client} onUpdate={onUpdate} onToast={onToast} businessName={businessName} slug={slug} />}
        {tab === 'loyalty'     && <LoyaltyDetailTab client={client} onUpdate={onUpdate} onToast={onToast} onCelebrate={onCelebrate} />}
        {tab === 'history'     && <HistoryTab client={client} />}
      </div>
    </div>
  );
}

// ─── SUB-TAB · SUMMARY ──────────────────────────────────────────────────────
function SummaryTab({ client }) {
  const history = useMemoCli(() => generateClientHistory(client).slice(0, 5), [client.id, client.visits]);
  const avg = client.visits > 0 ? Math.round(client.totalSpent / client.visits) : 0;
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <Stat label="Total visitas"        value={client.visits} />
        <Stat label="Total gastado"        value={formatCRC(client.totalSpent)} />
        <Stat label="Promedio por visita"  value={formatCRC(avg)} />
        <Stat label="Días sin venir"       value={daysSince(client.lastVisit)} />
      </div>
      <div style={{
        background: COLORS.white, borderRadius: 14, border: `1px solid ${COLORS.line}`, padding: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }}>
          <div>
            <Kicker>Últimas visitas</Kicker>
            <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 20, marginTop: 4, letterSpacing: '-0.01em' }}>
              Timeline
            </div>
          </div>
        </div>
        <div style={{ position: 'relative', paddingLeft: 24 }}>
          <div style={{ position: 'absolute', left: 7, top: 6, bottom: 6, width: 2, background: COLORS.line, borderRadius: 1 }} />
          {history.map((h, i) => (
            <div key={h.id} style={{
              position: 'relative', padding: '10px 0', display: 'grid',
              gridTemplateColumns: '1fr auto auto', gap: 16, alignItems: 'center',
            }}>
              <div style={{
                position: 'absolute', left: -22, top: 16,
                width: 12, height: 12, borderRadius: '50%',
                background: i === 0 ? COLORS.ink : COLORS.white,
                border: `2px solid ${COLORS.ink}`,
              }} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{h.service}</div>
                <div style={{ fontSize: 12, color: COLORS.stone, marginTop: 2, fontFamily: FONTS.mono }}>
                  {formatDate(h.date)} · {daysAgoLabel(h.date)}
                </div>
              </div>
              {h.usedReward && <Badge color="purple" icon="sparkles">Recompensa</Badge>}
              <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 500 }}>{formatCRC(h.price)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SUB-TAB · PERSONALITY ──────────────────────────────────────────────────
function PersonalityTab({ client, onUpdate, onToast }) {
  const [customTag, setCustomTag] = useStateCli('');
  const addTag = (t) => {
    if (!t.trim() || client.tags.includes(t)) return;
    // 🔌 API: PATCH /api/clients/:id/tags { tags: string[] }
    onUpdate({ tags: [...client.tags, t] });
  };
  const removeTag = (t) => {
    onUpdate({ tags: client.tags.filter(x => x !== t) });
  };
  const suggestions = PERSONALITY_TAGS.filter(t => !client.tags.includes(t));
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <PanelCard title="Etiquetas actuales" subtitle={`${client.tags.length} etiquetas asignadas`}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {client.tags.length === 0 && <div style={{ fontSize: 13, color: COLORS.stoneSoft }}>Sin etiquetas. Agregá una abajo.</div>}
          {client.tags.map(t => (
            <button key={t} onClick={() => removeTag(t)} className="bylo-pop" style={{
              ...tagPillStyle(tagTone(t)), cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              {t}
              <Icon name="x" size={11} strokeWidth={2.4} />
            </button>
          ))}
        </div>
      </PanelCard>

      <PanelCard title="Sugerencias" subtitle="Hacé clic para agregar al perfil">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {suggestions.map(t => (
            <button key={t} onClick={() => addTag(t)} style={{
              background: COLORS.white, color: COLORS.stone, border: `1px dashed ${COLORS.line}`,
              padding: '6px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 500,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
              transition: 'border-color 150ms, color 150ms, background 150ms',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.ink; e.currentTarget.style.color = COLORS.ink; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.line; e.currentTarget.style.color = COLORS.stone; }}
            >
              <Icon name="plus" size={11} /> {t}
            </button>
          ))}
        </div>
      </PanelCard>

      <PanelCard title="Crear etiqueta personalizada" subtitle="Presioná Enter para agregar">
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={customTag} onChange={e => setCustomTag(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && customTag.trim()) { addTag(customTag.trim()); setCustomTag(''); } }}
            placeholder="Ej: prefiere música suave"
            style={inputStyle(false)}
          />
          <Button icon="plus" disabled={!customTag.trim()} onClick={() => { addTag(customTag.trim()); setCustomTag(''); }}>
            Agregar
          </Button>
        </div>
      </PanelCard>
    </div>
  );
}

const tagPillStyle = (tone) => {
  const map = {
    green:  { bg: COLORS.greenSoft,   fg: COLORS.greenDeep },
    amber:  { bg: '#FFF7E6',          fg: '#B45309' },
    purple: { bg: COLORS.purpleSoft,  fg: COLORS.purple },
    stone:  { bg: COLORS.mist,        fg: COLORS.stone },
  };
  const t = map[tone] || map.stone;
  return {
    background: t.bg, color: t.fg, border: 'none',
    padding: '6px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, fontFamily: FONTS.body,
  };
};

// ─── SUB-TAB · PREFERENCES ──────────────────────────────────────────────────
function PreferencesTab({ client, onUpdate, onToast }) {
  const p = client.preferences;
  const [notes, setNotes] = useStateCli(p.notes || '');
  const [saveState, setSaveState] = useStateCli('idle'); // idle | saving | saved
  const saveTimer = useRefCli(null);

  // 🔌 API: PATCH /api/clients/:id/preferences  (debounced 800ms)
  useEffectCli(() => {
    if (notes === (p.notes || '')) return;
    setSaveState('saving');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      onUpdate({ preferences: { ...p, notes } });
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 1200);
    }, 800);
    return () => clearTimeout(saveTimer.current);
  }, [notes]);

  const toggleTopic = (t) => {
    const has = p.topics.includes(t);
    onUpdate({ preferences: { ...p, topics: has ? p.topics.filter(x => x !== t) : [...p.topics, t] } });
  };
  const toggleDrink = (d) => {
    const has = p.drinks.includes(d);
    onUpdate({ preferences: { ...p, drinks: has ? p.drinks.filter(x => x !== d) : [...p.drinks, d] } });
  };
  const setDiet = (v) => {
    onUpdate({ preferences: { ...p, diet: v } });
    onToast(v ? '🥗 Marcado en dieta' : 'Quitado de dieta');
  };

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <PanelCard title="Temas de conversación" subtitle="Lo que le gusta hablar mientras lo atendés">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {CONVO_TOPICS.map(t => {
            const sel = p.topics.includes(t);
            return (
              <button key={t} onClick={() => toggleTopic(t)} style={{
                background: sel ? COLORS.green : COLORS.white,
                color: sel ? COLORS.white : COLORS.stone,
                border: `1px solid ${sel ? COLORS.green : COLORS.line}`,
                padding: '7px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 600,
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
                fontFamily: FONTS.body, transition: 'all 150ms',
              }}>
                {sel && <Icon name="check" size={11} strokeWidth={2.6} />}
                {t}
              </button>
            );
          })}
        </div>
      </PanelCard>

      <PanelCard title="Restricciones" subtitle="Aparecerá un badge en su perfil y en la cita">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.ink }}>En dieta 🥗</div>
            <div style={{ fontSize: 12.5, color: COLORS.stone, marginTop: 3 }}>Evitá ofrecer dulces o snacks azucarados.</div>
          </div>
          <Toggle on={p.diet} onChange={setDiet} />
        </div>
      </PanelCard>

      <PanelCard title="Bebidas preferidas" subtitle="Si tu negocio ofrece bebidas, te sugiere preparar la favorita">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {DRINK_OPTIONS.map(d => {
            const sel = p.drinks.includes(d);
            return (
              <button key={d} onClick={() => toggleDrink(d)} style={{
                background: sel ? COLORS.greenSoft : COLORS.white,
                color: sel ? COLORS.greenDeep : COLORS.stone,
                border: `1px solid ${sel ? COLORS.green : COLORS.line}`,
                padding: '7px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                fontFamily: FONTS.body, transition: 'all 150ms',
              }}>
                <span style={{
                  width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${sel ? COLORS.green : COLORS.line}`,
                  background: sel ? COLORS.green : COLORS.white,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {sel && <Icon name="check" size={10} color={COLORS.white} strokeWidth={3} />}
                </span>
                {d}
              </button>
            );
          })}
        </div>
        {p.drinks.length > 0 && (
          <div style={{
            marginTop: 16, padding: 12, background: COLORS.greenSoft, borderRadius: 8,
            display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: COLORS.greenDeep,
          }}>
            <Icon name="sparkles" size={15} />
            <span>Cuando agendes a {client.name.split(' ')[0]}, te sugeriremos: <b>preparar {p.drinks[0]}</b>.</span>
          </div>
        )}
      </PanelCard>

      <PanelCard
        title="Notas personales"
        subtitle="Guardado automático"
        headerExtra={
          <div style={{ fontSize: 11.5, color: saveState === 'saved' ? COLORS.greenDeep : COLORS.stoneSoft, fontFamily: FONTS.mono, display: 'flex', alignItems: 'center', gap: 5 }}>
            {saveState === 'saving' && <><span className="bylo-spinner" style={{ borderColor: 'rgba(0,0,0,0.15)', borderTopColor: COLORS.stone, width: 10, height: 10, borderWidth: 1.5 }} />guardando…</>}
            {saveState === 'saved'  && <><Icon name="check" size={12} color={COLORS.greenDeep} strokeWidth={2.6} /> guardado</>}
            {saveState === 'idle'   && '·'}
          </div>
        }
      >
        <textarea
          value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Cualquier detalle que quieras recordar de este cliente…"
          rows={5}
          style={{ ...inputStyle(false), resize: 'vertical', minHeight: 100, fontFamily: FONTS.body }}
        />
      </PanelCard>
    </div>
  );
}

// ─── SUB-TAB · REMINDER ─────────────────────────────────────────────────────
function ReminderTab({ client, onUpdate, onToast, businessName, slug }) {
  const [previewOpen, setPreviewOpen] = useStateCli(false);
  const [custom, setCustom] = useStateCli(client.reminderDays);
  const presets = [15, 30, 45];
  const message = reminderMessage(client, businessName, slug);
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <PanelCard title="Recordatorio automático" subtitle="Te avisamos cuando es momento de invitar a este cliente">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Recordatorio activado</div>
            <div style={{ fontSize: 12.5, color: COLORS.stone, marginTop: 3 }}>
              Se envía cuando pasa el tiempo configurado sin que vuelva.
            </div>
          </div>
          <Toggle on={client.reminderEnabled} onChange={v => {
            // 🔌 API: PATCH /api/clients/:id/reminder { enabled, days }
            onUpdate({ reminderEnabled: v });
            onToast(v ? 'Recordatorio activado' : 'Recordatorio pausado');
          }} />
        </div>

        <div style={{
          paddingTop: 18, borderTop: `1px solid ${COLORS.line}`, display: 'grid', gap: 14,
          opacity: client.reminderEnabled ? 1 : 0.5, pointerEvents: client.reminderEnabled ? 'auto' : 'none',
        }}>
          <div style={{ fontSize: 13, color: COLORS.stone }}>Frecuencia del recordatorio</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {presets.map(d => (
              <button key={d} onClick={() => { setCustom(d); onUpdate({ reminderDays: d }); }} style={{
                background: client.reminderDays === d ? COLORS.ink : COLORS.white,
                color: client.reminderDays === d ? COLORS.white : COLORS.ink,
                border: `1px solid ${client.reminderDays === d ? COLORS.ink : COLORS.line}`,
                padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: FONTS.body, transition: 'all 150ms',
              }}>{d} días</button>
            ))}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 'auto' }}>
              <span style={{ fontSize: 12, color: COLORS.stoneSoft, fontFamily: FONTS.mono }}>personalizado</span>
              <input type="number" min={1} max={365}
                value={custom}
                onChange={e => { const v = Number(e.target.value); setCustom(v); }}
                onBlur={() => onUpdate({ reminderDays: custom })}
                style={{ ...inputStyle(false), width: 80, padding: '8px 10px' }}
              />
            </div>
          </div>
        </div>
      </PanelCard>

      <PanelCard title="Vista previa del mensaje" subtitle="Esto recibirá tu cliente por WhatsApp">
        <div style={{
          background: COLORS.chatBg, padding: 18, borderRadius: 12,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)',
          backgroundSize: '14px 14px',
        }}>
          <div style={{
            background: COLORS.white, padding: '10px 14px',
            borderRadius: 10, borderTopLeftRadius: 2,
            maxWidth: 360, fontSize: 14, lineHeight: 1.45, color: COLORS.ink,
            boxShadow: '0 1px 1px rgba(0,0,0,0.08)',
          }}>
            {message}
            <div style={{ fontSize: 10.5, color: COLORS.stoneSoft, marginTop: 6, textAlign: 'right' }}>
              {formatTime(new Date().toISOString())}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <Button variant="green" icon="send" onClick={() => {
            // 🔌 API: POST /api/reminders/send { clientId, businessId }
            setPreviewOpen(true);
          }}>
            Enviar recordatorio ahora
          </Button>
          <Button variant="secondary" icon="copy" onClick={() => {
            try { navigator.clipboard.writeText(message); } catch (e) {}
            onToast('Mensaje copiado al portapapeles');
          }}>
            Copiar
          </Button>
        </div>
      </PanelCard>

      {previewOpen && (
        <Modal onClose={() => setPreviewOpen(false)} title="Recordatorio enviado">
          <div style={{ display: 'grid', gap: 16, padding: '4px 0 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: COLORS.greenSoft,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="check" size={22} color={COLORS.green} strokeWidth={3} />
              </div>
              <div>
                <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 17, letterSpacing: '-0.01em' }}>
                  Mensaje enviado a {client.name}
                </div>
                <div style={{ fontSize: 13, color: COLORS.stone, marginTop: 3, fontFamily: FONTS.mono }}>
                  {client.phone}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: COLORS.stoneSoft, fontFamily: FONTS.mono }}>
              demo · en producción se envía vía WhatsApp Business API / Twilio
            </div>
          </div>
          <Button style={{ width: '100%' }} onClick={() => setPreviewOpen(false)}>Entendido</Button>
        </Modal>
      )}
    </div>
  );
}

// ─── SUB-TAB · LOYALTY DETAIL ───────────────────────────────────────────────
function LoyaltyDetailTab({ client, onUpdate, onToast, onCelebrate }) {
  const complete = client.loyaltyPoints >= client.loyaltyGoal;
  const punches = Array.from({ length: client.loyaltyGoal }, (_, i) => i < client.loyaltyPoints);
  const addPoint = () => {
    if (client.loyaltyPoints < client.loyaltyGoal) {
      onUpdate({ loyaltyPoints: client.loyaltyPoints + 1 });
    }
  };
  const redeem = () => {
    // 🔌 API: POST /api/loyalty/redeem { clientId }
    onCelebrate();
    onUpdate({ loyaltyPoints: 0, redeemed: (client.redeemed || 0) + 1 });
    setTimeout(() => onToast(`🎉 ¡${client.name.split(' ')[0]} canjeó su corte gratis!`), 200);
  };

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <PanelCard title="Progreso de fidelidad" subtitle={`${client.loyaltyPoints} de ${client.loyaltyGoal} cortes para el corte gratis`}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22, justifyContent: 'center' }}>
          {punches.map((filled, i) => (
            <div key={i} style={{
              width: 52, height: 52, borderRadius: '50%',
              background: filled ? COLORS.green : COLORS.white,
              border: `2px solid ${filled ? COLORS.green : COLORS.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: filled ? COLORS.white : COLORS.stoneSoft,
              fontFamily: FONTS.display, fontWeight: 800, fontSize: 16,
              transition: 'all 320ms cubic-bezier(.2,.7,.2,1)',
              boxShadow: filled ? '0 4px 12px -4px rgba(0,196,106,0.5)' : 'none',
              animation: filled ? `bylo-pop 320ms ${i * 30}ms both` : 'none',
            }}>
              {filled ? <Icon name="check" size={20} color={COLORS.white} strokeWidth={3} /> : i + 1}
            </div>
          ))}
        </div>

        {complete ? (
          <div style={{
            background: COLORS.greenSoft, border: `2px solid ${COLORS.green}`, borderRadius: 14,
            padding: 20, display: 'grid', gap: 14, textAlign: 'center',
          }}>
            <div style={{ fontSize: 36 }}>🎉</div>
            <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 22, color: COLORS.ink, letterSpacing: '-0.02em' }}>
              ¡Corte gratis desbloqueado!
            </div>
            <div style={{ fontSize: 13.5, color: COLORS.greenDeep }}>
              {client.name} completó {client.loyaltyGoal} cortes. Canjeá ahora para reiniciar el ciclo.
            </div>
            <Button variant="green" icon="sparkles" onClick={redeem} style={{ justifySelf: 'center' }}>
              Canjear recompensa
            </Button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: COLORS.stone, fontSize: 13.5 }}>
            Faltan <b style={{ color: COLORS.ink }}>{client.loyaltyGoal - client.loyaltyPoints}</b> cortes para el corte gratis.
            <div style={{ marginTop: 14 }}>
              <Button variant="secondary" icon="plus" onClick={addPoint}>
                Registrar un corte
              </Button>
            </div>
          </div>
        )}
      </PanelCard>

      <PanelCard title="Historial de canjes" subtitle={`${client.redeemed || 0} recompensas canjeadas`}>
        {(!client.redeemed || client.redeemed === 0) ? (
          <div style={{ fontSize: 13, color: COLORS.stoneSoft, fontStyle: 'italic' }}>
            {client.name.split(' ')[0]} todavía no ha canjeado ninguna recompensa.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {Array.from({ length: client.redeemed }).map((_, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px', background: COLORS.mist, borderRadius: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon name="sparkles" size={15} color={COLORS.purple} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Corte gratis #{i + 1}</span>
                </div>
                <span style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.stone }}>
                  ciclo completado
                </span>
              </div>
            ))}
          </div>
        )}
      </PanelCard>
    </div>
  );
}

// ─── SUB-TAB · HISTORY ──────────────────────────────────────────────────────
function HistoryTab({ client }) {
  const history = useMemoCli(() => generateClientHistory(client), [client.id, client.visits]);
  return (
    <PanelCard title="Historial completo" subtitle={`${history.length} citas registradas`}>
      {history.length === 0 ? (
        <div style={{ fontSize: 13, color: COLORS.stoneSoft }}>Sin citas anteriores.</div>
      ) : (
        <div style={{ display: 'grid', gap: 0 }}>
          {history.map((h, i) => (
            <div key={h.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 16, alignItems: 'center',
              padding: '14px 0', borderBottom: i === history.length - 1 ? 'none' : `1px solid ${COLORS.line}`,
            }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{h.service}</div>
                <div style={{ fontSize: 12, color: COLORS.stoneSoft, marginTop: 2, fontFamily: FONTS.mono }}>
                  {formatDate(h.date)}
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: COLORS.stone, fontFamily: FONTS.mono }}>
                {daysAgoLabel(h.date)}
              </div>
              {h.usedReward ? <Badge color="purple" icon="sparkles">Recompensa</Badge> : <span />}
              <div style={{ fontFamily: FONTS.mono, fontSize: 13.5, fontWeight: 500 }}>{formatCRC(h.price)}</div>
            </div>
          ))}
        </div>
      )}
    </PanelCard>
  );
}

// ─── UTILITY COMPONENTS ─────────────────────────────────────────────────────
function PanelCard({ title, subtitle, children, headerExtra }) {
  return (
    <section style={{
      background: COLORS.white, borderRadius: 14, border: `1px solid ${COLORS.line}`,
      padding: 24, boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06)',
    }}>
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 18, gap: 16,
      }}>
        <div>
          <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 17, letterSpacing: '-0.01em' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 13, color: COLORS.stone, marginTop: 3 }}>{subtitle}</div>}
        </div>
        {headerExtra}
      </header>
      {children}
    </section>
  );
}

function Toggle({ on, onChange, size = 'md' }) {
  const dims = size === 'sm' ? { w: 34, h: 20, k: 16, x: 14 } : { w: 44, h: 26, k: 20, x: 18 };
  return (
    <button onClick={() => onChange(!on)} style={{
      width: dims.w, height: dims.h, borderRadius: 999, padding: 3,
      background: on ? COLORS.green : COLORS.line, border: 'none',
      cursor: 'pointer', transition: 'background 220ms', flexShrink: 0,
    }}>
      <div style={{
        width: dims.k, height: dims.k, borderRadius: '50%', background: COLORS.white,
        transform: `translateX(${on ? dims.x : 0}px)`, transition: 'transform 220ms cubic-bezier(.2,.7,.2,1)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

function Modal({ title, onClose, children, width = 460 }) {
  useEffectCli(() => {
    const onKey = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,20,25,0.5)', zIndex: 300,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      animation: 'bylo-fadeup 200ms',
    }}>
      <div onClick={e => e.stopPropagation()} className="bylo-pop" style={{
        background: COLORS.white, borderRadius: 20, padding: 28,
        width: '100%', maxWidth: width, boxShadow: SHADOWS.lg,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>{title}</div>
          <button onClick={onClose} style={{ border: 'none', background: COLORS.mist, cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.stone }}>
            <Icon name="x" size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

window.ClientsTab = ClientsTab;
window.PanelCard  = PanelCard;
window.Toggle     = Toggle;
window.Modal      = Modal;
window.LoyaltyMini = LoyaltyMini;

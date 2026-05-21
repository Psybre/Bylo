// ─── BYLO ONBOARDING ────────────────────────────────────────────────────────
const { useState: useStateOnb, useRef: useRefOnb } = React;

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DEFAULT_HOURS = [
  { day: 1, active: true,  open: '08:00', close: '18:00' },
  { day: 2, active: true,  open: '08:00', close: '18:00' },
  { day: 3, active: true,  open: '08:00', close: '18:00' },
  { day: 4, active: true,  open: '08:00', close: '18:00' },
  { day: 5, active: true,  open: '08:00', close: '18:00' },
  { day: 6, active: true,  open: '09:00', close: '15:00' },
  { day: 0, active: false, open: '09:00', close: '13:00' },
];

function Onboarding({ onNavigate }) {
  const [name, setName]       = useStateOnb('');
  const [phone, setPhone]     = useStateOnb('');
  const [country, setCountry] = useStateOnb('CR');
  const [services, setServices] = useStateOnb([
    { id: 's1', name: '', basePrice: '', durationMin: 30, description: '', rules: [] },
  ]);
  const [hours, setHours] = useStateOnb(DEFAULT_HOURS);
  const [submitting, setSubmitting] = useStateOnb(false);
  const [toast, setToast] = useStateOnb(null);
  const [errors, setErrors] = useStateOnb({});
  const [touched, setTouched] = useStateOnb({});

  const validate = () => {
    const e = {};
    if (!name.trim())  e.name  = 'Requerido';
    if (!phone.trim()) e.phone = 'Requerido';
    services.forEach((s, i) => {
      if (!s.name.trim())                       e[`s_${i}_name`]  = 'Requerido';
      if (!s.basePrice || Number(s.basePrice) <= 0) e[`s_${i}_price`] = 'Requerido';
    });
    return e;
  };

  const liveErrors = validate();
  const canSubmit = Object.keys(liveErrors).length === 0;

  const showError = (key) => touched[key] && liveErrors[key];

  const handleSubmit = async () => {
    setTouched(Object.fromEntries(Object.keys(liveErrors).map(k => [k, true])));
    if (!canSubmit) return;
    setSubmitting(true);
    // 🔌 API: POST /api/businesses
    //   Body: { name, phone, country, services, pricingRules, openingHours }
    //   Response: { business: Business, chatUrl: string }
    await new Promise(r => setTimeout(r, 1400));
    setSubmitting(false);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'mi-negocio';
    const url = `bylo.app/chat/${slug}`;
    try { navigator.clipboard?.writeText('https://' + url); } catch (e) {}
    setToast({ url, slug });
    setTimeout(() => setToast(null), 6000);
  };

  return (
    <div data-screen-label="03 Onboarding" style={{
      minHeight: '100vh', background: COLORS.mist, padding: '40px 20px 80px',
    }}>
      <OnbHeader onNavigate={onNavigate} />

      <div style={{ maxWidth: 760, margin: '40px auto 0', display: 'grid', gap: 16 }}>
        <SectionCard
          n="01"
          title="Datos del negocio"
          subtitle="¿Cómo te conocen tus clientes?"
        >
          <div style={{ display: 'grid', gap: 16 }}>
            <Field label="Nombre del negocio" error={showError('name')}>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, name: true }))}
                placeholder="Ej: Barbería Don Pepe"
                style={inputStyle(!!showError('name'))}
              />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <Field label="Teléfono WhatsApp" error={showError('phone')}>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, phone: true }))}
                  placeholder="+506 8888-0000"
                  style={inputStyle(!!showError('phone'))}
                />
              </Field>
              <Field label="País">
                <select
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  style={inputStyle(false)}
                >
                  <option value="CR">🇨🇷 Costa Rica</option>
                  <option value="MX">🇲🇽 México</option>
                  <option value="CO">🇨🇴 Colombia</option>
                  <option value="AR">🇦🇷 Argentina</option>
                  <option value="ES">🇪🇸 España</option>
                </select>
              </Field>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          n="02"
          title="Servicios"
          subtitle="Lo que ofrecés. Mínimo 1, máximo 8."
          headerExtra={
            <Button size="sm" variant="secondary" icon="plus"
              onClick={() => services.length < 8 && setServices([...services, {
                id: `s${Date.now()}`, name: '', basePrice: '', durationMin: 30, description: '', rules: [],
              }])}
              disabled={services.length >= 8}
            >Agregar servicio</Button>
          }
        >
          <div style={{ display: 'grid', gap: 12 }}>
            {services.map((s, i) => (
              <ServiceRow
                key={s.id}
                index={i}
                service={s}
                showErrorName={showError(`s_${i}_name`)}
                showErrorPrice={showError(`s_${i}_price`)}
                onTouch={(k) => setTouched(t => ({ ...t, [`s_${i}_${k}`]: true }))}
                canRemove={services.length > 1}
                onRemove={() => setServices(services.filter((_, j) => j !== i))}
                onChange={(patch) => setServices(services.map((srv, j) => j === i ? { ...srv, ...patch } : srv))}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          n="03"
          title="Horario laboral"
          subtitle="Cuándo estás abierto. Activá o desactivá cada día."
        >
          <div style={{ display: 'grid', gap: 4 }}>
            {hours.map((h, i) => (
              <HourRow
                key={h.day}
                row={h}
                onChange={(patch) => setHours(hours.map((r, j) => j === i ? { ...r, ...patch } : r))}
              />
            ))}
          </div>
        </SectionCard>

        <div style={{
          background: COLORS.white, borderRadius: 16, border: `1px solid ${COLORS.line}`,
          padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 24, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>
              Tu link público
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.stone, marginTop: 4 }}>
              bylo.app/chat/{name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || '...' : '...'}
            </div>
          </div>
          <Button size="lg" icon="arrow" onClick={handleSubmit} disabled={!canSubmit || submitting}>
            {submitting ? (<><span className="bylo-spinner" style={{ marginRight: 8 }} />Creando…</>) : 'Crear mi link de Bylo'}
          </Button>
        </div>
      </div>

      {toast && <SuccessToast url={toast.url} slug={toast.slug} onChat={() => onNavigate('chat')} onDashboard={() => onNavigate('dashboard')} />}
    </div>
  );
}

function OnbHeader({ onNavigate }) {
  return (
    <div style={{ display: 'grid', gap: 24, justifyItems: 'center', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: 760, alignItems: 'center' }}>
        <button onClick={() => onNavigate('landing')} style={{
          border: 'none', background: 'transparent', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6, color: COLORS.stone, fontSize: 13, padding: 0,
        }}>
          <Icon name="arrowLeft" size={16} /> Volver
        </button>
        <Logo />
        <div style={{ width: 60 }} />
      </div>
      <div style={{ display: 'grid', gap: 12, maxWidth: 600, marginTop: 8 }}>
        <Kicker>Onboarding</Kicker>
        <h1 style={{
          fontFamily: FONTS.display, fontWeight: 800,
          fontSize: 'clamp(32px, 4vw, 44px)', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.05,
        }}>
          Configurá tu negocio en 5 minutos
        </h1>
        <div style={{ color: COLORS.stone, fontSize: 16, lineHeight: 1.5 }}>
          Tres secciones. Sin tarjeta. Tu link queda listo al final.
        </div>
      </div>
    </div>
  );
}

function SectionCard({ n, title, subtitle, headerExtra, children }) {
  return (
    <section style={{
      background: COLORS.white, borderRadius: 16, border: `1px solid ${COLORS.line}`,
      padding: 28,
    }}>
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16,
        marginBottom: 24, paddingBottom: 18, borderBottom: `1px solid ${COLORS.line}`,
      }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{
            fontFamily: FONTS.mono, fontSize: 11, color: COLORS.stoneSoft,
            background: COLORS.mist, padding: '4px 8px', borderRadius: 6, marginTop: 4,
          }}>{n}</div>
          <div>
            <div style={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>
              {title}
            </div>
            <div style={{ color: COLORS.stone, fontSize: 14, marginTop: 4 }}>{subtitle}</div>
          </div>
        </div>
        {headerExtra}
      </header>
      {children}
    </section>
  );
}

function Field({ label, error, children, hint }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <div style={{
        fontFamily: FONTS.mono, fontSize: 11, color: COLORS.stone,
        letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500,
      }}>{label}</div>
      {children}
      {(error || hint) && (
        <div style={{ fontSize: 12, color: error ? COLORS.warn : COLORS.stoneSoft }}>
          {error || hint}
        </div>
      )}
    </label>
  );
}

const inputStyle = (hasError) => ({
  width: '100%', padding: '12px 14px', borderRadius: 8,
  border: `1px solid ${hasError ? COLORS.warn : COLORS.line}`,
  background: COLORS.white, fontSize: 14, color: COLORS.ink, outline: 'none',
  transition: 'border-color 150ms, box-shadow 150ms',
  fontFamily: FONTS.body,
});

function ServiceRow({ index, service, showErrorName, showErrorPrice, onTouch, onChange, canRemove, onRemove }) {
  const [open, setOpen] = useStateOnb(false);
  return (
    <div style={{
      border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 16, background: COLORS.white,
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 10, alignItems: 'flex-start',
      }}>
        <Field label={`Servicio ${index + 1}`} error={showErrorName}>
          <input
            value={service.name}
            onChange={e => onChange({ name: e.target.value })}
            onBlur={() => onTouch('name')}
            placeholder="Ej: Corte clásico"
            style={inputStyle(!!showErrorName)}
          />
        </Field>
        <Field label="Precio (₡)" error={showErrorPrice}>
          <input
            type="number"
            value={service.basePrice}
            onChange={e => onChange({ basePrice: e.target.value })}
            onBlur={() => onTouch('price')}
            placeholder="8000"
            style={inputStyle(!!showErrorPrice)}
          />
        </Field>
        <Field label="Duración (min)">
          <input
            type="number"
            value={service.durationMin}
            onChange={e => onChange({ durationMin: Number(e.target.value) || 0 })}
            style={inputStyle(false)}
          />
        </Field>
        <div style={{ paddingTop: 22 }}>
          {canRemove && (
            <button onClick={onRemove} style={{
              border: 'none', background: 'transparent', cursor: 'pointer',
              color: COLORS.stoneSoft, padding: 8, display: 'flex',
            }}>
              <Icon name="x" size={16} />
            </button>
          )}
        </div>
      </div>
      <Field label="Descripción" hint="Opcional. Lo verá tu cliente.">
        <input
          value={service.description}
          onChange={e => onChange({ description: e.target.value })}
          placeholder="Ej: Corte tijera o máquina"
          style={{ ...inputStyle(false), marginTop: 12 }}
        />
      </Field>

      <button onClick={() => setOpen(!open)} style={{
        marginTop: 16, border: 'none', background: 'transparent', cursor: 'pointer',
        color: COLORS.stone, fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6,
        padding: 0, fontFamily: FONTS.body, fontWeight: 500,
      }}>
        <Icon name={open ? 'chevronDown' : 'chevron'} size={14} />
        Reglas de precio variables ({service.rules.length})
      </button>
      {open && (
        <div className="bylo-fadeup" style={{ marginTop: 14, display: 'grid', gap: 8, padding: 14, background: COLORS.mist, borderRadius: 10 }}>
          {service.rules.length === 0 && (
            <div style={{ fontSize: 12.5, color: COLORS.stone }}>
              Si el precio cambia por género, largo, tipo, etc. agregá una regla.
            </div>
          )}
          {service.rules.map((r, ri) => (
            <div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 90px auto', gap: 8, alignItems: 'center' }}>
              <input value={r.attribute}    onChange={e => onChange({ rules: service.rules.map((x, xi) => xi === ri ? { ...x, attribute: e.target.value } : x) })} placeholder="atributo" style={{ ...inputStyle(false), padding: '8px 10px' }} />
              <input value={r.value}        onChange={e => onChange({ rules: service.rules.map((x, xi) => xi === ri ? { ...x, value: e.target.value } : x) })}     placeholder="valor"    style={{ ...inputStyle(false), padding: '8px 10px' }} />
              <input type="number" value={r.modifier} onChange={e => onChange({ rules: service.rules.map((x, xi) => xi === ri ? { ...x, modifier: Number(e.target.value) } : x) })} placeholder="0" style={{ ...inputStyle(false), padding: '8px 10px' }} />
              <select value={r.modifierType} onChange={e => onChange({ rules: service.rules.map((x, xi) => xi === ri ? { ...x, modifierType: e.target.value } : x) })} style={{ ...inputStyle(false), padding: '8px 10px' }}>
                <option value="ADD">+ ₡</option>
                <option value="SUBTRACT">- ₡</option>
                <option value="PERCENT">%</option>
              </select>
              <button onClick={() => onChange({ rules: service.rules.filter((_, xi) => xi !== ri) })} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: COLORS.stoneSoft, padding: 4 }}>
                <Icon name="x" size={14} />
              </button>
            </div>
          ))}
          <Button size="sm" variant="ghost" icon="plus"
            onClick={() => onChange({ rules: [...service.rules, { attribute: '', value: '', modifier: 0, modifierType: 'ADD' }] })}
            style={{ justifySelf: 'start', color: COLORS.green, border: 'none', padding: '6px 0' }}
          >
            Agregar regla
          </Button>
        </div>
      )}
    </div>
  );
}

function HourRow({ row, onChange }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: 12, alignItems: 'center',
      padding: '12px 0', borderBottom: `1px solid ${COLORS.line}`,
    }}>
      <button
        onClick={() => onChange({ active: !row.active })}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: 'transparent',
          cursor: 'pointer', padding: 0, minWidth: 140,
        }}
      >
        <div style={{
          width: 34, height: 20, borderRadius: 999, padding: 2,
          background: row.active ? COLORS.green : COLORS.line,
          transition: 'background 200ms', flexShrink: 0,
        }}>
          <div style={{
            width: 16, height: 16, borderRadius: '50%', background: COLORS.white,
            transform: `translateX(${row.active ? 14 : 0}px)`, transition: 'transform 200ms',
          }} />
        </div>
        <span style={{
          fontFamily: FONTS.body, fontWeight: 600, fontSize: 14,
          color: row.active ? COLORS.ink : COLORS.stoneSoft, width: 60, textAlign: 'left',
        }}>
          {DAY_NAMES[row.day]}
        </span>
      </button>
      <input
        type="time" value={row.open} disabled={!row.active}
        onChange={e => onChange({ open: e.target.value })}
        style={{ ...inputStyle(false), padding: '8px 10px', opacity: row.active ? 1 : 0.4 }}
      />
      <input
        type="time" value={row.close} disabled={!row.active}
        onChange={e => onChange({ close: e.target.value })}
        style={{ ...inputStyle(false), padding: '8px 10px', opacity: row.active ? 1 : 0.4 }}
      />
    </div>
  );
}

function SuccessToast({ url, slug, onChat, onDashboard }) {
  return (
    <div className="bylo-pop" style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: COLORS.ink, color: COLORS.white, borderRadius: 16, padding: 18,
      boxShadow: SHADOWS.lg, display: 'grid', gap: 14, zIndex: 100,
      maxWidth: 520, width: 'calc(100% - 40px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', background: COLORS.green,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="check" size={16} color={COLORS.white} strokeWidth={3} />
        </div>
        <div>
          <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 15 }}>
            ¡Listo! Tu link está activo
          </div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 12, opacity: 0.85, marginTop: 2 }}>
            {url} · copiado al portapapeles
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button size="sm" variant="green" icon="chat" onClick={onChat}>Probar el chat</Button>
        <Button size="sm" variant="secondary" icon="arrow" onClick={onDashboard}>Ver mi panel</Button>
      </div>
    </div>
  );
}

window.Onboarding = Onboarding;
window.Field = Field;
window.inputStyle = inputStyle;

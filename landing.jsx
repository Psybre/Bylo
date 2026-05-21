// ─── BYLO LANDING ───────────────────────────────────────────────────────────
const { useState, useEffect, useRef } = React;

function Landing({ onNavigate }) {
  return (
    <div data-screen-label="01 Landing" style={{ background: COLORS.white, minHeight: '100vh', color: COLORS.ink }}>
      <LandingNav onNavigate={onNavigate} />
      <LandingHero onNavigate={onNavigate} />
      <LandingHow />
      <LandingStat />
      <LandingIndustries />
      <LandingCTA onNavigate={onNavigate} />
      <LandingFooter />
    </div>
  );
}

function LandingNav({ onNavigate }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'saturate(180%) blur(10px)',
      borderBottom: `1px solid ${COLORS.line}`,
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '16px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Logo size={22} />
        <nav style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <a href="#how"        onClick={e => e.preventDefault()} style={navLinkStyle}>Cómo funciona</a>
          <a href="#industries" onClick={e => e.preventDefault()} style={navLinkStyle}>Para quién</a>
          <a href="#chat"       onClick={e => { e.preventDefault(); onNavigate('chat'); }} style={navLinkStyle}>Ver demo</a>
        </nav>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>Entrar</Button>
          <Button variant="primary" size="sm" icon="arrow" onClick={() => onNavigate('onboarding')}>
            Crear mi link gratis
          </Button>
        </div>
      </div>
    </header>
  );
}
const navLinkStyle = { fontSize: 14, color: COLORS.stone, textDecoration: 'none', fontWeight: 500 };

function LandingHero({ onNavigate }) {
  return (
    <section style={{
      maxWidth: 1200, margin: '0 auto', padding: '88px 32px 56px',
      display: 'grid', gap: 56,
    }}>
      <div style={{ maxWidth: 820, display: 'grid', gap: 28 }}>
        <Kicker>Para negocios de servicios</Kicker>
        <h1 style={{
          fontFamily: FONTS.display, fontWeight: 800,
          fontSize: 'clamp(44px, 6.5vw, 84px)', lineHeight: 0.98,
          letterSpacing: '-0.04em', margin: 0, color: COLORS.ink,
          textWrap: 'pretty',
        }}>
          Tus clientes te escriben.<br />
          <span style={{ color: COLORS.stone }}>Bylo agenda la cita.</span>
        </h1>
        <p style={{
          fontSize: 19, lineHeight: 1.55, color: COLORS.stone, margin: 0,
          maxWidth: 600, fontWeight: 400,
        }}>
          Una IA conversacional cotiza y agenda en tu chat 24/7. Vos solo aceptás
          las citas cuando aparecen en tu panel. Cero respuestas manuales.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button size="lg" icon="arrow" onClick={() => onNavigate('onboarding')}>
            Crear mi link gratis
          </Button>
          <Button size="lg" variant="secondary" icon="chat" onClick={() => onNavigate('chat')}>
            Probar el chat
          </Button>
          <span style={{ fontSize: 13, color: COLORS.stoneSoft, marginLeft: 8 }}>
            Sin tarjeta · 30 segundos
          </span>
        </div>
      </div>

      <HeroMockup />
    </section>
  );
}

function HeroMockup() {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 24,
      alignItems: 'stretch',
    }}>
      {/* Phone-style chat preview */}
      <div style={{
        background: COLORS.chatBg, borderRadius: 24, padding: 28,
        boxShadow: SHADOWS.lg, border: `1px solid ${COLORS.line}`,
        position: 'relative', overflow: 'hidden', minHeight: 440,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)',
          backgroundSize: '14px 14px', opacity: 0.6,
        }} />
        <div style={{ position: 'relative', display: 'grid', gap: 12, maxWidth: 380, margin: '24px auto 0' }}>
          <ChatBubblePreview side="bot" text="¡Hola! Soy el asistente de Barbería Don Pepe 💈 ¿En qué te ayudo?" time="10:32" />
          <ChatBubblePreview side="user" text="quiero un corte + barba" time="10:32" />
          <ChatBubblePreview side="bot" text="Perfecto. ¿Tenés barba larga o corta?" time="10:32" />
          <ChatBubblePreview side="user" text="larga" time="10:33" />
          <ChatBubblePreview side="bot" text="Precio final: ₡14,000. Tengo disponible mañana a las 10:00, 11:30 o 14:00 ¿cuál te viene?" time="10:33" highlight />
        </div>
      </div>
      {/* Dashboard preview */}
      <div style={{
        background: COLORS.white, borderRadius: 24, padding: 28,
        boxShadow: SHADOWS.lg, border: `1px solid ${COLORS.line}`,
        display: 'grid', gap: 14, minHeight: 440,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Kicker>Panel · Don Pepe</Kicker>
            <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 22, marginTop: 6, letterSpacing: '-0.02em' }}>
              Citas pendientes
            </div>
          </div>
          <Badge color="ink">3 nuevas</Badge>
        </div>
        {MOCK_BOOKINGS.slice(0, 3).map((b, i) => (
          <PendingPreviewCard key={b.id} booking={b} idx={i} />
        ))}
        <div style={{
          marginTop: 'auto', padding: 14, background: COLORS.greenSoft,
          borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Icon name="zap" size={16} color={COLORS.greenDeep} />
          <span style={{ fontSize: 13, color: COLORS.greenDeep, fontWeight: 600 }}>
            Realtime activo · llegan sin recargar
          </span>
        </div>
      </div>
    </div>
  );
}

function ChatBubblePreview({ side, text, time, highlight }) {
  const isUser = side === 'user';
  return (
    <div style={{
      display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
      animation: 'bylo-fadeup 480ms both',
    }}>
      <div style={{
        maxWidth: '80%', padding: '8px 12px 6px',
        background: isUser ? COLORS.green : COLORS.white,
        color: isUser ? COLORS.white : COLORS.ink,
        borderRadius: 10,
        borderTopLeftRadius:  isUser ? 10 : 2,
        borderTopRightRadius: isUser ? 2  : 10,
        fontSize: 13.5, lineHeight: 1.45,
        boxShadow: '0 1px 1px rgba(0,0,0,0.08)',
        outline: highlight ? `2px solid ${COLORS.greenDeep}` : 'none',
        outlineOffset: 2,
      }}>
        {text}
        <div style={{
          fontSize: 10, opacity: 0.7, textAlign: 'right', marginTop: 2,
          color: isUser ? 'rgba(255,255,255,0.85)' : COLORS.stoneSoft,
        }}>
          {time}
        </div>
      </div>
    </div>
  );
}

function PendingPreviewCard({ booking, idx }) {
  return (
    <div style={{
      padding: 12, borderRadius: 12, border: `1px solid ${COLORS.line}`,
      display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, alignItems: 'center',
      animation: `bylo-fadeup ${300 + idx * 80}ms both`,
    }}>
      <Avatar name={booking.customer.name} size={36} bg={COLORS.mist} color={COLORS.ink} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: COLORS.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {booking.customer.name}
        </div>
        <div style={{ fontSize: 12, color: COLORS.stone, marginTop: 2 }}>
          {booking.service.name} · {formatTime(booking.slot.startAt)}
        </div>
      </div>
      <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.ink, fontWeight: 500 }}>
        {formatCRC(booking.quotedPrice)}
      </div>
    </div>
  );
}

function LandingHow() {
  const steps = [
    { n: '01', title: 'Configurás', body: 'Servicios, precios y horario. Toma 5 minutos.', icon: 'settings' },
    { n: '02', title: 'Chateás',    body: 'Tu cliente escribe, Bylo responde al instante: cotiza, agenda y confirma solo.', icon: 'chat' },
    { n: '03', title: 'Cobrás',     body: 'La IA cotiza y agenda. Vos solo aceptás en el panel.', icon: 'sparkles' },
  ];
  return (
    <section id="how" style={{ borderTop: `1px solid ${COLORS.line}`, background: COLORS.white }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 32px' }}>
        <div style={{ display: 'grid', gap: 12, marginBottom: 56 }}>
          <Kicker>Cómo funciona</Kicker>
          <h2 style={{
            fontFamily: FONTS.display, fontSize: 'clamp(36px, 5vw, 56px)',
            fontWeight: 800, letterSpacing: '-0.03em', margin: 0, lineHeight: 1,
          }}>
            Tres pasos. Cero fricción.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {steps.map(s => (
            <div key={s.n} style={{
              padding: 28, border: `1px solid ${COLORS.line}`, borderRadius: 16,
              display: 'grid', gap: 16, alignContent: 'start', minHeight: 220,
              background: COLORS.white, transition: 'transform 200ms ease, border-color 200ms ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.ink; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.line; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.stoneSoft }}>{s.n}</div>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: COLORS.mist,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={s.icon} size={18} color={COLORS.ink} />
                </div>
              </div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em' }}>
                {s.title}
              </div>
              <div style={{ color: COLORS.stone, fontSize: 15, lineHeight: 1.5 }}>{s.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LandingStat() {
  const [mobile, setMobile] = React.useState(() => window.innerWidth < 768);
  React.useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <section style={{
      borderTop: `1px solid ${COLORS.line}`,
      background: COLORS.ink, color: COLORS.white,
      overflow: 'hidden',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: mobile ? '72px 24px 64px' : '120px 32px 100px', display: 'grid', gap: 40 }}>
        <Kicker color={COLORS.stoneSoft}>El cambio</Kicker>
        <div style={{
          fontFamily: FONTS.display, fontWeight: 800,
          fontSize: 'clamp(52px, 14vw, 220px)', lineHeight: 0.88,
          letterSpacing: '-0.06em',
        }}>
          30 segundos.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: mobile ? 32 : 64, alignItems: 'start' }}>
          <div style={{ fontSize: mobile ? 18 : 22, lineHeight: 1.4, fontWeight: 500, textWrap: 'pretty', maxWidth: 480 }}>
            Es lo que tarda Bylo en cotizar, agendar y confirmar una cita.
            Lo que antes te costaba 8 mensajes y media hora distraído.
          </div>
          <div style={{ display: 'flex', gap: mobile ? 24 : 40, fontFamily: FONTS.mono, fontSize: 12, color: COLORS.stoneSoft }}>
            <div><div style={{ color: COLORS.white, fontSize: 28, fontFamily: FONTS.display, fontWeight: 800 }}>24/7</div>respondiendo</div>
            <div><div style={{ color: COLORS.white, fontSize: 28, fontFamily: FONTS.display, fontWeight: 800 }}>0</div>apps que aprender</div>
            <div><div style={{ color: COLORS.green, fontSize: 28, fontFamily: FONTS.display, fontWeight: 800 }}>↑42%</div>conversión</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingIndustries() {
  const items = [
    { icon: 'scissors', title: 'Barberías',     body: 'Cortes, barba, degradés. Precios variables por estilo.' },
    { icon: 'paw',      title: 'Veterinarias',  body: 'Consultas, baños, vacunas. Diferentes según tamaño.' },
    { icon: 'sparkles', title: 'Manicura',      body: 'Diseños, gel, acrílico. Cotizá según material.' },
    { icon: 'wrench',   title: 'Talleres',      body: 'Lavado, mecánica, lubricación. Por tipo de vehículo.' },
    { icon: 'camera',   title: 'Fotógrafos',    body: 'Sesiones, eventos. Paquete según horas y ubicación.' },
    { icon: 'palette',  title: 'Maquillaje',    body: 'Eventos, novias, sociales. Calculá tiempo y producto.' },
  ];
  return (
    <section id="industries" style={{ background: COLORS.white }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 32px' }}>
        <div style={{ display: 'grid', gap: 12, marginBottom: 48 }}>
          <Kicker>Industrias</Kicker>
          <h2 style={{
            fontFamily: FONTS.display, fontSize: 'clamp(36px, 5vw, 56px)',
            fontWeight: 800, letterSpacing: '-0.03em', margin: 0, lineHeight: 1, maxWidth: 760,
          }}>
            Pensado para cualquier servicio<br />donde el precio depende del cliente.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: COLORS.line, border: `1px solid ${COLORS.line}`, borderRadius: 20, overflow: 'hidden' }}>
          {items.map(it => (
            <div key={it.title} style={{
              padding: 32, background: COLORS.white, display: 'grid', gap: 14,
              alignContent: 'start', minHeight: 200,
            }}>
              <Icon name={it.icon} size={22} color={COLORS.ink} />
              <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' }}>{it.title}</div>
              <div style={{ color: COLORS.stone, fontSize: 14.5, lineHeight: 1.5 }}>{it.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LandingCTA({ onNavigate }) {
  return (
    <section style={{ borderTop: `1px solid ${COLORS.line}`, background: COLORS.mist }}>
      <div style={{
        maxWidth: 900, margin: '0 auto', padding: '120px 32px',
        display: 'grid', gap: 28, justifyItems: 'center', textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: FONTS.display, fontSize: 'clamp(40px, 6vw, 72px)',
          fontWeight: 800, letterSpacing: '-0.035em', margin: 0, lineHeight: 1,
          textWrap: 'balance',
        }}>
          ¿Listo para dejar de<br />responder mensajes?
        </h2>
        <p style={{ fontSize: 18, color: COLORS.stone, maxWidth: 520, margin: 0, lineHeight: 1.5 }}>
          Configurá tu link en 5 minutos. Gratis mientras dure el hackathon.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button size="lg" icon="arrow" onClick={() => onNavigate('onboarding')}>
            Crear mi link gratis
          </Button>
          <Button size="lg" variant="secondary" onClick={() => onNavigate('chat')}>
            Ver el chat en vivo
          </Button>
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer style={{ background: COLORS.white, borderTop: `1px solid ${COLORS.line}` }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '56px 32px 32px',
        display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 48,
      }}>
        <div style={{ display: 'grid', gap: 14 }}>
          <Logo size={22} />
          <div style={{ fontSize: 14, color: COLORS.stone, lineHeight: 1.5, maxWidth: 280 }}>
            La IA que agenda tus citas mientras vos trabajás.
          </div>
        </div>
        {[
          { h: 'Producto',   items: ['Chat IA', 'Panel', 'Integraciones'] },
          { h: 'Recursos',   items: ['Documentación', 'Ejemplos', 'Estado'] },
          { h: 'Compañía',   items: ['Sobre Bylo', 'Contacto', 'Privacidad'] },
        ].map(col => (
          <div key={col.h} style={{ display: 'grid', gap: 12 }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.stoneSoft }}>
              {col.h}
            </div>
            {col.items.map(i => (
              <a key={i} href="#" onClick={e => e.preventDefault()} style={{ fontSize: 14, color: COLORS.ink, textDecoration: 'none' }}>{i}</a>
            ))}
          </div>
        ))}
      </div>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '24px 32px',
        borderTop: `1px solid ${COLORS.line}`, display: 'flex', justifyContent: 'space-between',
        fontSize: 12, color: COLORS.stoneSoft, fontFamily: FONTS.mono, letterSpacing: '0.02em',
      }}>
        <div>© 2026 Bylo. Construido para Avify · Hackathon CRTW 2026.</div>
        <div>v0.1 · made in CR</div>
      </div>
    </footer>
  );
}

window.Landing = Landing;

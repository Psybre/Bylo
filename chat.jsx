// ─── BYLO CHAT SIMULATOR ────────────────────────────────────────────────────
// A mobile messenger-style chat. Bot bubbles white, user bubbles green.
// Original design — not a recreation of any specific messaging app brand.

const { useState: useStateChat, useEffect: useEffectChat, useRef: useRefChat } = React;

function ChatScreen({ onNavigate }) {
  return (
    <div data-screen-label="02 Chat" style={{
      minHeight: '100vh', background: COLORS.mist,
      display: 'flex', flexDirection: 'column',
    }}>
      <ChatTopBar onNavigate={onNavigate} />
      <div style={{
        flex: 1, display: 'grid', placeItems: 'center', padding: '24px 16px 40px',
      }}>
        <ChatPhone />
      </div>
    </div>
  );
}

function ChatTopBar({ onNavigate }) {
  return (
    <div style={{
      background: COLORS.white, borderBottom: `1px solid ${COLORS.line}`,
      padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <button onClick={() => onNavigate('landing')} style={{
          border: 'none', background: 'transparent', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8, color: COLORS.stone, fontSize: 13, padding: 0,
        }}>
          <Icon name="arrowLeft" size={16} /> Volver
        </button>
        <div style={{ width: 1, height: 16, background: COLORS.line }} />
        <Logo size={18} />
        <Badge color="green" icon="dot">link en vivo</Badge>
      </div>
      <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.stone }}>
        bylo.app/chat/donpepe
      </div>
    </div>
  );
}

// ─── The phone frame containing the chat ────────────────────────────────────
function ChatPhone() {
  return (
    <div style={{
      width: 'min(420px, 100%)', height: 'min(820px, calc(100vh - 140px))',
      background: COLORS.ink, borderRadius: 40, padding: 10,
      boxShadow: SHADOWS.lg, position: 'relative',
    }}>
      <div style={{
        width: '100%', height: '100%', background: COLORS.chatBg,
        borderRadius: 32, overflow: 'hidden',
        display: 'flex', flexDirection: 'column', position: 'relative',
      }}>
        <ChatHeader />
        <ChatThread />
      </div>
    </div>
  );
}

function ChatHeader() {
  return (
    <div style={{
      background: '#0B5A3A',
      color: COLORS.white,
      padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      borderBottom: '1px solid rgba(0,0,0,0.1)',
      flexShrink: 0,
    }}>
      <Icon name="arrowLeft" size={20} color={COLORS.white} strokeWidth={2.2} />
      <Avatar name={MOCK_BUSINESS.name} size={38} bg="#127C56" color={COLORS.white} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: FONTS.display, fontWeight: 700, fontSize: 15,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {MOCK_BUSINESS.name}
          </span>
          <Icon name="verified" size={14} color={COLORS.green} />
        </div>
        <div style={{ fontSize: 11.5, opacity: 0.85, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.green }} />
          en línea · verificado por Bylo
        </div>
      </div>
      <Icon name="phone" size={18} color={COLORS.white} strokeWidth={2} />
      <Icon name="moreVert" size={20} color={COLORS.white} strokeWidth={2.4} />
    </div>
  );
}

// ─── Scripted demo flow (deterministic, easy to replace with API) ───────────
const DEMO_FLOW = [
  // index = number of user messages sent so far
  { trigger: 0,
    bot: [`¡Hola! Soy el asistente de ${MOCK_BUSINESS.name} 💈 ¿En qué te puedo ayudar hoy?`] },
  { trigger: 1, // after first user msg, regardless of content
    bot: [
      `¡Claro! Estos son nuestros servicios:`,
      { kind: 'services', services: MOCK_SERVICES },
      `¿Cuál te interesa?`,
    ] },
  { trigger: 2,
    bot: [
      `Perfecto. El Corte + Barba tiene un precio base de ₡12,000. ¿Tenés barba larga o corta?`,
    ] },
  { trigger: 3,
    bot: [
      `Listo. Con barba larga el precio final sería ₡14,000.`,
      `Tengo estos horarios disponibles 👇`,
      { kind: 'slots', slots: MOCK_SLOTS },
    ] },
  { trigger: 4,
    bot: [
      { kind: 'confirmation',
        booking: {
          service: 'Corte + barba (barba larga)',
          when: formatDate(MOCK_SLOTS[1].startAt) + ' · ' + formatTime(MOCK_SLOTS[1].startAt),
          price: 14000,
        } },
      `¡Listo! Tu cita queda agendada y le avisé a Don Pepe. Te confirma en unos minutos. 🎉`,
    ] },
  { trigger: 5,
    bot: [
      `Cuando quieras puedo ayudarte con otra cita. ¡Nos vemos pronto!`,
    ] },
];

const SUGGESTED_REPLIES = {
  0: ['quiero un corte', 'cuánto cuesta el degradé', 'horarios'],
  1: ['el corte + barba', 'degradé', 'corte clásico'],
  2: ['larga', 'corta'],
  3: [], // user will pick a slot
  4: ['gracias!'],
};

function ChatThread() {
  const initialMessages = [
    { id: 'm0', role: 'assistant', kind: 'text',
      content: DEMO_FLOW[0].bot[0], timestamp: new Date(Date.now() - 1000 * 60).toISOString() },
  ];
  const [messages, setMessages] = useStateChat(initialMessages);
  const [userTurn, setUserTurn] = useStateChat(0);  // count of user messages
  const [typing, setTyping] = useStateChat(false);
  const [input, setInput] = useStateChat('');
  const [pickedSlot, setPickedSlot] = useStateChat(null);
  const scrollRef = useRefChat(null);

  useEffectChat(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const pushBotMessages = (botContent) => {
    setTyping(true);
    // 🔌 API: POST /api/chat  → { messages, slug }  → { reply, suggestedSlots?, bookingConfirmed? }
    // Replace this setTimeout block with the awaited API call and stream results.
    setTimeout(() => {
      setTyping(false);
      botContent.forEach((item, i) => {
        setTimeout(() => {
          const id = `m_${Date.now()}_${i}`;
          if (typeof item === 'string') {
            setMessages(prev => [...prev, { id, role: 'assistant', kind: 'text', content: item, timestamp: new Date().toISOString() }]);
          } else {
            setMessages(prev => [...prev, { id, role: 'assistant', kind: item.kind, payload: item, timestamp: new Date().toISOString() }]);
          }
        }, i * 380);
      });
    }, 1500);
  };

  const sendUser = (text) => {
    if (!text.trim()) return;
    const next = userTurn + 1;
    setMessages(prev => [...prev, {
      id: `u_${Date.now()}`, role: 'user', kind: 'text', content: text, timestamp: new Date().toISOString(),
    }]);
    setUserTurn(next);
    setInput('');
    const step = DEMO_FLOW.find(s => s.trigger === next);
    if (step) pushBotMessages(step.bot);
  };

  const pickSlot = (slot) => {
    setPickedSlot(slot);
    sendUser(`${formatDate(slot.startAt)} a las ${formatTime(slot.startAt)} ✓`);
  };

  const pickService = (service) => {
    sendUser(`el ${service.name.toLowerCase()}`);
  };

  const suggestions = SUGGESTED_REPLIES[userTurn] || [];

  return (
    <>
      <div ref={scrollRef} style={{
        flex: 1, overflowY: 'auto', padding: '14px 12px 6px',
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)',
        backgroundSize: '14px 14px',
        scrollBehavior: 'smooth',
      }}>
        <DateSeparator label="Hoy" />
        {messages.map(m => (
          <ChatMessage key={m.id} msg={m} onPickSlot={pickSlot} onPickService={pickService} pickedSlot={pickedSlot} />
        ))}
        {typing && <TypingIndicator />}
      </div>

      {suggestions.length > 0 && !typing && (
        <SuggestedBar suggestions={suggestions} onPick={sendUser} />
      )}

      <ChatComposer value={input} onChange={setInput} onSend={() => sendUser(input)} />
    </>
  );
}

function DateSeparator({ label }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 14px' }}>
      <div style={{
        background: 'rgba(255,255,255,0.85)', color: COLORS.stone,
        fontSize: 11, padding: '4px 10px', borderRadius: 8, fontWeight: 500,
        boxShadow: '0 1px 1px rgba(0,0,0,0.06)',
      }}>{label}</div>
    </div>
  );
}

function ChatMessage({ msg, onPickSlot, onPickService, pickedSlot }) {
  const isUser = msg.role === 'user';
  const time = formatTime(msg.timestamp);

  return (
    <div className="bylo-fadeup" style={{
      display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 6,
    }}>
      <div style={{
        maxWidth: '82%',
        background: isUser ? COLORS.green : COLORS.white,
        color: isUser ? COLORS.white : COLORS.ink,
        padding: msg.kind === 'text' ? '7px 11px 5px' : '10px',
        borderRadius: 10,
        borderTopLeftRadius:  isUser ? 10 : 2,
        borderTopRightRadius: isUser ? 2  : 10,
        fontSize: 14.5, lineHeight: 1.4,
        boxShadow: '0 1px 1px rgba(0,0,0,0.08)',
        minWidth: msg.kind !== 'text' ? 240 : 0,
      }}>
        {msg.kind === 'text' && (
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</div>
        )}
        {msg.kind === 'services' && (
          <ServicesCard services={msg.payload.services} onPick={onPickService} />
        )}
        {msg.kind === 'slots' && (
          <SlotsCard slots={msg.payload.slots} onPick={onPickSlot} pickedSlot={pickedSlot} />
        )}
        {msg.kind === 'confirmation' && (
          <ConfirmationCard booking={msg.payload.booking} />
        )}
        <div style={{
          fontSize: 10, opacity: 0.7, textAlign: 'right', marginTop: 4,
          color: isUser ? 'rgba(255,255,255,0.9)' : COLORS.stoneSoft,
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 3,
        }}>
          {time}
          {isUser && <Icon name="checkDouble" size={12} color="rgba(255,255,255,0.9)" strokeWidth={2.2} />}
        </div>
      </div>
    </div>
  );
}

function ServicesCard({ services, onPick }) {
  return (
    <div style={{ display: 'grid', gap: 6, marginBottom: 2 }}>
      {services.map(s => (
        <button key={s.id} onClick={() => onPick(s)} style={{
          background: COLORS.mist, border: 'none', borderRadius: 8,
          padding: '10px 12px', textAlign: 'left', cursor: 'pointer',
          display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center',
          transition: 'background 150ms',
        }}
          onMouseEnter={e => e.currentTarget.style.background = COLORS.greenSoft}
          onMouseLeave={e => e.currentTarget.style.background = COLORS.mist}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: 13.5, color: COLORS.ink }}>{s.name}</div>
            <div style={{ fontSize: 11.5, color: COLORS.stone, marginTop: 1 }}>{s.durationMin} min · {s.description}</div>
          </div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 12.5, color: COLORS.ink, fontWeight: 500 }}>
            {formatCRC(s.basePrice)}
          </div>
        </button>
      ))}
    </div>
  );
}

function SlotsCard({ slots, onPick, pickedSlot }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
      {slots.map(s => {
        const picked = pickedSlot?.id === s.id;
        return (
          <button key={s.id} onClick={() => !picked && onPick(s)} disabled={!!pickedSlot} style={{
            background: picked ? COLORS.green : COLORS.mist,
            color: picked ? COLORS.white : COLORS.ink,
            border: 'none', borderRadius: 8, padding: '12px 10px',
            display: 'grid', gap: 2, cursor: pickedSlot ? 'default' : 'pointer',
            opacity: pickedSlot && !picked ? 0.4 : 1,
            transition: 'background 150ms',
          }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 11, opacity: 0.7 }}>{formatDate(s.startAt)}</div>
            <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em' }}>
              {formatTime(s.startAt)}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ConfirmationCard({ booking }) {
  return (
    <div style={{
      background: COLORS.greenSoft, borderRadius: 8,
      padding: 14, display: 'grid', gap: 10,
      border: `1px solid ${COLORS.green}33`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', background: COLORS.green,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
        }}>
          <Icon name="check" size={16} color={COLORS.white} strokeWidth={3} />
        </div>
        <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink, letterSpacing: '-0.01em' }}>
          Cita reservada
        </div>
      </div>
      <div style={{ display: 'grid', gap: 4, fontSize: 12.5, color: COLORS.ink }}>
        <Row k="Servicio" v={booking.service} />
        <Row k="Cuándo"    v={booking.when} />
        <Row k="Precio"   v={formatCRC(booking.price)} bold />
      </div>
      <div style={{ fontSize: 10.5, fontFamily: FONTS.mono, color: COLORS.greenDeep, marginTop: 2 }}>
        powered by Bylo · pago via Avify ✓
      </div>
    </div>
  );
}

function Row({ k, v, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: COLORS.stone }}>{k}</span>
      <span style={{ fontWeight: bold ? 700 : 500 }}>{v}</span>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="bylo-fadeup" style={{
      display: 'flex', justifyContent: 'flex-start', marginBottom: 6,
    }}>
      <div style={{
        background: COLORS.white, padding: '12px 14px', borderRadius: 10, borderTopLeftRadius: 2,
        boxShadow: '0 1px 1px rgba(0,0,0,0.08)', display: 'flex', gap: 4, alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: COLORS.stoneSoft,
            display: 'inline-block',
            animation: `bylo-dot 1.2s ${i * 0.15}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

function SuggestedBar({ suggestions, onPick }) {
  return (
    <div style={{
      padding: '8px 12px', display: 'flex', gap: 6, overflowX: 'auto',
      background: 'transparent',
    }}>
      {suggestions.map(s => (
        <button key={s} onClick={() => onPick(s)} style={{
          background: COLORS.white, border: `1px solid ${COLORS.line}`,
          borderRadius: 999, padding: '6px 12px', fontSize: 12.5,
          color: COLORS.ink, fontWeight: 500, cursor: 'pointer',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>{s}</button>
      ))}
    </div>
  );
}

function ChatComposer({ value, onChange, onSend }) {
  return (
    <div style={{
      padding: '8px 8px 10px', display: 'flex', gap: 6, alignItems: 'center',
      background: 'transparent',
    }}>
      <div style={{
        flex: 1, background: COLORS.white, borderRadius: 24,
        display: 'flex', alignItems: 'center', padding: '4px 6px 4px 14px',
        boxShadow: '0 1px 1px rgba(0,0,0,0.06)',
      }}>
        <Icon name="smile" size={20} color={COLORS.stone} />
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSend()}
          placeholder="Escribí un mensaje"
          style={{
            flex: 1, border: 'none', outline: 'none', padding: '10px 8px',
            fontSize: 14, color: COLORS.ink, background: 'transparent',
          }}
        />
        <Icon name="paperclip" size={18} color={COLORS.stone} />
      </div>
      <button onClick={onSend} disabled={!value.trim()} style={{
        width: 44, height: 44, borderRadius: '50%', background: COLORS.green,
        color: 'white', border: 'none', cursor: value.trim() ? 'pointer' : 'default',
        opacity: value.trim() ? 1 : 0.6,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition: 'opacity 150ms',
      }}>
        <Icon name={value.trim() ? 'send' : 'mic'} size={18} color={COLORS.white} strokeWidth={2.2} />
      </button>
    </div>
  );
}

window.ChatScreen = ChatScreen;

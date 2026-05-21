// ─── BYLO CRM · LOYALTY GLOBAL TAB ──────────────────────────────────────────
// Table of all clients ordered by loyalty points. Filter by completion status.

const { useState: useStateLoy, useMemo: useMemoLoy } = React;

function LoyaltyTab({ clients, setClients, onOpenClient, onToast, onCelebrate }) {
  const [filter, setFilter] = useStateLoy('all'); // all | near | complete
  const [goal, setGoal] = useStateLoy(10);
  const [configOpen, setConfigOpen] = useStateLoy(false);

  const sorted = useMemoLoy(() => {
    let arr = [...clients].sort((a, b) => b.loyaltyPoints - a.loyaltyPoints);
    if (filter === 'near')     arr = arr.filter(c => c.loyaltyPoints >= 8 && c.loyaltyPoints < c.loyaltyGoal);
    if (filter === 'complete') arr = arr.filter(c => c.loyaltyPoints >= c.loyaltyGoal);
    return arr;
  }, [clients, filter]);

  const filterButtons = [
    { id: 'all',      label: 'Todos',                count: clients.length },
    { id: 'near',     label: 'Cerca de completar',  count: clients.filter(c => c.loyaltyPoints >= 8 && c.loyaltyPoints < c.loyaltyGoal).length },
    { id: 'complete', label: 'Ya completaron',      count: clients.filter(c => c.loyaltyPoints >= c.loyaltyGoal).length },
  ];

  const redeem = (id) => {
    const c = clients.find(x => x.id === id);
    if (!c) return;
    // 🔌 API: POST /api/loyalty/redeem { clientId }
    onCelebrate();
    setClients(prev => prev.map(x => x.id === id ? { ...x, loyaltyPoints: 0, redeemed: (x.redeemed || 0) + 1 } : x));
    setTimeout(() => onToast(`🎉 ${c.name.split(' ')[0]} canjeó su corte gratis`), 200);
  };

  const totalRedeemed = clients.reduce((s, c) => s + (c.redeemed || 0), 0);
  const totalPoints   = clients.reduce((s, c) => s + c.loyaltyPoints, 0);

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <Kicker>Programa de fidelidad</Kicker>
          <h1 style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 38, margin: '8px 0 0', letterSpacing: '-0.03em', lineHeight: 1 }}>
            Fidelidad
          </h1>
          <div style={{ color: COLORS.stone, fontSize: 14.5, marginTop: 10 }}>
            Regla actual: <b style={{ color: COLORS.ink }}>cada {goal} cortes, 1 gratis</b>
          </div>
        </div>
        <Button variant="secondary" icon="settings" onClick={() => setConfigOpen(true)}>Editar regla</Button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <Stat label="Clientes activos"     value={clients.length} />
        <Stat label="Recompensas dadas"    value={totalRedeemed} />
        <Stat label="Puntos en circulación" value={totalPoints} />
      </div>

      <div style={{ display: 'flex', gap: 4, padding: 4, background: COLORS.white, borderRadius: 10, border: `1px solid ${COLORS.line}`, justifySelf: 'start' }}>
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
            <span style={{ fontFamily: FONTS.mono, fontSize: 10.5, opacity: 0.7 }}>{f.count}</span>
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <EmptyState title="Nada que mostrar" body="Cambiá el filtro para ver más clientes." icon="sparkles" />
      ) : (
        <div style={{
          background: COLORS.white, borderRadius: 14, border: `1px solid ${COLORS.line}`, overflow: 'hidden',
          boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06)',
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 80px 1.4fr 80px auto',
            padding: '14px 20px', borderBottom: `1px solid ${COLORS.line}`,
            fontFamily: FONTS.mono, fontSize: 10.5, color: COLORS.stoneSoft,
            letterSpacing: '0.08em', textTransform: 'uppercase', gap: 16,
          }}>
            <span>Cliente</span>
            <span>Puntos</span>
            <span>Progreso</span>
            <span>Canjes</span>
            <span />
          </div>
          {sorted.map((c, i) => (
            <LoyaltyRow
              key={c.id}
              client={c}
              onOpen={() => onOpenClient(c.id)}
              onRedeem={() => redeem(c.id)}
              isLast={i === sorted.length - 1}
            />
          ))}
        </div>
      )}

      {configOpen && (
        <Modal title="Regla del programa" onClose={() => setConfigOpen(false)}>
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ fontSize: 14, color: COLORS.stone, lineHeight: 1.5 }}>
              Definí cuántos cortes necesita acumular un cliente para ganar uno gratis.
              Esta regla se aplica a todos los clientes nuevos.
            </div>
            <Field label="Cortes necesarios para corte gratis">
              <input type="number" min={2} max={50} value={goal}
                onChange={e => setGoal(Number(e.target.value) || 10)}
                style={inputStyle(false)} />
            </Field>
            <div style={{ padding: 14, background: COLORS.mist, borderRadius: 8, fontSize: 13, color: COLORS.stone }}>
              "Cada <b style={{ color: COLORS.ink }}>{goal} cortes</b>, el cliente recibe 1 gratis"
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 22 }}>
            <Button variant="ghost" onClick={() => setConfigOpen(false)}>Cancelar</Button>
            <Button icon="check" onClick={() => {
              // 🔌 API: PATCH /api/loyalty/config { businessId, goal }
              setConfigOpen(false); onToast('Regla guardada');
            }}>Guardar regla</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function LoyaltyRow({ client, onOpen, onRedeem, isLast }) {
  const complete = client.loyaltyPoints >= client.loyaltyGoal;
  const pct = Math.min(100, (client.loyaltyPoints / client.loyaltyGoal) * 100);
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 80px 1.4fr 80px auto',
      padding: '14px 20px', borderBottom: isLast ? 'none' : `1px solid ${COLORS.line}`,
      gap: 16, alignItems: 'center',
    }}>
      <button onClick={onOpen} style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 12, padding: 0, textAlign: 'left',
      }}>
        <Avatar name={client.name} size={36} bg={COLORS.mist} color={COLORS.ink} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 13.5, color: COLORS.ink }}>{client.name}</div>
          <div style={{ fontSize: 11.5, color: COLORS.stoneSoft, marginTop: 2, fontFamily: FONTS.mono }}>{client.phone}</div>
        </div>
      </button>

      <div style={{
        fontFamily: FONTS.display, fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em',
        color: complete ? COLORS.greenDeep : COLORS.ink,
      }}>
        {client.loyaltyPoints}<span style={{ fontSize: 13, color: COLORS.stoneSoft, fontWeight: 600 }}>/{client.loyaltyGoal}</span>
      </div>

      <div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {Array.from({ length: client.loyaltyGoal }, (_, i) => (
            <div key={i} style={{
              width: 16, height: 16, borderRadius: '50%',
              background: i < client.loyaltyPoints ? COLORS.green : COLORS.mist,
              border: `1.5px solid ${i < client.loyaltyPoints ? COLORS.green : COLORS.line}`,
              transition: 'all 220ms',
            }} />
          ))}
        </div>
        <div style={{
          height: 4, marginTop: 8, background: COLORS.mist, borderRadius: 2, overflow: 'hidden', maxWidth: 200,
        }}>
          <div style={{ width: `${pct}%`, height: '100%', background: complete ? COLORS.green : COLORS.ink, transition: 'width 400ms' }} />
        </div>
      </div>

      <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.stone, textAlign: 'left' }}>
        {client.redeemed || 0}
      </div>

      {complete
        ? <Button size="sm" variant="green" icon="sparkles" onClick={onRedeem}>Canjear</Button>
        : <Button size="sm" variant="ghost" onClick={onOpen} style={{ color: COLORS.stone }}>Ver perfil</Button>}
    </div>
  );
}

window.LoyaltyTab = LoyaltyTab;

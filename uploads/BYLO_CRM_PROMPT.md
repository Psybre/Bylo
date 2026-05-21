# BYLO — Prompt de extensión CRM para Claude Design

> **Contexto:** Ya existe un prototipo React funcional de Bylo con Landing, Chat WhatsApp, Onboarding y Dashboard básico. Este prompt extiende el Dashboard con 6 módulos CRM nuevos. Mantener el mismo design system.

---

## DESIGN SYSTEM (obligatorio — mismo que el original)

```tsx
const C = {
  ink: '#0F1419', green: '#00C46A', greenSoft: '#E8F9F1', greenDark: '#009952',
  mist: '#F4F6F8', stone: '#6B7280', line: '#E5E7EB', warn: '#DC2626', white: '#FFFFFF',
  amber: '#F59E0B', amberSoft: '#FEF3C7',
  purple: '#7C3AED', purpleSoft: '#EDE9FE',
  blue: '#3B82F6', blueSoft: '#EFF6FF',
}
// Manrope 800 → headers | Inter 400/500/600 → body | JetBrains Mono → labels/códigos
// borderRadius: 8px botones, 14px cards, 999px badges
// box-shadow: 0 2px 8px -2px rgba(0,0,0,0.06) para cards
```

---

## MOCK DATA EXTENDIDA

```ts
// 🔌 API: GET /api/clients?businessId=biz_001  →  Client[]
const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1', name: 'Carlos Rodríguez', phone: '+506 8765-4321',
    avatar: 'CR', visits: 9, nextVisitDays: 30,
    lastVisit: new Date(Date.now() - 18 * 86400000).toISOString(),
    tags: ['habla mucho', 'fútbol', 'puntual'],
    preferences: { topics: ['fútbol', 'F1'], diet: false, drinks: ['café', 'agua'] },
    loyaltyPoints: 9, loyaltyGoal: 10,
    reminderDays: 30, reminderEnabled: true,
    status: 'active', notes: 'Le gusta el degradé en los lados',
    totalSpent: 126000,
  },
  {
    id: 'c2', name: 'Andrés Mora', phone: '+506 8333-4444',
    avatar: 'AM', visits: 4, nextVisitDays: 15,
    lastVisit: new Date(Date.now() - 10 * 86400000).toISOString(),
    tags: ['tímido', 'puntual'],
    preferences: { topics: ['básquetbol', 'música'], diet: true, drinks: ['agua'] },
    loyaltyPoints: 4, loyaltyGoal: 10,
    reminderDays: 15, reminderEnabled: true,
    status: 'active', notes: 'Prefiere silencio mientras lo atienden',
    totalSpent: 36000,
  },
  {
    id: 'c3', name: 'Diego Vargas', phone: '+506 8234-5678',
    avatar: 'DV', visits: 12, nextVisitDays: 30,
    lastVisit: new Date(Date.now() - 5 * 86400000).toISOString(),
    tags: ['conversador', 'fútbol', 'cliente VIP'],
    preferences: { topics: ['fútbol', 'tecnología'], diet: false, drinks: ['café', 'energizante'] },
    loyaltyPoints: 2, loyaltyGoal: 10,  // ya recibió recompensas anteriores — lleva 2 del nuevo ciclo
    reminderDays: 30, reminderEnabled: false,
    status: 'vip', notes: 'Cliente desde 2023. Siempre pide lo mismo.',
    totalSpent: 312000,
  },
  {
    id: 'c4', name: 'Pablo Castro', phone: '+506 8901-2345',
    avatar: 'PC', visits: 2, nextVisitDays: 15,
    lastVisit: new Date(Date.now() - 25 * 86400000).toISOString(),
    tags: ['nuevo', 'curioso'],
    preferences: { topics: ['videojuegos'], diet: false, drinks: ['jugo'] },
    loyaltyPoints: 2, loyaltyGoal: 10,
    reminderDays: 15, reminderEnabled: true,
    status: 'at_risk',  // lleva 25 días sin venir
    notes: '',
    totalSpent: 17000,
  },
]

// 🔌 API: GET /api/bookings?businessId=biz_001&range=week  →  Booking[]
const MOCK_CALENDAR_WEEK: CalendarEvent[] = [
  { id: 'e1', clientName: 'Carlos Rodríguez', service: 'Corte + barba', startAt: setDay(1, 9, 0),  duration: 45, status: 'confirmed', color: 'green' },
  { id: 'e2', clientName: 'Andrés Mora',       service: 'Degradé',       startAt: setDay(1, 11, 0), duration: 40, status: 'confirmed', color: 'green' },
  { id: 'e3', clientName: 'Diego Vargas',      service: 'Corte clásico', startAt: setDay(2, 9, 30), duration: 30, status: 'confirmed', color: 'purple' },  // VIP
  { id: 'e4', clientName: 'Laura Soto',        service: 'Diseño de barba',startAt: setDay(3, 15, 0),duration: 30, status: 'pending',   color: 'amber'  },
  { id: 'e5', clientName: 'Sofía Jiménez',     service: 'Corte clásico', startAt: setDay(4, 10, 0), duration: 30, status: 'confirmed', color: 'green' },
  { id: 'e6', clientName: 'Pablo Castro',      service: 'Corte + barba', startAt: setDay(5, 14, 0), duration: 45, status: 'confirmed', color: 'green' },
]

// Helper: day of this week (1=Mon...7=Sun), hour, minute → ISO string
function setDay(dow, h, m) {
  const d = new Date(); d.setDate(d.getDate() - d.getDay() + dow); d.setHours(h, m, 0, 0); return d.toISOString()
}

// Personality tags predefinidas (el dueño puede crear más)
const PERSONALITY_TAGS = [
  'habla mucho', 'tímido', 'conversador', 'callado', 'puntual', 'siempre tarde',
  'curioso', 'exigente', 'relajado', 'cliente VIP', 'nuevo', 'fiel'
]

// Temas de conversación predefinidos
const CONVO_TOPICS = ['fútbol', 'básquetbol', 'F1', 'música', 'tecnología', 'videojuegos', 'política', 'negocios', 'cine', 'viajes']

// Bebidas predefinidas (según lo que ofrezca el negocio)
const DRINK_OPTIONS = ['café', 'agua', 'energizante', 'jugo', 'refresco', 'ninguna']
```

---

## INSTRUCCIONES GLOBALES

1. **Un solo React Artifact** con todo el módulo CRM.
2. **Routing interno** entre las vistas con `useState`.
3. **Animaciones** con `framer-motion` — aparición de cards, transiciones de tabs, micro-interacciones en badges y botones.
4. **Iconos** exclusivamente de `lucide-react` — outline, 14–20px.
5. **Cada acción debe producir feedback visual**: agregar tag → badge aparece animado; guardar preferencias → toast verde; toggle recordatorio → cambio de estado animado; desbloquear recompensa → confetti o burst de puntos.
6. **Los `// 🔌 API:` y `// 🔌 REALTIME:`** deben marcarse en cada punto de integración.
7. **No usar localStorage** — todo en `useState`.
8. **Responsive**: funcionar en 400px y 1280px.

---

## MÓDULO 1 — CALENDARIO VISUAL DEL DUEÑO

**Ruta:** Tab `calendar` dentro del Dashboard

**Vista principal:** semana actual, columnas Lun–Dom, franjas de 30min de 7am a 8pm.

**Comportamiento:**
- Cada cita es un bloque de color (verde = confirmada, amber = pendiente, morado = VIP).
- Al hacer clic en un bloque → aparece un mini-panel lateral (drawer) con los datos de la cita: cliente, servicio, hora, precio, botón "Ver perfil cliente".
- Botón "+ Nueva cita" abre un modal inline (no popover) con: cliente (select de MOCK_CLIENTS), servicio, fecha, hora. Al confirmar, el bloque aparece animado en el calendario.
- Vista alternativa: botón toggle "Semana / Día" — la vista día muestra una sola columna con más detalle y espacio.
- Indicador de "hoy" con línea horizontal roja que muestra la hora actual.

```tsx
// 🔌 API: GET /api/bookings?businessId=&range=week → CalendarEvent[]
// 🔌 API: POST /api/bookings → { clientId, serviceId, startAt, duration }
// 🔌 REALTIME: supabase.channel('bookings').on('postgres_changes', ...) → actualizar calendario en vivo
```

**UX crítica:** el calendario debe sentirse ágil. Al hover sobre una cita, mostrar tooltip con nombre + servicio. Los bloques deben tener `border-radius: 6px` y un borde izquierdo más grueso (4px) del color del status.

---

## MÓDULO 2 — ETIQUETAS DE PERSONALIDAD DEL CLIENTE

**Ubicación:** dentro del perfil del cliente (módulo 6), sección "Personalidad".

**Comportamiento:**
- Se muestran los tags actuales del cliente como badges con `×` para eliminar.
- Chips sugeridos (de `PERSONALITY_TAGS`) que al hacer clic se agregan animados.
- Campo de texto para crear tag personalizado → al presionar Enter o click en "+" aparece como nuevo badge.
- Tags con colores semánticos:
  - Personalidad positiva (puntual, conversador) → verde suave
  - Neutral (callado, curioso) → gris
  - Atención (siempre tarde, exigente) → amber
  - Especiales (VIP, fiel) → morado

```tsx
// 🔌 API: PATCH /api/clients/:id/tags { tags: string[] }
// Al agregar: animación slide-in del badge nuevo
// Al eliminar: animación scale-out + fade del badge
```

---

## MÓDULO 3 — REGISTRO DE GUSTOS Y PREFERENCIAS

**Ubicación:** dentro del perfil del cliente, sección "Preferencias".

**Componentes:**
- **Temas de conversación:** chips multiselect de `CONVO_TOPICS`. Los seleccionados aparecen en verde. Los no seleccionados en gris. Al hacer clic toggle.
- **En dieta:** toggle switch (sí/no). Si está en dieta → aparece badge "🥗 En dieta" en su perfil y en la cita cuando se agenda.
- **Bebidas preferidas:** checkboxes de `DRINK_OPTIONS`. Las seleccionadas aparecen con ícono de bebida y fondo verde suave. Si el negocio tiene bebidas configuradas y el cliente tiene una preferida, al crear la cita aparece sugerencia "¿Preparar café para Carlos?".
- **Notas personales:** textarea libre, guardado automático con debounce de 800ms + indicador "Guardando..." → "Guardado ✓".

```tsx
// 🔌 API: PATCH /api/clients/:id/preferences { topics, diet, drinks, notes }
// Auto-save con debounce: actualizar sin botón explícito
```

---

## MÓDULO 4 — RECORDATORIOS DE CORTE

**Ubicación:** dentro del perfil del cliente, sección "Recordatorio", Y en vista general de clientes como badge de días pendientes.

**Comportamiento:**
- Toggle para activar/desactivar recordatorio por cliente.
- Selector de frecuencia: `15 días` / `30 días` / `personalizado` (input numérico).
- Indicador visual en la lista de clientes:
  - Verde: viene pronto (menos de 5 días del próximo recordatorio esperado)
  - Amber: se acerca (5–10 días)
  - Rojo: vencido (ya pasó la fecha sugerida sin visita) — aparece badge "⚠ Sin visita 25 días"
- Al activar el recordatorio → aparece una preview del mensaje que se enviaría por WhatsApp:

```
Vista previa del mensaje:
"¡Hola Carlos! 💈 Ya pasaron 30 días desde tu último corte en Barbería Don Pepe.
¿Agendamos para esta semana? bylo.app/chat/donpepe"
```

```tsx
// 🔌 API: PATCH /api/clients/:id/reminder { enabled: bool, days: number }
// 🔌 API: POST /api/reminders/preview { clientId, businessId } → { message: string }
// En producción: disparar mensajes vía WhatsApp Business API o Twilio
// Para demo: el botón "Enviar preview" muestra el mensaje en un modal estilo WhatsApp
```

---

## MÓDULO 5 — PROGRAMA DE FIDELIDAD

**Ubicación:** widget en el perfil del cliente + tab "Fidelidad" en el Dashboard.

**Por cliente:**
- Barra de progreso visual: `loyaltyPoints / loyaltyGoal` — por ejemplo 9/10.
- Cada punto = un círculo pequeño. Los completados en verde `#00C46A`, el pendiente en gris.
- Al llegar al 10: animación de celebración (burst de partículas CSS o confetti con `canvas-confetti` si disponible) + badge "🎉 ¡Corte gratis desbloqueado!".
- Botón "Canjear recompensa" → confirma el canje, resetea el contador a 0, registra historial de canjes.
- El dueño puede configurar la regla: "cada N cortes, 1 gratis" (configurable en settings).

**Vista global (tab "Fidelidad" en Dashboard):**
- Tabla de todos los clientes ordenados por puntos (descendente).
- Columnas: Avatar + Nombre, Puntos actuales, Progreso (barra mini), Canjes históricos, Próximo a completar.
- Filtro: "Todos" / "Cerca de completar (8+ puntos)" / "Ya completaron".
- Badge rojo con número en el ícono del tab si hay clientes que ya completaron y no han canjeado.

```tsx
// 🔌 API: GET /api/loyalty?businessId= → { clients: LoyaltyRecord[], config: { goal: number } }
// 🔌 API: POST /api/loyalty/redeem { clientId } → { newCycle: true, message: string }
// 🔌 API: PATCH /api/loyalty/config { businessId, goal: number }
```

---

## MÓDULO 6 — PERFILES DE CLIENTES (CRM)

**Ruta:** Tab `clients` dentro del Dashboard (nueva tab en el sidebar).

**Vista lista:**
- Cards o tabla de todos los clientes con: avatar circular con iniciales (color basado en nombre), nombre, teléfono, último corte (fecha relativa "hace 18 días"), badge de status (active/vip/at_risk), puntos de fidelidad, próximo recordatorio.
- Buscador por nombre o teléfono (filtrado en tiempo real, sin API call).
- Filtros: Todos / VIP / En riesgo / Con recordatorio activo.
- Botón "+ Nuevo cliente" → modal inline con: nombre, teléfono, notas iniciales. Al guardar, aparece en la lista con animación.

**Vista perfil individual (al hacer clic en un cliente):**
- Header: avatar grande, nombre, teléfono, badge de status, total gastado, número de visitas.
- Tabs dentro del perfil: **Resumen** / **Personalidad** (módulo 2) / **Preferencias** (módulo 3) / **Recordatorio** (módulo 4) / **Fidelidad** (módulo 5) / **Historial**.
- Tab Resumen: stats (total visitas, total gastado, promedio por visita, días desde última visita), historial de últimas 5 citas en timeline vertical.
- Tab Historial: lista completa de citas con fecha, servicio, precio, si usó recompensa.
- Botón "Agendar cita" → abre el modal de nueva cita del calendario (módulo 1) preseleccionando al cliente.

```tsx
// 🔌 API: GET /api/clients?businessId= → Client[]
// 🔌 API: GET /api/clients/:id → Client (detalle)
// 🔌 API: POST /api/clients → { name, phone, businessId }
// 🔌 API: GET /api/clients/:id/history → Booking[]
// 🔌 API: PATCH /api/clients/:id → { status, notes, ... }
```

---

## FLUJOS DE DEMO PARA EL PITCH (implementar con botones de acceso rápido)

Agregar en el Dashboard una barra superior con botones "Demo rápida":

```
[🗓 Ver calendario] [👤 Ver Carlos] [🎉 Canjear recompensa] [📲 Enviar recordatorio]
```

Cada botón navega directo al estado visual más impactante:
- **Ver calendario** → abre vista semana con todas las citas del mock.
- **Ver Carlos** → abre el perfil de Carlos Rodríguez con 9/10 puntos (a punto de canjear).
- **Canjear recompensa** → dispara la animación de celebración con el corte gratis.
- **Enviar recordatorio** → muestra el preview del mensaje WhatsApp para Pablo Castro (25 días sin visita).

---

## NOTA PARA EL BACKEND

Marcadores de integración en el código:

| Módulo | Endpoint | Método | Descripción |
|---|---|---|---|
| Calendario | `/api/bookings?range=week` | GET | Eventos de la semana |
| Calendario | `/api/bookings` | POST | Nueva cita desde el panel |
| Tags | `/api/clients/:id/tags` | PATCH | Actualizar etiquetas |
| Preferencias | `/api/clients/:id/preferences` | PATCH | Gustos y notas |
| Recordatorios | `/api/clients/:id/reminder` | PATCH | Config recordatorio |
| Fidelidad | `/api/loyalty/redeem` | POST | Canjear recompensa |
| Clientes | `/api/clients` | GET / POST | Lista y creación |
| Clientes | `/api/clients/:id` | GET / PATCH | Perfil y edición |
| Historial | `/api/clients/:id/history` | GET | Citas pasadas |

---

*Bylo · Módulo CRM · Hackathon CRTW 2026 · Construido para Avify*

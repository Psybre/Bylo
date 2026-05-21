# 🎨 BYLO — Prompt para Claude Design (claude.ai Artifacts)

> **Instrucciones de uso:** Copiá esta sección + la pantalla que necesitás construir y pegalo en claude.ai. Cada pantalla es un React Artifact independiente con datos mock. Los puntos marcados `// 🔌 API:` indican exactamente dónde conectar el backend real.

---

## CONTEXTO DEL PRODUCTO (incluir siempre)

Bylo es una app SaaS para negocios pequeños de servicios (barberías, peluquerías, manicuristas, fotógrafos, veterinarias). Permite que sus clientes coticen y agenden citas a través de un chat conversacional con IA estilo WhatsApp, sin que el dueño tenga que responder manualmente.

**Flujo:**
1. Dueño configura servicios y horarios en `/onboarding`
2. Obtiene link público `bylo.app/chat/[slug]`
3. Clientes chatean con IA que cotiza y agenda
4. Dueño ve y acepta citas en `/dashboard/[slug]` en tiempo real

---

## DESIGN SYSTEM (incluir siempre — pegar como constantes en el componente)

```tsx
// ─── BYLO DESIGN TOKENS ─────────────────────────────────────────────────────
const COLORS = {
  ink:       '#0F1419',   // texto principal, CTAs primarios
  green:     '#00C46A',   // acento WhatsApp, success, burbuja bot
  greenSoft: '#E8F9F1',   // fondo sutil success/badges
  mist:      '#F4F6F8',   // fondos secundarios, cards
  stone:     '#6B7280',   // texto secundario, captions
  line:      '#E5E7EB',   // bordes sutiles
  warn:      '#DC2626',   // error/danger
  warnSoft:  '#FEF2F2',   // fondo error
  white:     '#FFFFFF',
}

// Tipografía (importar de Google Fonts vía @import en <style>)
// font-family: 'Manrope' — display, headers (pesos 700, 800)
// font-family: 'Inter' — body, UI (pesos 400, 500, 600)
// font-family: 'JetBrains Mono' — labels técnicos, kickers, código

// Sombras
// shadow-sm: 0 2px 8px -2px rgba(0,0,0,0.08)
// shadow-md: 0 8px 24px -8px rgba(0,0,0,0.12)
// shadow-lg: 0 20px 60px -20px rgba(0,0,0,0.18)

// Border radius
// botones: 8px | cards: 16px | modales: 24px | badges: 999px
```

**Reglas de diseño IRROMPIBLES:**
- Fondo siempre blanco `#FFFFFF`. Acento siempre verde `#00C46A`. Texto siempre `#0F1419`.
- Cero gradientes de colores saturados. Cero ilustraciones 3D. Cero stock photos.
- Iconos: solo Lucide React, lineales, tamaño 16–20px.
- Animaciones: discretas, 200–500ms, nunca infinitas (excepto el "escribiendo..." del chat).
- La landing debe parecer Linear o Vercel: sobria, whitespace generoso, tipografía dominante.
- El chat debe parecer WhatsApp real: el diseño de Bylo desaparece adentro del simulador.

---

## TIPOS COMPARTIDOS (interfaces TypeScript — respetar en todos los artifacts)

```ts
interface Business {
  id: string
  slug: string
  name: string
  phone: string
  openingHours: { day: number; open: string; close: string }[]
}

interface Service {
  id: string
  businessId: string
  name: string
  durationMin: number
  basePrice: number
  description: string
  avifySku: string
}

interface PricingRule {
  id: string
  serviceId: string
  attribute: string   // ej: "género", "largo", "tipo"
  value: string       // ej: "hombre", "largo", "degradé"
  modifier: number    // ej: 2000
  modifierType: 'ADD' | 'SUBTRACT' | 'PERCENT'
}

interface Slot {
  id: string
  businessId: string
  resourceId: string
  startAt: string   // ISO 8601
  endAt: string
  status: 'available' | 'booked'
}

interface Booking {
  id: string
  slotId: string
  serviceId: string
  customerId: string
  quotedPrice: number
  status: 'pending' | 'confirmed' | 'cancelled'
  avifyOrderId?: string
  createdAt: string
  customer: { name: string; phone: string }
  service: { name: string }
  slot: { startAt: string }
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}
```

---

## MOCK DATA (misma forma que devuelve la API real)

```ts
// 🔌 API: GET /api/businesses?slug=donpepe  →  Business
const MOCK_BUSINESS: Business = {
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
}

// 🔌 API: GET /api/services?businessId=biz_001  →  Service[]
const MOCK_SERVICES: Service[] = [
  { id: 'svc_001', businessId: 'biz_001', name: 'Corte clásico', durationMin: 30, basePrice: 8000, description: 'Corte tijera o máquina', avifySku: 'BYLO-CORTE-CLASICO' },
  { id: 'svc_002', businessId: 'biz_001', name: 'Corte + barba', durationMin: 45, basePrice: 12000, description: 'Corte completo con perfilado de barba', avifySku: 'BYLO-CORTE-BARBA' },
  { id: 'svc_003', businessId: 'biz_001', name: 'Degradé', durationMin: 40, basePrice: 9000, description: 'Fade o degradé con máquina', avifySku: 'BYLO-DEGRADE' },
  { id: 'svc_004', businessId: 'biz_001', name: 'Diseño de barba', durationMin: 30, basePrice: 7000, description: 'Solo barba, sin corte', avifySku: 'BYLO-BARBA' },
]

// 🔌 API: GET /api/bookings?businessId=biz_001  →  Booking[]
const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'book_001', slotId: 'slot_101', serviceId: 'svc_002', customerId: 'cust_001',
    quotedPrice: 14000, status: 'pending', createdAt: new Date().toISOString(),
    customer: { name: 'Carlos Rodríguez', phone: '+506 8765-4321' },
    service: { name: 'Corte + barba' },
    slot: { startAt: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString() },
  },
  {
    id: 'book_002', slotId: 'slot_102', serviceId: 'svc_001', customerId: 'cust_002',
    quotedPrice: 8000, status: 'confirmed', avifyOrderId: 'AVF-00123', createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    customer: { name: 'María González', phone: '+506 8111-2222' },
    service: { name: 'Corte clásico' },
    slot: { startAt: new Date(Date.now() + 1000 * 60 * 60).toISOString() },
  },
  {
    id: 'book_003', slotId: 'slot_103', serviceId: 'svc_003', customerId: 'cust_003',
    quotedPrice: 9000, status: 'pending', createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    customer: { name: 'Andrés Mora', phone: '+506 8333-4444' },
    service: { name: 'Degradé' },
    slot: { startAt: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString() },
  },
]

// 🔌 API: GET /api/slots?businessId=biz_001&from=today  →  Slot[]
const MOCK_SLOTS: Slot[] = [
  { id: 'slot_201', businessId: 'biz_001', resourceId: 'res_001', startAt: new Date(Date.now() + 1000*60*60*1).toISOString(), endAt: new Date(Date.now() + 1000*60*90).toISOString(), status: 'available' },
  { id: 'slot_202', businessId: 'biz_001', resourceId: 'res_001', startAt: new Date(Date.now() + 1000*60*60*2).toISOString(), endAt: new Date(Date.now() + 1000*60*150).toISOString(), status: 'available' },
  { id: 'slot_203', businessId: 'biz_001', resourceId: 'res_001', startAt: new Date(Date.now() + 1000*60*60*4).toISOString(), endAt: new Date(Date.now() + 1000*60*270).toISOString(), status: 'available' },
]
```

---

## PUNTOS DE INTEGRACIÓN CON LA API

Cuando el backend esté listo, reemplazar los mocks por estas llamadas reales:

```ts
// ─── CHAT ────────────────────────────────────────────────────────────────────
// 🔌 POST /api/chat
// Body:  { messages: Message[], slug: string }
// Reply: { reply: string, suggestedSlots?: Slot[], bookingConfirmed?: Booking }
const sendMessage = async (messages: Message[], slug: string) => {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, slug }),
  })
  return res.json()
}

// ─── NEGOCIOS ────────────────────────────────────────────────────────────────
// 🔌 POST /api/businesses  →  crea Business + Services + Slots
// 🔌 GET  /api/businesses?slug=  →  Business

// ─── CITAS ───────────────────────────────────────────────────────────────────
// 🔌 GET    /api/bookings?businessId=  →  Booking[]
// 🔌 PATCH  /api/bookings/:id  →  { status: 'confirmed' }  →  dispara integración Avify

// ─── REALTIME (Supabase) ─────────────────────────────────────────────────────
// 🔌 supabase.channel('bookings').on('postgres_changes',
//      { event: 'INSERT', schema: 'public', table: 'bookings', filter: `businessId=eq.${id}` },
//      (payload) => setBookings(prev => [payload.new, ...prev])
//    ).subscribe()
```

---

## INSTRUCCIONES PARA CLAUDE (leer antes de generar cualquier pantalla)

1. **Construí un solo React Artifact** funcional, sin archivos externos.
2. **Importar Google Fonts** vía `<style>@import url(...)</style>` dentro del JSX.
3. **Usar los COLORS, tipos y mocks** definidos arriba — no inventar colores ni datos.
4. **Cada punto de integración** debe tener el comentario `// 🔌 API:` para que el backend lo encuentre fácil.
5. **Estados requeridos siempre**: loading, empty state, error state.
6. **Animaciones con framer-motion** (`import { motion, AnimatePresence } from "framer-motion"`).
7. **Iconos con lucide-react** (`import { X, Check, ... } from "lucide-react"`).
8. **No usar browser storage** (localStorage/sessionStorage) — mantener todo en useState.
9. **Responsive**: mobile-first, que funcione en 375px y 1280px.
10. **El simulador de WhatsApp** es la única pantalla donde el verde `#00C46A` domina (burbujas del bot). En el resto de la app, el verde es solo acento puntual.

---

## PANTALLA 1 — LANDING PAGE (`/`)

Construí la landing completa de Bylo como un React Artifact.

**Secciones (en orden):**
1. **Navbar** — logo "bylo" en Manrope 800 + nav links + CTA "Crear mi link gratis" (botón negro)
2. **Hero** — eyebrow "PARA NEGOCIOS DE SERVICIOS" en JetBrains Mono uppercase tracked, H1 "Tus clientes te escriben. Bylo agenda la cita." en Manrope 800, subhead, 2 CTAs, y debajo un mockup del simulador de WhatsApp (puede ser una imagen simplificada de las burbujas)
3. **Cómo funciona** — kicker "CÓMO FUNCIONA", H2 "Tres pasos. Cero fricción.", 3 cards numeradas: Configurás → Compartís → Cobrás
4. **Stat destacada** — "30 segundos." gigante en Manrope 800, texto explicativo abajo
5. **Para qué negocios** — kicker "INDUSTRIAS", 6 tarjetas: Barberías / Veterinarias / Manicura / Talleres / Fotógrafos / Maquillaje con descripciones del §12 del brief
6. **CTA final** — H2 "¿Listo para dejar de responder mensajes?", sub, botón
7. **Footer** — tagline, 3 columnas, copyright "© 2026 Bylo. Construido para Avify · Hackathon CRTW 2026."

**Copy exacto:** usar el §12 del brief original (no inventar texto).

---

## PANTALLA 2 — CHAT WHATSAPP (`/chat/[slug]`)

Construí el simulador de WhatsApp como React Artifact.

**Debe verse idéntico a WhatsApp Web/móvil:**
- Header: foto de perfil circular del negocio (placeholder SVG), nombre, "en línea", tick azul verificado "por Bylo" en verde `#00C46A`
- Fondo del chat: color `#ECE5DD` (fondo exacto de WhatsApp) con patrón sutil
- Burbujas del BOT (izquierda): fondo blanco `#FFFFFF`, texto `#0F1419`, timestamp gris
- Burbujas del USUARIO (derecha): fondo verde `#00C46A` (color original WhatsApp), texto blanco, timestamp + doble tick
- Indicador "escribiendo...": 3 puntos animados, aparece mientras se espera respuesta
- Input: fondo blanco, placeholder "Escribe un mensaje", botón enviar circular verde

**Estado inicial:** el bot saluda automáticamente con el nombre del negocio.

**Flujo mock del chat (simular respuestas con delay de 1.5s):**
```
Bot: "¡Hola! Soy el asistente de Barbería Don Pepe 💈 ¿En qué te puedo ayudar hoy?"
User: "quiero un corte"
Bot: (muestra "escribiendo...") → "¡Claro! Tenemos estos servicios: [lista]. ¿Cuál te interesa?"
User: "el corte + barba"
Bot: (muestra "escribiendo...") → "Perfecto. El Corte + Barba tiene un precio base de ₡12,000. ¿Tenés barba larga o corta?"
User: "larga"
Bot: (muestra "escribiendo...") → "El precio final sería ₡14,000. Tengo estos horarios disponibles: [slots]. ¿Cuál te viene bien?"
```
// 🔌 API: en producción reemplazar las respuestas mock por POST /api/chat

**IMPORTANTE:** el diseño de Bylo (negro/blanco) aparece SOLO en el header fuera del chat. Dentro del simulador, todo debe verse como WhatsApp real.

---

## PANTALLA 3 — ONBOARDING (`/onboarding`)

Construí el formulario de onboarding como React Artifact.

**Un solo paso, sin wizard:**
- Header: logo "bylo" centrado + "Configurá tu negocio en 5 minutos"
- Sección 1 — **Datos del negocio**: nombre, teléfono, país (select)
- Sección 2 — **Servicios**: lista de servicios con botón "+ Agregar servicio". Cada servicio tiene: nombre, precio base (₡), duración (min), descripción. Mínimo 1 servicio, máximo 8.
- Sección 3 — **Reglas de precio** (por servicio): atributo, valor, modificador (+ ₡ / - ₡ / %). Ej: "si género = hombre, + ₡0". Añadir/remover dinámicamente.
- Sección 4 — **Horario laboral**: 7 días (Lun–Dom), toggle activo/inactivo por día, hora apertura y cierre.
- CTA final: "Crear mi link de Bylo →" (botón negro grande)

**Al hacer submit (mock):**
```tsx
// 🔌 API: POST /api/businesses
// Body: { name, phone, country, services: Service[], pricingRules: PricingRule[], openingHours }
// Response: { business: Business, chatUrl: string }
// Por ahora: mostrar toast "¡Listo! Tu link es bylo.app/chat/tu-negocio" + copiar al clipboard
```

**UX:**
- Validación en tiempo real (campo requerido → borde rojo + mensaje)
- Botón disabled si hay errores
- Loading spinner en el botón al hacer submit

---

## PANTALLA 4 — PANEL DEL DUEÑO (`/dashboard/[slug]`)

Construí el panel completo como React Artifact.

**Layout:**
- Sidebar izquierdo (fijo en desktop, hamburger en mobile): logo, nav (Citas, Hoy, Calendario, Servicios, Horarios, Configuración), badge contador de citas pendientes
- Topbar: nombre del negocio, "Panel de control", botón "Ver mi chat →"
- Área principal: cambia según tab activo

**Tab 1 — Pendientes:**
- Título "Citas pendientes" + badge contador
- Lista de `MOCK_BOOKINGS` con status `pending`
- Cada card muestra: nombre cliente, servicio, hora, precio, teléfono
- Botón "Aceptar" → cambia status a `confirmed`, mueve a tab "Hoy", muestra badge "Avify ✓" en verde
- Animación de aparición: `initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}`
- Simulación Realtime: cada 15 segundos aparece una nueva cita mock con animación y glow negro de 2s

```tsx
// 🔌 REALTIME: En producción reemplazar el setInterval por:
// supabase.channel('bookings').on('postgres_changes', { event: 'INSERT', ... }, handler).subscribe()
```

**Tab 2 — Hoy:**
- Lista de citas `confirmed` del día con timeline visual (hora → cliente → servicio → precio)
- Badge "Avify ✓" en las que tienen `avifyOrderId`

**Tab 3 — Calendario:**
- Vista semanal: 7 columnas (Lun–Dom), franjas de 30 min, citas como bloques de color
- Citas pendientes en borde naranja, confirmadas en fondo verde suave

```tsx
// 🔌 API: PATCH /api/bookings/:id  → { status: 'confirmed' }
// Respuesta exitosa → muestra badge "Avify ✓" (avifyOrderId en el booking)
```

---

## NOTAS FINALES PARA EL DESARROLLADOR BACKEND

Cuando conectes el backend real, buscá en el código los comentarios `// 🔌 API:` y `// 🔌 REALTIME:` — son los únicos puntos que hay que tocar. El resto del componente no cambia.

**Contratos de la API que el frontend espera:**

| Endpoint | Método | Body / Params | Response |
|---|---|---|---|
| `/api/chat` | POST | `{ messages, slug }` | `{ reply, suggestedSlots?, bookingConfirmed? }` |
| `/api/businesses` | POST | `{ name, phone, services, pricingRules, openingHours }` | `{ business, chatUrl }` |
| `/api/businesses` | GET | `?slug=` | `Business` |
| `/api/bookings` | GET | `?businessId=` | `Booking[]` |
| `/api/bookings/:id` | PATCH | `{ status }` | `Booking` |
| `/api/slots` | GET | `?businessId=&from=&to=` | `Slot[]` |

---

*Bylo · Hackathon CRTW 2026 · Construido para Avify*

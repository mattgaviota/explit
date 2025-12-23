# Notas de Migración: React a Next.js + Firebase

## Resumen de Cambios

Se ha convertido la aplicación React monolítica (`index.js`) a una aplicación Next.js con arquitectura modular y persistencia en tiempo real con Firebase Firestore.

## Archivo Original

- **`index.js`**: Componente React único con ~420 líneas
  - Incluía toda la lógica de estado, handlers, cálculos y UI
  - Sin persistencia (estado en memoria)
  - Lógica compleja entremezclada

## Nueva Estructura

### División de Responsabilidades

#### Lógica Core (`lib/`)
- **`types.ts`**: Interfaces TypeScript (7 tipos)
- **`firebase.ts`**: Configuración Firestore y referencias
- **`calculations.ts`**: Funciones puras para cálculos (balances, settlements)
- **`hooks.ts`**: Custom hooks para Firestore sync (3 hooks)

#### Componentes (`components/`)
- **`App.tsx`**: Orquestador principal + handlers Firestore (migrado del index.js original)
- **`ParticipantForm.tsx`**: Formulario de entrada para participantes
- **`ParticipantsList.tsx`**: Listado de participantes + balances
- **`ExpenseForm.tsx`**: Modal para registrar gastos
- **`ExpenseList.tsx`**: Listado de gastos con acciones
- **`Settlement.tsx`**: Visualización de cálculos de deudas

#### Páginas (`app/`)
- **`page.tsx`**: Landing page con crear/unirse sesión
- **`gastos/[sessionId]/page.tsx`**: Ruta dinámica para sesiones
- **`layout.tsx`**: Root layout + Tailwind CSS

### Cambios de Características

#### ✅ Añadido
- **Persistencia**: Firestore Realtime listeners
- **Sesiones**: URLs únicas para compartir (`/gastos/{sessionId}`)
- **Real-time sync**: Cambios visibles instantáneamente para múltiples usuarios
- **Manejo de errores**: Estados de carga y error
- **TypeScript**: Type safety completo
- **Landing page**: Crear y unirse a sesiones

#### 🔄 Modificado
- **Estado**: De `useState` a Firestore `onSnapshot` listeners
- **Participantes**: Se guardan en Firestore (no solo en memoria)
- **Gastos**: Subcollection en Firestore
- **Colores**: Siguen siendo aleatorios HSL, pero persistentes

#### ⚠️ Consideraciones
- Requiere conexión a Firebase (sin offline mode)
- Firestore tiene límites en tier free (50K reads/writes/día)
- No hay autenticación (todos pueden acceder a cualquier sesión)

## Migración de Lógica Específica

### 1. Estado → Hooks Firestore

**Antes** (React):
```javascript
const [participants, setParticipants] = useState([]);
const [expenses, setExpenses] = useState([]);
```

**Ahora** (Firestore + Hooks):
```typescript
const { session, loading } = useSession(sessionId);
const { expenses, loading } = useExpenses(sessionId);
const participants = session?.participants || [];
```

### 2. Handlers → Firestore Writes

**Antes** (React setState):
```javascript
const addParticipant = (name) => {
  const newParticipant = { id: crypto.randomUUID(), name, color: ... };
  setParticipants([...participants, newParticipant]);
};
```

**Ahora** (Firestore):
```typescript
const handleAddParticipant = async (name: string) => {
  const newParticipant: Participant = { id: crypto.randomUUID(), name, color: ... };
  await setDoc(getSessionRef(sessionId), {
    participants: arrayUnion(newParticipant),
    updatedAt: serverTimestamp(),
  }, { merge: true });
};
```

### 3. Cálculos → Funciones Puras Reutilizables

Se extrajeron las funciones de cálculo del componente a `lib/calculations.ts`:
- `calculateTotalAmount(expenses)`
- `calculatePerPersonAmount(total, count)`
- `calculateBalances(participants, expenses)`
- `calculateSettlements(participants, balances)`

### 4. Componentes → Composición

El componente monolítico se dividió en 6 componentes reutilizables y testables.

## Pasos de Configuración

Ver `SETUP.md` para:
1. Crear proyecto Firebase
2. Configurar Firestore
3. Configurar variables de entorno
4. Actualizar security rules
5. Iniciar servidor

## Posibles Mejoras Futuras

- [ ] Agregar autenticación Firebase Auth
- [ ] Implementar offline mode con Firestore persistence
- [ ] Agregar historial de sesiones pasadas
- [ ] Exportar datos a CSV/PDF
- [ ] Modo oscuro
- [ ] Soporte para múltiples monedas
- [ ] Notificaciones en tiempo real
- [ ] Rate limiting en operaciones

## Diferencias Técnicas

| Aspecto | React (Original) | Next.js + Firebase |
|---------|-----------------|-------------------|
| **Persistencia** | None | Firestore real-time |
| **Routing** | No (SPA) | Next.js App Router |
| **Sharing** | Imposible | Por URL única |
| **Colaboración** | No | Real-time multi-user |
| **Build** | Vite/Parcel | Next.js (built-in) |
| **Deploy** | Static hosting | Vercel/Node server |

## Testing

Para futuro:
- Unit tests para `lib/calculations.ts`
- Integration tests para componentes
- E2E tests con Playwright

## Rendimiento

- **Lazy loading**: Next.js code splitting automático
- **Real-time**: Firestore optimiza listeners
- **Bundle**: TypeScript compilation en build time
- **ISR**: Posibilidad de usar ISR para funciones estáticas

## Notas de Desarrollo

1. **"use client"**: Los hooks de Firestore requieren `'use client'` en componentes
2. **Async params**: Next.js 15 requiere `await params` en page components
3. **Firestore cleanup**: Los hooks se limpian automáticamente en useEffect
4. **Typing**: Usar `as` para castear Firestore refs a tipos TypeScript

---

**Migración completada**: Aplicación funcional, lista para usar con Firebase.

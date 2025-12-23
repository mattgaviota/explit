# Estructura de Archivos - Cuentas Claras

## Descripción General

```
split/
├── app/                          # Rutas y layouts de Next.js
│   ├── layout.tsx               # Layout raíz (HTML, metadata)
│   ├── page.tsx                 # Landing page (home)
│   ├── globals.css              # Estilos globales + Tailwind
│   └── gastos/
│       └── [sessionId]/
│           └── page.tsx         # Página dinámmica de sesión
│
├── components/                   # Componentes React
│   ├── App.tsx                  # Componente principal (lógica + orquestación)
│   ├── ParticipantForm.tsx      # Formulario para agregar participantes
│   ├── ParticipantsList.tsx     # Lista de participantes + sección de balances
│   ├── ExpenseForm.tsx          # Modal para registrar gastos
│   ├── ExpenseList.tsx          # Lista de gastos registrados
│   └── Settlement.tsx           # Visualización de "quién debe a quién"
│
├── lib/                          # Lógica compartida
│   ├── types.ts                 # Interfaces TypeScript
│   ├── firebase.ts              # Configuración e inicialización de Firebase
│   ├── calculations.ts          # Funciones de cálculo (balances, settlements)
│   └── hooks.ts                 # Custom hooks para Firestore sync
│
├── public/                       # Archivos estáticos
│
├── .env.local                    # ⚠️ Variables de entorno (crear manualmente)
├── .env.example                  # Template de .env.local
├── .gitignore                    # Git ignore patterns
├── package.json                  # Dependencias y scripts
├── tsconfig.json                 # Configuración TypeScript
├── next.config.ts                # Configuración Next.js
├── tailwind.config.ts            # Configuración Tailwind CSS
├── postcss.config.js             # Configuración PostCSS
│
├── README.md                     # 📖 Descripción general del proyecto
├── QUICK_START.md                # ⚡ Inicio rápido (comienza aquí)
├── SETUP.md                      # 🔧 Guía detallada de instalación
├── CLAUDE.md                     # 🏗️  Arquitectura y desarrollo
├── MIGRATION_NOTES.md            # 📝 Detalles de migración
├── FILE_STRUCTURE.md             # 📑 Este archivo
│
└── index.js                      # 📦 Archivo original React (referencia)
```

## Descripción de Cada Archivo

### 🔧 Configuración

| Archivo | Descripción |
|---------|-------------|
| `package.json` | Dependencias (Next.js, React, Firebase, Tailwind) y scripts |
| `tsconfig.json` | Configuración del compilador TypeScript |
| `next.config.ts` | Configuración de Next.js (SSR, build, etc.) |
| `tailwind.config.ts` | Configuración de Tailwind CSS (colores, plugins) |
| `postcss.config.js` | Configuración de PostCSS (Tailwind, autoprefixer) |
| `.env.local` | ⚠️ Variables de entorno Firebase (crear manualmente) |
| `.env.example` | Template de .env.local (referencia) |
| `.gitignore` | Patrones de archivos a ignorar en Git |

### 📄 Páginas (Next.js App Router)

| Archivo | Ruta | Descripción |
|---------|------|-------------|
| `app/layout.tsx` | - | Layout raíz (HTML, head, metadata) |
| `app/page.tsx` | `/` | Landing page (crear/unirse sesión) |
| `app/globals.css` | - | Estilos globales y Tailwind imports |
| `app/gastos/[sessionId]/page.tsx` | `/gastos/:sessionId` | Página dinámica de sesión |

### 🧩 Componentes

| Archivo | Descripción |
|---------|-------------|
| `App.tsx` | **Componente principal** - Lógica de estado, handlers Firestore, orquestación |
| `ParticipantForm.tsx` | Input + botón para agregar participante |
| `ParticipantsList.tsx` | Lista de participantes + tarjeta de balances |
| `ExpenseForm.tsx` | Modal modal con formulario para registrar gasto |
| `ExpenseList.tsx` | Lista de gastos con botones de eliminar |
| `Settlement.tsx` | Sección de "quién debe a quién" con cálculos |

### 📚 Librerías (Lógica Compartida)

| Archivo | Descripción |
|---------|-------------|
| `lib/types.ts` | Interfaces TypeScript: `Participant`, `Expense`, `Session`, `Settlement`, `Balances` |
| `lib/firebase.ts` | Inicialización de Firestore, referencias a collections, helper functions |
| `lib/calculations.ts` | Funciones puras: `calculateBalances()`, `calculateSettlements()`, etc. |
| `lib/hooks.ts` | Custom hooks: `useSession()`, `useExpenses()`, `useParticipants()` |

### 📖 Documentación

| Archivo | Propósito |
|---------|----------|
| `README.md` | Descripción general, features, stack, instalación básica |
| `QUICK_START.md` | ⚡ **Comienza aquí** - Instalación rápida en 15 minutos |
| `SETUP.md` | 🔧 Guía detallada paso a paso (Firebase, env, rules) |
| `CLAUDE.md` | 🏗️  Arquitectura técnica para desarrolladores |
| `MIGRATION_NOTES.md` | 📝 Cambios desde la versión React original |
| `FILE_STRUCTURE.md` | 📑 Este archivo (descripción de estructura) |

### 📦 Original

| Archivo | Propósito |
|---------|----------|
| `index.js` | Archivo React original (para referencia) |

## Flujo de Desarrollo

### Para empezar:
1. Lee `QUICK_START.md`
2. Sigue `SETUP.md` para configurar Firebase
3. `npm install && npm run dev`

### Para entender la arquitectura:
1. Lee `CLAUDE.md`
2. Revisa `lib/types.ts` para datos
3. Revisa `lib/firebase.ts` para Firestore setup
4. Revisa `components/App.tsx` para lógica principal

### Para hacer cambios:
1. Componentes → `components/`
2. Lógica pura → `lib/calculations.ts`
3. Tipos → `lib/types.ts`
4. Configuración → `next.config.ts`, `tailwind.config.ts`, etc.

## Orden de Lectura Recomendado

```
1. QUICK_START.md          (15 min)
   ↓
2. SETUP.md                (15 min)
   ↓
3. README.md               (10 min)
   ↓
4. lib/types.ts            (5 min)
   ↓
5. components/App.tsx      (20 min)
   ↓
6. lib/calculations.ts     (10 min)
   ↓
7. CLAUDE.md               (15 min)
```

## Cambios Principales desde index.js

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| **Persistencia** | useState en memoria | Firestore real-time |
| **Componentes** | 1 grande | 6 pequeños + orquestador |
| **Cálculos** | En el render | Funciones puras |
| **Tipos** | Ninguno | TypeScript completo |
| **Routing** | SPA sin rutas | Next.js App Router |
| **Composición** | Monolítico | Modular |

## Total de Archivos

- **Configuración**: 8 archivos
- **App/Pages**: 4 archivos
- **Componentes**: 6 archivos
- **Librerías**: 4 archivos
- **Documentación**: 6 archivos
- **Otros**: 1 archivo (index.js original)

**Total**: ~29 archivos

## Notas Importantes

- El `index.js` original se mantiene para referencia
- Todos los componentes usan `'use client'` (Firestore requiere client-side)
- TypeScript está configurado con `strict: true`
- Tailwind está configurado solo para archivos en `app/` y `components/`
- Firebase es solo client-side (sin Admin SDK)

---

Para más información, consulta `CLAUDE.md` o los comentarios en cada archivo.

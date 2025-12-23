# Explit

Una aplicación web moderna para dividir gastos de forma justa en tus juntadas, creada con Next.js y Firebase.

## Características

- **Crear sesiones**: Genera una nueva sesión con un código único
- **Compartir por URL**: Comparte el enlace con tus amigos para que se unan
- **Gestión de participantes**: Agrega y elimina personas de la juntada
- **Registro de gastos**: Registra quién pagó y cuánto
- **Cálculos automáticos**: Calcula automáticamente quién debe a quién
- **Algoritmo optimizado**: Minimiza el número de transferencias necesarias
- **Persistencia en tiempo real**: Todos ven los cambios al instante con Firebase
- **Interfaz moderna**: Diseño limpio y responsive con Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (React 19)
- **Base de Datos**: Firebase Firestore
- **Estilos**: Tailwind CSS
- **Iconos**: Lucide React
- **Lenguaje**: TypeScript

## Configuración

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd split
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilita Firestore Database
3. Copia las credenciales de Firebase
4. Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Configurar Firestore Rules

En Firebase Console, ve a Firestore > Rules y reemplaza con:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{sessionId} {
      allow read, write;
      match /expenses/{expenseId} {
        allow read, write;
      }
    }
  }
}
```

> ⚠️ **Nota de seguridad**: Esta configuración permite acceso abierto. Para producción, implementa autenticación adecuada.

## Desarrollo

### Ejecutar servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

### Build para producción

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

## Estructura del Proyecto

```
split/
├── app/
│   ├── layout.tsx           # Layout raíz
│   ├── page.tsx             # Landing page
│   ├── globals.css          # Estilos globales
│   └── gastos/
│       └── [sessionId]/
│           └── page.tsx     # Página de sesión dinámica
├── components/
│   ├── App.tsx              # Componente principal
│   ├── ParticipantForm.tsx  # Formulario de participante
│   ├── ParticipantsList.tsx # Lista de participantes
│   ├── ExpenseForm.tsx      # Formulario de gasto
│   ├── ExpenseList.tsx      # Lista de gastos
│   └── Settlement.tsx       # Cálculos de deudas
├── lib/
│   ├── firebase.ts          # Configuración de Firebase
│   ├── types.ts             # Interfaces TypeScript
│   ├── calculations.ts      # Lógica de cálculos
│   └── hooks.ts             # Custom hooks
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## Flujo de Uso

1. **Ir a la página de inicio** y crear una nueva sesión
2. **Compartir el link** con los amigos
3. **Agregar participantes** en la juntada
4. **Registrar gastos** a medida que ocurren
5. **Ver automáticamente** quién debe a quién
6. **Compartir el plan** de pagos con el grupo

## Algoritmo de Settlement

El algoritmo utiliza un enfoque codicioso para minimizar el número de transacciones:

1. Calcula el balance de cada persona (positivo = debe recibir, negativo = debe pagar)
2. Agrupa a deudores y acreedores
3. Empareja deudores con acreedores, creando pagos hasta reconciliar

Este método es óptimo para reducir el número total de transferencias necesarias.

## Limitaciones y Mejoras Futuras

- No hay persistencia local (requiere conexión a Firebase)
- No hay autenticación de usuarios
- No hay historial de sesiones pasadas
- No hay exportación de datos

## Licencia

MIT

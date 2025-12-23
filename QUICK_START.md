# Quick Start - Cuentas Claras

## 1️⃣ Instalación Rápida (5 minutos)

```bash
# Instalar dependencias
npm install
```

## 2️⃣ Firebase Setup (10 minutos)

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Crea un nuevo proyecto
3. Ve a **Build > Firestore Database** y crea BD (modo test)
4. Copia tu Firebase config desde **Project Settings**
5. Pégalo en `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

6. En **Firestore > Rules**, pega:

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

7. **Publish** las reglas

## 3️⃣ Iniciar (1 minuto)

```bash
npm run dev
```

Abre http://localhost:3000

## 4️⃣ Usar

1. Haz clic en **"Crear Sesión"**
2. Comparte el link con amigos
3. Agrega participantes y gastos
4. ¡Los cambios se sincronizan instantáneamente!

## 🎯 Estructura de Datos

```
Sesión = URL única con un conjunto de gastos
Participante = Persona en la juntada (con color asignado)
Gasto = Dinero pagado por alguien
Balance = Cuánto debe/recibe cada persona
Settlement = Plan de pagos optimizado
```

## 📱 URLs

- **Home**: http://localhost:3000 (crear/unirse sesión)
- **Sesión**: http://localhost:3000/gastos/[id-único]

## ⚡ Comandos Útiles

```bash
npm run dev      # Desarrollo
npm run build    # Build de producción
npm run start    # Ejecutar build
npm run lint     # Chequear code style
```

## 🐛 Problemas Comunes

**"Firebase not initialized"**
- Verifica `.env.local` tiene los valores correctos
- Reinicia: `Ctrl+C` y `npm run dev`

**"Permission denied" en Firestore**
- Verifica que las Firestore Rules están publicadas
- Estás en modo "test mode"?

**Nada se ve**
- Abre DevTools (F12) > Console
- Busca errores de red o Firebase

## 📚 Documentación Completa

- `README.md` - Descripción general
- `SETUP.md` - Guía detallada de instalación
- `CLAUDE.md` - Arquitectura técnica
- `MIGRATION_NOTES.md` - Cambios desde versión React

## 🚀 Listo para Producción?

Sí, pero antes:
- [ ] Implementa autenticación (Firebase Auth)
- [ ] Actualiza Firestore rules con `request.auth`
- [ ] Deploy a Vercel: `npm i -g vercel && vercel`
- [ ] Configura variables en Vercel settings

---

¡Listo! Ahora puedes dividir gastos sin drama. 💰

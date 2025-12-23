# Guía de Configuración - Cuentas Claras

## Paso 1: Instalar Dependencias

```bash
npm install
```

## Paso 2: Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Haz clic en "Create Project" o usa uno existente
3. Nombre del proyecto: `cuentas-claras` (o el que prefieras)
4. No necesitas Google Analytics

## Paso 3: Habilitar Firestore

1. En Firebase Console, ve a **Build > Firestore Database**
2. Haz clic en **Create Database**
3. Selecciona región más cercana (ej: `us-east1`)
4. **Modo**: Selecciona "Start in test mode" (para desarrollo)
5. Crea la base de datos

## Paso 4: Copiar Credenciales de Firebase

1. En Firebase Console, ve a **Project Settings** (engranaje en la esquina superior)
2. Ve a la pestaña **Your apps**
3. Selecciona o crea una app web (`</>`)
4. Copia el objeto de configuración que se ve así:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "cuentas-claras.firebaseapp.com",
  projectId: "cuentas-claras-xxxxx",
  storageBucket: "cuentas-claras-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

## Paso 5: Configurar Variables de Entorno

1. Crea un archivo `.env.local` en la raíz del proyecto
2. Copia el contenido de `.env.example`:

```bash
cp .env.example .env.local
```

3. Reemplaza los valores con los de tu Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=cuentas-claras.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=cuentas-claras-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=cuentas-claras-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Paso 6: Configurar Reglas de Firestore (Desarrollo)

1. En Firebase Console, ve a **Build > Firestore Database > Rules**
2. Reemplaza el contenido con:

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

3. Publica las reglas

⚠️ **IMPORTANTE**: Estas reglas son solo para desarrollo. Para producción, debes implementar autenticación.

## Paso 7: Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en http://localhost:3000

## Verificación

1. Abre http://localhost:3000
2. Haz clic en "Crear Sesión"
3. Verifica que se crea una sesión con URL compartible
4. Intenta agregar participantes y gastos
5. Comprueba que los datos se guardan en Firestore (revisa en Firebase Console)

## Solución de Problemas

### Error: "Firebase app not initialized"
- Verifica que `.env.local` existe y tiene valores correctos
- Reinicia el servidor Next.js: `Ctrl+C` y `npm run dev`

### Datos no se guardan en Firestore
- Verifica las Firestore rules permiten `write`
- Abre Browser DevTools (F12) > Console y busca errores
- Verifica el Firebase projectId es correcto

### El servidor no inicia
- Verifica que Node.js 18+ está instalado: `node --version`
- Borra `node_modules` y `.next`: `rm -rf node_modules .next`
- Reinstala: `npm install`

## Para Producción

Antes de hacer deploy:

1. **Habilita autenticación** en Firebase (Email/Google)
2. **Actualiza Firestore rules** para validar `request.auth`
3. **Habilita SSL/HTTPS** en el servidor
4. Considera **limitaciones de Firestore**:
   - 50K reads/writes diarios en tier free
   - Máximo 1 MB por documento
   - Máximo 20K documents por colección

## Desplegando a Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

Sigue los pasos interactivos y configura las variables de entorno.

## Documentación Adicional

- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Docs](https://cloud.google.com/firestore/docs)

# Troubleshooting - Cuentas Claras

## Problemas Comunes y Soluciones

### 1. ❌ "Module not found" o "Cannot find module 'firebase'"

**Síntoma**: Error al ejecutar `npm run dev`

**Solución**:
```bash
# Elimina node_modules y reinstala
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### 2. ❌ "Firebase app not initialized"

**Síntoma**: Error en consola: `FirebaseError: Firebase app not initialized`

**Causas posibles**:
- `.env.local` no existe
- `.env.local` tiene valores vacíos o incorrectos
- Servidor no se reinició después de crear `.env.local`

**Solución**:
```bash
# 1. Verifica que existe .env.local
ls -la .env.local

# 2. Verifica que tiene valores (no "your_xxx_here")
cat .env.local

# 3. Reinicia el servidor
# Ctrl+C en terminal
npm run dev
```

### 3. ❌ "Permission denied" en Firestore

**Síntoma**: Error al guardar datos: `Permission denied: Missing or insufficient permissions`

**Causas posibles**:
- Firestore rules no están configuradas correctamente
- Rules no están publicadas
- No estás en modo "test mode"

**Solución**:
```
1. Ve a Firebase Console > Firestore Database > Rules
2. Verifica que el contenido es:

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

3. Haz clic en "Publish"
4. Espera a que diga "Published" (puede tardar 1-2 min)
5. Reinicia el servidor
```

### 4. ❌ "No data showing" / "Página en blanco"

**Síntoma**: La app carga pero no hay datos

**Debug steps**:
```javascript
// Abre DevTools (F12) > Console
// Busca errores en rojo
// Verifica que Firebase se inicializó
```

**Causas posibles**:
- Firebase no está inicializado
- No hay conexión a internet
- Firestore database no existe

**Solución**:
1. Abre DevTools (F12) > Console
2. Busca errores en rojo
3. Si ves "Cannot read properties of undefined", Firebase no se inicializó
4. Verifica `.env.local` como en problema #2

### 5. ❌ "localhost:3000 refused to connect"

**Síntoma**: Error al abrir `http://localhost:3000`

**Causas posibles**:
- Servidor no está ejecutándose
- Puerto 3000 está en uso
- Node.js no está instalado correctamente

**Solución**:
```bash
# Verifica que Next.js está corriendo
# Deberías ver: "ready - started server on 0.0.0.0:3000"

# Si no funciona, intenta otro puerto
PORT=3001 npm run dev

# Si aún no funciona, verifica Node.js
node --version  # Debe ser 18 o superior
```

### 6. ❌ "Datos no se sincronizan entre usuarios"

**Síntoma**: Cambios hechos en una ventana no aparecen en otra

**Causas posibles**:
- Firestore listeners no están activos
- Hay error en la conexión
- Rules no permiten lectura

**Debug**:
1. Abre DevTools en ambas ventanas
2. En ambas, abre Console
3. Busca errores relacionados a Firestore
4. Verifica que ambas ventanas usan el mismo `sessionId`

**Solución**:
```bash
# Verifica que las reglas tienen "allow read"
# En Firebase Console > Firestore Database > Rules
allow read, write;

# Reinicia ambas ventanas del navegador
```

### 7. ⚠️ "Slow performance" / "Laggy app"

**Síntoma**: App se mueve lentamente, hay delays

**Causas posibles**:
- Muchos gastos (100+)
- Laptop lenta
- Firestore sync delays
- Network latency

**Optimización**:
```typescript
// Los cálculos ya usan useMemo, pero si tienes problemas:
// Reduce el número de listeners activos
// O implementa pagination para gastos
```

### 8. ❌ "SessionId not found" en URL

**Síntoma**: Accedes a `/gastos/xxx` pero dice "sesión no encontrada"

**Causas posibles**:
- El `sessionId` es inválido o mal copiado
- La sesión fue eliminada
- El `sessionId` no existe en Firestore

**Solución**:
1. Verifica que el URL sea exacto en Firebase Console
2. En `Firestore Database`, ve a la colección `sessions`
3. Busca tu `sessionId`
4. Si no está, crea una nueva sesión

### 9. ❌ Error de compilación TypeScript

**Síntoma**: `npm run build` falla con errores de tipo

**Solución**:
```bash
# Primero verifica que el código está correcto
npm run lint

# Luego intenta el build
npm run build

# Si aún falla, revisa el error específico
# Usualmente es un type casting o null check
```

### 10. ❌ ".env.local not being read"

**Síntoma**: Variables de entorno aparecen como `undefined`

**Causas**:
- `.env.local` no existe
- Nombre del archivo es incorrecto (case-sensitive en Linux/Mac)
- No reiniciaste el servidor

**Solución**:
```bash
# Verifica que el archivo existe EXACTAMENTE así
ls -la | grep env

# Debe mostrar: .env.local

# NO: .env, .ENV.local, .env.local.txt, etc.

# Verifica contenido
cat .env.local

# Reinicia
npm run dev
```

## Debugging Avanzado

### Ver logs de Firestore

```javascript
// En el navegador Console (F12)
import { enableLogging } from 'firebase/firestore';
enableLogging(true);
```

### Verificar cambios en Firestore Console

```
1. Firebase Console > Firestore Database
2. Ve a Collection "sessions"
3. Haz clic en tu sessionId
4. Verifica que ve:
   - createdAt
   - updatedAt
   - participants (array)
5. Ve a la subcollection "expenses"
6. Verifica que se crean documentos
```

### Inspeccionar estado de React

```javascript
// DevTools > React tab (necesita React DevTools extensión)
// Selecciona App component
// Verifica "session" y "expenses" en props
```

## Preguntas Frecuentes

**P: ¿Funciona sin internet?**
R: No, necesita conexión a Firestore. Para offline, necesitas `enablePersistence()`.

**P: ¿Puedo usar una BD diferente a Firestore?**
R: Sí, pero necesitarías cambiar `lib/firebase.ts` y `lib/hooks.ts`.

**P: ¿Puedo hostear en GitHub Pages?**
R: No (GitHub Pages es solo static). Usa Vercel, Netlify, o Heroku.

**P: ¿Es seguro para datos reales?**
R: No en desarrollo (rules abiertas). Para producción, agrega autenticación.

## Recursos

- [Firebase Docs](https://firebase.google.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## Contacto / Soporte

Para bugs o preguntas específicas:
1. Revisa `CLAUDE.md` para arquitectura
2. Revisa los comentarios en los archivos
3. Abre DevTools y busca errores en Console
4. Verifica Firebase Console para datos

---

**Última actualización**: Dec 23, 2024
**Versión**: 1.0.0

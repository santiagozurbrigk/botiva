# 🔧 Solución de Problemas en Render.com

## Problema: El backend queda en "Deploying..." y no inicia

### Síntomas
- ✅ Build exitoso
- ❌ Deployment se queda en "Deploying..."
- ❌ Error en n8n: "The service refused the connection"
- ❌ Health check no responde

---

## ✅ Soluciones Paso a Paso

### 1. Verificar Variables de Entorno

**En Render Dashboard:**
1. Ve a tu servicio → **Environment**
2. Verifica que tengas estas variables configuradas:

```env
NODE_ENV=production
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
SUPABASE_ANON_KEY=tu-anon-key
CORS_ORIGIN=https://botiva.vercel.app
```

⚠️ **IMPORTANTE**: Si falta alguna variable de Supabase, el servidor no iniciará correctamente.

---

### 2. Verificar Logs de Render

**En Render Dashboard:**
1. Ve a **Logs** (en el menú lateral)
2. Busca errores como:
   - `Error: Cannot find module`
   - `EADDRINUSE`
   - `Missing environment variable`
   - `Connection refused`

**Comandos útiles para ver logs:**
- Los logs aparecen automáticamente en la interfaz
- Si ves errores de Supabase, verifica las credenciales

---

### 3. Verificar Health Check

**El health check debe estar configurado así:**
- **Path**: `/health`
- **Method**: GET

**Prueba manualmente:**
```bash
curl https://botiva.onrender.com/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-03T..."
}
```

---

### 4. Problemas Comunes y Soluciones

#### ❌ Problema: "Cannot find module"
**Solución:**
- Verifica que `package.json` tenga todas las dependencias
- Asegúrate de que `npm install` se ejecute correctamente
- Verifica que el `buildCommand` en Render sea `npm install`

#### ❌ Problema: "EADDRINUSE" o "Port already in use"
**Solución:**
- Render asigna automáticamente el puerto
- NO definas `PORT` en variables de entorno
- El servidor debe usar `process.env.PORT || 3001`

#### ❌ Problema: "Service refused the connection"
**Solución:**
1. El servicio puede estar "sleeping" (plan gratuito)
2. Espera 30-60 segundos después del primer request
3. O actualiza al plan Starter ($7/mes) para evitar sleep

#### ❌ Problema: Variables de entorno faltantes
**Solución:**
1. Ve a **Environment** en Render
2. Agrega todas las variables necesarias
3. Haz **Manual Deploy** para aplicar los cambios

---

### 5. Reiniciar el Servicio

**Si el deployment está atascado:**

1. **Opción 1: Manual Deploy**
   - Ve a **Events** en Render
   - Click en **Manual Deploy**
   - Selecciona el último commit

2. **Opción 2: Restart Service**
   - Ve a **Settings** → **Manual Restart**
   - Click en **Restart**

3. **Opción 3: Cancelar y Redesplegar**
   - Si el deployment está atascado, cancélalo
   - Haz un nuevo commit (cualquier cambio pequeño)
   - Push a GitHub para trigger automático

---

### 6. Verificar Configuración del Servicio

**En Render Dashboard → Settings:**

✅ **Build Command**: `npm install`
✅ **Start Command**: `npm start`
✅ **Health Check Path**: `/health`
✅ **Auto-Deploy**: `Yes` (si está conectado a GitHub)

---

### 7. Probar el Servidor Localmente

**Antes de deployar, prueba localmente:**

```bash
cd Backend
npm install
npm start
```

**Luego prueba:**
```bash
curl http://localhost:3001/health
```

Si funciona localmente pero no en Render, el problema es de configuración en Render.

---

### 8. Verificar el Plan de Render

**Plan Gratuito (Free):**
- ⚠️ Se "duerme" después de 15 minutos de inactividad
- ⚠️ Tarda 30-60 segundos en "despertar"
- ⚠️ Puede causar timeouts en n8n

**Plan Starter ($7/mes):**
- ✅ Siempre activo
- ✅ Sin delays
- ✅ Mejor para producción

**Recomendación**: Si necesitas que n8n funcione siempre, actualiza al plan Starter.

---

### 9. Verificar CORS

**Si el frontend no puede conectarse:**

1. Verifica que `CORS_ORIGIN` en Render sea:
   ```
   https://botiva.vercel.app
   ```

2. En desarrollo local, puedes usar:
   ```
   http://localhost:5173
   ```

---

### 10. Comandos de Diagnóstico

**Desde tu computadora, prueba estos comandos:**

```bash
# 1. Verificar que el servicio responde
curl https://botiva.onrender.com/health

# 2. Verificar que el endpoint de órdenes funciona (sin auth)
curl -X POST https://botiva.onrender.com/api/orders \
  -H "Content-Type: application/json" \
  -d '{"external_id": "test", "customer_name": "Test", "customer_phone": "+123", "customer_address": "Test", "items": [], "total_amount": 0, "payment_method": "efectivo"}'

# 3. Verificar login
curl -X POST https://botiva.onrender.com/api/auth/login-admin \
  -H "Content-Type: application/json" \
  -d '{"email": "tu-email@ejemplo.com", "password": "tu-password"}'
```

---

## 🚨 Checklist de Verificación

Antes de reportar un problema, verifica:

- [ ] Variables de entorno configuradas en Render
- [ ] Health check responde (`/health`)
- [ ] Build exitoso en Render
- [ ] Logs no muestran errores críticos
- [ ] Servidor funciona localmente
- [ ] `package.json` tiene todas las dependencias
- [ ] `startCommand` es correcto (`npm start`)
- [ ] CORS está configurado correctamente

---

## 📞 Si el Problema Persiste

1. **Revisa los logs completos** en Render
2. **Copia el error específico** que aparece
3. **Verifica que el código esté actualizado** en GitHub
4. **Prueba hacer un nuevo deployment** manual

---

## 🔄 Deployment Manual

Si necesitas hacer un deployment manual:

1. **En Render Dashboard:**
   - Ve a **Events**
   - Click en **Manual Deploy**
   - Selecciona el branch (`main`)
   - Click en **Deploy latest commit**

2. **O desde Git:**
   ```bash
   git commit --allow-empty -m "Trigger deployment"
   git push origin main
   ```

---

## ✅ Configuración Correcta Final

**render.yaml:**
```yaml
services:
  - type: web
    name: botiva-backend
    env: node
    plan: free  # o starter para producción
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /health
```

**server.js:**
```javascript
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
```

**Variables de entorno en Render:**
- `NODE_ENV=production`
- `SUPABASE_URL=...`
- `SUPABASE_SERVICE_ROLE_KEY=...`
- `SUPABASE_ANON_KEY=...`
- `CORS_ORIGIN=https://botiva.vercel.app`

---

**Última actualización**: Noviembre 2025

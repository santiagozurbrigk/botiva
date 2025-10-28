# 🚀 Guía de Deploy a Producción - Botiva

## 📋 Índice
1. [Preparación del Proyecto](#preparación-del-proyecto)
2. [Deploy del Backend](#deploy-del-backend)
3. [Deploy del Frontend](#deploy-del-frontend)
4. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
5. [Configuración de Supabase](#configuración-de-supabase)
6. [Dominio Personalizado](#dominio-personalizado)
7. [Monitoreo y Logs](#monitoreo-y-logs)

---

## 🔧 Preparación del Proyecto

### 1. Verificar archivos necesarios

#### Backend (`Backend/`):
- ✅ `server.js` - Servidor principal
- ✅ `package.json` - Con script `start`
- ✅ `.env` - Variables de entorno (NO subir a GitHub)

#### Frontend (`Frontend/`):
- ✅ `vite.config.js` - Configuración de Vite
- ✅ `package.json` - Con scripts de build
- ✅ Variables de entorno en `.env`

---

## 🖥️ Deploy del Backend

### Opción A: Render.com (Recomendado)

1. **Crear cuenta en Render.com**
   - Ve a https://render.com
   - Registrate con GitHub

2. **Crear nuevo Web Service**
   - Click en "New +" → "Web Service"
   - Conecta tu repositorio de GitHub
   - Selecciona el branch `main` o `master`

3. **Configuración del servicio:**
   ```
   Name: botiva-backend
   Environment: Node
   Build Command: cd Backend && npm install
   Start Command: cd Backend && npm start
   Instance Type: Free (o $7/mes para Starter)
   ```

4. **Variables de Entorno:**
   ```
   PORT=10000
   SUPABASE_URL=tu_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   SUPABASE_ANON_KEY=tu_anon_key
   NODE_ENV=production
   CORS_ORIGIN=https://tu-frontend-url.vercel.app
   ```

5. **Habilitar Auto-Deploy**
   - ✅ Check "Auto-Deploy"
   - Cada push a `main` deployará automáticamente

6. **Obtener URL del Backend:**
   - Render te dará una URL tipo: `https://botiva-backend.onrender.com`
   - Guarda esta URL para configurar el frontend

### Opción B: Railway

1. **Crear cuenta en Railway.app**
   - Ve a https://railway.app
   - Conecta con GitHub

2. **Nuevo Proyecto**
   - "New Project" → "Deploy from GitHub repo"
   - Selecciona tu repositorio

3. **Configuración:**
   - Railway detectará automáticamente Node.js
   - Agrega `ROOT_DIR=Backend` en variables de entorno
   - Railway configurará el resto automáticamente

4. **Variables de Entorno:**
   - Agrega todas las variables necesarias en el panel

---

## 🎨 Deploy del Frontend

### Opción A: Vercel (Recomendado)

1. **Crear cuenta en Vercel**
   - Ve a https://vercel.com
   - Registrate con GitHub

2. **Importar Proyecto**
   - Click "Add New" → "Project"
   - Importa tu repositorio
   - Selecciona el directorio `Frontend`

3. **Configuración:**
   ```
   Framework Preset: Vite
   Root Directory: Frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Variables de Entorno:**
   ```
   VITE_API_URL=https://botiva-backend.onrender.com
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel te dará una URL tipo: `https://botiva-xxx.vercel.app`

### Opción B: Netlify

1. **Crear cuenta en Netlify**
   - Ve a https://netlify.com
   - Conecta con GitHub

2. **Nuevo Site desde Git**
   - "Add new site" → "Import an existing project"
   - Selecciona tu repositorio

3. **Configuración de Build:**
   ```
   Base directory: Frontend
   Build command: npm run build
   Publish directory: Frontend/dist
   ```

4. **Variables de Entorno:**
   - Ve a "Site settings" → "Environment variables"
   - Agrega `VITE_API_URL`

---

## 🔐 Configuración de Variables de Entorno

### Backend (Render/Railway):

```env
# Puerto (Render usa 10000, Railway auto-asigna)
PORT=10000

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
SUPABASE_ANON_KEY=tu_anon_key

# Entorno
NODE_ENV=production

# CORS - URL de tu frontend en producción
CORS_ORIGIN=https://botiva-frontend.vercel.app
```

### Frontend (Vercel/Netlify):

```env
# URL del backend en producción
VITE_API_URL=https://botiva-backend.onrender.com

# Supabase (opcional, si lo usas directamente)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

### Actualizar Frontend para usar variables de entorno:

En `Frontend/src/lib/api.js`, verifica que use:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

---

## 🗄️ Configuración de Supabase

### 1. Actualizar RLS Policies

Asegúrate de que las políticas RLS estén configuradas correctamente para producción:

```sql
-- Verificar que todas las políticas estén activas
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### 2. Verificar URLs Permitidas en Supabase

1. Ve a tu proyecto en Supabase
2. Settings → API
3. En "URLs permitidas" agrega:
   ```
   https://botiva-frontend.vercel.app
   https://botiva-backend.onrender.com
   ```

### 3. CORS en Supabase Dashboard

- Settings → API → CORS Origins
- Agrega tu dominio de frontend

---

## 🌐 Dominio Personalizado

### Render.com:

1. En tu servicio de backend:
   - Settings → Custom Domain
   - Agrega tu dominio: `api.botiva.com`
   - Configura DNS según instrucciones

2. DNS Records a configurar:
   ```
   Type: CNAME
   Name: api
   Value: botiva-backend.onrender.com
   ```

### Vercel:

1. En tu proyecto de frontend:
   - Settings → Domains
   - Agrega tu dominio: `app.botiva.com`
   - Configura DNS según instrucciones

2. DNS Records:
   ```
   Type: CNAME
   Name: app
   Value: cname.vercel-dns.com
   ```

---

## 📊 Monitoreo y Logs

### Render.com:
- **Logs en tiempo real** en el dashboard
- **Métricas** de CPU, memoria, tráfico
- **Alertas** por email (en plan pago)

### Vercel:
- **Analytics** integrado
- **Logs** de deploy y errores
- **Performance metrics**

### Recomendaciones adicionales:

1. **Sentry** para error tracking:
   ```bash
   npm install @sentry/node @sentry/react
   ```

2. **Uptime Robot** para monitoreo:
   - https://uptimerobot.com
   - Monitorea tu backend cada 5 minutos

---

## ✅ Checklist Pre-Deploy

- [ ] Variables de entorno configuradas en producción
- [ ] `CORS_ORIGIN` apunta al frontend correcto
- [ ] `VITE_API_URL` apunta al backend correcto
- [ ] Base de datos Supabase configurada
- [ ] RLS policies verificadas
- [ ] URLs permitidas en Supabase
- [ ] Build del frontend funciona localmente
- [ ] Backend funciona localmente
- [ ] Logs configurados
- [ ] Dominio personalizado (opcional)
- [ ] SSL/HTTPS habilitado (automático)

---

## 🚨 Troubleshooting

### Backend no inicia:
- Verifica el `PORT` en variables de entorno
- Render usa `PORT` automáticamente, no lo sobreescribas a menos que sea necesario
- Revisa los logs en el dashboard

### Frontend no conecta con backend:
- Verifica `VITE_API_URL` en variables de entorno
- Verifica `CORS_ORIGIN` en backend
- Revisa la consola del navegador para errores CORS

### Errores de autenticación:
- Verifica que las keys de Supabase estén correctas
- Verifica URLs permitidas en Supabase
- Revisa las políticas RLS

### Build falla:
- Revisa los logs de build
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que `node_modules` no esté en el repositorio

---

## 📞 Soporte

Si tienes problemas con el deploy:
1. Revisa los logs en la plataforma
2. Verifica las variables de entorno
3. Prueba localmente primero
4. Contacta al equipo de soporte de la plataforma

---

## 🎯 Próximos Pasos

1. ✅ Deploy del backend
2. ✅ Deploy del frontend
3. ✅ Configurar n8n con URLs de producción
4. ✅ Probar flujo completo
5. ✅ Configurar dominio personalizado
6. ✅ Monitoreo activo

**¡Listo para producción! 🚀**

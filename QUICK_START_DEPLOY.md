# ⚡ Quick Start - Deploy Rápido de Botiva

## 🎯 Setup en 15 minutos

### Paso 1: Preparar el Repositorio (2 min)

1. Asegúrate de que tu código esté en GitHub
2. Verifica que `.gitignore` esté actualizado (ya incluido)
3. Haz commit y push de todos los cambios

```bash
git add .
git commit -m "Preparado para deploy a producción"
git push origin main
```

---

### Paso 2: Deploy del Backend en Render.com (5 min)

1. **Crear cuenta:**
   - Ve a https://render.com
   - Sign up con GitHub

2. **Nuevo Web Service:**
   - Click "New +" → "Web Service"
   - Conecta tu repositorio
   - Selecciona el repo de Botiva

3. **Configuración rápida:**
   ```
   Name: botiva-backend
   Region: Oregon (o el más cercano)
   Branch: main
   Root Directory: Backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Instance: Free (o Starter $7/mes)
   ```

4. **Variables de Entorno (IMPORTANTE):**
   ```
   NODE_ENV = production
   PORT = 10000
   SUPABASE_URL = (tu URL de Supabase)
   SUPABASE_SERVICE_ROLE_KEY = (tu service role key)
   SUPABASE_ANON_KEY = (tu anon key)
   CORS_ORIGIN = https://botiva-frontend.vercel.app
   ```
   ⚠️ **NOTA:** La última variable la agregas después de deploy del frontend

5. **Click "Create Web Service"**
   - Espera 2-3 minutos a que termine el deploy
   - Copia la URL que te da (ej: `https://botiva-backend-xxx.onrender.com`)

---

### Paso 3: Deploy del Frontend en Vercel (5 min)

1. **Crear cuenta:**
   - Ve a https://vercel.com
   - Sign up con GitHub

2. **Importar proyecto:**
   - Click "Add New" → "Project"
   - Selecciona tu repositorio
   - Click "Import"

3. **Configuración:**
   ```
   Framework Preset: Vite
   Root Directory: Frontend
   Build Command: npm run build (auto-detectado)
   Output Directory: dist (auto-detectado)
   ```

4. **Variables de Entorno:**
   ```
   VITE_API_URL = https://botiva-backend-xxx.onrender.com
   ```
   (Usa la URL que copiaste del backend)

5. **Click "Deploy"**
   - Espera 1-2 minutos
   - Copia la URL del frontend (ej: `https://botiva-xxx.vercel.app`)

---

### Paso 4: Actualizar CORS y Variables (3 min)

1. **Volver a Render (Backend):**
   - Ve a tu servicio
   - Settings → Environment
   - Actualiza `CORS_ORIGIN` con la URL de Vercel
   - Click "Save Changes"
   - El servicio se redeployará automáticamente

2. **Supabase Dashboard:**
   - Ve a tu proyecto en Supabase
   - Settings → API
   - En "URLs permitidas" agrega:
     - `https://botiva-frontend.vercel.app`
     - `https://botiva-backend.onrender.com`

---

### Paso 5: Probar (2 min)

1. **Abre la URL del frontend:**
   - Deberías ver la pantalla de login

2. **Prueba login:**
   - Intenta iniciar sesión con tus credenciales
   - Si funciona, ¡estás listo!

3. **Verifica logs:**
   - Render: Ve a "Logs" en tu servicio
   - Vercel: Ve a "Deployments" → Click en el último → Ver logs

---

## 🔗 URLs de Producción

Después del deploy, tendrás:

- **Frontend:** `https://botiva-xxx.vercel.app`
- **Backend:** `https://botiva-backend-xxx.onrender.com`
- **Health Check:** `https://botiva-backend-xxx.onrender.com/health`

---

## 🎯 Configurar n8n

Ahora que tienes el backend en producción:

1. **En n8n:**
   - Cambia todas las URLs de `http://localhost:3001` a tu URL de Render
   - Usa `https://botiva-backend-xxx.onrender.com/api/orders`

2. **Webhook de WhatsApp:**
   - Configura el webhook para que apunte a tu backend de producción

3. **Prueba el flujo completo:**
   - Envía un mensaje por WhatsApp
   - Verifica que aparezca en el dashboard

---

## 🚨 Troubleshooting Rápido

### Frontend muestra error de conexión:
- Verifica `VITE_API_URL` en Vercel
- Verifica `CORS_ORIGIN` en Render
- Revisa la consola del navegador

### Backend no responde:
- Verifica logs en Render
- Verifica variables de entorno
- Prueba `/health` endpoint

### Error 401/403:
- Verifica keys de Supabase
- Verifica URLs permitidas en Supabase dashboard

---

## ✅ Checklist Final

- [ ] Backend deployado en Render
- [ ] Frontend deployado en Vercel
- [ ] Variables de entorno configuradas
- [ ] CORS actualizado
- [ ] Supabase URLs permitidas configuradas
- [ ] Login funciona
- [ ] n8n configurado con URLs de producción
- [ ] Flujo de WhatsApp probado

**¡Listo! Botiva está en producción 🚀**

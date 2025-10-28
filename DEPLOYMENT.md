# 🚀 Guía de Despliegue - Ala-Burguer

Esta guía te ayudará a desplegar el proyecto Ala-Burguer en producción usando **Render.com** para el backend y **Vercel** para el frontend.

## 📋 Prerrequisitos

- Cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
- Cuenta en [Render.com](https://render.com)
- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [GitHub](https://github.com)

## 🗄️ Paso 1: Configurar MongoDB Atlas

### 1.1 Crear Cluster
1. Ve a [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crea una cuenta gratuita
3. Crea un nuevo cluster (M0 Sandbox - Gratuito)
4. Elige la región más cercana a tu ubicación

### 1.2 Configurar Acceso
1. **Database Access**: Crea un usuario de base de datos
   - Username: `ala-burguer-admin`
   - Password: Genera una contraseña segura
   - Database User Privileges: `Read and write to any database`

2. **Network Access**: Configura acceso de red
   - Agrega IP: `0.0.0.0/0` (para permitir acceso desde cualquier lugar)
   - O agrega las IPs específicas de Render.com

### 1.3 Obtener String de Conexión
1. Ve a "Connect" en tu cluster
2. Selecciona "Connect your application"
3. Copia el string de conexión:
   ```
   mongodb+srv://ala-burguer-admin:<password>@cluster0.xxxxx.mongodb.net/ala-burguer?retryWrites=true&w=majority
   ```

## 🔧 Paso 2: Desplegar Backend en Render.com

### 2.1 Preparar Repositorio
1. Sube tu código a GitHub
2. Asegúrate de que el backend esté en la carpeta `Backend/`

### 2.2 Crear Servicio en Render
1. Ve a [Render.com](https://render.com)
2. Conecta tu cuenta de GitHub
3. Crea un nuevo "Web Service"
4. Selecciona tu repositorio

### 2.3 Configurar el Servicio
```
Name: ala-burguer-backend
Environment: Node
Build Command: cd Backend && npm install
Start Command: cd Backend && npm start
```

### 2.4 Variables de Entorno en Render
Configura estas variables en Render:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://ala-burguer-admin:<tu-password>@cluster0.xxxxx.mongodb.net/ala-burguer?retryWrites=true&w=majority
JWT_SECRET=tu_jwt_secret_super_seguro_para_produccion
FRONTEND_URL=https://ala-burguer.vercel.app
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### 2.5 Desplegar
1. Haz clic en "Create Web Service"
2. Espera a que se complete el despliegue
3. Anota la URL del servicio (ej: `https://ala-burguer-backend.onrender.com`)

## 🌐 Paso 3: Desplegar Frontend en Vercel

### 3.1 Preparar Frontend
1. Asegúrate de que el frontend esté en la carpeta `Frontend/`
2. Actualiza `Frontend/vercel.json` con la URL correcta del backend

### 3.2 Conectar con Vercel
1. Ve a [Vercel](https://vercel.com)
2. Conecta tu cuenta de GitHub
3. Importa tu repositorio

### 3.3 Configurar el Proyecto
```
Framework Preset: Vite
Root Directory: Frontend
Build Command: npm run build
Output Directory: dist
```

### 3.4 Variables de Entorno en Vercel
```
VITE_API_URL=https://ala-burguer-backend.onrender.com/api
VITE_APP_NAME=Ala-Burguer
VITE_APP_VERSION=1.0.0
```

### 3.5 Desplegar
1. Haz clic en "Deploy"
2. Espera a que se complete el despliegue
3. Anota la URL del frontend (ej: `https://ala-burguer.vercel.app`)

## 🔄 Paso 4: Actualizar URLs

### 4.1 Actualizar Backend
1. Ve a Render.com
2. Actualiza la variable `FRONTEND_URL` con la URL real de Vercel
3. Reinicia el servicio

### 4.2 Actualizar Frontend
1. Ve a Vercel
2. Actualiza la variable `VITE_API_URL` con la URL real de Render
3. Redespliega el frontend

## 🎯 Paso 5: Inicializar Datos

### 5.1 Crear Admin Inicial
1. Ve a la URL del backend: `https://ala-burguer-backend.onrender.com/api/test`
2. Deberías ver: `{"message":"🚀 Ala-Burguer Backend funcionando correctamente!"}`

### 5.2 Ejecutar Script de Datos
1. Conecta a tu servidor local o usa un servicio como Railway
2. Ejecuta: `cd Backend && npm run seed`
3. Esto creará el admin por defecto y datos de ejemplo

### 5.3 Credenciales por Defecto
```
Email: admin@ala-burguer.com
Password: admin123
```

## 🔐 Paso 6: Configuración de Seguridad

### 6.1 Cambiar Credenciales
1. Inicia sesión en el panel de admin
2. Cambia la contraseña del admin por defecto
3. Crea nuevos usuarios admin si es necesario

### 6.2 Configurar Dominio Personalizado (Opcional)
1. **Render.com**: Configura un dominio personalizado
2. **Vercel**: Configura un dominio personalizado
3. Actualiza las variables de entorno con las nuevas URLs

## 📊 Paso 7: Monitoreo y Mantenimiento

### 7.1 Logs
- **Render.com**: Ve a "Logs" para ver los logs del backend
- **Vercel**: Ve a "Functions" para ver los logs del frontend

### 7.2 Base de Datos
- **MongoDB Atlas**: Monitorea el uso de la base de datos
- **Backup**: Configura backups automáticos en Atlas

### 7.3 Actualizaciones
- **Backend**: Push a GitHub actualiza automáticamente en Render
- **Frontend**: Push a GitHub actualiza automáticamente en Vercel

## 🚨 Solución de Problemas

### Error de CORS
- Verifica que `FRONTEND_URL` en Render coincida con la URL de Vercel
- Verifica que `VITE_API_URL` en Vercel coincida con la URL de Render

### Error de Base de Datos
- Verifica que `MONGODB_URI` sea correcta
- Verifica que el usuario de MongoDB tenga permisos
- Verifica que la IP esté en la lista blanca de Atlas

### Error de Autenticación
- Verifica que `JWT_SECRET` esté configurado
- Verifica que el token no haya expirado

## 📱 URLs Finales

Después del despliegue tendrás:

- **Frontend**: `https://ala-burguer.vercel.app`
- **Backend**: `https://ala-burguer-backend.onrender.com`
- **Admin Panel**: `https://ala-burguer.vercel.app/admin/login`

## 🎉 ¡Listo!

Tu aplicación Ala-Burguer estará funcionando en producción con:
- ✅ Base de datos en la nube (MongoDB Atlas)
- ✅ Backend escalable (Render.com)
- ✅ Frontend optimizado (Vercel)
- ✅ Despliegue automático desde GitHub
- ✅ HTTPS habilitado
- ✅ Dominio personalizado (opcional)

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Render y Vercel
2. Verifica las variables de entorno
3. Comprueba la conectividad de la base de datos
4. Revisa la configuración de CORS

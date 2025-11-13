# Instrucciones para Vaciar la Base de Datos

Este documento explica cómo vaciar toda la base de datos manteniendo solo el usuario de super admin.

## ⚠️ ADVERTENCIA IMPORTANTE

**Este proceso es IRREVERSIBLE**. Asegúrate de:
1. Hacer un backup completo de la base de datos antes de ejecutar estos scripts
2. Verificar que tienes el email correcto del super admin que quieres mantener
3. Tener acceso a Supabase para ejecutar el script SQL
4. Tener las variables de entorno configuradas correctamente (`.env`)

## 📋 Prerequisitos

1. **Backup de la base de datos**: Haz un backup completo antes de continuar
2. **Email del super admin**: Necesitas el email del super admin que quieres mantener
3. **Variables de entorno**: Asegúrate de que tu archivo `.env` tiene:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## 🚀 Pasos para Limpiar la Base de Datos

### Paso 1: Preparar el Script SQL

1. Abre el archivo `Backend/scripts/clean-database.sql`
2. En la línea 69, reemplaza `'TU_EMAIL_SUPER_ADMIN@ejemplo.com'` con el email real del super admin que quieres mantener:

```sql
DELETE FROM super_admins 
WHERE email != 'tu-email-super-admin@ejemplo.com'; -- CAMBIAR ESTE EMAIL
```

### Paso 2: Ejecutar el Script SQL

1. Ve a tu panel de Supabase
2. Abre el SQL Editor
3. Copia y pega el contenido de `Backend/scripts/clean-database.sql`
4. Asegúrate de haber reemplazado el email en la línea 69
5. Ejecuta el script
6. Verifica que las consultas de verificación al final muestren:
   - 1 super admin restante
   - 0 registros en todas las demás tablas

### Paso 3: Limpiar Usuarios de Auth

Después de ejecutar el script SQL, necesitas limpiar los usuarios de Supabase Auth:

1. Abre una terminal en la raíz del proyecto
2. Ejecuta el siguiente comando (reemplaza el email con el del super admin):

```bash
node Backend/scripts/clean-auth-users.js tu-email-super-admin@ejemplo.com
```

3. El script:
   - Buscará el super admin en la base de datos
   - Listará todos los usuarios de Auth
   - Eliminará todos los usuarios excepto el super admin
   - Mostrará un resumen de los usuarios eliminados

### Paso 4: Verificar

Después de ejecutar ambos scripts, verifica:

1. **Base de datos**:
   - Solo debería existir 1 super admin en la tabla `super_admins`
   - Todas las demás tablas deberían estar vacías

2. **Auth**:
   - Solo debería existir 1 usuario en Supabase Auth (el super admin)

3. **Login**:
   - Intenta iniciar sesión con el super admin para verificar que funciona correctamente

## 📊 Tablas que se Eliminarán

El script elimina datos de las siguientes tablas:

- `order_items`
- `order_events`
- `payments`
- `orders`
- `waiter_tables`
- `waiters`
- `riders`
- `products`
- `extras`
- `delivery_config`
- `stock_requests`
- `admins`
- `restaurants`
- `super_admins` (excepto el especificado)

## 🔧 Solución de Problemas

### Error: "Super admin no encontrado"
- Verifica que el email sea correcto
- Verifica que el super admin existe en la tabla `super_admins`
- Ejecuta: `SELECT * FROM super_admins;` para ver todos los super admins

### Error: "SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidos"
- Verifica que el archivo `.env` existe en la raíz del proyecto
- Verifica que las variables están correctamente configuradas
- Asegúrate de estar ejecutando el script desde la raíz del proyecto

### Error al eliminar usuarios de Auth
- Verifica que tienes permisos de Service Role Key
- Verifica que la conexión a Supabase funciona
- Revisa los logs del script para ver qué usuarios no se pudieron eliminar

## 📝 Notas Adicionales

- Los scripts están diseñados para eliminar TODOS los datos excepto el super admin especificado
- Las foreign keys con CASCADE aseguran que los datos relacionados se eliminen correctamente
- El script de Auth elimina usuarios uno por uno para evitar errores masivos
- Si hay algún error durante el proceso, puedes ejecutar los scripts nuevamente (pero primero verifica qué datos quedaron)

## 🆘 Soporte

Si encuentras algún problema:
1. Revisa los logs de error
2. Verifica que todos los pasos se ejecutaron correctamente
3. Revisa que el backup se hizo correctamente antes de continuar


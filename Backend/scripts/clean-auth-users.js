/**
 * Script para limpiar usuarios de Supabase Auth
 * Mantiene solo el super admin especificado
 * 
 * Uso:
 * node Backend/scripts/clean-auth-users.js <email_super_admin>
 * 
 * Ejemplo:
 * node Backend/scripts/clean-auth-users.js admin@botiva.com
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno desde Backend/.env
config({ path: resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidos en .env');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function cleanAuthUsers(superAdminEmail) {
  try {
    console.log('🔍 Buscando super admin en la base de datos...');
    
    // 1. Buscar el super admin en la tabla super_admins
    const { data: superAdmin, error: superAdminError } = await supabaseAdmin
      .from('super_admins')
      .select('id, email, auth_user_id')
      .eq('email', superAdminEmail)
      .single();
    
    if (superAdminError || !superAdmin) {
      console.error('❌ Error: Super admin no encontrado en la base de datos');
      console.error('   Verifica que el email sea correcto y que el super admin exista');
      process.exit(1);
    }
    
    console.log(`✅ Super admin encontrado: ${superAdmin.email} (ID: ${superAdmin.id})`);
    console.log(`   Auth User ID: ${superAdmin.auth_user_id}`);
    
    // 2. Obtener todos los usuarios de Auth
    console.log('\n🔍 Obteniendo todos los usuarios de Auth...');
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error al listar usuarios:', listError);
      process.exit(1);
    }
    
    console.log(`📊 Total de usuarios en Auth: ${users.length}`);
    
    // 3. Filtrar usuarios a eliminar (todos excepto el super admin)
    const usersToDelete = users.filter(user => user.id !== superAdmin.auth_user_id);
    console.log(`🗑️  Usuarios a eliminar: ${usersToDelete.length}`);
    
    if (usersToDelete.length === 0) {
      console.log('✅ No hay usuarios para eliminar. Solo existe el super admin.');
      return;
    }
    
    // 4. Eliminar usuarios uno por uno
    console.log('\n🗑️  Eliminando usuarios...');
    let deletedCount = 0;
    let errorCount = 0;
    
    for (const user of usersToDelete) {
      try {
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
        
        if (deleteError) {
          console.error(`   ❌ Error al eliminar ${user.email}:`, deleteError.message);
          errorCount++;
        } else {
          console.log(`   ✅ Eliminado: ${user.email}`);
          deletedCount++;
        }
      } catch (error) {
        console.error(`   ❌ Error al eliminar ${user.email}:`, error.message);
        errorCount++;
      }
    }
    
    // 5. Verificar resultado
    console.log('\n📊 Resumen:');
    console.log(`   ✅ Usuarios eliminados: ${deletedCount}`);
    if (errorCount > 0) {
      console.log(`   ❌ Errores: ${errorCount}`);
    }
    
    // 6. Verificar usuarios restantes
    const { data: { users: remainingUsers }, error: remainingError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (remainingError) {
      console.error('❌ Error al verificar usuarios restantes:', remainingError);
    } else {
      console.log(`\n📊 Usuarios restantes en Auth: ${remainingUsers.length}`);
      remainingUsers.forEach(user => {
        const userEmail = user.email || 'Sin email';
        console.log(`   - ${userEmail} (ID: ${user.id})`);
      });
    }
    
    console.log('\n✅ Proceso completado!');
    console.log(`   Super admin mantenido: ${superAdmin.email}`);
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    process.exit(1);
  }
}

// Ejecutar script
const superAdminEmail = process.argv[2];

if (!superAdminEmail) {
  console.error('❌ Error: Debes proporcionar el email del super admin');
  console.error('   Uso: node Backend/scripts/clean-auth-users.js <email_super_admin>');
  process.exit(1);
}

console.log('🚀 Iniciando limpieza de usuarios de Auth...');
console.log(`   Super admin a mantener: ${superAdminEmail}\n`);

cleanAuthUsers(superAdminEmail)
  .then(() => {
    console.log('\n✅ Script completado exitosamente');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });


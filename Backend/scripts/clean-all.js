/**
 * Script completo para limpiar la base de datos y usuarios de Auth
 * Mantiene solo el super admin especificado
 * 
 * Uso:
 * node Backend/scripts/clean-all.js <email_super_admin>
 * 
 * Ejemplo:
 * node Backend/scripts/clean-all.js admin@botiva.com
 * 
 * IMPORTANTE: Este script elimina TODOS los datos excepto el super admin especificado.
 * Asegúrate de hacer un backup antes de ejecutarlo.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

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

// Función para preguntar confirmación al usuario
function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'si' || answer.toLowerCase() === 's' || answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

async function cleanDatabase(superAdminEmail) {
  try {
    console.log('\n🗑️  Paso 1: Limpiando base de datos...\n');
    
    // 1. Verificar que el super admin existe
    const { data: superAdmin, error: superAdminError } = await supabaseAdmin
      .from('super_admins')
      .select('id, email, auth_user_id')
      .eq('email', superAdminEmail)
      .single();
    
    if (superAdminError || !superAdmin) {
      console.error('❌ Error: Super admin no encontrado en la base de datos');
      console.error('   Verifica que el email sea correcto y que el super admin exista');
      return false;
    }
    
    console.log(`✅ Super admin encontrado: ${superAdmin.email} (ID: ${superAdmin.id})`);
    
    // 2. Eliminar datos en orden (respetando foreign keys)
    // Usamos delete con filtros que siempre sean verdaderos para eliminar todos los registros
    
    // Función helper para eliminar registros de una tabla
    const deleteTable = async (tableName, excludeId = null) => {
      try {
        console.log(`   Eliminando ${tableName}...`);
        let query = supabaseAdmin.from(tableName).delete();
        
        if (excludeId) {
          // Excluir un ID específico (para super_admins)
          query = query.neq('id', excludeId);
        } else {
          // Para todas las demás tablas, usar un filtro que siempre sea verdadero
          // Usamos gte con created_at si la tabla lo tiene, o cualquier otro filtro que siempre sea verdadero
          query = query.gte('created_at', '1970-01-01');
        }
        
        const { error } = await query;
        
        if (error) {
          console.error(`     ⚠️  Error: ${error.message}`);
          return false;
        } else {
          console.log(`     ✅ ${tableName} eliminado`);
          return true;
        }
      } catch (error) {
        console.error(`     ❌ Error: ${error.message}`);
        return false;
      }
    };
    
    // Eliminar en orden (respetando foreign keys)
    await deleteTable('order_items');
    await deleteTable('order_events');
    await deleteTable('payments');
    await deleteTable('orders');
    await deleteTable('waiter_tables');
    await deleteTable('waiters');
    await deleteTable('riders');
    await deleteTable('products');
    await deleteTable('extras');
    await deleteTable('delivery_config');
    await deleteTable('stock_requests');
    await deleteTable('admins');
    await deleteTable('restaurants');
    await deleteTable('super_admins', superAdmin.id); // Excluir el super admin que queremos mantener
    
    console.log('✅ Base de datos limpiada exitosamente\n');
    return true;
    
  } catch (error) {
    console.error('❌ Error al limpiar la base de datos:', error);
    return false;
  }
}

async function cleanAuthUsers(superAdminEmail) {
  try {
    console.log('🗑️  Paso 2: Limpiando usuarios de Auth...\n');
    
    // 1. Buscar el super admin en la base de datos
    const { data: superAdmin, error: superAdminError } = await supabaseAdmin
      .from('super_admins')
      .select('id, email, auth_user_id')
      .eq('email', superAdminEmail)
      .single();
    
    if (superAdminError || !superAdmin) {
      console.error('❌ Error: Super admin no encontrado en la base de datos');
      return false;
    }
    
    console.log(`✅ Super admin encontrado: ${superAdmin.email}`);
    console.log(`   Auth User ID: ${superAdmin.auth_user_id}\n`);
    
    // 2. Obtener todos los usuarios de Auth
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error al listar usuarios:', listError);
      return false;
    }
    
    console.log(`📊 Total de usuarios en Auth: ${users.length}`);
    
    // 3. Filtrar usuarios a eliminar
    const usersToDelete = users.filter(user => user.id !== superAdmin.auth_user_id);
    console.log(`🗑️  Usuarios a eliminar: ${usersToDelete.length}\n`);
    
    if (usersToDelete.length === 0) {
      console.log('✅ No hay usuarios para eliminar. Solo existe el super admin.\n');
      return true;
    }
    
    // 4. Eliminar usuarios uno por uno
    let deletedCount = 0;
    let errorCount = 0;
    
    for (const user of usersToDelete) {
      try {
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
        
        if (deleteError) {
          console.error(`   ❌ Error al eliminar ${user.email || 'sin email'}:`, deleteError.message);
          errorCount++;
        } else {
          console.log(`   ✅ Eliminado: ${user.email || 'sin email'}`);
          deletedCount++;
        }
      } catch (error) {
        console.error(`   ❌ Error al eliminar ${user.email || 'sin email'}:`, error.message);
        errorCount++;
      }
    }
    
    // 5. Resumen
    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Usuarios eliminados: ${deletedCount}`);
    if (errorCount > 0) {
      console.log(`   ❌ Errores: ${errorCount}`);
    }
    console.log('');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error al limpiar usuarios de Auth:', error);
    return false;
  }
}

async function verifyCleanup(superAdminEmail) {
  try {
    console.log('🔍 Paso 3: Verificando limpieza...\n');
    
    // Verificar super admins
    const { data: superAdmins, error: superAdminsError } = await supabaseAdmin
      .from('super_admins')
      .select('id, email');
    
    if (superAdminsError) {
      console.error('❌ Error al verificar super_admins:', superAdminsError);
      return false;
    }
    
    console.log(`📊 Super admins restantes: ${superAdmins.length}`);
    superAdmins.forEach(sa => {
      console.log(`   - ${sa.email} (ID: ${sa.id})`);
    });
    
    // Verificar otras tablas
    const tables = [
      'orders', 'restaurants', 'admins', 'products', 'extras',
      'waiters', 'riders', 'payments', 'order_items', 'order_events',
      'waiter_tables', 'delivery_config', 'stock_requests'
    ];
    
    console.log('\n📊 Verificando tablas:');
    for (const table of tables) {
      const { count, error } = await supabaseAdmin
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`   ⚠️  ${table}: Error al verificar (${error.message})`);
      } else {
        console.log(`   ${count === 0 ? '✅' : '❌'} ${table}: ${count} registros`);
      }
    }
    
    // Verificar usuarios de Auth
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error al verificar usuarios de Auth:', usersError);
    } else {
      console.log(`\n📊 Usuarios en Auth: ${users.length}`);
      users.forEach(user => {
        console.log(`   - ${user.email || 'sin email'} (ID: ${user.id})`);
      });
    }
    
    console.log('\n✅ Verificación completada\n');
    return true;
    
  } catch (error) {
    console.error('❌ Error al verificar limpieza:', error);
    return false;
  }
}

async function main() {
  const superAdminEmail = process.argv[2];
  
  if (!superAdminEmail) {
    console.error('❌ Error: Debes proporcionar el email del super admin');
    console.error('   Uso: node Backend/scripts/clean-all.js <email_super_admin>');
    process.exit(1);
  }
  
  console.log('⚠️  ADVERTENCIA: Este script eliminará TODOS los datos excepto el super admin especificado.');
  console.log('   Asegúrate de haber hecho un backup antes de continuar.\n');
  console.log(`   Super admin a mantener: ${superAdminEmail}\n`);
  
  // Pedir confirmación
  const confirmed = await askConfirmation('¿Estás seguro de que quieres continuar? (si/no): ');
  
  if (!confirmed) {
    console.log('\n❌ Operación cancelada por el usuario');
    process.exit(0);
  }
  
  console.log('\n🚀 Iniciando limpieza...\n');
  
  // Paso 1: Limpiar base de datos
  const dbCleaned = await cleanDatabase(superAdminEmail);
  if (!dbCleaned) {
    console.error('❌ Error al limpiar la base de datos. Abortando...');
    process.exit(1);
  }
  
  // Paso 2: Limpiar usuarios de Auth
  const authCleaned = await cleanAuthUsers(superAdminEmail);
  if (!authCleaned) {
    console.error('❌ Error al limpiar usuarios de Auth. Verifica manualmente.');
  }
  
  // Paso 3: Verificar
  await verifyCleanup(superAdminEmail);
  
  console.log('✅ Proceso completado exitosamente');
  console.log(`   Super admin mantenido: ${superAdminEmail}\n`);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });


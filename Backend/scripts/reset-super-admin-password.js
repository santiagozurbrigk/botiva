import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar configurados en .env');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function resetSuperAdminPassword(email, newPassword) {
  try {
    console.log(`🔐 Reseteando contraseña para: ${email}`);
    
    // Buscar el usuario por email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      throw listError;
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      console.error(`❌ No se encontró un usuario con el email: ${email}`);
      console.log('\n📋 Usuarios disponibles:');
      users.users.forEach(u => {
        console.log(`  - ${u.email} (ID: ${u.id})`);
      });
      return;
    }

    console.log(`✅ Usuario encontrado: ${user.email} (ID: ${user.id})`);

    // Actualizar la contraseña
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (error) {
      throw error;
    }

    console.log('✅ Contraseña actualizada exitosamente!');
    console.log(`\n📧 Email: ${email}`);
    console.log(`🔑 Nueva contraseña: ${newPassword}`);
    console.log('\n⚠️  IMPORTANTE: Guarda esta contraseña de forma segura');
    
    // Verificar si existe en la tabla super_admins
    const { data: superAdmin, error: superAdminError } = await supabaseAdmin
      .from('super_admins')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (superAdminError || !superAdmin) {
      console.log('\n⚠️  ADVERTENCIA: El usuario no está registrado en la tabla super_admins');
      console.log('   Necesitas crear el registro en la tabla super_admins con:');
      console.log(`   - auth_user_id: ${user.id}`);
      console.log(`   - email: ${email}`);
      console.log(`   - name: (el nombre que quieras)`);
    } else {
      console.log('\n✅ El usuario ya está registrado en la tabla super_admins');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Obtener argumentos de la línea de comandos
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('📖 Uso: node reset-super-admin-password.js <email> <nueva_contraseña>');
  console.log('\nEjemplo:');
  console.log('  node reset-super-admin-password.js botivamangment@gmail.com MiNuevaPassword123');
  process.exit(1);
}

resetSuperAdminPassword(email, password);


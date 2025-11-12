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

async function createSuperAdmin(email, password, name) {
  try {
    console.log(`🔐 Creando super admin: ${email}`);
    
    // Verificar si el usuario ya existe
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      throw listError;
    }

    let user = users.users.find(u => u.email === email);
    let isNewUser = false;

    if (!user) {
      // Crear nuevo usuario
      console.log('📝 Creando nuevo usuario en Supabase Auth...');
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (createError) {
        throw createError;
      }

      user = newUser.user;
      isNewUser = true;
      console.log('✅ Usuario creado en Supabase Auth');
    } else {
      console.log('✅ Usuario ya existe en Supabase Auth');
      // Actualizar contraseña si es necesario
      if (password) {
        console.log('🔑 Actualizando contraseña...');
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          user.id,
          { password }
        );
        if (updateError) {
          throw updateError;
        }
        console.log('✅ Contraseña actualizada');
      }
    }

    // Verificar si ya existe en super_admins
    const { data: existingSuperAdmin, error: checkError } = await supabaseAdmin
      .from('super_admins')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingSuperAdmin) {
      console.log('✅ El usuario ya está registrado en la tabla super_admins');
      console.log('\n📋 Información del Super Admin:');
      console.log(`   ID: ${existingSuperAdmin.id}`);
      console.log(`   Nombre: ${existingSuperAdmin.name}`);
      console.log(`   Email: ${existingSuperAdmin.email}`);
      return;
    }

    // Crear registro en super_admins
    console.log('📝 Creando registro en tabla super_admins...');
    const { data: superAdmin, error: insertError } = await supabaseAdmin
      .from('super_admins')
      .insert({
        auth_user_id: user.id,
        name: name || email.split('@')[0],
        email: email,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log('✅ Super Admin creado exitosamente!');
    console.log('\n📋 Información del Super Admin:');
    console.log(`   ID: ${superAdmin.id}`);
    console.log(`   Nombre: ${superAdmin.name}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Auth User ID: ${user.id}`);
    console.log('\n🔑 Credenciales:');
    console.log(`   Email: ${email}`);
    console.log(`   Contraseña: ${password || '(la que configuraste anteriormente)'}`);
    console.log('\n✅ Ya puedes iniciar sesión en /super-admin/login');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.details) {
      console.error('   Detalles:', error.details);
    }
    process.exit(1);
  }
}

// Obtener argumentos de la línea de comandos
const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4];

if (!email) {
  console.log('📖 Uso: node create-super-admin.js <email> [contraseña] [nombre]');
  console.log('\nEjemplos:');
  console.log('  node create-super-admin.js botivamangment@gmail.com MiPassword123');
  console.log('  node create-super-admin.js botivamangment@gmail.com MiPassword123 "Tu Nombre"');
  console.log('\nNota: Si el usuario ya existe, solo se actualizará la contraseña si la proporcionas');
  process.exit(1);
}

createSuperAdmin(email, password, name);


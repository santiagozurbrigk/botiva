import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno - intentar múltiples ubicaciones
const envPaths = [
  resolve(__dirname, '../../.env'),           // Desde Backend/scripts/
  resolve(__dirname, '../.env'),              // Desde Backend/
  resolve(__dirname, '../../Backend/.env'),   // Desde raíz
  resolve(process.cwd(), '.env'),             // Desde directorio actual
  resolve(process.cwd(), 'Backend/.env'),     // Desde raíz/Backend/
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    config({ path: envPath });
    console.log(`✅ Variables de entorno cargadas desde: ${envPath}`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('⚠️  No se encontró archivo .env, intentando cargar desde variables de entorno del sistema...');
  config(); // Intentar cargar desde variables de entorno del sistema
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidos');
  console.error('\nUbicaciones buscadas:');
  envPaths.forEach(path => {
    console.error(`   - ${path} ${existsSync(path) ? '✅' : '❌'}`);
  });
  console.error('\n💡 Solución:');
  console.error('   1. Asegúrate de tener un archivo .env en la raíz del proyecto o en Backend/');
  console.error('   2. O define las variables de entorno en tu sistema');
  console.error('   3. O pasa las variables directamente:');
  console.error('      SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node Backend/scripts/diagnose-products-issue.js');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnoseProductsIssue() {
  console.log('🔍 Diagnóstico de productos multi-tenant\n');

  try {
    // 1. Verificar que la columna restaurant_id existe
    console.log('1️⃣ Verificando estructura de la tabla products...');
    
    // Intentar obtener un producto para ver si la columna existe
    const { data: testProduct, error: testError } = await supabase
      .from('products')
      .select('id, name, restaurant_id')
      .limit(1);

    if (testError) {
      if (testError.message && testError.message.includes('restaurant_id')) {
        console.error('❌ La columna restaurant_id NO existe en la tabla products');
        console.log('\n💡 Solución: Ejecuta el script schema-updates.sql en Supabase SQL Editor');
        console.log('   O ejecuta este SQL:');
        console.log('   ALTER TABLE products ADD COLUMN restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;');
        return;
      } else {
        console.error('❌ Error al verificar la tabla products:', testError.message);
        return;
      }
    }

    if (testProduct && testProduct.length > 0) {
      const hasRestaurantId = 'restaurant_id' in testProduct[0];
      if (hasRestaurantId) {
        console.log('✅ La columna restaurant_id existe en la tabla products');
      } else {
        console.error('❌ La columna restaurant_id NO existe en la tabla products');
        console.log('\n💡 Solución: Ejecuta el script schema-updates.sql en Supabase SQL Editor');
        return;
      }
    } else {
      console.log('⚠️  No hay productos en la tabla, no se puede verificar la columna');
    }
    console.log('');

    // 2. Contar productos por restaurant_id
    console.log('2️⃣ Analizando productos por restaurante...');
    const { data: productsByRestaurant, error: countError } = await supabase
      .from('products')
      .select('restaurant_id')
      .not('restaurant_id', 'is', null);

    if (countError) {
      console.error('❌ Error al contar productos:', countError);
      return;
    }

    const restaurantCounts = {};
    productsByRestaurant.forEach(p => {
      restaurantCounts[p.restaurant_id] = (restaurantCounts[p.restaurant_id] || 0) + 1;
    });

    console.log('📊 Productos por restaurante:');
    Object.entries(restaurantCounts).forEach(([restaurantId, count]) => {
      console.log(`   - ${restaurantId}: ${count} productos`);
    });

    // 3. Contar productos sin restaurant_id
    const { data: productsWithoutRestaurant, error: nullError } = await supabase
      .from('products')
      .select('id, name, restaurant_id')
      .is('restaurant_id', null);

    if (nullError) {
      console.error('❌ Error al contar productos sin restaurant_id:', nullError);
    } else {
      console.log(`\n⚠️  Productos SIN restaurant_id: ${productsWithoutRestaurant?.length || 0}`);
      if (productsWithoutRestaurant && productsWithoutRestaurant.length > 0) {
        console.log('   Estos productos aparecerán en TODOS los restaurantes:');
        productsWithoutRestaurant.slice(0, 5).forEach(p => {
          console.log(`   - ${p.name} (ID: ${p.id})`);
        });
        if (productsWithoutRestaurant.length > 5) {
          console.log(`   ... y ${productsWithoutRestaurant.length - 5} más`);
        }
      }
    }

    // 4. Verificar restaurantes existentes
    console.log('\n3️⃣ Verificando restaurantes existentes...');
    const { data: restaurants, error: restaurantsError } = await supabase
      .from('restaurants')
      .select('id, name, active');

    if (restaurantsError) {
      console.error('❌ Error al obtener restaurantes:', restaurantsError);
    } else {
      console.log(`📋 Restaurantes encontrados: ${restaurants?.length || 0}`);
      restaurants?.forEach(r => {
        console.log(`   - ${r.name} (ID: ${r.id}, Activo: ${r.active})`);
      });
    }

    // 5. Verificar admins y sus restaurant_id
    console.log('\n4️⃣ Verificando admins y sus restaurant_id...');
    const { data: admins, error: adminsError } = await supabase
      .from('admins')
      .select('id, name, email, restaurant_id');

    if (adminsError) {
      console.error('❌ Error al obtener admins:', adminsError);
    } else {
      console.log(`👥 Admins encontrados: ${admins?.length || 0}`);
      admins?.forEach(a => {
        if (!a.restaurant_id) {
          console.log(`   ⚠️  ${a.name} (${a.email}) - SIN restaurant_id asignado`);
        } else {
          const restaurant = restaurants?.find(r => r.id === a.restaurant_id);
          console.log(`   ✅ ${a.name} (${a.email}) - Restaurante: ${restaurant?.name || a.restaurant_id}`);
        }
      });
    }

    // 6. Obtener algunos productos de ejemplo
    console.log('\n5️⃣ Ejemplo de productos en la base de datos:');
    const { data: sampleProducts, error: sampleError } = await supabase
      .from('products')
      .select('id, name, restaurant_id, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (sampleError) {
      console.error('❌ Error al obtener productos de ejemplo:', sampleError);
    } else {
      sampleProducts?.forEach(p => {
        const restaurant = restaurants?.find(r => r.id === p.restaurant_id);
        console.log(`   - ${p.name} | restaurant_id: ${p.restaurant_id || 'NULL'} | Restaurante: ${restaurant?.name || 'N/A'}`);
      });
    }

    console.log('\n✅ Diagnóstico completado\n');

    // Resumen y recomendaciones
    console.log('📝 RESUMEN Y RECOMENDACIONES:');
    console.log('─────────────────────────────────────────────────');
    
    if (productsWithoutRestaurant && productsWithoutRestaurant.length > 0) {
      console.log('⚠️  PROBLEMA ENCONTRADO:');
      console.log(`   Hay ${productsWithoutRestaurant.length} productos sin restaurant_id.`);
      console.log('   Estos productos aparecerán en TODOS los restaurantes.');
      console.log('\n💡 SOLUCIÓN:');
      console.log('   1. Asignar restaurant_id a los productos existentes, o');
      console.log('   2. Eliminar los productos sin restaurant_id si no son necesarios');
    } else {
      console.log('✅ No se encontraron productos sin restaurant_id');
    }

    const adminsWithoutRestaurant = admins?.filter(a => !a.restaurant_id) || [];
    if (adminsWithoutRestaurant.length > 0) {
      console.log('\n⚠️  PROBLEMA ENCONTRADO:');
      console.log(`   Hay ${adminsWithoutRestaurant.length} admins sin restaurant_id.`);
      console.log('   Estos admins no podrán crear productos correctamente.');
      console.log('\n💡 SOLUCIÓN:');
      console.log('   Asignar restaurant_id a estos admins desde el panel de super admin');
    }

  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
  }
}

diagnoseProductsIssue();


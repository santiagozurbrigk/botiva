import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import productsRoutes from './routes/products.js';
import extrasRoutes from './routes/extras.js';
import ordersRoutes from './routes/orders.js';
import ridersRoutes from './routes/riders.js';
import waitersRoutes from './routes/waiters.js';
import waiterTablesRoutes from './routes/waiter-tables.js';
import kitchenRoutes from './routes/kitchen.js';
import stockRoutes from './routes/stock.js';
import authRoutes from './routes/auth.js';
import financesRoutes from './routes/finances.js';
import deliveryConfigRoutes from './routes/delivery-config.js';
import superAdminRoutes from './routes/super-admin.js';

dotenv.config();

console.log('🔧 Iniciando servidor...');
console.log('📦 Variables de entorno cargadas');
console.log('🌐 NODE_ENV:', process.env.NODE_ENV || 'no definido');
console.log('🔌 PORT:', process.env.PORT || 'no definido (usará 3001)');

// Validar variables críticas de Supabase
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ ERROR: Variables de entorno faltantes:', missingVars.join(', '));
  console.error('⚠️ El servidor no puede iniciar sin estas variables.');
  process.exit(1);
}

console.log('✅ Todas las variables de entorno requeridas están presentes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Configurar CORS - permitir múltiples orígenes si es necesario
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['*'];

const corsOptions = {
  origin: (origin, callback) => {
    // Si no hay origen (como en requests desde Postman), permitir
    if (!origin) {
      return callback(null, true);
    }
    
    // Si CORS_ORIGIN es '*', permitir todo
    if (allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    // Remover trailing slash y path del origen para comparar solo el dominio
    const originWithoutPath = origin.split('/').slice(0, 3).join('/'); // Solo protocolo + dominio + puerto
    
    // Verificar si el origen (sin path) está en la lista permitida
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      const allowedWithoutPath = allowedOrigin.split('/').slice(0, 3).join('/');
      return originWithoutPath === allowedWithoutPath;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS bloqueado: origen ${origin} no está en la lista permitida`);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Supabase clients
console.log('🔗 Inicializando clientes de Supabase...');
try {
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const supabaseAnon = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  // Make Supabase clients available to routes
  app.locals.supabaseAdmin = supabaseAdmin;
  app.locals.supabaseAnon = supabaseAnon;
  
  console.log('✅ Clientes de Supabase inicializados correctamente');
} catch (error) {
  console.error('❌ ERROR al inicializar Supabase:', error.message);
  process.exit(1);
}

// Routes
console.log('🛣️ Configurando rutas...');
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/extras', extrasRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/riders', ridersRoutes);
app.use('/api/waiters', waitersRoutes);
app.use('/api/waiter-tables', waiterTablesRoutes);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/finances', financesRoutes);
app.use('/api/delivery-config', deliveryConfigRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/super-admin', superAdminRoutes);
console.log('✅ Rutas configuradas');

// Health check
app.get('/health', (req, res) => {
  console.log('💚 Health check solicitado');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Botiva API - Backend funcionando correctamente',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Iniciar servidor
console.log('🚀 Iniciando servidor HTTP...');

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor iniciado exitosamente`);
  console.log(`🔌 Puerto: ${PORT}`);
  console.log(`🌐 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`📡 Servidor listo para recibir peticiones`);
});

// Manejo de errores del servidor
server.on('error', (error) => {
  console.error('❌ ERROR al iniciar el servidor:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.error(`⚠️ El puerto ${PORT} ya está en uso`);
  }
  process.exit(1);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ ERROR no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rechazada no manejada:', reason);
  process.exit(1);
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import productsRoutes from './routes/products.js';
import ordersRoutes from './routes/orders.js';
import ridersRoutes from './routes/riders.js';
import authRoutes from './routes/auth.js';
import financesRoutes from './routes/finances.js';
import deliveryConfigRoutes from './routes/delivery-config.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Supabase clients
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/riders', ridersRoutes);
app.use('/api/finances', financesRoutes);
app.use('/api/delivery-config', deliveryConfigRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 Health check disponible en /health`);
});

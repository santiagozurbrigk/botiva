import express from 'express';
import { authenticateAdmin, authenticateWaiter } from '../middleware/auth.js';

const router = express.Router();

// GET /api/waiter-tables - Obtener mesas de un mozo (admin) o del mozo autenticado
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { waiter_id } = req.query;
    const { supabaseAdmin } = req.app.locals;

    let query = supabaseAdmin
      .from('waiter_tables')
      .select(`
        *,
        waiter:waiters(id, name, email)
      `)
      .order('table_number', { ascending: true });

    if (waiter_id) {
      query = query.eq('waiter_id', waiter_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching waiter tables:', error);
    res.status(500).json({ error: 'Error al obtener mesas' });
  }
});

// GET /api/waiter-tables/me - Obtener mesas del mozo autenticado
router.get('/me', authenticateWaiter, async (req, res) => {
  try {
    const { supabaseAdmin } = req.app.locals;
    const waiterId = req.user.waiter.id;

    const { data, error } = await supabaseAdmin
      .from('waiter_tables')
      .select('*')
      .eq('waiter_id', waiterId)
      .order('table_number', { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching waiter tables:', error);
    res.status(500).json({ error: 'Error al obtener mesas' });
  }
});

// POST /api/waiter-tables - Asignar mesas a un mozo (solo admin)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { waiter_id, table_numbers } = req.body;

    if (!waiter_id || !Array.isArray(table_numbers) || table_numbers.length === 0) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const { supabaseAdmin } = req.app.locals;

    // Eliminar mesas existentes del mozo
    await supabaseAdmin
      .from('waiter_tables')
      .delete()
      .eq('waiter_id', waiter_id);

    // Insertar nuevas mesas
    const tablesToInsert = table_numbers.map(table_number => ({
      waiter_id,
      table_number: parseInt(table_number),
    }));

    const { data, error } = await supabaseAdmin
      .from('waiter_tables')
      .insert(tablesToInsert)
      .select();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error assigning tables:', error);
    res.status(500).json({ error: 'Error al asignar mesas' });
  }
});

// DELETE /api/waiter-tables/:id - Eliminar asignación de mesa (solo admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { supabaseAdmin } = req.app.locals;

    const { error } = await supabaseAdmin
      .from('waiter_tables')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Mesa eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting waiter table:', error);
    res.status(500).json({ error: 'Error al eliminar mesa' });
  }
});

export default router;


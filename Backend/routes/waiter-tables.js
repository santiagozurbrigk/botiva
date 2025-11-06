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

    // Convertir a enteros y eliminar duplicados
    const tableNumbersInt = [...new Set(table_numbers.map(t => parseInt(t)))].filter(t => !isNaN(t));

    if (tableNumbersInt.length === 0) {
      return res.status(400).json({ error: 'No hay números de mesa válidos' });
    }

    // Verificar si alguna mesa ya está asignada a otro mozo
    const { data: existingTables, error: checkError } = await supabaseAdmin
      .from('waiter_tables')
      .select('table_number, waiter_id, waiter:waiters(name)')
      .in('table_number', tableNumbersInt)
      .neq('waiter_id', waiter_id);

    if (checkError) throw checkError;

    if (existingTables && existingTables.length > 0) {
      const conflictingTables = existingTables.map(t => `Mesa ${t.table_number} (${t.waiter?.name || 'otro mozo'})`).join(', ');
      return res.status(409).json({ 
        error: `Las siguientes mesas ya están asignadas a otros mozos: ${conflictingTables}` 
      });
    }

    // Eliminar TODAS las mesas existentes del mozo primero
    const { error: deleteError } = await supabaseAdmin
      .from('waiter_tables')
      .delete()
      .eq('waiter_id', waiter_id);

    if (deleteError) {
      console.error('Error deleting existing tables:', deleteError);
      throw deleteError;
    }

    // Esperar un momento para asegurar que la eliminación se complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Insertar nuevas mesas una por una para evitar problemas de concurrencia
    const insertedTables = [];
    for (const table_number of tableNumbersInt) {
      try {
        const { data: inserted, error: insertError } = await supabaseAdmin
          .from('waiter_tables')
          .insert({
            waiter_id,
            table_number,
          })
          .select()
          .single();

        if (insertError) {
          // Si es error de duplicado, la mesa ya existe (puede pasar en casos de race condition)
          if (insertError.code === '23505') {
            console.warn(`Mesa ${table_number} ya existe, omitiendo...`);
            // Intentar obtener la mesa existente
            const { data: existing } = await supabaseAdmin
              .from('waiter_tables')
              .select('*')
              .eq('waiter_id', waiter_id)
              .eq('table_number', table_number)
              .single();
            
            if (existing) {
              insertedTables.push(existing);
            }
          } else {
            throw insertError;
          }
        } else if (inserted) {
          insertedTables.push(inserted);
        }
      } catch (err) {
        console.error(`Error inserting table ${table_number}:`, err);
        // Continuar con las demás mesas
        if (err.code !== '23505') {
          throw err;
        }
      }
    }

    res.status(201).json(insertedTables);
  } catch (error) {
    console.error('Error assigning tables:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ 
        error: 'Una o más mesas ya están asignadas. Por favor, recarga la página e intenta nuevamente.' 
      });
    }
    
    res.status(500).json({ 
      error: error.message || 'Error al asignar mesas',
      details: error.details || null
    });
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


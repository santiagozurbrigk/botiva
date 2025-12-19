/**
 * Utilidad para enviar webhooks a n8n
 * 
 * CONFIGURACIÓN:
 * Las URLs de webhook se configuran por restaurante en la tabla 'restaurants':
 * - n8n_webhook_url: URL para notificaciones de pedidos listos para retirar
 * - n8n_order_confirmation_webhook_url: URL para confirmación de pedidos por peso
 * 
 * Si no hay URL configurada en el restaurante, se intentará usar variables de entorno como fallback:
 * - N8N_WEBHOOK_URL
 * - N8N_ORDER_CONFIRMATION_WEBHOOK_URL
 * 
 * Si no hay ninguna URL configurada, el sistema funcionará normalmente pero no enviará webhooks.
 */

/**
 * Obtiene la URL del webhook desde la base de datos o variables de entorno
 * @param {Object} supabaseAdmin - Cliente de Supabase con permisos de admin
 * @param {string} restaurantId - ID del restaurante
 * @param {string} webhookType - Tipo de webhook: 'ready' o 'confirmation'
 * @returns {Promise<string|null>} URL del webhook o null si no está configurada
 */
async function getWebhookUrl(supabaseAdmin, restaurantId, webhookType) {
  try {
    // Intentar obtener la URL desde la base de datos
    const { data: restaurant, error } = await supabaseAdmin
      .from('restaurants')
      .select('n8n_webhook_url, n8n_order_confirmation_webhook_url')
      .eq('id', restaurantId)
      .single();

    if (!error && restaurant) {
      if (webhookType === 'confirmation') {
        if (restaurant.n8n_order_confirmation_webhook_url) {
          return restaurant.n8n_order_confirmation_webhook_url;
        }
      } else if (webhookType === 'ready') {
        if (restaurant.n8n_webhook_url) {
          return restaurant.n8n_webhook_url;
        }
      }
    }

    // Fallback a variables de entorno si no hay URL en la BD
    if (webhookType === 'confirmation') {
      return process.env.N8N_ORDER_CONFIRMATION_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL || null;
    } else {
      return process.env.N8N_WEBHOOK_URL || null;
    }
  } catch (error) {
    console.error('Error obteniendo URL de webhook desde BD:', error);
    // Fallback a variables de entorno en caso de error
    if (webhookType === 'confirmation') {
      return process.env.N8N_ORDER_CONFIRMATION_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL || null;
    } else {
      return process.env.N8N_WEBHOOK_URL || null;
    }
  }
}

/**
 * Envía un webhook a n8n cuando un pedido es confirmado (después de completar peso/total)
 * @param {Object} order - El objeto del pedido completo (debe incluir order_items y restaurant_id)
 * @param {Object} supabaseAdmin - Cliente de Supabase con permisos de admin
 * @returns {Promise<void>}
 */
export async function sendOrderConfirmationWebhook(order, supabaseAdmin) {
  if (!order.restaurant_id) {
    console.log('⚠️ Pedido sin restaurant_id, omitiendo webhook de confirmación');
    return;
  }

  const webhookUrl = await getWebhookUrl(supabaseAdmin, order.restaurant_id, 'confirmation');
  
  // Si no hay URL configurada, no hacer nada (no es crítico)
  if (!webhookUrl) {
    console.log('⚠️ URL de webhook de confirmación no configurada para el restaurante, omitiendo webhook');
    return;
  }

  try {
    // Obtener tiempo de demora del restaurante desde delivery_config
    let deliveryTimeMinutes = 30; // Valor por defecto
    try {
      const { data: deliveryConfig, error: configError } = await supabaseAdmin
        .from('delivery_config')
        .select('delivery_time_minutes')
        .eq('restaurant_id', order.restaurant_id)
        .eq('is_active', true)
        .single();

      if (!configError && deliveryConfig && deliveryConfig.delivery_time_minutes) {
        deliveryTimeMinutes = deliveryConfig.delivery_time_minutes;
      }
    } catch (error) {
      console.warn('⚠️ No se pudo obtener tiempo de demora del restaurante, usando valor por defecto:', error.message);
    }

    // Usar chat_id del pedido si está disponible, o extraerlo
    let chatId = order.chat_id;
    
    if (!chatId || chatId === '0' || chatId === '0000000000') {
      // Intentar extraer del external_id
      if (order.external_id && order.external_id.includes('_')) {
        const parts = order.external_id.split('_');
        if (parts.length >= 2 && parts[0] && parts[0] !== '0' && parts[0] !== '0000000000') {
          chatId = parts[0];
        }
      }
      
      // Si aún no hay chat_id, usar customer_phone
      if (!chatId && order.customer_phone && order.customer_phone !== '0' && order.customer_phone !== '0000000000') {
        chatId = order.customer_phone;
      }
    }

    const payload = {
      order_id: order.id,
      external_id: order.external_id,
      chat_id: chatId || order.customer_phone || '0000000000',
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_address: order.customer_address,
      status: order.status,
      total_amount: order.total_amount,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      order_type: order.order_type,
      created_at: order.created_at,
      items: order.order_items || [],
      confirmed: true, // Indica que el pedido fue confirmado después de pesar
      delivery_time_minutes: deliveryTimeMinutes, // Tiempo de demora configurado por el restaurante
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`❌ Error al enviar webhook de confirmación a n8n: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Detalles del error: ${errorText}`);
    } else {
      console.log(`✅ Webhook de confirmación enviado exitosamente a n8n para pedido ${order.id}`);
    }
  } catch (error) {
    // No lanzar el error para no interrumpir el flujo principal
    console.error('❌ Error al enviar webhook de confirmación a n8n:', error.message);
  }
}

/**
 * Envía un webhook a n8n cuando un pedido cambia de estado a "listo para retirar"
 * @param {Object} order - El objeto del pedido completo (debe incluir order_items y restaurant_id)
 * @param {Object} supabaseAdmin - Cliente de Supabase con permisos de admin
 * @returns {Promise<void>}
 */
export async function sendOrderReadyWebhook(order, supabaseAdmin) {
  if (!order.restaurant_id) {
    console.log('⚠️ Pedido sin restaurant_id, omitiendo webhook');
    return;
  }

  const webhookUrl = await getWebhookUrl(supabaseAdmin, order.restaurant_id, 'ready');
  
  // Si no hay URL configurada, no hacer nada (no es crítico)
  if (!webhookUrl) {
    console.log('⚠️ URL de webhook no configurada para el restaurante, omitiendo webhook');
    return;
  }

  try {
    // Extraer chat_id del external_id (formato: chatId_timestamp) o usar customer_phone
    // En pedidos de n8n, el customer_phone es el chat_id
    let chatId = null;
    
    // PRIORIDAD 1: Intentar extraer chat_id del external_id si tiene el formato chatId_timestamp
    if (order.external_id && order.external_id.includes('_')) {
      const parts = order.external_id.split('_');
      // Si el external_id tiene formato chatId_timestamp, usar la primera parte
      if (parts.length >= 2 && parts[0] && parts[0] !== '' && parts[0] !== '0' && parts[0] !== 'order') {
        const extractedChatId = parts[0].trim();
        // Validar que no sea un valor por defecto
        if (extractedChatId !== '0000000000' && extractedChatId.length > 0) {
          chatId = extractedChatId;
        }
      }
    }
    
    // PRIORIDAD 2: Si no se pudo extraer del external_id, usar customer_phone
    if (!chatId && order.customer_phone) {
      const customerPhone = String(order.customer_phone).trim();
      // Validar que no sea un valor por defecto
      if (customerPhone !== '' && customerPhone !== '0' && customerPhone !== '0000000000') {
        chatId = customerPhone;
      }
    }
    
    // Si aún no hay chat_id válido, usar customer_phone como último recurso (aunque sea el valor por defecto)
    if (!chatId) {
      chatId = order.customer_phone || '0000000000';
    }

    const payload = {
      order_id: order.id,
      external_id: order.external_id,
      chat_id: chatId, // ID del chat de WhatsApp para identificar al cliente en n8n
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_address: order.customer_address,
      status: order.status,
      total_amount: order.total_amount,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      order_type: order.order_type,
      created_at: order.created_at,
      items: order.order_items || [],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`❌ Error al enviar webhook a n8n: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Detalles del error: ${errorText}`);
    } else {
      console.log(`✅ Webhook enviado exitosamente a n8n para pedido ${order.id}`);
    }
  } catch (error) {
    // No lanzar el error para no interrumpir el flujo principal
    console.error('❌ Error al enviar webhook a n8n:', error.message);
  }
}


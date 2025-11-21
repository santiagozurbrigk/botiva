/**
 * Utilidad para enviar webhooks a n8n
 * 
 * CONFIGURACIÓN:
 * Para habilitar los webhooks, agrega la siguiente variable de entorno en tu archivo .env:
 * 
 * N8N_WEBHOOK_URL=https://tu-instancia-n8n.com/webhook/order-ready
 * 
 * Esta URL debe ser el webhook de n8n que recibirá las notificaciones cuando un pedido
 * cambie de estado a "listo para retirar" o "finalizado".
 * 
 * Si la variable no está configurada, el sistema funcionará normalmente pero no enviará webhooks.
 */

/**
 * Envía un webhook a n8n cuando un pedido cambia de estado a "listo para retirar"
 * @param {Object} order - El objeto del pedido completo (debe incluir order_items)
 * @returns {Promise<void>}
 */
export async function sendOrderReadyWebhook(order) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  
  // Si no hay URL configurada, no hacer nada (no es crítico)
  if (!webhookUrl) {
    console.log('⚠️ N8N_WEBHOOK_URL no configurada, omitiendo webhook');
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


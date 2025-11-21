// ============================================
// CÓDIGO PARA EL NODO CODE DE n8n
// Recibe el webhook cuando un pedido está "listo para retirar"
// ============================================

// Obtener los datos del webhook (viene del nodo Webhook Trigger)
const webhookData = $input.item.json;

// Extraer información del pedido
const orderId = webhookData.order_id;
const externalId = webhookData.external_id;
const chatId = webhookData.chat_id; // ID del chat de WhatsApp para responder al cliente
const customerName = webhookData.customer_name;
const customerPhone = webhookData.customer_phone;
const status = webhookData.status; // "finalizado" o "listo para retirar"
const totalAmount = webhookData.total_amount;
const items = webhookData.items || [];

// Formatear items para el mensaje
const itemsText = items.map(item => {
  const quantity = item.quantity || 1;
  const name = item.name || 'Producto';
  return `${quantity}x ${name}`;
}).join('\n');

// Mensaje para enviar al cliente por WhatsApp
const message = `¡Hola ${customerName}! 👋

Tu pedido #${externalId.split('_')[0] || orderId} está *listo para retirar* ✅

📦 *Resumen del pedido:*
${itemsText}

💰 *Total: $${totalAmount}*

Puedes pasar a retirarlo cuando gustes. ¡Gracias por tu compra! 🎉`;

// Retornar datos para el siguiente nodo (HTTP Request a WhatsApp)
return {
  json: {
    // Datos originales del webhook
    ...webhookData,
    
    // chat_id es crítico para identificar el chat en WhatsApp
    chat_id: chatId,
    '# chat_id': chatId, // Formato alternativo para compatibilidad
    
    // Mensaje formateado para WhatsApp
    message: message,
    'T mensaje': message, // Formato alternativo
    
    // Información adicional útil
    order_id: orderId,
    external_id: externalId,
    customer_name: customerName,
    customer_phone: customerPhone,
    status: status,
    total_amount: totalAmount,
    items: items,
    items_text: itemsText,
    
    // Flags útiles
    ready_for_pickup: true,
    notification_sent: false // Se marcará como true después de enviar
  }
};


// Obtener TODOS los datos del nodo anterior
const inputData = $input.item.json;

// Obtener el string del pedido (formato n8n: 'T pedido')
const pedidoTexto = inputData['T pedido'] || inputData.pedido || inputData['pedido'] || '';

// Obtener datos del cliente (formato n8n con prefijos T y #)
// IMPORTANTE: Priorizar campos con prefijo # primero (formato n8n estándar)
const customerName = inputData.nombre || inputData['T nombre'] || inputData.customer_name || 'Cliente';

// Extraer chat_id - Intentar TODAS las variantes posibles
// IMPORTANTE: n8n puede usar diferentes formatos, buscar en todos los campos posibles
let chatId = '';

// Buscar en todas las variantes posibles (con y sin prefijos)
if (inputData['# chat_id'] && inputData['# chat_id'] !== '' && inputData['# chat_id'] !== '0') {
  chatId = String(inputData['# chat_id']).trim();
} else if (inputData.chat_id && inputData.chat_id !== '' && inputData.chat_id !== '0') {
  chatId = String(inputData.chat_id).trim();
} else if (inputData.phone && inputData.phone !== '' && inputData.phone !== '0') {
  chatId = String(inputData.phone).trim();
} else if (inputData.telefono && inputData.telefono !== '' && inputData.telefono !== '0') {
  chatId = String(inputData.telefono).trim();
} else if (inputData.customer_phone && inputData.customer_phone !== '' && inputData.customer_phone !== '0') {
  chatId = String(inputData.customer_phone).trim();
}

// Debug: Si no se encontró, intentar buscar en todas las claves del objeto
if (!chatId || chatId === '' || chatId === '0') {
  // Buscar cualquier campo que contenga "chat" o "phone" en su nombre
  for (const key in inputData) {
    if ((key.toLowerCase().includes('chat') || key.toLowerCase().includes('phone') || key.toLowerCase().includes('telefono')) 
        && inputData[key] 
        && String(inputData[key]).trim() !== '' 
        && String(inputData[key]).trim() !== '0'
        && String(inputData[key]).trim() !== '0000000000') {
      chatId = String(inputData[key]).trim();
      break;
    }
  }
}

// Solo usar valor por defecto si realmente no se encontró ningún chat_id válido
const customerPhone = (chatId && chatId !== '' && chatId !== '0' && chatId !== '0000000000') ? chatId : '0000000000';

// DEBUG: Descomentar para ver qué valores se están capturando
// console.log('DEBUG chat_id extraction:', {
//   'inputData.chat_id': inputData.chat_id,
//   'inputData["# chat_id"]': inputData['# chat_id'],
//   'chatId extraído': chatId,
//   'customerPhone': customerPhone
// });

const customerAddress = inputData.direccion || inputData['T direccion'] || inputData.address || '';
const montoTotal = parseFloat(inputData.monto || inputData['# monto'] || inputData.total_amount || 0);
const paymentMethod = inputData.pago || inputData['T pago'] || inputData.payment_method || 'efectivo';
const timestamp = inputData.timestamp || inputData['# timestamp'] || inputData['T timestamp'] || Date.now();

// Obtener descripción adicional si existe
const descripcion = inputData.descripcion || inputData['T descripcion'] || '';

// Obtener restaurant_id desde los datos (debe venir de un nodo Set anterior)
// NO usar $env aquí porque causa error de permisos
// Intentar obtener desde múltiples fuentes posibles
const restaurantId = inputData.restaurant_id || inputData['restaurant_id'] || '';

// Función para parsear el pedido desde string
function parsearPedido(pedidoTexto) {
  const items = [];
  
  // Si el pedido está vacío, retornar array vacío
  if (!pedidoTexto || pedidoTexto.trim() === '') {
    return items;
  }
  
  // Dividir por "y", "Y", "," para separar productos
  const productos = pedidoTexto.split(/\s+y\s+|\s+Y\s+|\s*,\s*/i).map(p => p.trim()).filter(p => p !== '');
  
  productos.forEach(producto => {
    // Buscar cantidad al inicio (ej: "2 ojos de bife" -> cantidad: 2, nombre: "ojos de bife")
    // También maneja casos como "2x ojos de bife", "2xOjos", etc.
    const match = producto.match(/^(\d+)\s*[xX]?\s*(.+)$/);
    
    if (match) {
      const cantidad = parseInt(match[1]);
      const nombre = match[2].trim();
      
      items.push({
        product_id: null,
        name: nombre,
        quantity: cantidad,
        unit_price: 0 // Se calculará después
      });
    } else {
      // Si no tiene cantidad, asumir cantidad 1
      items.push({
        product_id: null,
        name: producto,
        quantity: 1,
        unit_price: 0
      });
    }
  });
  
  return items;
}

// Parsear el pedido
const items = parsearPedido(pedidoTexto);

// Si no se parsearon items, crear un item único con todo el pedido o un item por defecto
if (items.length === 0) {
  if (pedidoTexto && pedidoTexto.trim() !== '') {
    items.push({
      product_id: null,
      name: pedidoTexto,
      quantity: 1,
      unit_price: 0
    });
  } else {
    // Si no hay pedido, crear un item genérico para evitar array vacío
    items.push({
      product_id: null,
      name: 'Pedido sin descripción',
      quantity: 1,
      unit_price: 0
    });
  }
}

// Si hay descripción adicional, agregarla al primer item
if (descripcion && items.length > 0) {
  items[0].name = `${items[0].name} - ${descripcion}`;
}

// El monto total ya viene calculado del AI agent, solo validar que no sea 0
// Si el monto total es 0, usar un valor mínimo para evitar error
const totalFinal = montoTotal > 0 ? montoTotal : 1;

// Calcular precio unitario por item (dividir total entre cantidad total)
// Esto es solo para asignar un precio a cada item, pero el total ya viene del AI agent
const cantidadTotal = items.reduce((sum, item) => sum + item.quantity, 0);
const precioPorUnidad = cantidadTotal > 0 ? totalFinal / cantidadTotal : totalFinal;

// Asignar precio unitario a cada item (asegurar que sea número, no string)
items.forEach(item => {
  item.unit_price = parseFloat((Math.round(precioPorUnidad * 100) / 100).toFixed(2));
  item.quantity = parseInt(item.quantity) || 1;
  // Asegurar que el nombre no esté vacío (requerido por la base de datos)
  if (!item.name || item.name.trim() === '') {
    item.name = 'Producto sin nombre';
  }
  // Asegurar que product_id sea null o un string UUID válido, nunca un array
  if (Array.isArray(item.product_id)) {
    item.product_id = item.product_id[0] || null;
  }
  if (item.product_id !== null && typeof item.product_id !== 'string') {
    item.product_id = null;
  }
});

// Generar external_id único usando chat_id y timestamp
const externalId = chatId ? `${chatId}_${timestamp}` : `order_${timestamp}`;

// Limpiar items finales: asegurar que product_id sea null (no array) y que todos los campos sean del tipo correcto
const itemsFinales = items.map(item => ({
  product_id: item.product_id === null || item.product_id === undefined ? null : (typeof item.product_id === 'string' ? item.product_id : null),
  name: String(item.name || 'Producto sin nombre'),
  quantity: parseInt(item.quantity) || 1,
  unit_price: parseFloat(item.unit_price) || 0
}));

// Retornar resultado con TODOS los campos necesarios para el HTTP Request
// IMPORTANTE: Preservar el chat_id original si existe, solo usar customerPhone si no se encontró
// Verificar también en inputData original por si acaso se perdió en el proceso
let finalChatId = customerPhone;
if (chatId && chatId !== '' && chatId !== '0' && chatId !== '0000000000') {
  finalChatId = chatId;
} else if (inputData.chat_id && inputData.chat_id !== '' && inputData.chat_id !== '0' && inputData.chat_id !== '0000000000') {
  finalChatId = String(inputData.chat_id).trim();
} else if (inputData['# chat_id'] && inputData['# chat_id'] !== '' && inputData['# chat_id'] !== '0' && inputData['# chat_id'] !== '0000000000') {
  finalChatId = String(inputData['# chat_id']).trim();
}

return {
  json: {
    // Mantener todos los campos originales
    ...inputData,
    
    // Datos del cliente (mantener formato original para compatibilidad)
    // SOBRESCRIBIR con valores procesados para asegurar consistencia
    'T nombre': customerName,
    nombre: customerName,
    '# chat_id': finalChatId, // Usar el chat_id extraído, no el valor por defecto
    chat_id: finalChatId, // Usar el chat_id extraído, no el valor por defecto
    'T direccion': customerAddress,
    direccion: customerAddress,
    '# monto': montoTotal,
    monto: montoTotal,
    'T pago': paymentMethod,
    pago: paymentMethod,
    '# timestamp': timestamp,
    timestamp: timestamp,
    
    // Items parseados (formato para el API) - usar items finales limpios
    items: itemsFinales,
    total_amount: parseFloat((Math.round(totalFinal * 100) / 100).toFixed(2)),
    
    // Campos adicionales para el HTTP Request (CRÍTICOS)
    external_id: externalId,
    restaurant_id: restaurantId, // DEBE venir de un nodo Set anterior
    order_type: 'delivery',
    
    // Campos del cliente para el API (sin prefijos)
    customer_name: customerName,
    customer_phone: finalChatId, // Usar el chat_id extraído como customer_phone
    customer_address: customerAddress,
    payment_method: paymentMethod,
    
    // Flags útiles para debugging
    items_parsed: true,
    items_count: items.length
  }
};


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = {
  // Auth
  loginAdmin: async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  loginRider: async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login-rider`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  loginWaiter: async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login-waiter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  loginSuperAdmin: async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login-super-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al iniciar sesión');
    }
    return data;
  },

  // Products
  getProducts: async (token) => {
    const response = await fetch(`${API_URL}/api/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  createProduct: async (token, product) => {
    const response = await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });
    return response.json();
  },

  updateProduct: async (token, id, product) => {
    const response = await fetch(`${API_URL}/api/products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });
    return response.json();
  },

  deleteProduct: async (token, id) => {
    const response = await fetch(`${API_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  // Extras
  getExtras: async (token) => {
    const response = await fetch(`${API_URL}/api/extras`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  createExtra: async (token, extra) => {
    const response = await fetch(`${API_URL}/api/extras`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(extra),
    });
    return response.json();
  },

  updateExtra: async (token, id, extra) => {
    const response = await fetch(`${API_URL}/api/extras/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(extra),
    });
    return response.json();
  },

  deleteExtra: async (token, id) => {
    const response = await fetch(`${API_URL}/api/extras/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  // Orders
  createOrder: async (token, orderData) => {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al crear pedido');
    }
    return data;
  },

  getOrders: async (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_URL}/api/orders?${queryString}`;
    
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener pedidos');
    }
    return Array.isArray(data) ? data : [];
  },

  getOrder: async (token, id) => {
    const response = await fetch(`${API_URL}/api/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  updateOrder: async (token, id, updates) => {
    const response = await fetch(`${API_URL}/api/orders/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  // Actualizar pedido completo (incluyendo items)
  updateOrderFull: async (token, id, orderData) => {
    const response = await fetch(`${API_URL}/api/orders/${id}/full`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar pedido');
    }
    return data;
  },

  // Obtener comandas del mozo autenticado
  getMyComandas: async (token, status = null) => {
    const url = status 
      ? `${API_URL}/api/orders/waiter/me?status=${status}`
      : `${API_URL}/api/orders/waiter/me`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener comandas');
    }
    return Array.isArray(data) ? data : [];
  },

  // Actualizar comanda (para mozos)
  updateComanda: async (token, id, comandaData) => {
    const response = await fetch(`${API_URL}/api/orders/comanda/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(comandaData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar comanda');
    }
    return data;
  },

  // Actualizar estado del pedido (para riders)
  updateOrderStatus: async (token, id, status) => {
    const response = await fetch(`${API_URL}/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    return response.json();
  },

  // Actualizar estado de pago del pedido (para riders)
  updateOrderPaymentStatus: async (token, id, payment_status) => {
    const response = await fetch(`${API_URL}/api/orders/${id}/payment-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ payment_status }),
    });
    return response.json();
  },

  // Confirmar peso y total del pedido (para restaurantes por kilo)
  confirmOrderWeight: async (token, id, { items, total_amount }) => {
    const response = await fetch(`${API_URL}/api/orders/${id}/confirm-weight`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items, total_amount }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al confirmar peso del pedido');
    }
    return data;
  },

  // Crear comanda desde panel de mozo
  createComanda: async (token, comandaData) => {
    const response = await fetch(`${API_URL}/api/orders/comanda`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(comandaData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al crear comanda');
    }
    return data;
  },

  // Riders
  getRiders: async (token) => {
    const response = await fetch(`${API_URL}/api/riders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener repartidores');
    }
    return Array.isArray(data) ? data : [];
  },

  createRider: async (token, rider) => {
    const response = await fetch(`${API_URL}/api/riders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(rider),
    });
    return response.json();
  },

  updateRider: async (token, id, rider) => {
    const response = await fetch(`${API_URL}/api/riders/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(rider),
    });
    return response.json();
  },

  deleteRider: async (token, id) => {
    const response = await fetch(`${API_URL}/api/riders/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  // Waiters
  getWaiters: async (token) => {
    const response = await fetch(`${API_URL}/api/waiters`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener mozos');
    }
    return Array.isArray(data) ? data : [];
  },

  createWaiter: async (token, waiter) => {
    const response = await fetch(`${API_URL}/api/waiters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(waiter),
    });
    return response.json();
  },

  updateWaiter: async (token, id, waiter) => {
    const response = await fetch(`${API_URL}/api/waiters/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(waiter),
    });
    return response.json();
  },

  deleteWaiter: async (token, id) => {
    const response = await fetch(`${API_URL}/api/waiters/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  // Waiter Tables
  getWaiterTables: async (token, waiterId = null) => {
    const url = waiterId 
      ? `${API_URL}/api/waiter-tables?waiter_id=${waiterId}`
      : `${API_URL}/api/waiter-tables`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener mesas');
    }
    return Array.isArray(data) ? data : [];
  },

  getMyTables: async (token) => {
    const response = await fetch(`${API_URL}/api/waiter-tables/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener mis mesas');
    }
    return Array.isArray(data) ? data : [];
  },

  assignTablesToWaiter: async (token, waiterId, tableNumbers) => {
    const response = await fetch(`${API_URL}/api/waiter-tables`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ waiter_id: waiterId, table_numbers: tableNumbers }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al asignar mesas');
    }
    return data;
  },

  deleteWaiterTable: async (token, id) => {
    const response = await fetch(`${API_URL}/api/waiter-tables/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  // Kitchen
  getKitchenOrders: async (restaurantId) => {
    if (!restaurantId) {
      throw new Error('restaurant_id es requerido para obtener pedidos de cocina');
    }
    const response = await fetch(`${API_URL}/api/kitchen/orders?restaurant_id=${restaurantId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener pedidos de cocina');
    }
    return Array.isArray(data) ? data : [];
  },

  updateKitchenOrderStatus: async (id, status, restaurantId) => {
    const response = await fetch(`${API_URL}/api/kitchen/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, restaurant_id: restaurantId }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar estado');
    }
    return data;
  },

  // Stock
  createStockRequest: async (payload) => {
    const response = await fetch(`${API_URL}/api/stock/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al enviar el pedido de stock');
    }
    return data;
  },

  getStockRequests: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_URL}/api/stock/requests?${query}` : `${API_URL}/api/stock/requests`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener pedidos de stock');
    }
    return Array.isArray(data) ? data : [];
  },

  updateStockRequestStatus: async (token, id, status) => {
    const response = await fetch(`${API_URL}/api/stock/requests/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar el estado del stock');
    }
    return data;
  },

  // Finances
  getFinanceSummary: async (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/api/finances/summary?${queryString}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener resumen financiero');
    }
    return data;
  },

  getStatistics: async (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/api/finances/statistics?${queryString}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener estadísticas');
    }
    return data;
  },

  getPayments: async (token) => {
    const response = await fetch(`${API_URL}/api/finances/payments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  createPayment: async (token, payment) => {
    const response = await fetch(`${API_URL}/api/finances/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payment),
    });
    return response.json();
  },

  // Delivery Config
  getDeliveryConfig: async (token) => {
    const response = await fetch(`${API_URL}/api/delivery-config`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener configuración de entrega');
    }
    return data;
  },

  updateDeliveryConfig: async (token, config) => {
    const response = await fetch(`${API_URL}/api/delivery-config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(config),
    });
    return response.json();
  },

  getDeliveryConfigHistory: async (token) => {
    const response = await fetch(`${API_URL}/api/delivery-config/history`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  // Super Admin
  getRestaurants: async (token) => {
    const response = await fetch(`${API_URL}/api/super-admin/restaurants`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener restaurantes');
    }
    return data;
  },

  getRestaurant: async (token, id) => {
    const response = await fetch(`${API_URL}/api/super-admin/restaurants/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener restaurante');
    }
    return data;
  },

  getRestaurantDetails: async (token, id) => {
    const response = await fetch(`${API_URL}/api/super-admin/restaurants/${id}/details`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener detalles del restaurante');
    }
    return data;
  },

  createRestaurant: async (token, restaurantData) => {
    const response = await fetch(`${API_URL}/api/super-admin/restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(restaurantData),
    });
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.error || 'Error al crear restaurante');
      if (data.details) {
        error.details = data.details;
      }
      throw error;
    }
    return data;
  },

  updateRestaurant: async (token, id, restaurantData) => {
    const response = await fetch(`${API_URL}/api/super-admin/restaurants/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(restaurantData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar restaurante');
    }
    return data;
  },

  deleteRestaurant: async (token, id) => {
    const response = await fetch(`${API_URL}/api/super-admin/restaurants/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar restaurante');
    }
    return data;
  },

  createRestaurantAdmin: async (token, restaurantId, adminData) => {
    const response = await fetch(`${API_URL}/api/super-admin/restaurants/${restaurantId}/admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(adminData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al crear cuenta de administrador');
    }
    return data;
  },

  getRestaurantAdmins: async (token, restaurantId) => {
    const response = await fetch(`${API_URL}/api/super-admin/restaurants/${restaurantId}/admins`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener administradores');
    }
    return data;
  },
};


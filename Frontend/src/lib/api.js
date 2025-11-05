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
};


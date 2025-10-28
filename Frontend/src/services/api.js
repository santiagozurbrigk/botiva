// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Clase para manejar las llamadas a la API
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.backendURL = BACKEND_URL;
    this.token = localStorage.getItem('adminToken');
  }

  // Método para construir URLs de imágenes
  getImageUrl(imagePath) {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${this.backendURL}${imagePath}`;
  }

  // Método para hacer requests HTTP
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Agregar token de autenticación si existe
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la petición');
      }

      return data;
    } catch (error) {
      console.error('Error en API:', error);
      throw error;
    }
  }

  // Métodos para autenticación
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.token = response.token;
      localStorage.setItem('adminToken', response.token);
    }
    
    return response;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('adminToken');
  }

  // Métodos para categorías
  async getCategories(active = true) {
    return this.request(`/categories?active=${active}`);
  }

  async createCategory(categoryData) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id, categoryData) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleCategory(id) {
    return this.request(`/categories/${id}/toggle`, {
      method: 'PATCH',
    });
  }

  // Métodos para productos
  async getProducts(category = null, active = true, available = true) {
    let endpoint = `/products?active=${active}&available=${available}`;
    if (category) {
      endpoint = `/products/category/${category}?active=${active}&available=${available}`;
    }
    return this.request(endpoint);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async createProduct(productData) {
    const formData = new FormData();
    
    // Agregar campos del producto
    Object.keys(productData).forEach(key => {
      if (key === 'image' && productData[key] instanceof File) {
        formData.append('image', productData[key]);
      } else if (key !== 'image') {
        formData.append(key, productData[key]);
      }
    });

    return this.request('/products', {
      method: 'POST',
      headers: {
        // No establecer Content-Type para FormData
      },
      body: formData,
    });
  }

  async updateProduct(id, productData) {
    const formData = new FormData();
    
    // Agregar campos del producto
    Object.keys(productData).forEach(key => {
      if (key === 'image' && productData[key] instanceof File) {
        formData.append('image', productData[key]);
      } else if (key !== 'image') {
        formData.append(key, productData[key]);
      }
    });

    return this.request(`/products/${id}`, {
      method: 'PUT',
      headers: {
        // No establecer Content-Type para FormData
      },
      body: formData,
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleProduct(id) {
    return this.request(`/products/${id}/toggle`, {
      method: 'PATCH',
    });
  }

  // Métodos para pedidos
  async getOrders(status = null, limit = 50, page = 1) {
    let endpoint = `/orders?limit=${limit}&page=${page}`;
    if (status) {
      endpoint += `&status=${status}`;
    }
    return this.request(endpoint);
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(id, status) {
    return this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async updateOrder(id, orderData) {
    return this.request(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  async deleteOrder(id) {
    return this.request(`/orders/${id}`, {
      method: 'DELETE',
    });
  }

  async getOrderStats() {
    return this.request('/orders/stats/summary');
  }

  // Métodos para promociones
  async getPromotions(active = true) {
    return this.request(`/promotions?active=${active}`);
  }

  async getCurrentPromotion() {
    return this.request('/promotions/active/current');
  }

  async createPromotion(promotionData) {
    const formData = new FormData();
    
    // Agregar campos de la promoción
    Object.keys(promotionData).forEach(key => {
      if (key === 'image' && promotionData[key] instanceof File) {
        formData.append('image', promotionData[key]);
      } else if (key !== 'image') {
        formData.append(key, promotionData[key]);
      }
    });

    return this.request('/promotions', {
      method: 'POST',
      headers: {
        // No establecer Content-Type para FormData
      },
      body: formData,
    });
  }

  async updatePromotion(id, promotionData) {
    const formData = new FormData();
    
    // Agregar campos de la promoción
    Object.keys(promotionData).forEach(key => {
      if (key === 'image' && promotionData[key] instanceof File) {
        formData.append('image', promotionData[key]);
      } else if (key !== 'image') {
        formData.append(key, promotionData[key]);
      }
    });

    return this.request(`/promotions/${id}`, {
      method: 'PUT',
      headers: {
        // No establecer Content-Type para FormData
      },
      body: formData,
    });
  }

  async deletePromotion(id) {
    return this.request(`/promotions/${id}`, {
      method: 'DELETE',
    });
  }

  async togglePromotion(id) {
    return this.request(`/promotions/${id}/toggle`, {
      method: 'PATCH',
    });
  }

  // Método para verificar autenticación
  async checkAuth() {
    try {
      return await this.request('/auth/me');
    } catch (error) {
      this.logout();
      throw error;
    }
  }
}

// Crear instancia única del servicio
const apiService = new ApiService();

export default apiService;

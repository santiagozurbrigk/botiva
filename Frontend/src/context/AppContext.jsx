import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/api';

// Estado inicial
const initialState = {
  // Autenticación
  isAuthenticated: false,
  admin: null,
  loading: false,
  
  // Datos
  categories: [],
  products: [],
  orders: [],
  promotions: [],
  
  // Carrito
  cart: [],
  cartOpen: false,
  
  // UI
  error: null,
  success: null,
};

// Tipos de acciones
const actionTypes = {
  // Autenticación
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  
  // Datos
  SET_CATEGORIES: 'SET_CATEGORIES',
  SET_PRODUCTS: 'SET_PRODUCTS',
  SET_ORDERS: 'SET_ORDERS',
  SET_PROMOTIONS: 'SET_PROMOTIONS',
  
  // Carrito
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_CART_ITEM: 'UPDATE_CART_ITEM',
  CLEAR_CART: 'CLEAR_CART',
  TOGGLE_CART: 'TOGGLE_CART',
  
  // UI
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_SUCCESS: 'SET_SUCCESS',
  CLEAR_MESSAGES: 'CLEAR_MESSAGES',
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    // Autenticación
    case actionTypes.LOGIN_START:
      return { ...state, loading: true, error: null };
    
    case actionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        admin: action.payload,
        loading: false,
        error: null,
      };
    
    case actionTypes.LOGIN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        admin: null,
        loading: false,
        error: action.payload,
      };
    
    case actionTypes.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        admin: null,
        cart: [],
        cartOpen: false,
      };
    
    // Datos
    case actionTypes.SET_CATEGORIES:
      return { ...state, categories: action.payload };
    
    case actionTypes.SET_PRODUCTS:
      return { ...state, products: action.payload };
    
    case actionTypes.SET_ORDERS:
      return { ...state, orders: action.payload };
    
    case actionTypes.SET_PROMOTIONS:
      return { ...state, promotions: action.payload };
    
    // Carrito
    case actionTypes.ADD_TO_CART:
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        cart: [...state.cart, { ...action.payload, quantity: 1 }],
      };
    
    case actionTypes.REMOVE_FROM_CART:
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload),
      };
    
    case actionTypes.UPDATE_CART_ITEM:
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    
    case actionTypes.CLEAR_CART:
      return { ...state, cart: [] };
    
    case actionTypes.TOGGLE_CART:
      return { ...state, cartOpen: !state.cartOpen };
    
    // UI
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, success: null };
    
    case actionTypes.SET_SUCCESS:
      return { ...state, success: action.payload, error: null };
    
    case actionTypes.CLEAR_MESSAGES:
      return { ...state, error: null, success: null };
    
    default:
      return state;
  }
};

// Crear contexto
const AppContext = createContext();

// Provider
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        try {
          dispatch({ type: actionTypes.SET_LOADING, payload: true });
          const response = await apiService.checkAuth();
          dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: response.admin });
        } catch (error) {
          dispatch({ type: actionTypes.LOGOUT });
        } finally {
          dispatch({ type: actionTypes.SET_LOADING, payload: false });
        }
      }
    };

    checkAuth();
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        
        // Cargar categorías primero
        const categoriesResponse = await apiService.getCategories(true);
        dispatch({ type: actionTypes.SET_CATEGORIES, payload: categoriesResponse.data });

        // Cargar productos
        const productsResponse = await apiService.getProducts(null, true, true);
        // Procesar URLs de imágenes
        const productsWithImageUrls = productsResponse.data.map(product => ({
          ...product,
          image: apiService.getImageUrl(product.image)
        }));
        dispatch({ type: actionTypes.SET_PRODUCTS, payload: productsWithImageUrls });

        // Cargar promociones
        const promotionsResponse = await apiService.getCurrentPromotion();
        if (promotionsResponse.data) {
          // Procesar URL de imagen de promoción
          const promotionWithImageUrl = {
            ...promotionsResponse.data,
            image: apiService.getImageUrl(promotionsResponse.data.image)
          };
          dispatch({ type: actionTypes.SET_PROMOTIONS, payload: [promotionWithImageUrl] });
        }
      } catch (error) {
        console.error('❌ Error cargando datos iniciales:', error);
      } finally {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    };

    // Agregar un pequeño delay para evitar sobrecarga
    const timer = setTimeout(loadInitialData, 500);
    return () => clearTimeout(timer);
  }, []);

  // Acciones
  const actions = {
    // Autenticación
    login: async (email, password) => {
      try {
        dispatch({ type: actionTypes.LOGIN_START });
        const response = await apiService.login(email, password);
        dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: response.admin });
        return response;
      } catch (error) {
        dispatch({ type: actionTypes.LOGIN_FAILURE, payload: error.message });
        throw error;
      }
    },

    logout: () => {
      apiService.logout();
      dispatch({ type: actionTypes.LOGOUT });
    },

    // Categorías
    loadCategories: async (active = true) => {
      try {
        const response = await apiService.getCategories(active);
        dispatch({ type: actionTypes.SET_CATEGORIES, payload: response.data });
        return response.data;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    createCategory: async (categoryData) => {
      try {
        const response = await apiService.createCategory(categoryData);
        dispatch({ type: actionTypes.SET_SUCCESS, payload: 'Categoría creada exitosamente' });
        await actions.loadCategories();
        return response.data;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    updateCategory: async (id, categoryData) => {
      try {
        const response = await apiService.updateCategory(id, categoryData);
        dispatch({ type: actionTypes.SET_SUCCESS, payload: 'Categoría actualizada exitosamente' });
        await actions.loadCategories();
        return response.data;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    deleteCategory: async (id) => {
      try {
        await apiService.deleteCategory(id);
        dispatch({ type: actionTypes.SET_SUCCESS, payload: 'Categoría eliminada exitosamente' });
        await actions.loadCategories();
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    toggleCategory: async (id) => {
      try {
        const response = await apiService.toggleCategory(id);
        dispatch({ type: actionTypes.SET_SUCCESS, payload: response.message });
        await actions.loadCategories();
        return response.data;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    // Productos
    loadProducts: async (category = null, active = true, available = true) => {
      try {
        const response = await apiService.getProducts(category, active, available);
        // Procesar URLs de imágenes
        const productsWithImageUrls = response.data.map(product => ({
          ...product,
          image: apiService.getImageUrl(product.image)
        }));
        dispatch({ type: actionTypes.SET_PRODUCTS, payload: productsWithImageUrls });
        return productsWithImageUrls;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    createProduct: async (productData) => {
      try {
        const response = await apiService.createProduct(productData);
        dispatch({ type: actionTypes.SET_SUCCESS, payload: 'Producto creado exitosamente' });
        await actions.loadProducts();
        return response.data;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    updateProduct: async (id, productData) => {
      try {
        const response = await apiService.updateProduct(id, productData);
        dispatch({ type: actionTypes.SET_SUCCESS, payload: 'Producto actualizado exitosamente' });
        await actions.loadProducts();
        return response.data;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    deleteProduct: async (id) => {
      try {
        await apiService.deleteProduct(id);
        dispatch({ type: actionTypes.SET_SUCCESS, payload: 'Producto eliminado exitosamente' });
        await actions.loadProducts();
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    toggleProduct: async (id) => {
      try {
        const response = await apiService.toggleProduct(id);
        dispatch({ type: actionTypes.SET_SUCCESS, payload: response.message });
        await actions.loadProducts();
        return response.data;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    // Carrito
    addToCart: (product) => {
      dispatch({ type: actionTypes.ADD_TO_CART, payload: product });
    },

    removeFromCart: (productId) => {
      dispatch({ type: actionTypes.REMOVE_FROM_CART, payload: productId });
    },

    updateCartItem: (productId, quantity) => {
      dispatch({ type: actionTypes.UPDATE_CART_ITEM, payload: { id: productId, quantity } });
    },

    clearCart: () => {
      dispatch({ type: actionTypes.CLEAR_CART });
    },

    toggleCart: () => {
      dispatch({ type: actionTypes.TOGGLE_CART });
    },

    // Pedidos
    loadOrders: async (status = null, limit = 50, page = 1) => {
      try {
        const response = await apiService.getOrders(status, limit, page);
        dispatch({ type: actionTypes.SET_ORDERS, payload: response.data });
        return response;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    createOrder: async (orderData) => {
      try {
        const response = await apiService.createOrder(orderData);
        dispatch({ type: actionTypes.SET_SUCCESS, payload: 'Pedido creado exitosamente' });
        dispatch({ type: actionTypes.CLEAR_CART });
        return response.data;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    updateOrderStatus: async (id, status) => {
      try {
        const response = await apiService.updateOrderStatus(id, status);
        dispatch({ type: actionTypes.SET_SUCCESS, payload: 'Estado del pedido actualizado' });
        await actions.loadOrders();
        return response.data;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    // Promociones
    loadPromotions: async (active = true) => {
      try {
        const response = await apiService.getPromotions(active);
        // Procesar URLs de imágenes
        const promotionsWithImageUrls = response.data.map(promotion => ({
          ...promotion,
          image: apiService.getImageUrl(promotion.image)
        }));
        dispatch({ type: actionTypes.SET_PROMOTIONS, payload: promotionsWithImageUrls });
        return promotionsWithImageUrls;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    createPromotion: async (promotionData) => {
      try {
        const response = await apiService.createPromotion(promotionData);
        dispatch({ type: actionTypes.SET_SUCCESS, payload: 'Promoción creada exitosamente' });
        await actions.loadPromotions();
        return response.data;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    updatePromotion: async (id, promotionData) => {
      try {
        const response = await apiService.updatePromotion(id, promotionData);
        dispatch({ type: actionTypes.SET_SUCCESS, payload: 'Promoción actualizada exitosamente' });
        await actions.loadPromotions();
        return response.data;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    // UI
    setLoading: (loading) => {
      dispatch({ type: actionTypes.SET_LOADING, payload: loading });
    },

    setError: (error) => {
      dispatch({ type: actionTypes.SET_ERROR, payload: error });
    },

    setSuccess: (success) => {
      dispatch({ type: actionTypes.SET_SUCCESS, payload: success });
    },

    clearMessages: () => {
      dispatch({ type: actionTypes.CLEAR_MESSAGES });
    },
  };

  // Calcular total del carrito
  const cartTotal = state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemsCount = state.cart.reduce((count, item) => count + item.quantity, 0);

  const value = {
    ...state,
    actions,
    cartTotal,
    cartItemsCount,
    getImageUrl: apiService.getImageUrl.bind(apiService),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook para usar el contexto
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de AppProvider');
  }
  return context;
};

export { actionTypes };

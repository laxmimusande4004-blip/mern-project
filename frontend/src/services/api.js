import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProducts = (params = {}) => api.get('/products', { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (productData) => api.post('/products', productData);
export const addToWishlist = (productId) => api.post(`/wishlist/${productId}`);
export const getWishlist = () => api.get('/wishlist');
export const removeFromWishlist = (productId) => api.delete(`/wishlist/${productId}`);
export const getCart = () => api.get('/cart');
export const addToCart = (productId) => api.post(`/cart/${productId}`);
export const updateCartQuantity = (productId, quantity) => api.patch(`/cart/${productId}`, { quantity });
export const removeFromCart = (productId) => api.delete(`/cart/${productId}`);
export const createPaymentOrder = () => api.post('/payments/create-order');
export const verifyPayment = (paymentDetails) => api.post('/payments/verify', paymentDetails);
export const getOrders = () => api.get('/payments/orders');

export default api;

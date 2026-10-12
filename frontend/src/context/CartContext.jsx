import { useCallback, useEffect, useMemo, useState } from 'react';
import { addToCart as addToCartRequest, getCart, removeFromCart as removeFromCartRequest, updateCartQuantity as updateCartQuantityRequest } from '../services/api';
import CartContext from './cart-context';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState('');

  const loadCart = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setCartLoading(true);
      setCartError('');
    }

    try {
      const response = await getCart();
      setCartItems(response.data.cart || []);
      setCartError('');
      return true;
    } catch (error) {
      setCartError(error.response?.data?.message || 'Unable to load your cart.');
      return false;
    } finally {
      setCartLoading(false);
    }
  }, []);

  const refreshCart = useCallback(() => loadCart(), [loadCart]);

  useEffect(() => {
    let mounted = true;

    const initializeCart = async () => {
      try {
        const response = await getCart();
        if (mounted) {
          setCartItems(response.data.cart || []);
          setCartError('');
        }
      } catch (error) {
        if (mounted) {
          setCartError(error.response?.data?.message || 'Unable to load your cart.');
        }
      } finally {
        if (mounted) setCartLoading(false);
      }
    };

    void initializeCart();
    return () => {
      mounted = false;
    };
  }, []);

  const addProduct = useCallback(async (productId) => {
    const response = await addToCartRequest(productId);
    setCartItems(response.data.cart || []);
    setCartError('');
  }, []);

  const setQuantity = useCallback(async (productId, quantity) => {
    const response = await updateCartQuantityRequest(productId, quantity);
    setCartItems(response.data.cart || []);
    setCartError('');
  }, []);

  const removeProduct = useCallback(async (productId) => {
    const response = await removeFromCartRequest(productId);
    setCartItems(response.data.cart || []);
    setCartError('');
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setCartError('');
    setCartLoading(false);
  }, []);

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );
  const value = useMemo(() => ({
    cartItems,
    cartCount,
    cartLoading,
    cartError,
    refreshCart,
    addProduct,
    setQuantity,
    removeProduct,
    clearCart,
  }), [cartItems, cartCount, cartLoading, cartError, refreshCart, addProduct, setQuantity, removeProduct, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

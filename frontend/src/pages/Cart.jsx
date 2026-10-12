import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/useCart';
import { createPaymentOrder, verifyPayment } from '../services/api';
import { loadRazorpay } from '../services/razorpay';

export default function Cart() {
  const {
    cartItems,
    cartCount,
    cartLoading,
    cartError,
    refreshCart,
    setQuantity,
    removeProduct,
  } = useCart();
  const [busyProductId, setBusyProductId] = useState('');
  const [actionError, setActionError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');

  const subtotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const handleQuantityChange = async (productId, quantity) => {
    setBusyProductId(productId);
    setActionError('');
    try {
      await setQuantity(productId, quantity);
    } catch (error) {
      setActionError(error.response?.data?.message || 'Unable to update item quantity.');
    } finally {
      setBusyProductId('');
    }
  };

  const handleRemove = async (productId) => {
    setBusyProductId(productId);
    setActionError('');
    try {
      await removeProduct(productId);
    } catch (error) {
      setActionError(error.response?.data?.message || 'Unable to remove item from your cart.');
    } finally {
      setBusyProductId('');
    }
  };

  const handleCheckout = async () => {
    if (checkoutLoading || cartItems.length === 0) return;

    setCheckoutLoading(true);
    setCheckoutError('');
    setPaymentSuccess('');

    try {
      const [orderResponse] = await Promise.all([
        createPaymentOrder(),
        loadRazorpay(),
      ]);
      const { keyId, order, customer } = orderResponse.data;

      const checkout = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'ShopKart',
        description: 'Order payment',
        order_id: order.id,
        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.contact,
        },
        theme: { color: '#2563eb' },
        handler: async (paymentDetails) => {
          try {
            await verifyPayment(paymentDetails);
            await refreshCart();
            setPaymentSuccess('Payment successful. Your order is confirmed.');
          } catch (error) {
            setCheckoutError(
              error.response?.data?.message ||
              'Payment was received but could not be verified. Contact support before trying again.'
            );
          } finally {
            setCheckoutLoading(false);
          }
        },
        modal: {
          ondismiss: () => setCheckoutLoading(false),
        },
      });

      checkout.on('payment.failed', (event) => {
        setCheckoutError(event.error?.description || 'Payment failed. Your cart is unchanged.');
        setCheckoutLoading(false);
      });
      checkout.open();
    } catch (error) {
      setCheckoutError(
        error.response?.data?.message ||
        error.message ||
        'Unable to start checkout. Please try again.'
      );
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="app-page">
      <Navbar />

      <main className="cart-page">
        <div className="section-header">
          <h1>My Cart</h1>
          <span>{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
        </div>

        {cartLoading && (
          <div className="state-box">
            <p>Loading your cart...</p>
          </div>
        )}

        {paymentSuccess && (
          <div className="cart-success" role="status">
            {paymentSuccess}
          </div>
        )}
        {checkoutError && (
          <div className="cart-action-error" role="alert">
            {checkoutError}
          </div>
        )}

        {!cartLoading && cartError && (
          <div className="state-box state-error">
            <div>
              <p>{cartError === 'No authentication token found. Please log in.' ? 'Please log in to view your cart.' : cartError}</p>
              <button type="button" className="secondary-button" onClick={refreshCart}>
                Try Again
              </button>
            </div>
          </div>
        )}

        {!cartLoading && !cartError && cartItems.length === 0 && (
          <div className="state-box state-empty cart-empty">
            <div className="empty-wishlist-content">
              <span className="empty-icon" aria-hidden="true">🛒</span>
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added anything yet.</p>
              <Link to="/products" className="primary-button quick-button">
                Browse Products
              </Link>
            </div>
          </div>
        )}

        {!cartLoading && !cartError && cartItems.length > 0 && (
          <>
            {actionError && (
              <div className="cart-action-error" role="alert">
                {actionError}
              </div>
            )}

            <div className="cart-layout">
              <section className="cart-items" aria-label="Items in your cart">
                {cartItems.map(({ product, quantity }) => {
                  const isBusy = busyProductId === product._id;

                  return (
                    <article className="cart-item" key={product._id}>
                      <img src={product.image} alt={product.name} className="cart-item-image" />
                      <div className="cart-item-details">
                        <h2>{product.name}</h2>
                        <p className="product-price">₹{product.price.toLocaleString('en-IN')}</p>
                        <p className="cart-stock">
                          {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                        </p>
                        <div className="cart-item-controls">
                          <div className="quantity-control" aria-label={`Quantity for ${product.name}`}>
                            <button
                              type="button"
                              aria-label={`Decrease ${product.name} quantity`}
                              onClick={() => handleQuantityChange(product._id, quantity - 1)}
                              disabled={isBusy || quantity <= 1}
                            >
                              −
                            </button>
                            <span>{quantity}</span>
                            <button
                              type="button"
                              aria-label={`Increase ${product.name} quantity`}
                              onClick={() => handleQuantityChange(product._id, quantity + 1)}
                              disabled={isBusy || quantity >= product.stock}
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            className="remove-button"
                            onClick={() => handleRemove(product._id)}
                            disabled={isBusy}
                          >
                            {isBusy ? 'Updating...' : 'Remove'}
                          </button>
                        </div>
                      </div>
                      <strong className="cart-item-total">
                        ₹{(product.price * quantity).toLocaleString('en-IN')}
                      </strong>
                    </article>
                  );
                })}
              </section>

              <aside className="order-summary">
                <h2>Order Summary</h2>
                <div className="summary-row">
                  <span>Items</span>
                  <span>{cartCount}</span>
                </div>
                <div className="summary-row summary-total">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <button
                  type="button"
                  className="primary-button checkout-button"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? 'Starting checkout...' : 'Proceed to Checkout'}
                </button>
                <p className="checkout-note">Secure payments powered by Razorpay.</p>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

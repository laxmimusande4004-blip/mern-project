import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getOrders } from '../services/api';

const formatDate = (date) => new Date(date).toLocaleString('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleRetry = () => {
    setLoading(true);
    setError('');

    getOrders()
      .then((response) => setOrders(response.data.orders || []))
      .catch((requestError) => {
        if (requestError.response?.status === 401) {
          navigate('/login?returnTo=%2Forders');
          return;
        }
        setError(requestError.response?.data?.message || 'Unable to load your orders.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;

    getOrders()
      .then((response) => {
        if (active) setOrders(response.data.orders || []);
      })
      .catch((requestError) => {
        if (active) {
          if (requestError.response?.status === 401) {
            navigate('/login?returnTo=%2Forders');
            return;
          }
          setError(requestError.response?.data?.message || 'Unable to load your orders.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="app-page">
      <Navbar />

      <main className="orders-page">
        <div className="section-header">
          <h1>My Orders</h1>
          <span>{orders.length} {orders.length === 1 ? 'order' : 'orders'}</span>
        </div>

        {loading && (
          <div className="state-box">
            <p>Loading your orders...</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-box state-error">
            <div>
              <p>{error}</p>
              <button type="button" className="secondary-button" onClick={handleRetry}>
                Try Again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="state-box state-empty orders-empty">
            <div className="empty-wishlist-content">
              <span className="empty-icon" aria-hidden="true">📦</span>
              <h2>No orders yet</h2>
              <p>Your orders will appear here after you check out.</p>
              <Link to="/products" className="primary-button quick-button">
                Browse Products
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => (
              <article className="order-card" key={order._id}>
                <header className="order-card-header">
                  <div>
                    <h2>Order #{order._id.slice(-8).toUpperCase()}</h2>
                    <p>Placed {formatDate(order.createdAt)}</p>
                  </div>
                  <span className={`order-status order-status-${order.status}`}>
                    {order.status}
                  </span>
                </header>

                <ul className="order-items">
                  {order.items.map((item, index) => (
                    <li key={`${item.product}-${index}`}>
                      <span>{item.name} <span className="order-item-quantity">× {item.quantity}</span></span>
                      <strong>₹{(item.price * item.quantity).toLocaleString('en-IN')}</strong>
                    </li>
                  ))}
                </ul>

                <footer className="order-card-footer">
                  <span>Total</span>
                  <strong>₹{(order.amount / 100).toLocaleString('en-IN')}</strong>
                </footer>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

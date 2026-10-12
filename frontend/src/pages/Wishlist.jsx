import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getWishlist, removeFromWishlist } from '../services/api';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const fetchWishlist = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getWishlist();
      setWishlist(response.data.wishlist || []);
    } catch {
      setError('Unable to load wishlist.');
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    setRemovingId(productId);

    try {
      await removeFromWishlist(productId);
      setWishlist((current) => current.filter((product) => product._id !== productId));
    } catch {
      setError('Unable to remove product from wishlist.');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="app-page">
      <Navbar />

      <main className="wishlist-page">
        <div className="section-header">
          <h1>My Wishlist</h1>
          <span>{wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved</span>
        </div>

        {loading && (
          <div className="state-box">
            <p>Loading your wishlist...</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-box state-error">
            <p>{error}</p>
            <button type="button" className="secondary-button" onClick={fetchWishlist}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && wishlist.length === 0 && (
          <div className="state-box state-empty empty-wishlist-box">
            <div className="empty-wishlist-content">
              <span className="empty-icon">❤️</span>
              <h2>Your wishlist is empty</h2>
              <p>Start saving products you love.</p>
              <Link to="/products" className="primary-button quick-button">
                Browse Products
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && wishlist.length > 0 && (
          <div className="wishlist-grid">
            {wishlist.map((product) => (
              <article key={product._id} className="wishlist-card">
                <img src={product.image} alt={product.name} className="wishlist-image" />

                <div className="wishlist-body">
                  <h3>{product.name}</h3>
                  <span className="product-category">{product.category}</span>
                  <p className="product-price">₹{product.price.toLocaleString('en-IN')}</p>
                  <p className="wishlist-stock">{product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}</p>

                  <div className="wishlist-actions">
                    <Link to={`/products/${product._id}`} className="secondary-link">
                      View Details
                    </Link>
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => handleRemove(product._id)}
                      disabled={removingId === product._id}
                    >
                      {removingId === product._id ? 'Removing...' : 'Remove from Wishlist'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

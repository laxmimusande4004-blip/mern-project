import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/useCart';

export default function Navbar() {
  const navigate = useNavigate();
  const { cartCount, clearCart } = useCart();

  const handleLogout = async () => {
    try {
      await api.post('/customers/logout');
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      clearCart();
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-content">
          <div>
            <Link to="/home" className="brand-link">
              ShopKart
            </Link>
          </div>
          <div className="navbar-actions">
            <Link to="/home" className="nav-link">
              Home
            </Link>
            <Link to="/products" className="nav-link">
              Products
            </Link>
            <Link to="/wishlist" className="nav-link">
              Wishlist
            </Link>
            <Link to="/cart" className="nav-link">
              Cart ({cartCount})
            </Link>
            <Link to="/orders" className="nav-link">
              Orders
            </Link>
            <button
              onClick={handleLogout}
              className="logout-button"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { getProducts } from '../services/api';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const response = await api.get('/customers/me');
        setCustomer(response.data);
      } catch (err) {
        console.error('Authentication check failed', err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [navigate]);

  useEffect(() => {
    if (!customer) return undefined;

    let cancelled = false;

    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        if (!cancelled) setProducts(response.data.products || []);
      } catch (err) {
        console.error('Product loading failed', err);
        if (!cancelled) setProductsError('Products could not be loaded. Please try again later.');
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    };

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [customer]);

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="app-page">
      <Navbar />

      <main className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <h1>
              Welcome back, <span>{customer.fullName}</span>! 👋
            </h1>
            <p>We're glad to see you at ShopKart.</p>
          </div>

          <div className="profile-details">
            <h3>Profile Details</h3>

            <dl className="details-grid">
              <div className="detail-item">
                <dt>Full Name</dt>
                <dd>{customer.fullName}</dd>
              </div>

              <div className="detail-item">
                <dt>Email Address</dt>
                <dd>{customer.email}</dd>
              </div>

              <div className="detail-item">
                <dt>Phone Number</dt>
                <dd>{customer.phoneNumber}</dd>
              </div>

              <div className="detail-item">
                <dt>Account Status</dt>
                <dd className="status-active">
                  <span></span> Active
                </dd>
              </div>
            </dl>

            <div className="quick-links">
              <Link to="/products" className="primary-button quick-button">
                Browse Products
              </Link>
            </div>
          </div>
        </div>

        <section className="dashboard-products" aria-labelledby="dashboard-products-title">
          <div className="dashboard-products-header">
            <div>
              <p className="eyebrow">ShopKart</p>
              <h2 id="dashboard-products-title">Featured Products</h2>
            </div>
            <Link to="/products" className="secondary-link dashboard-view-all">
              View all products
            </Link>
          </div>

          {productsLoading && (
            <div className="state-box">
              <p>Loading products...</p>
            </div>
          )}
          {!productsLoading && productsError && (
            <div className="state-box state-error">
              <p>{productsError}</p>
            </div>
          )}
          {!productsLoading && !productsError && products.length === 0 && (
            <div className="state-box state-empty">
              <p>No products are available yet.</p>
            </div>
          )}
          {!productsLoading && !productsError && products.length > 0 && (
            <div className="product-grid">
              {products.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

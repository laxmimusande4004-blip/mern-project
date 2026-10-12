import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/useCart';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshCart } = useCart();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return setError('Please enter both email and password.');
    }

    setLoading(true);
    try {
      await api.post('/customers/login', formData);
      await refreshCart();
      const returnTo = searchParams.get('returnTo');
      const destination = returnTo?.startsWith('/') && !returnTo.startsWith('//')
        ? returnTo
        : '/home';
      navigate(destination, { replace: true });
    } catch (requestError) {
      if (!requestError.response) {
        setError('Cannot reach the backend. Check that it is running and allows requests from this frontend.');
      } else if (requestError.response.status === 401) {
        setError(requestError.response.data?.message || 'Invalid email or password.');
      } else {
        setError(requestError.response.data?.message || 'Unable to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-heading">
          <h2>Welcome Back</h2>
          <p>Sign in to your ShopKart account</p>
        </div>
        
        {error && (
          <div className="alert alert-error">
            <p>{error}</p>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-fields">
            <div>
              <label>Email Address</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label>Password</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="primary-button"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        
        <p className="auth-footer">
          New to ShopKart?{' '}
          <Link to="/register" className="auth-link">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

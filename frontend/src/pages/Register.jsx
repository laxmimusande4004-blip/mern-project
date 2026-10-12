import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.password || !formData.phoneNumber) {
      return setError('All fields are required.');
    }

    setLoading(true);
    try {
      await api.post('/customers/register', formData);
      setSuccessMsg('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (requestError) {
      if (!requestError.response) {
        setError('Cannot reach the backend at localhost:5000. Start the backend from its folder and try again.');
      } else {
        setError(requestError.response.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-heading">
          <h2>Create Account</h2>
          <p>Join ShopKart today</p>
        </div>
        
        {error && (
          <div className="alert alert-error">
            <p>{error}</p>
          </div>
        )}
        
        {successMsg && (
          <div className="alert alert-success">
            <p>{successMsg}</p>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-fields">
            <div>
              <label>Full Name</label>
              <input
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                className="form-input"
                placeholder="John Doe"
              />
            </div>
            
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
              <label>Phone Number</label>
              <input
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="form-input"
                placeholder="+1 (555) 000-0000"
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
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

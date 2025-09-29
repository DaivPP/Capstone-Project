import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { login } from './services/Api.js';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(formData);
      localStorage.setItem('token', response.data.token);
      navigate('/app');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Login failed. Please try again.');
      console.error('Login failed:', err.response?.data?.error || err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Styles copied from SignupModal
  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '16px',
    boxSizing: 'border-box',
  };

  const modalContentStyle = {
    backgroundColor: '#1f2937',
    borderRadius: '12px',
    overflow: 'hidden',
    maxWidth: '1000px',
    width: '100%',
    height: '600px',
    display: 'flex',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    margin: 'auto',
  };

  const leftPanelStyle = {
    flex: '1',
    background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a855f7 100%)',
    padding: '100px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '600px',
    position: 'relative',
    color: 'white',
  };

  const rightPanelStyle = {
    flex: '1',
    padding: '33px',
    backgroundColor: '#111827',
    minHeight: '600px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#374151',
    border: '1px solid #4b5563',
    borderRadius: '8px',
    color: 'white',
    fontSize: '16px',
    outline: 'none',
  };

  const buttonStyle = {
    width: '100%',
    backgroundColor: '#7c3aed',
    color: 'white',
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#374151',
    cursor: 'not-allowed',
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={leftPanelStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>AMU</div>
            <Link
              to="/app"
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                fontSize: '14px',
                textDecoration: 'none',
              }}
            >
              Back to website →
            </Link>
          </div>
          <video
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1,
            }}
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/medical-backgroud.webm" type="video/webm" />
            <source src="/medical backgroud.mp4" type="video/mp4" />
          </video>
        </div>

        <div style={rightPanelStyle}>
          <div style={{ position: 'absolute', top: '10px', right: '20px' }}>
            <Link
              to="/app"
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                fontSize: '14px',
                textDecoration: 'none',
              }}
            >
              Back to website →
            </Link>
          </div>

          <div style={{ flex: '1' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '300', color: 'white', margin: '0 0 8px 0' }}>
              Login
            </h2>
            <p style={{ color: '#9ca3af', margin: '0 0 32px 0' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: '#a855f7', cursor: 'pointer', textDecoration: 'none' }}>
                Sign up
              </Link>
            </p>
            {error && <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                style={inputStyle}
                disabled={loading}
                required
              />
              <div style={{ position: 'relative', marginTop: '24px' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  style={{ ...inputStyle, paddingRight: '48px' }}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{ ...(loading ? disabledButtonStyle : buttonStyle), marginTop: '24px' }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

const SignupModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'Fletcher',
    lastName: '',
    email: '',
    password: ''
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Open modal when component loads
  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    alert('you cant code for shit hahah haha xd xd');
  };

  if (!isOpen) return null;

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
    boxSizing: 'border-box'
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
    margin: 'auto'
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
    color: 'white'
  };

  const rightPanelStyle = {
    flex: '1',
    padding: '33px',
    backgroundColor: '#111827',
    minHeight: '600px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#374151',
    border: '1px solid #4b5563',
    borderRadius: '8px',
    color: 'white',
    fontSize: '16px',
    outline: 'none'
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
    transition: 'background-color 0.2s'
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#374151',
    cursor: 'not-allowed'
  };

  const appleButtonStyle = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '10px 16px',
    borderRadius: '8px',
    backgroundColor: '#000000',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '16px',
    gap: '12px',
    border: '1px solid #000000'
  };

  const googleButtonStyle = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '10px 16px',
    borderRadius: '8px',
    backgroundColor: '#4285F4',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '16px',
    gap: '12px',
    border: '1px solid #4285F4'
  };

  const leftIconBoxStyle = {
    width: '40px',
    height: '32px',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={leftPanelStyle}>
          {/* Header */}
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
                textDecoration: 'none'
              }}
            >
              Back to website →
            </Link>
          </div>

          {/* Video Background */}
          <video
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1
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

        {/* Right side - Form */}
        <div style={rightPanelStyle}>
          {/* Back to website link */}
          <div style={{ position: 'absolute', top: '10px', right: '20px' }}>
            <Link 
              to="/app"
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'rgba(255, 255, 255, 0.7)', 
                cursor: 'pointer',
                fontSize: '14px',
                textDecoration: 'none'
              }}
            >
              Back to website →
            </Link>
          </div>

          <div style={{ flex: '1' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '300', color: 'white', margin: '0 0 8px 0' }}>
              Create an account
            </h2>
            <p style={{ color: '#9ca3af', margin: '0 0 32px 0' }}>
              Already have an account? <span style={{ color: '#a855f7', cursor: 'pointer' }}>Sign in</span>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Name fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="First name"
                  style={inputStyle}
                />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last name"
                  style={inputStyle}
                />
              </div>

              {/* Email field */}
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                style={inputStyle}
              />

              {/* Password field */}
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  style={{ ...inputStyle, paddingRight: '48px' }}
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
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Terms checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                <label htmlFor="terms" style={{ color: '#9ca3af', fontSize: '14px' }}>
                  I agree to the <span style={{ color: '#a855f7', textDecoration: 'underline', cursor: 'pointer' }}>Terms & Conditions</span>
                </label>
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={!agreedToTerms}
                style={agreedToTerms ? buttonStyle : disabledButtonStyle}
              >
                Create account
              </button>
            </div>
          </div>

          {/* Social login */}
          <div style={{ marginTop: '32px' }}>
            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(30,30,36,.8)' }}></div>
              <div style={{ position: 'relative', textAlign: 'center', backgroundColor: '#111827', padding: '0 8px', color: '#9ca3af', fontSize: '14px' }}>
                Or register with
              </div>
            </div>

            <div
  style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  }}
>
  <button
    onClick={() => {
      // Redirect to Apple Sign In
      window.location.href = 'https://appleid.apple.com/auth/authorize?client_id=your-apple-client-id&redirect_uri=your-redirect-uri&response_type=code&scope=name%20email';
    }}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      height: '50px',
      borderRadius: '8px',
      backgroundColor: '#000',
      color: '#fff',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
      transition: 'background-color 0.2s'
    }}
    onMouseEnter={(e) => {
      e.target.style.backgroundColor = '#333';
    }}
    onMouseLeave={(e) => {
      e.target.style.backgroundColor = '#000';
    }}
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff" aria-hidden>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
    <span>Enter with Apple</span>
  </button>

  <button
    onClick={() => {
      // Redirect to Google OAuth
      window.location.href = 'https://accounts.google.com/oauth/authorize?client_id=your-google-client-id&redirect_uri=your-redirect-uri&response_type=code&scope=openid%20email%20profile';
    }}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      height: '50px',
      borderRadius: '8px',
      backgroundColor: '#fff',
      color: '#000',
      fontWeight: '500',
      border: '1px solid #ccc',
      cursor: 'pointer',
      transition: 'background-color 0.2s, box-shadow 0.2s'
    }}
    onMouseEnter={(e) => {
      e.target.style.backgroundColor = '#f8f9fa';
      e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    }}
    onMouseLeave={(e) => {
      e.target.style.backgroundColor = '#fff';
      e.target.style.boxShadow = 'none';
    }}
  >
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.9-6.9C35.9 1.9 30.4 0 24 0 14.6 0 6.4 5.4 2.5 13.2l8.1 6.3C12.6 13.7 17.8 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-2.7-.3-3.9H24v7.4h12.6c-.3 2-1.6 5-4.6 7.1l7.1 5.5c4.2-3.9 7.4-9.6 7.4-16.1z"/>
      <path fill="#FBBC05" d="M10.6 28.7c-.5-1.6-.8-3.3-.8-5.2s.3-3.6.8-5.2l-8.1-6.3C.9 15 0 19.4 0 23.5s.9 8.5 2.5 11.5l8.1-6.3z"/>
      <path fill="#34A853" d="M24 48c6.4 0 11.8-2.1 15.8-5.9l-7.1-5.5c-2 1.4-4.8 2.5-8.7 2.5-6.2 0-11.4-4.1-13.3-9.6l-8.1 6.3C6.4 42.6 14.6 48 24 48z"/>
    </svg>
    <span>Enter with Google</span>
  </button>
             </div>
            </div>
          </div>
        </div>
      </div>
  );
};
export default SignupModal;
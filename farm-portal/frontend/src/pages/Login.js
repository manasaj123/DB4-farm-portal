import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetUsername, setResetUsername] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(form.username, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');
    setResetLoading(true);

    // Validate password
    if (resetNewPassword.length < 8) {
      setResetError('Password must be at least 8 characters');
      setResetLoading(false);
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('Passwords do not match');
      setResetLoading(false);
      return;
    }

    try {
      // Call backend API to reset password
      const response = await API.post('/auth/reset-password-direct', { 
        username: resetUsername, 
        newPassword: resetNewPassword 
      });
      
      setResetMessage(response.data.message || '✅ Password reset successfully!');
      setResetUsername('');
      setResetNewPassword('');
      setResetConfirmPassword('');
      
      // Close modal after 3 seconds
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetMessage('');
      }, 3000);
      
    } catch (err) {
      setResetError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Login to your Farm Portal account</p>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username or Email</label>
            <input
              type="text"
              placeholder="Enter your username or email"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              style={styles.input}
              required
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={styles.input}
              required
              disabled={loading}
            />
          </div>

          {/* Forgot Password - Centered */}
          <div style={styles.forgotPasswordContainer}>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              style={styles.forgotPasswordLink}
              disabled={loading}
            >
              Forgot Password?
            </button>
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p style={styles.footer}>
          Don't have an account? <Link to="/register" style={styles.link}>Register</Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={styles.modalOverlay} onClick={() => {
          if (!resetLoading) {
            setShowForgotPassword(false);
            setResetMessage('');
            setResetError('');
          }
        }}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>🔐 Reset Password</h2>
              <button 
                onClick={() => {
                  if (!resetLoading) {
                    setShowForgotPassword(false);
                    setResetMessage('');
                    setResetError('');
                  }
                }} 
                style={styles.modalClose}
                disabled={resetLoading}
              >
                ✕
              </button>
            </div>

            <p style={styles.modalSubtitle}>
              Enter your username and set a new password.
            </p>

            {resetError && <div style={styles.resetError}>{resetError}</div>}
            {resetMessage && <div style={styles.resetSuccess}>{resetMessage}</div>}

            <form onSubmit={handleResetPassword}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Username</label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={resetUsername}
                  onChange={(e) => {
                    setResetUsername(e.target.value);
                    setResetError('');
                    setResetMessage('');
                  }}
                  style={styles.input}
                  required
                  disabled={resetLoading || resetMessage}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password (min 8 characters)"
                  value={resetNewPassword}
                  onChange={(e) => {
                    setResetNewPassword(e.target.value);
                    setResetError('');
                    setResetMessage('');
                  }}
                  style={styles.input}
                  required
                  disabled={resetLoading || resetMessage}
                  minLength="8"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={resetConfirmPassword}
                  onChange={(e) => {
                    setResetConfirmPassword(e.target.value);
                    setResetError('');
                    setResetMessage('');
                  }}
                  style={styles.input}
                  required
                  disabled={resetLoading || resetMessage}
                />
              </div>

              <div style={styles.modalButtons}>
                <button
                  type="button"
                  onClick={() => {
                    if (!resetLoading) {
                      setShowForgotPassword(false);
                      setResetMessage('');
                      setResetError('');
                    }
                  }}
                  style={styles.modalCancel}
                  disabled={resetLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    ...styles.modalSubmit,
                    opacity: resetLoading ? 0.7 : 1,
                    cursor: resetLoading || resetMessage ? 'not-allowed' : 'pointer'
                  }}
                  disabled={resetLoading || resetMessage}
                >
                  {resetLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes slideUp {
            from {
              transform: translateY(-30px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  container: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh', 
    backgroundColor: '#f0f2f5',
    padding: '20px'
  },
  card: { 
    background: 'white', 
    padding: '40px', 
    borderRadius: '12px', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
    width: '400px',
    maxWidth: '100%'
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '5px',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: '14px',
    color: '#6c757d',
    marginBottom: '25px',
    textAlign: 'center'
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '15px',
    fontSize: '14px',
    border: '1px solid #f5c6cb',
    textAlign: 'center'
  },
  inputGroup: {
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '500',
    fontSize: '14px',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s',
    outline: 'none'
  },
  forgotPasswordContainer: {
    textAlign: 'center',  
    marginBottom: '15px'
  },
  forgotPasswordLink: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    fontSize: '14px',
    textDecoration: 'underline',
    padding: '0',
    transition: 'color 0.3s'
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    marginTop: '10px',
    transition: 'background-color 0.3s'
  },
  footer: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#6c757d'
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: '500'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px',
    backdropFilter: 'blur(4px)'
  },
  modal: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    width: '420px',
    maxWidth: '100%',
    boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
    animation: 'slideUp 0.3s ease'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  modalTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#1a1a2e',
    margin: 0,
    textAlign: 'center',
    flex: 1
  },
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6c757d',
    padding: '0 8px'
  },
  modalSubtitle: {
    fontSize: '14px',
    color: '#6c757d',
    marginBottom: '20px',
    textAlign: 'center'
  },
  resetError: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '15px',
    fontSize: '13px',
    border: '1px solid #f5c6cb'
  },
  resetSuccess: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '15px',
    fontSize: '13px',
    border: '1px solid #c3e6cb'
  },
  modalButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px'
  },
  modalCancel: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  modalSubmit: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  }
};

export default Login;
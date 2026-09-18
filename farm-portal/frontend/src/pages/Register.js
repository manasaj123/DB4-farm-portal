import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: '#6c757d'
  });
  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let score = 0;
    let message = '';
    let color = '#6c757d';

    if (password.length === 0) {
      return { score: 0, message: '', color: '#6c757d' };
    }

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Uppercase check
    if (/[A-Z]/.test(password)) score++;

    // Lowercase check
    if (/[a-z]/.test(password)) score++;

    // Numbers check
    if (/[0-9]/.test(password)) score++;

    // Special characters check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    // Determine strength
    if (score <= 2) {
      message = 'Weak';
      color = '#dc3545';
    } else if (score <= 4) {
      message = 'Fair';
      color = '#ffc107';
    } else if (score <= 6) {
      message = 'Good';
      color = '#17a2b8';
    } else {
      message = 'Strong';
      color = '#28a745';
    }

    return { score, message, color };
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setForm({ ...form, password });
    const strength = checkPasswordStrength(password);
    setPasswordStrength(strength);
  };

  const validatePassword = (password) => {
    const requirements = [];
    
    if (password.length < 8) {
      requirements.push('at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      requirements.push('one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      requirements.push('one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      requirements.push('one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      requirements.push('one special character (!@#$%^&*(),.?":{}|<>)');
    }

    return requirements;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate password strength
    const passwordErrors = validatePassword(form.password);
    if (passwordErrors.length > 0) {
      setError(`Password must contain: ${passwordErrors.join(', ')}`);
      return;
    }

    try {
      await register(form.username, form.email, form.password);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join Farm Portal to manage your agricultural operations</p>
        
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input 
              type="text" 
              placeholder="Choose a username" 
              value={form.username} 
              onChange={(e) => setForm({ ...form, username: e.target.value })} 
              style={styles.input} 
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={form.email} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
              style={styles.input} 
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              placeholder="Create a strong password" 
              value={form.password} 
              onChange={handlePasswordChange} 
              style={{
                ...styles.input,
                borderColor: form.password ? passwordStrength.color : '#ddd'
              }} 
              required 
            />
            
            {/* Password strength indicator */}
            {form.password && (
              <div style={styles.strengthContainer}>
                <div style={styles.strengthBar}>
                  <div style={{
                    ...styles.strengthFill,
                    width: `${(passwordStrength.score / 7) * 100}%`,
                    backgroundColor: passwordStrength.color,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <span style={{ ...styles.strengthText, color: passwordStrength.color }}>
                  Password Strength: {passwordStrength.message}
                </span>
              </div>
            )}

            {/* Password requirements */}
            <div style={styles.requirements}>
              <p style={styles.requirementsTitle}>Password must contain:</p>
              <ul style={styles.requirementsList}>
                <li style={{
                  ...styles.requirementItem,
                  color: form.password.length >= 8 ? '#28a745' : '#6c757d'
                }}>
                  {form.password.length >= 8 ? '✅' : '⬜'} At least 8 characters
                </li>
                <li style={{
                  ...styles.requirementItem,
                  color: /[A-Z]/.test(form.password) ? '#28a745' : '#6c757d'
                }}>
                  {/[A-Z]/.test(form.password) ? '✅' : '⬜'} One uppercase letter
                </li>
                <li style={{
                  ...styles.requirementItem,
                  color: /[a-z]/.test(form.password) ? '#28a745' : '#6c757d'
                }}>
                  {/[a-z]/.test(form.password) ? '✅' : '⬜'} One lowercase letter
                </li>
                <li style={{
                  ...styles.requirementItem,
                  color: /[0-9]/.test(form.password) ? '#28a745' : '#6c757d'
                }}>
                  {/[0-9]/.test(form.password) ? '✅' : '⬜'} One number
                </li>
                <li style={{
                  ...styles.requirementItem,
                  color: /[!@#$%^&*(),.?":{}|<>]/.test(form.password) ? '#28a745' : '#6c757d'
                }}>
                  {/[!@#$%^&*(),.?":{}|<>]/.test(form.password) ? '✅' : '⬜'} One special character
                </li>
              </ul>
            </div>
          </div>

          <button type="submit" style={styles.button}>Create Account</button>
        </form>
        
        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Login</Link>
        </p>
      </div>
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
    marginBottom: '20px',
    textAlign: 'center'
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '15px',
    fontSize: '14px',
    border: '1px solid #f5c6cb'
  },
  success: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '15px',
    fontSize: '14px',
    border: '1px solid #c3e6cb'
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
  strengthContainer: {
    marginTop: '8px'
  },
  strengthBar: {
    width: '100%',
    height: '6px',
    backgroundColor: '#e9ecef',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  strengthFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease'
  },
  strengthText: {
    fontSize: '12px',
    marginTop: '4px',
    display: 'block'
  },
  requirements: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px'
  },
  requirementsTitle: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#6c757d',
    margin: '0 0 5px 0'
  },
  requirementsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  requirementItem: {
    fontSize: '12px',
    padding: '2px 0',
    transition: 'color 0.3s ease'
  },
  button: { 
    width: '100%', 
    padding: '12px', 
    backgroundColor: '#28a745', 
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
  }
};

export default Register;
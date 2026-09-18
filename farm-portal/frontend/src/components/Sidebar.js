import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/log-product', label: 'Log Product', icon: '📦' },
    { path: '/history', label: 'History', icon: '📋' }
  ];

  // Add admin link only for admin users
  if (user?.role === 'admin') {
    menuItems.push({ path: '/admin/users', label: 'User Management', icon: '👥' });
  }

  return (
    <div
      style={{
        width: '220px',
        height: '100vh',
        backgroundColor: '#1a1a2e',
        color: 'white',
        position: 'fixed',
        left: 0,
        top: 0,
        padding: '18px 16px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',  // pushes logout to bottom
      }}
    >
      <div>
        <h2
          style={{
            fontSize: '22px',
            marginBottom: '34px',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          🚜 Farm Portal
        </h2>

        <nav>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 14px',
                  marginBottom: '8px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: isActive ? '#fff' : '#c7c7d1',
                  backgroundColor: isActive ? '#e94560' : 'transparent',
                  fontSize: '15px',
                  transition: 'all 0.3s ease',
                }}
              >
                <span
                  style={{
                    marginRight: '12px',
                    fontSize: '18px',
                  }}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Button at the bottom */}
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={logout}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#e94560',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}
        >
          🚪 Logout {user ? `(${user.username})` : ''}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;

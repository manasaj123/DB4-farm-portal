import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LogProduct from './pages/LogProduct';
import SubmissionHistory from './pages/SubmissionHistory';
import Login from './pages/Login';
import Register from './pages/Register';
import UserManagement from './pages/UserManagement';

// Protect routes that require authentication
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

// Restrict routes to admin only
function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') return <Navigate to="/" />;
  return children;
}

function AppLayout() {
  const { user } = useAuth();
  return (
    <div style={{ display: 'flex' }}>
      {/* Show sidebar only when logged in */}
      {user && <Sidebar />}
      <div style={{ 
        marginLeft: user ? '250px' : '0', 
        flex: 1, 
        backgroundColor: '#f8f9fa', 
        minHeight: '100vh',
        minWidth: 0    
      }}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          
          {/* Protected routes (require login) */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/log-product" element={<ProtectedRoute><LogProduct /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><SubmissionHistory /></ProtectedRoute>} />
          
          {/* Admin routes */}
          <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
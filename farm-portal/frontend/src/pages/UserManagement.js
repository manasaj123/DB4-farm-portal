import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', role: 'user', password: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user && user.role === 'admin') fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    const res = await API.get('/admin/users');
    setUsers(res.data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/users', form);
      setMessage('User created');
      setForm({ username: '', email: '', role: 'user', password: '' });
      fetchUsers();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error');
    }
  };

  const handleUpdate = async (id) => {
    try {
      await API.put(`/admin/users/${id}`, { username: form.username, email: form.email, role: form.role });
      setEditing(null);
      fetchUsers();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this user?')) {
      await API.delete(`/admin/users/${id}`);
      fetchUsers();
    }
  };

  const startEdit = (u) => {
    setEditing(u.id);
    setForm({ username: u.username, email: u.email, role: u.role, password: '' });
  };

  if (!user || user.role !== 'admin') return <p>Access denied</p>;

  return (
    <div style={{ padding: '30px', maxWidth: '800px' }}>
      <h2>User Management</h2>
      {message && <p>{message}</p>}
      <form onSubmit={editing ? (e) => { e.preventDefault(); handleUpdate(editing); } : handleCreate} style={{ marginBottom: '20px', background: '#fff', padding: '20px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required style={{ flex: 1, minWidth: '150px', padding: '8px' }} />
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required style={{ flex: 1, minWidth: '150px', padding: '8px' }} />
          {!editing && <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required style={{ flex: 1, minWidth: '150px', padding: '8px' }} />}
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ padding: '8px' }}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" style={{ marginTop: '10px', padding: '8px 20px', backgroundColor: editing ? '#ffc107' : '#28a745', color: 'white', border: 'none', borderRadius: '8px' }}>
          {editing ? 'Update' : 'Create'}
        </button>
        {editing && <button onClick={() => setEditing(null)} style={{ marginLeft: '10px', padding: '8px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '8px' }}>Cancel</button>}
      </form>

      <table style={{ width: '100%', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={th}>ID</th><th style={th}>Username</th><th style={th}>Email</th><th style={th}>Role</th><th style={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={td}>{u.id}</td>
              <td style={td}>{u.username}</td>
              <td style={td}>{u.email}</td>
              <td style={td}>{u.role}</td>
              <td style={td}>
                <button onClick={() => startEdit(u)} style={{ marginRight: '5px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px' }}>Edit</button>
                <button onClick={() => handleDelete(u.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = { padding: '12px', textAlign: 'left', fontSize: '13px', color: '#6c757d' };
const td = { padding: '12px' };

export default UserManagement;
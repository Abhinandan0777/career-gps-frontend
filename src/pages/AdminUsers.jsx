import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminUsers() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [isAuthenticated, user, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (roleFilter !== 'all') {
        params.role = roleFilter;
      }
      const data = await adminAPI.listUsers(params);
      setUsers(data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (userToEdit) => {
    setEditingUser(userToEdit);
    setNewRole(userToEdit.role);
  };

  const handleCloseEdit = () => {
    setEditingUser(null);
    setNewRole('');
  };

  const handleUpdateRole = async () => {
    if (!editingUser || !newRole) return;
    if (editingUser.id === user.id) {
      setError('You cannot change your own role');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      await adminAPI.updateUserRole(editingUser.id, { role: newRole });
      await fetchUsers();
      handleCloseEdit();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === user.id) {
      setError('You cannot delete your own account');
      return;
    }

    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setError('');
      await adminAPI.deleteUser(userId);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query)
    );
  });

  const getRoleBadge = (role) => {
    const styles = {
      learner: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
      creator: 'bg-purple-500/20 border-purple-500/50 text-purple-300',
      admin: 'bg-red-500/20 border-red-500/50 text-red-300'
    };
    return styles[role] || styles.learner;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="mb-4 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-300">Manage user accounts and roles</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 animate-fade-in">
            ⚠️ {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 animate-fade-in">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <div className="flex gap-3">
            {['all', 'learner', 'creator', 'admin'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all capitalize ${
                  roleFilter === role
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 animate-fade-in">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-white mb-2">No Users Found</h3>
              <p className="text-gray-400">
                {searchQuery ? 'Try a different search query' : 'No users match the selected filter'}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Users ({filteredUsers.length})
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-4 px-4 text-gray-400 font-semibold">User</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-semibold">Email</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-semibold">Role</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-semibold">Joined</th>
                      <th className="text-right py-4 px-4 text-gray-400 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-white font-semibold">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-300">{u.email}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-lg text-sm font-semibold border capitalize ${getRoleBadge(u.role)}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-400 text-sm">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleEditRole(u)}
                              disabled={u.id === user.id}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Edit Role
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={u.id === user.id}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Edit Role Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-xl bg-gray-900/95 rounded-2xl p-8 border border-white/20 max-w-md w-full animate-fade-in">
              <h2 className="text-3xl font-bold text-white mb-6">Update User Role</h2>

              <div className="mb-6">
                <p className="text-gray-300 mb-1">User: <span className="text-white font-semibold">{editingUser.name}</span></p>
                <p className="text-gray-400 text-sm">{editingUser.email}</p>
              </div>

              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">
                  New Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="learner">Learner</option>
                  <option value="creator">Creator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleUpdateRole}
                  disabled={actionLoading || newRole === editingUser.role}
                  className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Updating...' : 'Update Role'}
                </button>
                <button
                  onClick={handleCloseEdit}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAnalytics();
  }, [isAuthenticated, user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminAPI.getPlatformAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">Platform-wide metrics and management</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">
            ⚠️ {error}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in">
          <button
            onClick={() => navigate('/admin/applications')}
            className="backdrop-blur-xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl p-6 border border-blue-500/30 hover:border-blue-500/50 transition-all transform hover:scale-105 text-left"
          >
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-xl font-bold text-white mb-2">Applications</h3>
            <p className="text-gray-400 text-sm">Review creator applications</p>
          </button>

          <button
            onClick={() => navigate('/admin/users')}
            className="backdrop-blur-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-purple-500/30 hover:border-purple-500/50 transition-all transform hover:scale-105 text-left"
          >
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-xl font-bold text-white mb-2">Users</h3>
            <p className="text-gray-400 text-sm">Manage user accounts</p>
          </button>

          <button
            onClick={() => navigate('/admin/skill-demand')}
            className="backdrop-blur-xl bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl p-6 border border-green-500/30 hover:border-green-500/50 transition-all transform hover:scale-105 text-left"
          >
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">Skill Demand</h3>
            <p className="text-gray-400 text-sm">View analytics</p>
          </button>

          <button
            onClick={() => navigate('/admin/courses')}
            className="backdrop-blur-xl bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-2xl p-6 border border-orange-500/30 hover:border-orange-500/50 transition-all transform hover:scale-105 text-left"
          >
            <div className="text-4xl mb-3">📚</div>
            <h3 className="text-xl font-bold text-white mb-2">Courses</h3>
            <p className="text-gray-400 text-sm">Manage course publications</p>
          </button>
        </div>

        {/* Platform Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Users</span>
              <span className="text-3xl">👤</span>
            </div>
            <div className="text-3xl font-bold text-white">{analytics?.totalUsers || 0}</div>
            <div className="text-sm text-gray-400 mt-2">
              {analytics?.activeUsers || 0} active
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Courses</span>
              <span className="text-3xl">📚</span>
            </div>
            <div className="text-3xl font-bold text-white">{analytics?.totalCourses || 0}</div>
            <div className="text-sm text-gray-400 mt-2">
              {analytics?.publishedCourses || 0} published
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Enrollments</span>
              <span className="text-3xl">✅</span>
            </div>
            <div className="text-3xl font-bold text-white">{analytics?.totalEnrollments || 0}</div>
            <div className="text-sm text-gray-400 mt-2">
              {analytics?.completedEnrollments || 0} completed
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Certificates</span>
              <span className="text-3xl">🏆</span>
            </div>
            <div className="text-3xl font-bold text-white">{analytics?.totalCertificates || 0}</div>
            <div className="text-sm text-gray-400 mt-2">
              Issued to learners
            </div>
          </div>
        </div>

        {/* User Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">User Roles</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Learners</span>
                <span className="text-white font-semibold">{analytics?.learnerCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Creators</span>
                <span className="text-white font-semibold">{analytics?.creatorCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Admins</span>
                <span className="text-white font-semibold">{analytics?.adminCount || 0}</span>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Course Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Avg Duration</span>
                <span className="text-white font-semibold">
                  {analytics?.avgCourseDuration ? `${Math.round(analytics.avgCourseDuration)}h` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Avg Enrollments</span>
                <span className="text-white font-semibold">
                  {analytics?.avgEnrollmentsPerCourse ? Math.round(analytics.avgEnrollmentsPerCourse) : 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Completion Rate</span>
                <span className="text-white font-semibold">
                  {analytics?.completionRate ? `${Math.round(analytics.completionRate)}%` : '0%'}
                </span>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Pending Actions</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Applications</span>
                <span className="text-yellow-400 font-semibold">{analytics?.pendingApplications || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Draft Courses</span>
                <span className="text-gray-400 font-semibold">
                  {(analytics?.totalCourses || 0) - (analytics?.publishedCourses || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {analytics?.recentActivity && analytics.recentActivity.length > 0 && (
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
            <div className="space-y-3">
              {analytics.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{activity.icon || '📌'}</span>
                    <div>
                      <p className="text-white font-semibold">{activity.title}</p>
                      <p className="text-gray-400 text-sm">{activity.description}</p>
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm">{activity.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

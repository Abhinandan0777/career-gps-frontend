import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { creatorsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'creator') {
      navigate('/');
      return;
    }
    fetchDashboard();
  }, [isAuthenticated, user]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await creatorsAPI.getCreatorDashboard();
      console.log('Dashboard data received:', data); // Debug log
      setDashboard(data);
    } catch (err) {
      console.error('Dashboard fetch error:', err); // Debug log
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard');
      // Set default dashboard data so UI doesn't break
      setDashboard({
        totalCourses: 0,
        totalEnrollments: 0,
        completionRate: 0,
        certificatesIssued: 0,
        recentCourses: []
      });
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
          <h1 className="text-4xl font-bold text-white mb-2">Creator Dashboard</h1>
          <p className="text-gray-300">Manage your courses and track your impact</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 animate-fade-in">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <p className="font-semibold mb-1">Dashboard Load Error</p>
                <p className="text-sm">{error}</p>
                <p className="text-xs mt-2 text-red-400">
                  Tip: Make sure the backend server is running on port 5000 and the database is connected.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Courses</span>
              <span className="text-3xl">📚</span>
            </div>
            <div className="text-3xl font-bold text-white">{dashboard?.totalCourses || 0}</div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Enrollments</span>
              <span className="text-3xl">👥</span>
            </div>
            <div className="text-3xl font-bold text-white">{dashboard?.totalEnrollments || 0}</div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Completion Rate</span>
              <span className="text-3xl">✅</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {dashboard?.completionRate ? `${Math.round(dashboard.completionRate)}%` : '0%'}
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Certificates Issued</span>
              <span className="text-3xl">🏆</span>
            </div>
            <div className="text-3xl font-bold text-white">{dashboard?.certificatesIssued || 0}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
          <button
            onClick={() => navigate('/creator/courses/new')}
            className="backdrop-blur-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-purple-500/30 hover:border-purple-500/50 transition-all transform hover:scale-105 text-left"
          >
            <div className="text-4xl mb-3">➕</div>
            <h3 className="text-xl font-bold text-white mb-2">Create New Course</h3>
            <p className="text-gray-400 text-sm">Start building a new course</p>
          </button>

          <button
            onClick={() => navigate('/creator/courses')}
            className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all transform hover:scale-105 text-left"
          >
            <div className="text-4xl mb-3">📖</div>
            <h3 className="text-xl font-bold text-white mb-2">My Courses</h3>
            <p className="text-gray-400 text-sm">View and manage your courses</p>
          </button>

          <button
            onClick={() => navigate('/creator/analytics')}
            className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all transform hover:scale-105 text-left"
          >
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">Analytics</h3>
            <p className="text-gray-400 text-sm">View detailed analytics</p>
          </button>
        </div>

        {/* Recent Courses */}
        {dashboard?.recentCourses && dashboard.recentCourses.length > 0 && (
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Recent Courses</h2>
              <button
                onClick={() => navigate('/creator/courses')}
                className="text-purple-400 hover:text-purple-300 text-sm font-semibold"
              >
                View All →
              </button>
            </div>

            <div className="space-y-4">
              {dashboard.recentCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{course.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>👥 {course.enrollmentCount || 0} enrolled</span>
                      <span>
                        {course.isPublished ? (
                          <span className="text-green-400">✓ Published</span>
                        ) : (
                          <span className="text-yellow-400">⏳ Draft</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/creator/courses/${course.id}/lessons`)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all text-sm font-semibold"
                  >
                    Manage
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {dashboard && dashboard.totalCourses === 0 && (
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-12 border border-white/20 text-center animate-fade-in">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-white mb-2">Start Creating!</h3>
            <p className="text-gray-400 mb-6">
              You haven't created any courses yet. Create your first course to get started.
            </p>
            <button
              onClick={() => navigate('/creator/courses/new')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Create Your First Course
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

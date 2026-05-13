import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminCourses() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchCourses();
  }, [isAuthenticated, user, statusFilter]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (statusFilter === 'published') {
        params.isPublished = true;
      } else if (statusFilter === 'unpublished') {
        params.isPublished = false;
      }
      const data = await coursesAPI.listCourses(params);
      setCourses(data.courses || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (courseId, currentStatus) => {
    try {
      setActionLoading(prev => ({ ...prev, [courseId]: true }));
      setError('');
      
      await coursesAPI.updateCourse(courseId, {
        isPublished: !currentStatus
      });
      
      await fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update course status');
    } finally {
      setActionLoading(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const filteredCourses = courses.filter(course => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      course.title?.toLowerCase().includes(query) ||
      course.description?.toLowerCase().includes(query) ||
      course.creatorName?.toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (isPublished) => {
    return isPublished
      ? 'bg-green-500/20 border-green-500/50 text-green-300'
      : 'bg-gray-500/20 border-gray-500/50 text-gray-300';
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
          <h1 className="text-4xl font-bold text-white mb-2">Course Management</h1>
          <p className="text-gray-300">Manage all courses and their publication status</p>
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
            placeholder="Search by title, description, or creator..."
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <div className="flex gap-3">
            {['all', 'published', 'unpublished'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all capitalize ${
                  statusFilter === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 animate-fade-in">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-white mb-2">No Courses Found</h3>
              <p className="text-gray-400">
                {searchQuery ? 'Try a different search query' : 'No courses match the selected filter'}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Courses ({filteredCourses.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                  >
                    {/* Course Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-2">
                          by {course.creatorName || 'Unknown'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getStatusBadge(course.isPublished)}`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    {/* Course Description */}
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {course.description}
                    </p>

                    {/* Course Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 bg-white/5 rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">Duration</p>
                        <p className="text-white font-semibold">{course.durationHours || 0}h</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">Difficulty</p>
                        <p className="text-white font-semibold capitalize">{course.difficulty || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/courses/${course.id}`)}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm font-semibold"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleTogglePublish(course.id, course.isPublished)}
                        disabled={actionLoading[course.id]}
                        className={`flex-1 px-4 py-2 rounded-lg transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                          course.isPublished
                            ? 'bg-gray-600 hover:bg-gray-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {actionLoading[course.id] 
                          ? 'Updating...' 
                          : course.isPublished 
                            ? 'Unpublish' 
                            : 'Publish'
                        }
                      </button>
                    </div>

                    {/* Created Date */}
                    <p className="text-gray-500 text-xs mt-3">
                      Created: {new Date(course.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-gray-400 text-sm mb-1">Total Courses</h3>
            <p className="text-3xl font-bold text-white">{courses.length}</p>
          </div>
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-gray-400 text-sm mb-1">Published</h3>
            <p className="text-3xl font-bold text-green-400">
              {courses.filter(c => c.isPublished).length}
            </p>
          </div>
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-gray-400 text-sm mb-1">Drafts</h3>
            <p className="text-3xl font-bold text-gray-400">
              {courses.filter(c => !c.isPublished).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

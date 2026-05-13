import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { enrollmentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MyEnrollments() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchEnrollments();
  }, [isAuthenticated, statusFilter]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      const data = await enrollmentsAPI.getUserEnrollments(params);
      setEnrollments(data.enrollments || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    const params = new URLSearchParams();
    if (status !== 'all') {
      params.set('status', status);
    }
    setSearchParams(params);
  };

  const handleUnenroll = async (enrollmentId, courseTitle) => {
    if (!confirm(`Are you sure you want to unenroll from "${courseTitle}"?`)) {
      return;
    }

    try {
      await enrollmentsAPI.unenrollFromCourse(enrollmentId);
      // Refresh enrollments
      await fetchEnrollments();
      alert('Successfully unenrolled from course');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unenroll from course');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'active': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'enrolled': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'active': return '📚';
      case 'enrolled': return '🎯';
      default: return '📖';
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    if (statusFilter === 'all') return true;
    return enrollment.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            📚 My Enrollments
          </h1>
          <p className="text-gray-300 text-lg">
            Track your learning progress
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 backdrop-blur-xl bg-white/10 rounded-2xl p-2 border border-white/20 shadow-2xl animate-slide-in">
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusFilterChange('all')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              All Courses
            </button>
            <button
              onClick={() => handleStatusFilterChange('active')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                statusFilter === 'active'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              📚 Active
            </button>
            <button
              onClick={() => handleStatusFilterChange('completed')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                statusFilter === 'completed'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              ✅ Completed
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 animate-fade-in">
            ⚠️ {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
          </div>
        )}

        {/* Enrollments Grid */}
        {!loading && filteredEnrollments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {filteredEnrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105"
              >
                {/* Course Title */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex-1 line-clamp-2">
                    {enrollment.courseTitle || 'Untitled Course'}
                  </h3>
                  <span className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${getStatusColor(enrollment.status)}`}>
                    {getStatusEmoji(enrollment.status)} {enrollment.status}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>Progress</span>
                    <span className="font-semibold">{Math.round(enrollment.progress || 0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        enrollment.progress === 100
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500'
                      }`}
                      style={{ width: `${enrollment.progress || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Enrollment Date */}
                <div className="flex items-center text-sm text-gray-400 mb-4">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                </div>

                {/* Completion Date */}
                {enrollment.completedAt && (
                  <div className="flex items-center text-sm text-green-400 mb-4">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Completed: {new Date(enrollment.completedAt).toLocaleDateString()}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/courses/${enrollment.courseId}`)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
                  >
                    {enrollment.progress > 0 ? 'Continue' : 'Start'} Learning
                  </button>
                  
                  {enrollment.status !== 'completed' && (
                    <button
                      onClick={() => handleUnenroll(enrollment.id, enrollment.courseTitle)}
                      className="px-4 py-3 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl font-semibold hover:bg-red-500/30 transition-all"
                      title="Unenroll from course"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredEnrollments.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {statusFilter === 'all' ? 'No Enrollments Yet' : `No ${statusFilter} Courses`}
            </h3>
            <p className="text-gray-400 mb-6">
              {statusFilter === 'all'
                ? 'Start learning by enrolling in a course'
                : `You don't have any ${statusFilter} courses`}
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Browse Courses
            </button>
          </div>
        )}

        {/* Stats Summary */}
        {!loading && enrollments.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">
                {enrollments.length}
              </div>
              <div className="text-gray-300">Total Enrollments</div>
            </div>
            
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {enrollments.filter(e => e.status === 'active' || (e.progress > 0 && e.progress < 100)).length}
              </div>
              <div className="text-gray-300">In Progress</div>
            </div>
            
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {enrollments.filter(e => e.status === 'completed' || e.progress === 100).length}
              </div>
              <div className="text-gray-300">Completed</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

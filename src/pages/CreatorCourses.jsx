import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { creatorsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CreatorCourses() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'creator') {
      navigate('/');
      return;
    }
    fetchCourses();
  }, [isAuthenticated, user]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await creatorsAPI.getCreatorCourses();
      // Backend returns { courses: [...], pagination: {...} }
      setCourses(data.courses || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.response?.data?.message || 'Failed to load courses');
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
          <button
            onClick={() => navigate('/creator/dashboard')}
            className="mb-4 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">My Courses</h1>
              <p className="text-gray-300">Manage your courses and lessons</p>
            </div>
            <button
              onClick={() => navigate('/creator/courses/new')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
            >
              + Create Course
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 animate-fade-in">
            ⚠️ {error}
          </div>
        )}

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-12 border border-white/20 text-center animate-fade-in">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Courses Yet</h3>
            <p className="text-gray-400 mb-6">
              Create your first course to start teaching
            </p>
            <button
              onClick={() => navigate('/creator/courses/new')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Create Your First Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {courses.map((course) => (
              <div
                key={course.id}
                className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all"
              >
                {/* Course Thumbnail */}
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-40 object-cover rounded-xl mb-4"
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl mb-4 flex items-center justify-center">
                    <span className="text-6xl">📚</span>
                  </div>
                )}

                {/* Course Info */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-white flex-1">{course.title}</h3>
                    {course.isPublished ? (
                      <span className="px-2 py-1 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-xs font-semibold">
                        Published
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-300 text-xs font-semibold">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                    {course.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>⏱️ {course.durationHours}h</span>
                    <span className="capitalize">📊 {course.difficulty}</span>
                    <span>👥 {course.enrollmentCount || 0}</span>
                  </div>
                </div>

                {/* Skills */}
                {course.skills && course.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-600/30 border border-purple-500/50 rounded-lg text-purple-300 text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {course.skills.length > 3 && (
                      <span className="px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-gray-400 text-xs">
                        +{course.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/creator/courses/${course.id}/edit`)}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => navigate(`/creator/courses/${course.id}/lessons`)}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all text-sm font-semibold"
                  >
                    Lessons
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

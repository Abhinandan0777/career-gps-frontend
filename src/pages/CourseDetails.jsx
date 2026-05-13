import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesAPI, enrollmentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourseDetails();
    if (isAuthenticated) {
      checkEnrollment();
    }
  }, [id, isAuthenticated]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch course details
      const courseData = await coursesAPI.getCourseById(id);
      setCourse(courseData.course);
      
      // Fetch course lessons
      const lessonsData = await coursesAPI.getCourseLessons(id);
      setLessons(lessonsData.lessons || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      // Get user's enrollments and check if enrolled in this course
      const data = await enrollmentsAPI.getUserEnrollments();
      const userEnrollment = data.enrollments?.find(e => e.courseId === id);
      setEnrollment(userEnrollment || null);
    } catch (err) {
      console.error('Failed to check enrollment:', err);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/courses/${id}` } });
      return;
    }

    try {
      setEnrolling(true);
      setError('');
      
      await enrollmentsAPI.enrollInCourse({ courseId: id });
      
      // Refresh enrollment status
      await checkEnrollment();
      
      // Show success message
      alert('Successfully enrolled in course!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartCourse = () => {
    if (lessons.length > 0) {
      navigate(`/lessons/${lessons[0].id}`);
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'beginner': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getDifficultyEmoji = (diff) => {
    switch (diff) {
      case 'beginner': return '🌱';
      case 'intermediate': return '🚀';
      case 'advanced': return '⚡';
      default: return '📚';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">Error Loading Course</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  const progress = enrollment?.progress || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/courses')}
          className="mb-6 flex items-center text-gray-300 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Courses
        </button>

        {/* Course Header */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 shadow-2xl mb-8 animate-fade-in">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Course Image */}
            <div className="md:col-span-1">
              <div className="aspect-square bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-xl flex items-center justify-center text-8xl">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  '📚'
                )}
              </div>
            </div>

            {/* Course Info */}
            <div className="md:col-span-2">
              <h1 className="text-4xl font-bold text-white mb-4">{course.title}</h1>
              
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                {course.description || 'No description available'}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-3 mb-6">
                {course.difficulty && (
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getDifficultyColor(course.difficulty)}`}>
                    {getDifficultyEmoji(course.difficulty)} {course.difficulty}
                  </span>
                )}
                {course.durationHours && (
                  <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    ⏱️ {course.durationHours} hours
                  </span>
                )}
                {lessons.length > 0 && (
                  <span className="px-4 py-2 rounded-full text-sm font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    📖 {lessons.length} lessons
                  </span>
                )}
              </div>

              {/* Creator Info */}
              <div className="flex items-center mb-6 text-gray-300">
                <span className="mr-2 text-2xl">👤</span>
                <div>
                  <p className="text-sm text-gray-400">Created by</p>
                  <p className="font-semibold">{course.creatorName || 'Unknown Creator'}</p>
                </div>
              </div>

              {/* Skills */}
              {course.skills && course.skills.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-gray-400 mb-2">Skills you'll learn:</p>
                  <div className="flex flex-wrap gap-2">
                    {course.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white/10 text-white rounded-full text-sm border border-white/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Enrollment Status & Actions */}
              {error && (
                <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">
                  ⚠️ {error}
                </div>
              )}

              {enrollment ? (
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                      <span>Your Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <button
                    onClick={handleStartCourse}
                    disabled={lessons.length === 0}
                    className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {progress > 0 ? 'Continue Learning' : 'Start Course'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling || !course.isPublished}
                  className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enrolling ? 'Enrolling...' : !course.isPublished ? 'Not Published' : 'Enroll Now'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Course Content - Lessons */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 shadow-2xl animate-fade-in">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="mr-3">📚</span>
            Course Content
          </h2>

          {lessons.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-400">No lessons available yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, index) => {
                const isCompleted = enrollment?.completedLessons?.includes(lesson.id);
                
                return (
                  <div
                    key={lesson.id}
                    className={`backdrop-blur-xl bg-white/5 rounded-xl p-4 border transition-all hover:bg-white/10 ${
                      isCompleted ? 'border-green-500/30' : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        {/* Lesson Number */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-4 ${
                          isCompleted 
                            ? 'bg-green-500/20 text-green-300 border-2 border-green-500/50' 
                            : 'bg-purple-500/20 text-purple-300 border-2 border-purple-500/50'
                        }`}>
                          {isCompleted ? '✓' : index + 1}
                        </div>

                        {/* Lesson Info */}
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">{lesson.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            {lesson.durationMinutes && (
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {lesson.durationMinutes} min
                              </span>
                            )}
                            {lesson.videoUrl && (
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Video
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      {enrollment && (
                        <button
                          onClick={() => navigate(`/lessons/${lesson.id}`)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all text-sm font-semibold"
                        >
                          {isCompleted ? 'Review' : 'Start'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

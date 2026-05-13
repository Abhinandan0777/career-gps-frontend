import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonsAPI, coursesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TranscriptAnalysis from '../components/TranscriptAnalysis';

export default function LessonViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [courseLessons, setCourseLessons] = useState([]);
  const [transcript, setTranscript] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchLessonDetails();
  }, [id, isAuthenticated]);

  const fetchLessonDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch lesson details
      const lessonData = await lessonsAPI.getLessonById(id);
      setLesson(lessonData.lesson);
      
      // Fetch course details
      const courseData = await coursesAPI.getCourseById(lessonData.lesson.courseId);
      setCourse(courseData.course);
      
      // Fetch all lessons in the course
      const lessonsData = await coursesAPI.getCourseLessons(lessonData.lesson.courseId);
      setCourseLessons(lessonsData.lessons || []);
      
      // Calculate progress
      if (courseData.course.enrollment) {
        setProgress(courseData.course.enrollment.progress || 0);
      }
      
      // Try to fetch transcript (always attempt, handle 404 gracefully)
      try {
        const transcriptData = await lessonsAPI.getTranscript(id);
        setTranscript(transcriptData.transcript);
      } catch (err) {
        // No transcript exists, that's okay
        console.log('No transcript available for this lesson');
        setTranscript(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      setCompleting(true);
      setError('');
      
      const result = await lessonsAPI.markLessonComplete(id);
      
      // Update progress
      if (result.progress !== undefined) {
        setProgress(result.progress);
      }
      
      // Show success message
      if (result.certificateId) {
        alert('🎉 Congratulations! You completed the course and earned a certificate!');
        navigate(`/certificates/${result.certificateId}`);
      } else {
        alert('✅ Lesson marked as complete!');
      }
      
      // Refresh lesson details to update completion status
      await fetchLessonDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark lesson as complete');
    } finally {
      setCompleting(false);
    }
  };

  const getCurrentLessonIndex = () => {
    return courseLessons.findIndex(l => l.id === id);
  };

  const handlePreviousLesson = () => {
    const currentIndex = getCurrentLessonIndex();
    if (currentIndex > 0) {
      navigate(`/lessons/${courseLessons[currentIndex - 1].id}`);
    }
  };

  const handleNextLesson = () => {
    const currentIndex = getCurrentLessonIndex();
    if (currentIndex < courseLessons.length - 1) {
      navigate(`/lessons/${courseLessons[currentIndex + 1].id}`);
    }
  };

  const hasPrevious = getCurrentLessonIndex() > 0;
  const hasNext = getCurrentLessonIndex() < courseLessons.length - 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  if (error && !lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">Error Loading Lesson</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Course Info */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(`/courses/${lesson.courseId}`)}
            className="flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Course
          </button>

          {/* Progress Indicator */}
          {course && (
            <div className="flex items-center gap-4">
              <span className="text-gray-300 text-sm">Course Progress:</span>
              <div className="w-32 bg-gray-700 rounded-full h-2">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-white font-semibold text-sm">{Math.round(progress)}%</span>
            </div>
          )}
        </div>

        {/* Course Title */}
        {course && (
          <div className="mb-4">
            <h2 className="text-gray-400 text-sm mb-1">{course.title}</h2>
            <h1 className="text-3xl font-bold text-white">{lesson.title}</h1>
          </div>
        )}

        {/* Video Player */}
        {lesson.videoUrl && (
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl overflow-hidden border border-white/20 shadow-2xl mb-6 animate-fade-in">
            <div className="aspect-video bg-black">
              {(() => {
                const url = lesson.videoUrl;
                
                // YouTube video detection
                const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                if (youtubeMatch) {
                  const videoId = youtubeMatch[1];
                  return (
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title={lesson.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                }
                
                // Vimeo video detection
                const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
                if (vimeoMatch) {
                  const videoId = vimeoMatch[1];
                  return (
                    <iframe
                      className="w-full h-full"
                      src={`https://player.vimeo.com/video/${videoId}`}
                      title={lesson.title}
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  );
                }
                
                // Default: Direct video file
                return (
                  <video
                    controls
                    className="w-full h-full"
                    src={url}
                    poster={lesson.thumbnailUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                );
              })()}
            </div>
          </div>
        )}

        {/* Lesson Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lesson Description */}
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl animate-fade-in">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">📝</span>
                About This Lesson
              </h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {lesson.content || 'No description available'}
              </p>
              
              {lesson.durationMinutes && (
                <div className="mt-4 flex items-center text-gray-400">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Duration: {lesson.durationMinutes} minutes
                </div>
              )}
            </div>

            {/* Transcript */}
            {transcript && (
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl animate-fade-in">
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="w-full flex items-center justify-between text-white font-semibold mb-4"
                >
                  <span className="flex items-center">
                    <span className="mr-2">📄</span>
                    Transcript
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform ${showTranscript ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showTranscript && (
                  <div className="text-gray-300 text-sm leading-relaxed space-y-2 max-h-96 overflow-y-auto">
                    {transcript.text ? (
                      <p className="whitespace-pre-wrap">{transcript.text}</p>
                    ) : transcript.segments ? (
                      transcript.segments.map((segment, index) => (
                        <div key={index} className="flex gap-3">
                          {segment.timestamp && (
                            <span className="text-purple-400 font-mono text-xs flex-shrink-0">
                              {segment.timestamp}
                            </span>
                          )}
                          <p>{segment.text}</p>
                        </div>
                      ))
                    ) : (
                      <p>No transcript available</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* AI Analysis Demo Button - Show when no transcript */}
            {!transcript && (
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl animate-fade-in text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">No Transcript Available</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    This lesson doesn't have a transcript yet. Try our AI-powered transcript analysis demo!
                  </p>
                </div>
                <button
                  onClick={() => navigate('/transcript-demo')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center mx-auto"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Try AI Analysis Demo
                </button>
              </div>
            )}

            {/* AI-Powered Transcript Analysis */}
            <TranscriptAnalysis lessonId={id} transcript={transcript} />

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 animate-fade-in">
                ⚠️ {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleMarkComplete}
                disabled={completing || lesson.isCompleted}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {completing ? 'Marking Complete...' : lesson.isCompleted ? '✓ Completed' : 'Mark as Complete'}
              </button>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handlePreviousLesson}
                disabled={!hasPrevious}
                className="flex-1 px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous Lesson
              </button>
              
              <button
                onClick={handleNextLesson}
                disabled={!hasNext}
                className="flex-1 px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                Next Lesson
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Sidebar - Course Lessons */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl sticky top-8 animate-fade-in">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <span className="mr-2">📚</span>
                Course Lessons
              </h3>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {courseLessons.map((courseLesson, index) => {
                  const isCurrent = courseLesson.id === id;
                  const isCompleted = courseLesson.isCompleted;
                  
                  return (
                    <button
                      key={courseLesson.id}
                      onClick={() => navigate(`/lessons/${courseLesson.id}`)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        isCurrent
                          ? 'bg-purple-600/30 border-2 border-purple-500'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isCompleted
                            ? 'bg-green-500/20 text-green-300'
                            : isCurrent
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {isCompleted ? '✓' : index + 1}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold mb-1 line-clamp-2 ${
                            isCurrent ? 'text-white' : 'text-gray-300'
                          }`}>
                            {courseLesson.title}
                          </p>
                          {courseLesson.durationMinutes && (
                            <p className="text-xs text-gray-400">
                              {courseLesson.durationMinutes} min
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

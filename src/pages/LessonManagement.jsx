import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { coursesAPI, lessonsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LessonManagement() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { isAuthenticated, user } = useAuth();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  
  // Transcript management state
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [transcriptLesson, setTranscriptLesson] = useState(null);
  const [transcriptContent, setTranscriptContent] = useState('');
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [transcriptError, setTranscriptError] = useState('');
  const [fetchingYouTube, setFetchingYouTube] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    videoUrl: '',
    videoFile: null,
    videoType: 'url', // 'url' or 'upload'
    duration: '',
    order: ''
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'creator') {
      navigate('/');
      return;
    }
    fetchCourseAndLessons();
  }, [isAuthenticated, user, courseId]);

  const fetchCourseAndLessons = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [courseData, lessonsResponse] = await Promise.all([
        coursesAPI.getCourseById(courseId),
        coursesAPI.getCourseLessons(courseId)
      ]);

      setCourse(courseData);
      // API returns { lessons: [...] }, extract the array
      const lessonsData = lessonsResponse.lessons || lessonsResponse;
      setLessons(lessonsData.sort((a, b) => a.order - b.order));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course and lessons');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        // Validate file type (video only)
        const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
        if (!validTypes.includes(file.type)) {
          setError('Invalid file type. Please upload a video file (MP4, WebM, OGG, MOV)');
          return;
        }
        
        // Validate file size (max 500MB)
        const maxSize = 500 * 1024 * 1024; // 500MB
        if (file.size > maxSize) {
          setError('File size too large. Maximum size is 500MB');
          return;
        }
        
        setFormData(prev => ({
          ...prev,
          videoFile: file
        }));
        setError('');
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddLesson = () => {
    const nextOrder = lessons.length > 0 ? Math.max(...lessons.map(l => l.order)) + 1 : 1;
    setFormData({
      title: '',
      content: '',
      videoUrl: '',
      videoFile: null,
      videoType: 'url',
      duration: '',
      order: nextOrder.toString()
    });
    setEditingLesson(null);
    setShowForm(true);
  };

  const handleEditLesson = (lesson) => {
    setFormData({
      title: lesson.title || '',
      content: lesson.content || '',
      videoUrl: lesson.videoUrl || '',
      videoFile: null,
      videoType: lesson.videoUrl ? 'url' : 'upload',
      duration: lesson.durationMinutes?.toString() || '',
      order: lesson.order?.toString() || ''
    });
    setEditingLesson(lesson);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingLesson(null);
    setFormData({
      title: '',
      content: '',
      videoUrl: '',
      videoFile: null,
      videoType: 'url',
      duration: '',
      order: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }
    if (!formData.duration || formData.duration <= 0) {
      setError('Duration must be greater than 0');
      return;
    }
    if (!formData.order || formData.order <= 0) {
      setError('Order must be greater than 0');
      return;
    }

    // Validate video source
    if (formData.videoType === 'url' && !formData.videoUrl.trim()) {
      setError('Video URL is required when using URL option');
      return;
    }
    if (formData.videoType === 'upload' && !formData.videoFile && !editingLesson) {
      setError('Please select a video file to upload');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      // Prepare form data for multipart upload
      const submitData = new FormData();
      submitData.append('courseId', courseId);
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('durationMinutes', parseInt(formData.duration, 10));
      submitData.append('order', parseInt(formData.order, 10));
      
      // Add video based on type
      if (formData.videoType === 'url') {
        submitData.append('videoUrl', formData.videoUrl);
      } else if (formData.videoFile) {
        submitData.append('video', formData.videoFile);
      } else if (editingLesson && editingLesson.videoUrl) {
        // Keep existing video URL when editing without new file
        submitData.append('videoUrl', editingLesson.videoUrl);
      }

      if (editingLesson) {
        await lessonsAPI.updateLesson(editingLesson.id, submitData);
      } else {
        await lessonsAPI.createLesson(submitData);
      }

      await fetchCourseAndLessons();
      handleCancelForm();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${editingLesson ? 'update' : 'create'} lesson`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      setError('');
      await lessonsAPI.deleteLesson(lessonId);
      await fetchCourseAndLessons();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete lesson');
    }
  };

  // Transcript Management Functions
  const handleManageTranscript = async (lesson) => {
    setTranscriptLesson(lesson);
    setTranscriptContent('');
    setTranscriptError('');
    setShowTranscriptModal(true);
    
    // Try to load existing transcript
    setTranscriptLoading(true);
    try {
      const response = await lessonsAPI.getTranscript(lesson.id);
      setTranscriptContent(response.transcript.text || '');
    } catch (err) {
      // No transcript exists yet, that's okay
      console.log('No existing transcript');
    } finally {
      setTranscriptLoading(false);
    }
  };

  const handleFetchYouTubeTranscript = async () => {
    if (!transcriptLesson) return;
    
    setFetchingYouTube(true);
    setTranscriptError('');
    
    try {
      const response = await lessonsAPI.fetchYouTubeTranscript(transcriptLesson.id);
      setTranscriptContent(response.transcript.text || '');
      alert('✅ YouTube transcript fetched successfully!');
    } catch (err) {
      setTranscriptError(err.response?.data?.message || 'Failed to fetch YouTube transcript. The video may not have captions available.');
    } finally {
      setFetchingYouTube(false);
    }
  };

  const handleSaveTranscript = async () => {
    if (!transcriptLesson) return;
    
    if (!transcriptContent.trim()) {
      setTranscriptError('Transcript content cannot be empty');
      return;
    }
    
    setTranscriptLoading(true);
    setTranscriptError('');
    
    try {
      await lessonsAPI.saveTranscript(transcriptLesson.id, {
        content: transcriptContent
      });
      alert('✅ Transcript saved successfully!');
      setShowTranscriptModal(false);
    } catch (err) {
      setTranscriptError(err.response?.data?.message || 'Failed to save transcript');
    } finally {
      setTranscriptLoading(false);
    }
  };

  const handleDeleteTranscript = async () => {
    if (!transcriptLesson) return;
    
    if (!confirm('Are you sure you want to delete this transcript?')) {
      return;
    }
    
    setTranscriptLoading(true);
    setTranscriptError('');
    
    try {
      await lessonsAPI.deleteTranscript(transcriptLesson.id);
      setTranscriptContent('');
      alert('✅ Transcript deleted successfully!');
    } catch (err) {
      setTranscriptError(err.response?.data?.message || 'Failed to delete transcript');
    } finally {
      setTranscriptLoading(false);
    }
  };

  const isYouTubeVideo = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <button
            onClick={() => navigate('/creator/courses')}
            className="mb-4 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            ← Back to Courses
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Manage Lessons</h1>
              <p className="text-gray-300">{course?.title}</p>
            </div>
            <button
              onClick={handleAddLesson}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
            >
              + Add Lesson
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 animate-fade-in">
            ⚠️ {error}
          </div>
        )}

        {/* Lesson Form */}
        {showForm && (
          <div className="mb-8 backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-white font-semibold mb-2">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Introduction to Components"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white font-semibold mb-2">
                    Content <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Lesson content..."
                    rows={5}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white font-semibold mb-3">
                    Video Source
                  </label>
                  
                  {/* Video Type Tabs */}
                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, videoType: 'url', videoFile: null }))}
                      className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                        formData.videoType === 'url'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      🔗 Video URL (YouTube, Vimeo, etc.)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, videoType: 'upload', videoUrl: '' }))}
                      className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                        formData.videoType === 'upload'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      📤 Upload Video File
                    </button>
                  </div>

                  {/* URL Input */}
                  {formData.videoType === 'url' && (
                    <div className="animate-fade-in">
                      <input
                        type="url"
                        name="videoUrl"
                        value={formData.videoUrl}
                        onChange={handleChange}
                        placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                      <p className="text-gray-400 text-sm mt-2">
                        Paste the URL of your video from YouTube, Vimeo, or any other platform
                      </p>
                    </div>
                  )}

                  {/* File Upload */}
                  {formData.videoType === 'upload' && (
                    <div className="animate-fade-in">
                      <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-500 transition-colors">
                        <input
                          type="file"
                          id="videoFile"
                          name="videoFile"
                          accept="video/mp4,video/webm,video/ogg,video/quicktime"
                          onChange={handleChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="videoFile"
                          className="cursor-pointer block"
                        >
                          <div className="mb-4">
                            {formData.videoFile ? (
                              <div className="inline-block p-4 bg-green-500/20 border border-green-500/50 rounded-xl">
                                <svg className="w-12 h-12 text-green-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                            ) : (
                              <div className="inline-block p-4 bg-purple-500/20 border border-purple-500/50 rounded-xl">
                                <svg className="w-12 h-12 text-purple-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          {formData.videoFile ? (
                            <div>
                              <p className="text-white font-semibold mb-1">
                                ✅ {formData.videoFile.name}
                              </p>
                              <p className="text-gray-400 text-sm mb-2">
                                {(formData.videoFile.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                              <p className="text-purple-400 text-sm">
                                Click to change file
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-white font-semibold mb-1">
                                Click to select video file
                              </p>
                              <p className="text-gray-400 text-sm">
                                or drag and drop your video here
                              </p>
                            </div>
                          )}
                        </label>
                      </div>
                      
                      <div className="mt-3 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                        <p className="text-blue-300 text-sm">
                          <strong>📌 Supported formats:</strong> MP4, WebM, OGG, MOV<br />
                          <strong>📦 Maximum size:</strong> 500 MB<br />
                          <strong>💡 Tip:</strong> Compress large videos before uploading for faster processing
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">
                    Duration (minutes) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g., 15"
                    min="1"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">
                    Order <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    placeholder="e.g., 1"
                    min="1"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all"
                >
                  {editingLesson ? 'Update Lesson' : 'Create Lesson'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lessons List */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 animate-fade-in">
          <h2 className="text-2xl font-bold text-white mb-6">
            Lessons ({lessons.length})
          </h2>

          {lessons.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-white mb-2">No Lessons Yet</h3>
              <p className="text-gray-400 mb-6">
                Add your first lesson to get started
              </p>
              <button
                onClick={handleAddLesson}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all"
              >
                Add First Lesson
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-purple-600/30 border border-purple-500/50 rounded-lg text-white text-sm font-semibold">
                        #{lesson.order}
                      </span>
                      <h3 className="text-white font-semibold text-lg">{lesson.title}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>⏱️ {lesson.durationMinutes} min</span>
                      {lesson.videoUrl && <span>🎥 Video</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleManageTranscript(lesson)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all text-sm font-semibold"
                    >
                      📄 Transcript
                    </button>
                    <button
                      onClick={() => handleEditLesson(lesson)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLesson(lesson.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all text-sm font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transcript Management Modal */}
        {showTranscriptModal && transcriptLesson && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Manage Transcript</h2>
                  <p className="text-gray-400">{transcriptLesson.title}</p>
                </div>
                <button
                  onClick={() => setShowTranscriptModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* YouTube Fetch Button */}
              {isYouTubeVideo(transcriptLesson.videoUrl) && (
                <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold mb-1">Auto-Fetch from YouTube</h3>
                      <p className="text-gray-300 text-sm">
                        Automatically fetch captions from the YouTube video
                      </p>
                    </div>
                    <button
                      onClick={handleFetchYouTubeTranscript}
                      disabled={fetchingYouTube}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {fetchingYouTube ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Fetching...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                          Fetch from YouTube
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {transcriptError && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">
                  ⚠️ {transcriptError}
                </div>
              )}

              {/* Transcript Editor */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-3">
                  Transcript Content
                </label>
                <textarea
                  value={transcriptContent}
                  onChange={(e) => setTranscriptContent(e.target.value)}
                  placeholder="Paste or type the lesson transcript here...

You can:
• Paste text directly
• Fetch from YouTube (if available)
• Include timestamps in format [00:00] if desired"
                  rows={15}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors resize-none font-mono text-sm"
                  disabled={transcriptLoading}
                />
                
                {/* Character Counter with Limits */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-4">
                    <p className={`text-sm font-semibold ${
                      transcriptContent.length < 50 ? 'text-red-400' :
                      transcriptContent.length > 100000 ? 'text-yellow-400' :
                      transcriptContent.length > 500000 ? 'text-red-400' :
                      'text-gray-400'
                    }`}>
                      {transcriptContent.length.toLocaleString()} characters
                    </p>
                    
                    {/* Status Indicators */}
                    {transcriptContent.length < 50 && transcriptContent.length > 0 && (
                      <span className="text-xs text-red-400 flex items-center gap-1">
                        ⚠️ Too short (min: 50)
                      </span>
                    )}
                    {transcriptContent.length >= 50 && transcriptContent.length <= 100000 && (
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        ✅ Optimal length
                      </span>
                    )}
                    {transcriptContent.length > 100000 && transcriptContent.length <= 500000 && (
                      <span className="text-xs text-yellow-400 flex items-center gap-1">
                        ⚠️ Large (may slow AI processing)
                      </span>
                    )}
                    {transcriptContent.length > 500000 && (
                      <span className="text-xs text-red-400 flex items-center gap-1">
                        ❌ Too long (max: 500,000)
                      </span>
                    )}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="text-xs text-gray-400">
                    {transcriptContent.length > 0 && (
                      <span>
                        {((transcriptContent.length / 500000) * 100).toFixed(1)}% of max
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Visual Progress Bar */}
                {transcriptContent.length > 0 && (
                  <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        transcriptContent.length <= 100000 ? 'bg-green-500' :
                        transcriptContent.length <= 500000 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((transcriptContent.length / 500000) * 100, 100)}%` }}
                    />
                  </div>
                )}
                
                {/* Helpful Tips */}
                {transcriptContent.length > 100000 && (
                  <div className="mt-3 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                    <p className="text-yellow-300 text-sm">
                      💡 <strong>Tip:</strong> Large transcripts may take longer to process with AI. 
                      Consider splitting very long content into multiple lessons for better learning experience.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleSaveTranscript}
                  disabled={
                    transcriptLoading || 
                    !transcriptContent.trim() || 
                    transcriptContent.length < 50 || 
                    transcriptContent.length > 500000
                  }
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {transcriptLoading ? 'Saving...' : 'Save Transcript'}
                </button>
                
                {transcriptContent && (
                  <button
                    onClick={handleDeleteTranscript}
                    disabled={transcriptLoading}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                )}
                
                <button
                  onClick={() => setShowTranscriptModal(false)}
                  className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

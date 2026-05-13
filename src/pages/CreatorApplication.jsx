import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { creatorsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CreatorApplication() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    bio: '',
    expertise: '',
    portfolioUrl: '',
    motivation: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Check if user already has an application
    fetchApplication();
  }, [isAuthenticated]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const data = await creatorsAPI.getMyApplication();
      setApplication(data.application);
    } catch (err) {
      // No application found is okay
      if (err.response?.status !== 404) {
        console.error('Failed to fetch application:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.bio.trim() || !formData.expertise.trim()) {
      setError('Bio and expertise are required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      await creatorsAPI.applyAsCreator(formData);
      
      // Refresh application status
      await fetchApplication();
      
      alert('Application submitted successfully! We will review it shortly.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'pending': return '⏳';
      default: return '📝';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  // If user is already a creator with approved application
  if (user?.role === 'creator' && application?.status === 'approved') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 text-center animate-fade-in">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-4">You're an Approved Creator!</h2>
            <p className="text-gray-300 mb-6">
              You have creator access and can start creating courses.
            </p>
            <button
              onClick={() => navigate('/creator/dashboard')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Go to Creator Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If application exists, show status
  if (application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Creator Application
            </h1>
            <p className="text-gray-300 text-lg">
              Your application status
            </p>
          </div>

          {/* Application Status */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 shadow-2xl animate-fade-in">
            {/* Status Badge */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold border ${getStatusColor(application.status)}`}>
                <span className="mr-2 text-2xl">{getStatusEmoji(application.status)}</span>
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </div>
            </div>

            {/* Application Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Bio</h3>
                <p className="text-gray-300 whitespace-pre-wrap">{application.bio}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Expertise</h3>
                <p className="text-gray-300">{application.expertise}</p>
              </div>

              {application.portfolioUrl && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Portfolio</h3>
                  <a
                    href={application.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    {application.portfolioUrl}
                  </a>
                </div>
              )}

              {application.motivation && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Motivation</h3>
                  <p className="text-gray-300 whitespace-pre-wrap">{application.motivation}</p>
                </div>
              )}

              <div className="pt-6 border-t border-white/10">
                <p className="text-sm text-gray-400">
                  Submitted: {new Date(application.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* Admin Notes (if rejected) */}
              {application.status === 'rejected' && application.adminNotes && (
                <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                  <h3 className="text-lg font-semibold text-red-300 mb-2">Feedback</h3>
                  <p className="text-gray-300">{application.adminNotes}</p>
                </div>
              )}

              {/* Status Messages */}
              {application.status === 'pending' && (
                <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30 text-center">
                  <p className="text-yellow-300">
                    Your application is under review. We'll notify you once it's been processed.
                  </p>
                </div>
              )}

              {application.status === 'approved' && (
                <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/30 text-center">
                  <p className="text-green-300 mb-4">
                    Congratulations! Your application has been approved. You now have creator access.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all"
                  >
                    Refresh Page
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Application form
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            🎓 Become a Creator
          </h1>
          <p className="text-gray-300 text-lg">
            Share your knowledge and help others grow their careers
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 animate-fade-in">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 text-center">
            <div className="text-4xl mb-3">📚</div>
            <h3 className="text-lg font-bold text-white mb-2">Create Courses</h3>
            <p className="text-gray-400 text-sm">Build and publish your own courses</p>
          </div>
          
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 text-center">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-lg font-bold text-white mb-2">Reach Learners</h3>
            <p className="text-gray-400 text-sm">Connect with students worldwide</p>
          </div>
          
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 text-center">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-lg font-bold text-white mb-2">Track Impact</h3>
            <p className="text-gray-400 text-sm">Monitor your course analytics</p>
          </div>
        </div>

        {/* Application Form */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 shadow-2xl animate-fade-in">
          <h2 className="text-2xl font-bold text-white mb-6">Application Form</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bio <span className="text-red-400">*</span>
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Tell us about yourself and your background..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
              />
            </div>

            {/* Expertise */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Areas of Expertise <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="expertise"
                value={formData.expertise}
                onChange={handleChange}
                required
                placeholder="e.g., Web Development, Data Science, UI/UX Design"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>

            {/* Portfolio URL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Portfolio URL (Optional)
              </label>
              <input
                type="url"
                name="portfolioUrl"
                value={formData.portfolioUrl}
                onChange={handleChange}
                placeholder="https://your-portfolio.com"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>

            {/* Motivation */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Why do you want to become a creator? (Optional)
              </label>
              <textarea
                name="motivation"
                value={formData.motivation}
                onChange={handleChange}
                rows={4}
                placeholder="Share your motivation for teaching and creating courses..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

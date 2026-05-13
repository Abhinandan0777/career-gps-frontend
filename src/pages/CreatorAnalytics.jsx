import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { creatorsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CreatorAnalytics() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'creator') {
      navigate('/');
      return;
    }
    fetchAnalytics();
  }, [isAuthenticated, user, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await creatorsAPI.getCreatorAnalytics({ days: timeRange });
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
          <button
            onClick={() => navigate('/creator/dashboard')}
            className="mb-4 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">Creator Analytics</h1>
          <p className="text-gray-300">Track your course performance and student engagement</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 animate-fade-in">
            ⚠️ {error}
          </div>
        )}

        {/* Time Range Filter */}
        <div className="mb-6 flex gap-3 animate-fade-in">
          {[
            { value: '7', label: 'Last 7 Days' },
            { value: '30', label: 'Last 30 Days' },
            { value: '90', label: 'Last 90 Days' },
            { value: '365', label: 'Last Year' }
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                timeRange === range.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Coming Soon Message */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-12 border border-white/20 text-center animate-fade-in">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-2xl font-bold text-white mb-2">Analytics Coming Soon</h3>
          <p className="text-gray-400 mb-6">
            We're working on detailed analytics to help you understand your course performance better.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h4 className="text-white font-semibold mb-2">📈 Enrollment Trends</h4>
              <p className="text-gray-400 text-sm">Track how your enrollments grow over time</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h4 className="text-white font-semibold mb-2">⏱️ Completion Times</h4>
              <p className="text-gray-400 text-sm">See how long students take to complete</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h4 className="text-white font-semibold mb-2">⭐ Student Feedback</h4>
              <p className="text-gray-400 text-sm">View ratings and reviews from learners</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/creator/dashboard')}
            className="mt-8 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

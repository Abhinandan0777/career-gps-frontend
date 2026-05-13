import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminApplications() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [reviewingApp, setReviewingApp] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchApplications();
  }, [isAuthenticated, user, statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminAPI.listCreatorApplications({ status: statusFilter });
      setApplications(data.applications || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (application) => {
    setReviewingApp(application);
    setAdminNotes(application.adminNotes || '');
  };

  const handleCloseReview = () => {
    setReviewingApp(null);
    setAdminNotes('');
  };

  const handleApprove = async () => {
    if (!reviewingApp) return;

    try {
      setActionLoading(true);
      setError('');
      await adminAPI.reviewApplication(reviewingApp.id, {
        status: 'approved',
        adminNotes
      });
      await fetchApplications();
      handleCloseReview();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!reviewingApp) return;
    if (!adminNotes.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      await adminAPI.reviewApplication(reviewingApp.id, {
        status: 'rejected',
        adminNotes
      });
      await fetchApplications();
      handleCloseReview();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject application');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
      approved: 'bg-green-500/20 border-green-500/50 text-green-300',
      rejected: 'bg-red-500/20 border-red-500/50 text-red-300'
    };
    return styles[status] || styles.pending;
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
          <h1 className="text-4xl font-bold text-white mb-2">Creator Applications</h1>
          <p className="text-gray-300">Review and manage creator applications</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 animate-fade-in">
            ⚠️ {error}
          </div>
        )}

        {/* Status Filter */}
        <div className="mb-6 flex gap-3 animate-fade-in">
          {['pending', 'approved', 'rejected'].map((status) => (
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

        {/* Applications List */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 animate-fade-in">
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-white mb-2">No Applications</h3>
              <p className="text-gray-400">
                No {statusFilter} applications at this time
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{app.userName}</h3>
                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-1">{app.userEmail}</p>
                      <p className="text-gray-500 text-sm">
                        Applied: {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {app.status === 'pending' && (
                      <button
                        onClick={() => handleReview(app)}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all"
                      >
                        Review
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-white font-semibold mb-1">Bio</h4>
                      <p className="text-gray-300">{app.bio}</p>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Expertise</h4>
                      <p className="text-gray-300">{app.expertise}</p>
                    </div>
                    {app.portfolioUrl && (
                      <div>
                        <h4 className="text-white font-semibold mb-1">Portfolio</h4>
                        <a
                          href={app.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 underline"
                        >
                          {app.portfolioUrl}
                        </a>
                      </div>
                    )}
                    {app.motivation && (
                      <div>
                        <h4 className="text-white font-semibold mb-1">Motivation</h4>
                        <p className="text-gray-300">{app.motivation}</p>
                      </div>
                    )}
                    {app.adminNotes && (
                      <div>
                        <h4 className="text-white font-semibold mb-1">Admin Notes</h4>
                        <p className="text-gray-300">{app.adminNotes}</p>
                      </div>
                    )}
                    {app.reviewedAt && (
                      <p className="text-gray-500 text-sm">
                        Reviewed: {new Date(app.reviewedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review Modal */}
        {reviewingApp && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-xl bg-gray-900/95 rounded-2xl p-8 border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
              <h2 className="text-3xl font-bold text-white mb-6">Review Application</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="text-white font-semibold mb-1">Applicant</h3>
                  <p className="text-gray-300">{reviewingApp.userName}</p>
                  <p className="text-gray-400 text-sm">{reviewingApp.userEmail}</p>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Bio</h3>
                  <p className="text-gray-300">{reviewingApp.bio}</p>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Expertise</h3>
                  <p className="text-gray-300">{reviewingApp.expertise}</p>
                </div>
                {reviewingApp.portfolioUrl && (
                  <div>
                    <h3 className="text-white font-semibold mb-1">Portfolio</h3>
                    <a
                      href={reviewingApp.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 underline"
                    >
                      {reviewingApp.portfolioUrl}
                    </a>
                  </div>
                )}
                {reviewingApp.motivation && (
                  <div>
                    <h3 className="text-white font-semibold mb-1">Motivation</h3>
                    <p className="text-gray-300">{reviewingApp.motivation}</p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this application..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Processing...' : 'Approve'}
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={handleCloseReview}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

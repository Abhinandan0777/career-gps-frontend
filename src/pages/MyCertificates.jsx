import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { certificatesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MyCertificates() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCertificates();
  }, [isAuthenticated]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await certificatesAPI.getUserCertificates();
      setCertificates(data.certificates || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (certificateId) => {
    const downloadUrl = certificatesAPI.downloadCertificate(certificateId);
    window.open(downloadUrl, '_blank');
  };

  const handleVerify = (certificateId) => {
    navigate(`/certificates/verify/${certificateId}`);
  };

  const handleShare = (certificate) => {
    const verifyUrl = `${window.location.origin}/certificates/verify/${certificate.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Certificate - ${certificate.courseTitle}`,
        text: `I earned a certificate for completing ${certificate.courseTitle}!`,
        url: verifyUrl
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(verifyUrl).then(() => {
        alert('Certificate verification link copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy:', err);
        alert(`Verification URL: ${verifyUrl}`);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            🏆 My Certificates
          </h1>
          <p className="text-gray-300 text-lg">
            Your achievements and accomplishments
          </p>
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

        {/* Certificates Grid */}
        {!loading && certificates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {certificates.map((certificate) => (
              <div
                key={certificate.id}
                className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl hover:shadow-gold-500/50 transition-all transform hover:scale-105"
              >
                {/* Certificate Badge */}
                <div className="flex items-center justify-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-5xl shadow-2xl animate-pulse">
                    🏆
                  </div>
                </div>

                {/* Course Title */}
                <h3 className="text-xl font-bold text-white text-center mb-2 line-clamp-2">
                  {certificate.courseTitle || 'Course Certificate'}
                </h3>

                {/* Completion Date */}
                <div className="flex items-center justify-center text-sm text-gray-300 mb-4">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Completed: {new Date(certificate.issuedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>

                {/* Serial Number */}
                <div className="mb-6 p-3 bg-black/30 rounded-lg border border-white/10">
                  <p className="text-xs text-gray-400 mb-1 text-center">Certificate ID</p>
                  <p className="text-xs font-mono text-purple-300 text-center break-all">
                    {certificate.serialNumber}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleDownload(certificate.id)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Certificate
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleVerify(certificate.id)}
                      className="px-4 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl font-semibold hover:bg-blue-500/30 transition-all flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Verify
                    </button>

                    <button
                      onClick={() => handleShare(certificate)}
                      className="px-4 py-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl font-semibold hover:bg-purple-500/30 transition-all flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && certificates.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Certificates Yet</h3>
            <p className="text-gray-400 mb-6">
              Complete courses to earn certificates
            </p>
            <button
              onClick={() => navigate('/enrollments')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
            >
              View My Enrollments
            </button>
          </div>
        )}

        {/* Achievement Stats */}
        {!loading && certificates.length > 0 && (
          <div className="mt-12 backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 shadow-2xl animate-fade-in">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-3xl font-bold text-white mb-2">
                {certificates.length} Certificate{certificates.length !== 1 ? 's' : ''} Earned
              </h3>
              <p className="text-gray-300 text-lg">
                Keep up the great work! Continue learning to earn more certificates.
              </p>
            </div>

            {/* Timeline */}
            <div className="mt-8 space-y-4">
              <h4 className="text-lg font-semibold text-white mb-4">Recent Achievements</h4>
              {certificates.slice(0, 5).map((cert, index) => (
                <div
                  key={cert.id}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                    🏆
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{cert.courseTitle}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(cert.issuedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload(cert.id)}
                    className="px-4 py-2 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg font-semibold hover:bg-green-500/30 transition-all text-sm"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

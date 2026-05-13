import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { certificatesAPI } from '../services/api';

export default function CertificateVerify() {
  const { id } = useParams();
  
  const [certificate, setCertificate] = useState(null);
  const [serialInput, setSerialInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    // If ID is provided in URL, verify automatically
    if (id) {
      verifyCertificateById(id);
    }
  }, [id]);

  const verifyCertificateById = async (certId) => {
    try {
      setLoading(true);
      setError('');
      setCertificate(null);
      
      const data = await certificatesAPI.verifyCertificate(certId);
      setCertificate(data.certificate);
    } catch (err) {
      setError(err.response?.data?.message || 'Certificate not found or invalid');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!serialInput.trim()) {
      setError('Please enter a certificate ID');
      return;
    }

    try {
      setVerifying(true);
      setError('');
      setCertificate(null);
      
      const data = await certificatesAPI.verifyCertificate(serialInput.trim());
      setCertificate(data.certificate);
    } catch (err) {
      setError(err.response?.data?.message || 'Certificate not found or invalid');
    } finally {
      setVerifying(false);
    }
  };

  const handleDownload = () => {
    if (certificate) {
      const downloadUrl = certificatesAPI.downloadCertificate(certificate.id);
      window.open(downloadUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            🔍 Verify Certificate
          </h1>
          <p className="text-gray-300 text-lg">
            Verify the authenticity of a Career GPS certificate
          </p>
        </div>

        {/* Verification Form */}
        {!id && (
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 shadow-2xl mb-8 animate-fade-in">
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Certificate ID
                </label>
                <input
                  type="text"
                  value={serialInput}
                  onChange={(e) => setSerialInput(e.target.value)}
                  placeholder="Enter certificate ID or serial number"
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-sm"
                />
                <p className="mt-2 text-sm text-gray-400">
                  Enter the certificate ID to verify its authenticity
                </p>
              </div>

              <button
                type="submit"
                disabled={verifying || !serialInput.trim()}
                className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifying ? 'Verifying...' : 'Verify Certificate'}
              </button>
            </form>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="backdrop-blur-xl bg-red-500/20 rounded-2xl p-8 border border-red-500/50 shadow-2xl mb-8 animate-fade-in">
            <div className="text-center">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-2xl font-bold text-white mb-2">Verification Failed</h3>
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Certificate Details - Valid */}
        {certificate && (
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 shadow-2xl animate-fade-in">
            {/* Success Badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-4 animate-bounce">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">✅ Certificate Verified</h2>
              <p className="text-green-300">This certificate is authentic and valid</p>
            </div>

            {/* Certificate Info */}
            <div className="space-y-6">
              {/* Course Title */}
              <div className="text-center p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
                <p className="text-sm text-gray-400 mb-2">Course</p>
                <h3 className="text-2xl font-bold text-white">{certificate.courseTitle}</h3>
              </div>

              {/* Recipient */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-sm text-gray-400 mb-2">Awarded To</p>
                  <p className="text-lg font-semibold text-white">{certificate.userName}</p>
                </div>

                {/* Issue Date */}
                <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-sm text-gray-400 mb-2">Issue Date</p>
                  <p className="text-lg font-semibold text-white">
                    {new Date(certificate.issuedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Serial Number */}
              <div className="p-6 bg-black/30 rounded-xl border border-white/10">
                <p className="text-sm text-gray-400 mb-2">Certificate ID</p>
                <p className="text-sm font-mono text-purple-300 break-all">
                  {certificate.serialNumber}
                </p>
              </div>

              {/* Verification Details */}
              <div className="p-6 bg-green-500/10 rounded-xl border border-green-500/30">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <p className="text-green-300 font-semibold mb-1">Verified by Career GPS Platform</p>
                    <p className="text-sm text-gray-400">
                      This certificate has been verified against our secure database and is confirmed to be authentic.
                    </p>
                  </div>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Certificate
              </button>
            </div>
          </div>
        )}

        {/* Info Section */}
        {!certificate && !loading && (
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 shadow-2xl animate-fade-in">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="mr-2">ℹ️</span>
              About Certificate Verification
            </h3>
            <div className="space-y-3 text-gray-300">
              <p>
                Certificate verification allows you to confirm the authenticity of certificates issued by the Career GPS Platform.
              </p>
              <p>
                Each certificate has a unique ID that can be verified against our secure database.
              </p>
              <p className="text-sm text-gray-400">
                If you have questions about a certificate, please contact the certificate holder or our support team.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

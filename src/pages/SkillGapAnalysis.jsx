import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { careerAPI } from '../services/api';

const SkillGapAnalysis = () => {
  const navigate = useNavigate();
  const [jobRoleName, setJobRoleName] = useState('');
  const [userSkills, setUserSkills] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Suggested job roles for quick selection
  const suggestedRoles = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'Data Scientist',
    'Machine Learning Engineer',
    'Mobile Developer',
    'Cloud Architect',
    'UI/UX Designer',
    'Product Manager'
  ];

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const dashboard = await careerAPI.getDashboard();
      setUserSkills(dashboard?.profile?.skills || []);
    } catch (err) {
      console.error('Failed to load user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!jobRoleName || jobRoleName.trim().length === 0) {
      setError('Please enter or select a job role');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      console.log('Calling skill gap analysis API with:', { jobRoleName: jobRoleName.trim() });
      const result = await careerAPI.analyzeSkillGap({ jobRoleName: jobRoleName.trim() });
      console.log('Skill gap analysis result received:', result);
      setAnalysis(result);
    } catch (err) {
      console.error('Skill gap analysis error:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      console.error('Error message:', err.message);
      
      // Extract error message from response
      let errorMessage = 'Failed to analyze skill gap';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.details) {
        errorMessage = `${errorMessage}: ${err.response.data.details}`;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateRoadmap = () => {
    if (analysis) {
      navigate(`/career/roadmap?jobRole=${encodeURIComponent(jobRoleName)}`);
    }
  };

  const getReadinessColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReadinessGradient = (percentage) => {
    if (percentage >= 80) return 'from-green-500 to-emerald-600';
    if (percentage >= 60) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Skill Gap Analysis
        </h1>
        <p className="text-gray-600">Identify what skills you need to reach your target role</p>
      </div>

      {/* Analysis Form */}
      <div className="glass rounded-2xl p-8 mb-8 border border-gray-200/50">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Job Role Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Target Job Role
            </label>
            <input
              type="text"
              value={jobRoleName}
              onChange={(e) => setJobRoleName(e.target.value)}
              placeholder="e.g., Frontend Developer, Data Scientist..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 hover:border-gray-400"
              list="job-role-suggestions"
            />
            <datalist id="job-role-suggestions">
              {suggestedRoles.map((role, index) => (
                <option key={index} value={role} />
              ))}
            </datalist>
            <p className="mt-2 text-xs text-gray-500">
              Type any job role or select from suggestions
            </p>
          </div>

          {/* Current Skills Count */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Your Current Skills
            </label>
            <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Total Skills</span>
                <span className="text-2xl font-bold text-primary-600">{userSkills.length}</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-slide-in">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={analyzing || !jobRoleName || jobRoleName.trim().length === 0}
          className={`w-full py-4 px-6 rounded-xl text-white font-semibold text-lg shadow-lg transition-all duration-200 ${
            analyzing || !jobRoleName || jobRoleName.trim().length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'gradient-primary hover:shadow-xl transform hover:scale-[1.02]'
          }`}
        >
          {analyzing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing with AI...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analyze Skill Gap
            </span>
          )}
        </button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-8 animate-fade-in">
          {/* Readiness Score */}
          <div className="glass rounded-2xl p-8 border border-gray-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Readiness Score</h2>
            
            <div className="flex flex-col items-center mb-8">
              {/* Circular Progress */}
              <div className="relative w-48 h-48 mb-4">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - (analysis.readinessPercentage || 0) / 100)}`}
                    className={`bg-gradient-to-r ${getReadinessGradient(analysis.readinessPercentage || 0)}`}
                    style={{ stroke: analysis.readinessPercentage >= 80 ? '#10b981' : analysis.readinessPercentage >= 60 ? '#f59e0b' : '#ef4444' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${getReadinessColor(analysis.readinessPercentage || 0)}`}>
                      {analysis.readinessPercentage || 0}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Ready</div>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-center max-w-md">
                {analysis.readinessPercentage >= 80
                  ? "You're well-prepared for this role! Focus on the remaining skills to become an expert."
                  : analysis.readinessPercentage >= 60
                  ? "You're on the right track! Work on the missing skills to increase your readiness."
                  : "There's room for growth. Follow a learning roadmap to bridge the skill gap."}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {analysis.matchedSkills?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Matched Skills</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {analysis.missingSkills?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Missing Skills</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {(analysis.matchedSkills?.length || 0) + (analysis.missingSkills?.length || 0)}
                </div>
                <div className="text-sm text-gray-600">Total Required</div>
              </div>
            </div>
          </div>

          {/* AI-Suggested Required Skills */}
          {analysis.requiredSkills && analysis.requiredSkills.length > 0 && (
            <div className="glass rounded-2xl p-8 border border-gray-200/50">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Required Skills</h2>
                  <p className="text-gray-600 text-sm">AI-suggested skills for {analysis.jobRole?.name}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {analysis.requiredSkills.map((skill, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center space-x-2 hover:shadow-md transition-all duration-200"
                  >
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Skills */}
          {analysis.matchedSkills && analysis.matchedSkills.length > 0 && (
            <div className="glass rounded-2xl p-8 border border-gray-200/50">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Matched Skills</h2>
                  <p className="text-gray-600 text-sm">Skills you already have</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {analysis.matchedSkills.map((skill, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 hover:shadow-md transition-all duration-200"
                  >
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Skills */}
          {analysis.missingSkills && analysis.missingSkills.length > 0 && (
            <div className="glass rounded-2xl p-8 border border-gray-200/50">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Missing Skills</h2>
                  <p className="text-gray-600 text-sm">Skills you need to learn</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {analysis.missingSkills.map((skill, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 hover:shadow-md transition-all duration-200"
                  >
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generate Roadmap CTA */}
          <div className="glass rounded-2xl p-8 border border-gray-200/50 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Bridge the Gap?</h3>
            <p className="text-gray-600 mb-6">
              Generate a personalized learning roadmap to acquire the missing skills
            </p>
            <button
              onClick={handleGenerateRoadmap}
              className="px-8 py-4 gradient-success text-white rounded-xl hover:shadow-xl transition-all duration-200 font-semibold text-lg transform hover:scale-105"
            >
              Generate Learning Roadmap
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!analysis && !analyzing && (
        <div className="glass rounded-2xl p-12 text-center border border-gray-200/50">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Role to Analyze</h3>
          <p className="text-gray-600">
            Choose your target job role and click "Analyze Skill Gap" to see your readiness
          </p>
        </div>
      )}
    </div>
  );
};

export default SkillGapAnalysis;

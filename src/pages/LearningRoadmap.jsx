import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { careerAPI } from '../services/api';

// Mock job roles data
const mockJobRoles = [
  { id: '1', name: 'Frontend Developer', category: 'Engineering' },
  { id: '2', name: 'Backend Developer', category: 'Engineering' },
  { id: '3', name: 'Full Stack Developer', category: 'Engineering' },
  { id: '4', name: 'Data Scientist', category: 'Data' },
  { id: '5', name: 'DevOps Engineer', category: 'Operations' },
  { id: '6', name: 'Mobile Developer', category: 'Engineering' },
  { id: '7', name: 'UI/UX Designer', category: 'Design' },
  { id: '8', name: 'Product Manager', category: 'Management' },
  { id: '9', name: 'Machine Learning Engineer', category: 'Data' },
  { id: '10', name: 'Cloud Architect', category: 'Operations' }
];

const LearningRoadmap = () => {
  const [searchParams] = useSearchParams();
  const [selectedJobRole, setSelectedJobRole] = useState(searchParams.get('jobRole') || '');
  const [targetWeeks, setTargetWeeks] = useState(12);
  const [generating, setGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState('');
  const [completedWeeks, setCompletedWeeks] = useState(new Set());
  const [savedRoadmap, setSavedRoadmap] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load saved roadmaps on component mount
  useEffect(() => {
    loadSavedRoadmaps();
  }, []);

  const loadSavedRoadmaps = async () => {
    try {
      setLoading(true);
      const dashboard = await careerAPI.getDashboard();
      
      // If user has saved roadmaps, load the most recent one
      if (dashboard?.learningPaths && dashboard.learningPaths.length > 0) {
        const mostRecentRoadmap = dashboard.learningPaths[0];
        setRoadmap(mostRecentRoadmap.roadmap);
        setSavedRoadmap(true);
        
        // Set the job role if available
        if (mostRecentRoadmap.jobRole) {
          const matchingRole = mockJobRoles.find(r => r.name === mostRecentRoadmap.jobRole);
          if (matchingRole) {
            setSelectedJobRole(matchingRole.id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load saved roadmaps:', err);
      // Don't show error to user - just means no saved roadmaps
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedJobRole) {
      setError('Please select a job role');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      // Find the selected job role name
      const jobRole = mockJobRoles.find(r => r.id === selectedJobRole);
      
      const result = await careerAPI.generateRoadmap({
        jobRoleName: jobRole?.name || selectedJobRole,
        targetWeeks: targetWeeks
      });
      setRoadmap(result);
      setSavedRoadmap(false);
    } catch (err) {
      console.error('Roadmap generation error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.message || err.response?.data?.details || 'Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  const toggleWeekCompletion = (weekNumber) => {
    setCompletedWeeks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(weekNumber)) {
        newSet.delete(weekNumber);
      } else {
        newSet.add(weekNumber);
      }
      return newSet;
    });
  };

  const handleSaveRoadmap = () => {
    // In a real app, this would save to backend
    setSavedRoadmap(true);
    setTimeout(() => setSavedRoadmap(false), 3000);
  };

  const getProgressPercentage = () => {
    if (!roadmap?.weeklyPlan) return 0;
    return Math.round((completedWeeks.size / roadmap.weeklyPlan.length) * 100);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Learning Roadmap
        </h1>
        <p className="text-gray-600">Get a personalized week-by-week learning plan</p>
      </div>

      {/* Roadmap Generator */}
      <div className="glass rounded-2xl p-8 mb-8 border border-gray-200/50">
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Job Role Selector */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Target Job Role
            </label>
            <select
              value={selectedJobRole}
              onChange={(e) => setSelectedJobRole(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 hover:border-gray-400"
            >
              <option value="">Select a job role...</option>
              {mockJobRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} ({role.category})
                </option>
              ))}
            </select>
          </div>

          {/* Target Weeks */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Target Duration (Weeks)
            </label>
            <input
              type="number"
              min="4"
              max="52"
              value={targetWeeks}
              onChange={(e) => setTargetWeeks(parseInt(e.target.value) || 12)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 hover:border-gray-400"
            />
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

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating || !selectedJobRole}
          className={`w-full py-4 px-6 rounded-xl text-white font-semibold text-lg shadow-lg transition-all duration-200 ${
            generating || !selectedJobRole
              ? 'bg-gray-400 cursor-not-allowed'
              : 'gradient-success hover:shadow-xl transform hover:scale-[1.02]'
          }`}
        >
          {generating ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Roadmap with AI...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Generate Learning Roadmap
            </span>
          )}
        </button>
      </div>

      {/* Roadmap Display */}
      {roadmap && (
        <div className="space-y-8 animate-fade-in">
          {/* Progress Overview */}
          <div className="glass rounded-2xl p-8 border border-gray-200/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Your Learning Journey</h2>
                <p className="text-gray-600">
                  {roadmap.jobRole || 'Career'} • {roadmap.weeklyPlan?.length || 0} weeks
                </p>
              </div>
              <button
                onClick={handleSaveRoadmap}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  savedRoadmap
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-primary-600 border-2 border-primary-200 hover:border-primary-400 hover:shadow-md'
                }`}
              >
                {savedRoadmap ? (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Saved!
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Save Roadmap
                  </span>
                )}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Overall Progress</span>
                <span>{getProgressPercentage()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="gradient-success h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{roadmap.weeklyPlan?.length || 0}</div>
                <div className="text-xs text-gray-600">Total Weeks</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="text-2xl font-bold text-green-600">{completedWeeks.size}</div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">
                  {roadmap.estimatedHoursPerWeek || 10}h
                </div>
                <div className="text-xs text-gray-600">Per Week</div>
              </div>
            </div>
          </div>

          {/* Weekly Plan Timeline */}
          <div className="glass rounded-2xl p-8 border border-gray-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Weekly Breakdown</h2>
            
            <div className="space-y-6">
              {roadmap.weeklyPlan?.map((week, index) => (
                <div
                  key={index}
                  className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                    completedWeeks.has(week.week)
                      ? 'bg-green-50 border-green-300'
                      : 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-md'
                  }`}
                >
                  {/* Week Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleWeekCompletion(week.week)}
                        className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                          completedWeeks.has(week.week)
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 hover:border-primary-500'
                        }`}
                      >
                        {completedWeeks.has(week.week) && (
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>

                      {/* Week Info */}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Week {week.week}
                          {week.milestone && (
                            <span className="ml-3 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs rounded-full">
                              🎯 Milestone
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">{week.focus || 'Learning Focus'}</p>
                      </div>
                    </div>

                    {/* Hours Badge */}
                    <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {week.estimatedHours || 10}h
                    </div>
                  </div>

                  {/* Skills to Learn */}
                  {week.skills && week.skills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Skills to Learn:</h4>
                      <div className="flex flex-wrap gap-2">
                        {week.skills.map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="px-3 py-1 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Course Recommendations */}
                  {week.courses && week.courses.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Recommended Courses:</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {week.courses.map((course, courseIndex) => (
                          <div
                            key={courseIndex}
                            className="p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-semibold text-gray-900 text-sm">{course.title}</h5>
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium whitespace-nowrap ml-2">
                                {course.duration || '2h'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{course.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">{course.platform || 'Platform'}</span>
                              <button className="text-primary-600 hover:text-primary-700 text-xs font-medium">
                                View Course →
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timeline Connector */}
                  {index < roadmap.weeklyPlan.length - 1 && (
                    <div className="absolute left-10 -bottom-6 w-0.5 h-6 bg-gray-300"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Milestones Summary */}
          {roadmap.milestones && roadmap.milestones.length > 0 && (
            <div className="glass rounded-2xl p-8 border border-gray-200/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Milestones</h2>
              <div className="space-y-4">
                {roadmap.milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className="flex items-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{milestone.title}</h4>
                      <p className="text-sm text-gray-600">{milestone.description}</p>
                    </div>
                    <span className="text-sm text-gray-500">Week {milestone.week}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="glass rounded-2xl p-12 text-center border border-gray-200/50">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-12 w-12 text-primary-600 mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Your Roadmaps...</h3>
            <p className="text-gray-600">Checking for saved learning paths</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!roadmap && !generating && !loading && (
        <div className="glass rounded-2xl p-12 text-center border border-gray-200/50">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Generate Your Roadmap</h3>
          <p className="text-gray-600">
            Select your target role and duration to get a personalized learning plan
          </p>
        </div>
      )}
    </div>
  );
};

export default LearningRoadmap;

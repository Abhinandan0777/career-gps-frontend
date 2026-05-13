import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { coursesAPI } from '../services/api';
import apiClient from '../services/api';

export default function CourseCatalog() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);
  
  // Available options for filters
  const [skills, setSkills] = useState([]);
  const [creators, setCreators] = useState([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || '');
  const [skillId, setSkillId] = useState(searchParams.get('skillId') || '');
  const [creatorId, setCreatorId] = useState(searchParams.get('creatorId') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);

  useEffect(() => {
    fetchSkillsAndCreators();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [page, difficulty, skillId, creatorId]);

  const fetchSkillsAndCreators = async () => {
    try {
      // Fetch skills for filter dropdown
      const skillsResponse = await apiClient.get('/skills');
      setSkills(skillsResponse.skills || []);
      
      // Fetch creators (users with creator role) for filter dropdown
      const creatorsResponse = await apiClient.get('/users/creators');
      setCreators(creatorsResponse.creators || []);
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
      // Continue even if filters fail to load
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page,
        limit: 12,
        ...(difficulty && { difficulty }),
        ...(skillId && { skillId }),
        ...(creatorId && { creatorId }),
        ...(searchQuery && { search: searchQuery }),
        isPublished: 'true'
      };
      
      const data = await coursesAPI.listCourses(params);
      setCourses(data.courses);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Update URL params and trigger search
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (difficulty) params.set('difficulty', difficulty);
    if (skillId) params.set('skillId', skillId);
    if (creatorId) params.set('creatorId', creatorId);
    params.set('page', '1');
    setSearchParams(params);
    setPage(1);
    fetchCourses();
  };

  const handleDifficultyChange = (value) => {
    setDifficulty(value);
    setPage(1);
    updateUrlParams({ difficulty: value });
  };

  const handleSkillChange = (value) => {
    setSkillId(value);
    setPage(1);
    updateUrlParams({ skillId: value });
  };

  const handleCreatorChange = (value) => {
    setCreatorId(value);
    setPage(1);
    updateUrlParams({ creatorId: value });
  };

  const updateUrlParams = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            📚 Course Catalog
          </h1>
          <p className="text-gray-300 text-lg">
            Discover courses to advance your career
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl animate-slide-in">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search courses..."
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Skill Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Skill
                </label>
                <select
                  value={skillId}
                  onChange={(e) => handleSkillChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                >
                  <option value="">All Skills</option>
                  {skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => handleDifficultyChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">🌱 Beginner</option>
                  <option value="intermediate">🚀 Intermediate</option>
                  <option value="advanced">⚡ Advanced</option>
                </select>
              </div>

              {/* Creator Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Creator
                </label>
                <select
                  value={creatorId}
                  onChange={(e) => handleCreatorChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                >
                  <option value="">All Creators</option>
                  {creators.map((creator) => (
                    <option key={creator.id} value={creator.id}>
                      {creator.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 items-center">
              {/* Search Button */}
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Search
              </button>

              {/* Clear Filters */}
              {(searchQuery || difficulty || skillId || creatorId) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setDifficulty('');
                    setSkillId('');
                    setCreatorId('');
                    setPage(1);
                    setSearchParams({});
                    fetchCourses();
                  }}
                  className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </form>
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

        {/* Courses Grid */}
        {!loading && courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-fade-in">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/courses/${course.id}`)}
                className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105 cursor-pointer group"
              >
                {/* Thumbnail */}
                <div className="mb-4 h-40 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-xl flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    '📚'
                  )}
                </div>

                {/* Course Info */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors line-clamp-2">
                  {course.title}
                </h3>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {course.description || 'No description available'}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {course.difficulty && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(course.difficulty)}`}>
                      {getDifficultyEmoji(course.difficulty)} {course.difficulty}
                    </span>
                  )}
                  {course.durationHours && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      ⏱️ {course.durationHours}h
                    </span>
                  )}
                </div>

                {/* Creator */}
                <div className="flex items-center text-sm text-gray-400">
                  <span className="mr-2">👤</span>
                  <span>{course.creatorName || 'Unknown Creator'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && courses.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Courses Found</h3>
            <p className="text-gray-400">
              {searchQuery || difficulty
                ? 'Try adjusting your filters'
                : 'No courses available at the moment'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8 animate-fade-in">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={!pagination.hasPrev}
              className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            
            <span className="text-white font-semibold">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={!pagination.hasNext}
              className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminSkillDemand() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [skillDemand, setSkillDemand] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchSkillDemand();
  }, [isAuthenticated, user, dateRange]);

  const fetchSkillDemand = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminAPI.getSkillDemandAnalytics({ days: dateRange });
      setSkillDemand(data.skills || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load skill demand analytics');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    return '➡️';
  };

  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-green-400';
    if (trend === 'down') return 'text-red-400';
    return 'text-gray-400';
  };

  const handleExport = () => {
    const csv = [
      ['Rank', 'Skill', 'Demand Count', 'Trend', 'Category'].join(','),
      ...skillDemand.map((skill, index) => 
        [
          index + 1,
          skill.name,
          skill.demandCount,
          skill.trend || 'stable',
          skill.category || 'N/A'
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skill-demand-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Skill Demand Analytics</h1>
              <p className="text-gray-300">Track which skills are most in demand</p>
            </div>
            <button
              onClick={handleExport}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              <span>📊</span>
              Export Data
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 animate-fade-in">
            ⚠️ {error}
          </div>
        )}

        {/* Date Range Filter */}
        <div className="mb-6 flex gap-3 animate-fade-in">
          {[
            { value: '7', label: 'Last 7 Days' },
            { value: '30', label: 'Last 30 Days' },
            { value: '90', label: 'Last 90 Days' },
            { value: '365', label: 'Last Year' }
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setDateRange(range.value)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                dateRange === range.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Skill Demand Table */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 animate-fade-in">
          {skillDemand.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-white mb-2">No Data Available</h3>
              <p className="text-gray-400">
                No skill demand data for the selected time period
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Top Skills in Demand ({skillDemand.length})
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Based on skill gap analysis from learners
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-4 px-4 text-gray-400 font-semibold">Rank</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-semibold">Skill</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-semibold">Category</th>
                      <th className="text-right py-4 px-4 text-gray-400 font-semibold">Demand Count</th>
                      <th className="text-center py-4 px-4 text-gray-400 font-semibold">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skillDemand.map((skill, index) => (
                      <tr
                        key={skill.name || skill.id}
                        className="border-b border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {index < 3 && (
                              <span className="text-2xl">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                              </span>
                            )}
                            <span className="text-white font-semibold">#{index + 1}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-white font-semibold text-lg">{skill.name}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-3 py-1 bg-purple-600/30 border border-purple-500/50 rounded-lg text-purple-300 text-sm">
                            {skill.category || 'General'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-white font-bold text-xl">{skill.demandCount}</span>
                          <span className="text-gray-400 text-sm ml-2">requests</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-2xl">{getTrendIcon(skill.trend)}</span>
                            <span className={`font-semibold capitalize ${getTrendColor(skill.trend)}`}>
                              {skill.trend || 'stable'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Stats */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="text-gray-400 text-sm mb-1">Total Skills Tracked</h3>
                  <p className="text-3xl font-bold text-white">{skillDemand.length}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="text-gray-400 text-sm mb-1">Total Demand Requests</h3>
                  <p className="text-3xl font-bold text-white">
                    {skillDemand.reduce((sum, skill) => sum + (skill.demandCount || 0), 0)}
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="text-gray-400 text-sm mb-1">Trending Up</h3>
                  <p className="text-3xl font-bold text-green-400">
                    {skillDemand.filter(s => s.trend === 'up').length}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI, careerAPI } from '../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // User info form
  const [userForm, setUserForm] = useState({
    name: '',
    bio: '',
    avatar: ''
  });
  
  // Skills form
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({ name: '', level: 'beginner' });
  
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await usersAPI.getMe();
      
      // Set user info
      setUserForm({
        name: userData.name || '',
        bio: userData.bio || '',
        avatar: userData.avatar_url || ''
      });
      
      // Set skills if available
      if (userData.profile?.skills) {
        setSkills(userData.profile.skills);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to load profile. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateUserInfo = async (e) => {
    e.preventDefault();
    
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const updatedUser = await usersAPI.updateMe(userForm);
      updateUser(updatedUser);
      
      setMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNewSkillChange = (e) => {
    const { name, value } = e.target;
    setNewSkill(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = () => {
    if (!newSkill.name.trim()) {
      setMessage({
        type: 'error',
        text: 'Skill name is required'
      });
      return;
    }
    
    // Check if skill already exists
    if (skills.some(s => s.name.toLowerCase() === newSkill.name.toLowerCase())) {
      setMessage({
        type: 'error',
        text: 'This skill is already in your list'
      });
      return;
    }
    
    setSkills(prev => [...prev, { ...newSkill }]);
    setNewSkill({ name: '', level: 'beginner' });
    setMessage({ type: '', text: '' });
  };

  const handleRemoveSkill = (index) => {
    setSkills(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateSkillLevel = (index, newLevel) => {
    setSkills(prev => prev.map((skill, i) => 
      i === index ? { ...skill, level: newLevel } : skill
    ));
  };

  const handleSaveSkills = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      await careerAPI.createOrUpdateProfile({ skills });
      
      setMessage({
        type: 'success',
        text: 'Skills updated successfully!'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update skills. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto animate-fade-in">
        <div className="glass rounded-2xl p-12 text-center shadow-xl">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-2">
          My Profile
        </h2>
        <p className="text-gray-600">Manage your personal information and skills</p>
      </div>
      
      {message.text && (
        <div className={`mb-6 p-4 rounded-xl border-l-4 animate-slide-in ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-500' 
            : 'bg-red-50 border-red-500'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <p className={`text-sm font-medium ${
              message.type === 'success' ? 'text-green-700' : 'text-red-700'
            }`}>
              {message.text}
            </p>
          </div>
        </div>
      )}
      
      {/* User Information Section */}
      <div className="glass rounded-2xl p-8 mb-6 shadow-xl border border-gray-200/50">
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-white font-bold text-2xl mr-4 shadow-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{user?.name}</h3>
            <p className="text-gray-600 capitalize">{user?.role} • {user?.email}</p>
          </div>
        </div>
        
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-6"></div>
        
        <form onSubmit={handleUpdateUserInfo} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={userForm.name}
              onChange={handleUserFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 hover:border-gray-400 transition-all"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={userForm.bio}
              onChange={handleUserFormChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 hover:border-gray-400 transition-all resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>
          
          <div>
            <label htmlFor="avatar" className="block text-sm font-semibold text-gray-700 mb-2">
              Avatar URL
            </label>
            <input
              type="url"
              id="avatar"
              name="avatar"
              value={userForm.avatar}
              onChange={handleUserFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 hover:border-gray-400 transition-all"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
          
          <button
            type="submit"
            disabled={saving}
            className={`px-8 py-3 rounded-xl text-white font-semibold shadow-lg transition-all duration-200 ${
              saving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'gradient-primary hover:shadow-xl transform hover:scale-[1.02]'
            }`}
          >
            {saving ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Update Profile'
            )}
          </button>
        </form>
      </div>
      
      {/* Skills Section - Only for learners */}
      {user?.role === 'learner' && (
        <div className="glass rounded-2xl p-8 shadow-xl border border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">My Skills</h3>
              <p className="text-gray-600 text-sm">Showcase your expertise and proficiency levels</p>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl border border-primary-100">
              <span className="text-primary-700 font-semibold">{skills.length} Skills</span>
            </div>
          </div>
        
        {/* Add New Skill */}
        <div className="mb-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Skill
          </h4>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              name="name"
              value={newSkill.name}
              onChange={handleNewSkillChange}
              placeholder="Skill name (e.g., React, Python)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 hover:border-gray-400 transition-all"
            />
            <select
              name="level"
              value={newSkill.level}
              onChange={handleNewSkillChange}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 hover:border-gray-400 transition-all bg-white"
            >
              <option value="beginner">🌱 Beginner</option>
              <option value="intermediate">🚀 Intermediate</option>
              <option value="advanced">⭐ Advanced</option>
            </select>
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-6 py-3 gradient-primary text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold transform hover:scale-105 whitespace-nowrap"
            >
              Add Skill
            </button>
          </div>
        </div>
        
        {/* Skills List */}
        {skills.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No skills added yet</p>
            <p className="text-gray-400 text-sm mt-1">Add your first skill above to get started!</p>
          </div>
        ) : (
          <div className="grid gap-3 mb-6">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="group flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all duration-200 bg-white"
              >
                <div className="flex items-center flex-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-primary-600 font-bold text-lg">
                      {skill.level === 'beginner' ? '🌱' : skill.level === 'intermediate' ? '🚀' : '⭐'}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900 text-lg">{skill.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={skill.level}
                    onChange={(e) => handleUpdateSkillLevel(index, e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 hover:border-gray-400 transition-all bg-white font-medium"
                  >
                    <option value="beginner">🌱 Beginner</option>
                    <option value="intermediate">🚀 Intermediate</option>
                    <option value="advanced">⭐ Advanced</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(index)}
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {skills.length > 0 && (
          <button
            type="button"
            onClick={handleSaveSkills}
            disabled={saving}
            className={`w-full py-3.5 rounded-xl text-white font-semibold text-lg shadow-lg transition-all duration-200 ${
              saving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'gradient-success hover:shadow-xl transform hover:scale-[1.02]'
            }`}
          >
            {saving ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving Skills...
              </span>
            ) : (
              '💾 Save All Skills'
            )}
          </button>
        )}
      </div>
      )}
      
      {/* Creator-specific section */}
      {user?.role === 'creator' && (
        <div className="glass rounded-2xl p-8 shadow-xl border border-gray-200/50">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white text-3xl mr-4 shadow-lg">
              🎓
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Creator Profile</h3>
              <p className="text-gray-600">Share your knowledge and inspire learners</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">📚</span>
                <h4 className="font-semibold text-gray-900">Course Creation</h4>
              </div>
              <p className="text-sm text-gray-600">Create and manage your educational content</p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">📊</span>
                <h4 className="font-semibold text-gray-900">Analytics</h4>
              </div>
              <p className="text-sm text-gray-600">Track your course performance and engagement</p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">👥</span>
                <h4 className="font-semibold text-gray-900">Student Reach</h4>
              </div>
              <p className="text-sm text-gray-600">Connect with learners worldwide</p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">🏆</span>
                <h4 className="font-semibold text-gray-900">Impact</h4>
              </div>
              <p className="text-sm text-gray-600">Help learners achieve their career goals</p>
            </div>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="text-xl mr-2">💡</span>
              Creator Tips
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span>Keep your courses updated with the latest industry trends</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span>Engage with your students through clear and concise lessons</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span>Use the analytics dashboard to understand learner progress</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span>Publish courses to make them available to all learners</span>
              </li>
            </ul>
          </div>
        </div>
      )}
      
      {/* Admin-specific section */}
      {user?.role === 'admin' && (
        <div className="glass rounded-2xl p-8 shadow-xl border border-gray-200/50">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center text-white text-3xl mr-4 shadow-lg">
              👑
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Administrator Access</h3>
              <p className="text-gray-600">You have full platform management capabilities</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">👥</span>
                <h4 className="font-semibold text-gray-900">User Management</h4>
              </div>
              <p className="text-sm text-gray-600">Manage user accounts, roles, and permissions</p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">📝</span>
                <h4 className="font-semibold text-gray-900">Applications</h4>
              </div>
              <p className="text-sm text-gray-600">Review and approve creator applications</p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">📊</span>
                <h4 className="font-semibold text-gray-900">Analytics</h4>
              </div>
              <p className="text-sm text-gray-600">View platform-wide metrics and insights</p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">📚</span>
                <h4 className="font-semibold text-gray-900">Course Management</h4>
              </div>
              <p className="text-sm text-gray-600">Publish and manage all platform courses</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

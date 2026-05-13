import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    if (!token || !refreshToken) return;

    // Refresh token every 50 minutes (tokens expire in 1 hour)
    const refreshInterval = setInterval(async () => {
      try {
        await refreshAuthToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
        logout();
      }
    }, 50 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [token, refreshToken]);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user: userData, token: accessToken, refreshToken: newRefreshToken } = response;

      // Store in state
      setUser(userData);
      setToken(accessToken);
      setRefreshToken(newRefreshToken);

      // Store in localStorage
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login failed:', error);
      
      // Extract error details from backend response
      const errorData = error.response?.data?.error;
      
      if (errorData && typeof errorData === 'object') {
        // Backend returns structured error: { code, field, message }
        return {
          success: false,
          error: {
            code: errorData.code,
            field: errorData.field,
            message: errorData.message
          }
        };
      } else if (error.response?.data?.message) {
        // Backend returns simple message
        return {
          success: false,
          error: {
            message: error.response.data.message
          }
        };
      } else if (error.message) {
        // Network or other error
        return {
          success: false,
          error: {
            message: error.message === 'Network Error' 
              ? 'Unable to connect to server. Please check your internet connection.' 
              : 'Login failed. Please try again.'
          }
        };
      } else {
        // Fallback error
        return {
          success: false,
          error: {
            message: 'Login failed. Please try again.'
          }
        };
      }
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { user: newUser, token: accessToken, refreshToken: newRefreshToken } = response;

      // Store in state
      setUser(newUser);
      setToken(accessToken);
      setRefreshToken(newRefreshToken);

      // Store in localStorage
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = async () => {
    try {
      if (refreshToken) {
        await authAPI.logout({ refreshToken });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear state
      setUser(null);
      setToken(null);
      setRefreshToken(null);

      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  };

  const refreshAuthToken = async () => {
    try {
      const response = await authAPI.refreshToken({ refreshToken });
      const { token: newToken, refreshToken: newRefreshToken } = response;

      // Update state
      setToken(newToken);
      setRefreshToken(newRefreshToken);

      // Update localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      return newToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshAuthToken,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

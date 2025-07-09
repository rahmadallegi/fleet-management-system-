import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 AuthContext: Checking authentication status...');
      const token = localStorage.getItem('token');
      console.log('🔍 AuthContext: Token found:', token ? 'Yes' : 'No');

      if (!token) {
        console.log('🔍 AuthContext: No token found, user not authenticated');
        setLoading(false);
        return;
      }

      // Remove demo mode - use real authentication only
      console.log('🔍 AuthContext: Verifying token with backend...');

      // Verify token with backend
      const response = await authAPI.getProfile();
      console.log('🔍 AuthContext: Profile response:', response);

      if (response.success) {
        console.log('✅ AuthContext: Token valid, user authenticated');
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        console.log('❌ AuthContext: Token invalid, clearing auth state');
        // Invalid token, remove it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ AuthContext: Auth check failed:', error);
      // Token is invalid, remove it
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('🔐 AuthContext: Starting login process...', credentials);

      // Demo users for different roles
      const demoUsers = {
        'admin@fleet.com': {
          id: '1',
          email: 'admin@fleet.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          password: 'admin123'
        },
        'user@fleet.com': {
          id: '2',
          email: 'user@fleet.com',
          firstName: 'Regular',
          lastName: 'User',
          role: 'user',
          password: 'user123'
        },
        'warehouse@fleet.com': {
          id: '3',
          email: 'warehouse@fleet.com',
          firstName: 'Warehouse',
          lastName: 'Manager',
          role: 'warehouse',
          password: 'warehouse123'
        }
      };

      // Check for demo login first
      const demoUser = demoUsers[credentials.email];
      if (demoUser && demoUser.password === credentials.password) {
        console.log('✅ AuthContext: Demo login successful for role:', demoUser.role);

        const mockToken = `demo_token_${demoUser.role}_${Date.now()}`;
        const userData = {
          id: demoUser.id,
          email: demoUser.email,
          firstName: demoUser.firstName,
          lastName: demoUser.lastName,
          role: demoUser.role
        };

        // Store token and user data
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);

        return { success: true, data: { user: userData, token: mockToken } };
      }

      // Fallback to real API authentication
      console.log('🔐 AuthContext: Calling authAPI.login...');
      const response = await authAPI.login(credentials);
      console.log('🔐 AuthContext: API response received:', response);

      if (response.success) {
        console.log('✅ AuthContext: Login successful, extracting user data...');
        const { token, user } = response.data;

        // Store token
        localStorage.setItem('token', token);
        console.log('✅ AuthContext: Token stored in localStorage');

        // Update state
        setUser(user);
        setIsAuthenticated(true);
        console.log('✅ AuthContext: User state updated, login complete');

        return { success: true, user };
      } else {
        console.log('❌ AuthContext: Login failed:', response.message);
        return {
          success: false,
          message: response.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      console.error('❌ AuthContext: Error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed'
      };
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint (optional)
      await authAPI.logout?.();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear local storage and state
      localStorage.removeItem('token');
      localStorage.removeItem('user'); // Also remove user data
      setUser(null);
      setIsAuthenticated(false);

      console.log('🚪 User logged out - all auth data cleared');
    }
  };

  // Debug function to force clear authentication
  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    console.log('🧹 Authentication data force cleared');
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.data?.success) {
        return { success: true, message: response.data.message };
      } else {
        return { 
          success: false, 
          message: response.data?.message || 'Registration failed' 
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile?.(profileData);
      
      if (response.data?.success) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      } else {
        return { 
          success: false, 
          message: response.data?.message || 'Profile update failed' 
        };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Profile update failed. Please try again.' 
      };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    updateProfile,
    clearAuth, // Debug function
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

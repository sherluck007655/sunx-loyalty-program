import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        userType: action.payload.userType,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        userType: null,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        userType: null,
        error: null,
        loading: false
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  userType: null, // 'installer' or 'admin'
  loading: true, // Start with loading true to check for existing auth
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    const userData = localStorage.getItem('userData');

    if (token && userType && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token, userType }
        });

        // Set token in axios defaults
        authService.setAuthToken(token);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        logout();
      }
    } else {
      // No existing auth found, set loading to false
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Login function
  const login = async (credentials, type = 'installer') => {
    console.log('AuthContext login called with:', credentials, type);
    try {
      dispatch({ type: 'LOGIN_START' });

      let response;
      if (type === 'installer') {
        console.log('Calling authService.loginInstaller...');
        response = await authService.loginInstaller(credentials);
      } else {
        console.log('Calling authService.loginAdmin...');
        response = await authService.loginAdmin(credentials);
      }

      console.log('API response:', response);

      // Check if login was successful
      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }

      const { data } = response;
      if (!data) {
        throw new Error('Invalid response format');
      }

      const user = type === 'installer' ? data.installer : data.admin;
      const { token } = data;

      if (!user || !token) {
        throw new Error('Invalid credentials or missing data');
      }

      console.log('Extracted user and token:', { user, token });

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userType', type);
      localStorage.setItem('userData', JSON.stringify(user));

      // Set token in axios defaults
      authService.setAuthToken(token);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token, userType: type }
      });

      return response;
    } catch (error) {
      console.error('❌ AuthContext login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Invalid username or password';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });
      throw new Error(errorMessage);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: 'LOGIN_START' });

      const response = await authService.registerInstaller(userData);

      // Check if registration was successful
      if (!response.success) {
        throw new Error(response.message || 'Registration failed');
      }

      const { data } = response;
      const { installer, token, requiresApproval } = data;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userType', 'installer');
      localStorage.setItem('userData', JSON.stringify(installer));

      // Set token in axios defaults
      authService.setAuthToken(token);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: installer,
          token,
          userType: 'installer',
          requiresApproval: requiresApproval || false
        }
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    
    // Remove token from axios defaults
    authService.removeAuthToken();

    dispatch({ type: 'LOGOUT' });
  };

  // Update user data
  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData };
    localStorage.setItem('userData', JSON.stringify(updatedUser));
    dispatch({
      type: 'UPDATE_USER',
      payload: userData
    });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Set loading
  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
    setLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

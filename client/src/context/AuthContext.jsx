import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import socketService from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    if (token) {
      setUser({ token });
      socketService.connect();
    }
    setLoading(false);
  }, [token]);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);

      // The API returns: { token: "JWT..." }
      const authToken = response.token;

      if (!authToken) {
        throw new Error("Token missing in API response");
      }

      localStorage.setItem("token", authToken);
      setToken(authToken);
      

      // Set user minimal info
      setUser({ email: credentials.email });

      // Connect socket after login
      socketService.connect();
      // console.log("Login successful, token stored.");

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);

      return {
        success: false,
        message: error.response?.status === 401
          ? "Invalid email or password"
          : "Login failed. Please try again."
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    socketService.disconnect();
  };

  const isAuthenticated = !!token;

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
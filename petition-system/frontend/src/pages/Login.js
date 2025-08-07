import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI, handleAPIError } from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: '',
    code: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    
    if (token && role) {
      // Redirect based on role
      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Login code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await authAPI.login(formData.role, formData.code);
      
      if (response.data.success) {
        const { token, role } = response.data.data;
        
        // Store authentication data
        localStorage.setItem('authToken', token);
        localStorage.setItem('userRole', role);
        
        toast.success(`Welcome! Logged in as ${role}`);
        
        // Redirect based on role
        if (role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = handleAPIError(error);
      if (error.response?.status === 401) {
        setErrors({ code: 'Invalid login code. Please check and try again.' });
      } else {
        toast.error(errorMessage);
      }
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="text-center">
          <div className="bg-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Official Login
          </h2>
          <p className="text-gray-600">
            Sign in to access the petition management system
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Login Form */}
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          {/* Information Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Access Information:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Officials:</strong> Use your assigned login code</li>
                  <li><strong>Administrators:</strong> Use your admin access code</li>
                  <li>Contact IT support if you've forgotten your code</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={`input-field ${errors.role ? 'border-red-500' : ''}`}
              >
                <option value="">Select your role</option>
                <option value="official">Official</option>
                <option value="admin">Administrator</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            {/* Login Code */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Login Code *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className={`input-field pr-10 ${errors.code ? 'border-red-500' : ''}`}
                  placeholder="Enter your login code"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.code && (
                <p className="mt-1 text-sm text-red-600">{errors.code}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Enter the unique code provided by your administrator
              </p>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full btn-primary flex justify-center items-center space-x-2 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                For demonstration purposes:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Official Code:</span>
                  <code className="bg-gray-200 px-2 py-1 rounded text-xs">
                    tgbvfrertyu4820
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Admin Code:</span>
                  <code className="bg-gray-200 px-2 py-1 rounded text-xs">
                    nbcfeodkms934
                  </code>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                In production, these codes should be kept secure and not displayed
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have access?{' '}
            <a href="/" className="text-primary-600 hover:text-primary-700">
              Contact your administrator
            </a>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            <a href="/" className="hover:text-gray-700">
              ← Back to public portal
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, FileText, Search, LogIn, LogOut, BarChart3, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../utils/api';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuthStatus();
  }, [location]);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    
    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      setIsAuthenticated(false);
      setUserRole(null);
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local storage even if API call fails
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      setIsAuthenticated(false);
      setUserRole(null);
      navigate('/');
    }
    setIsMenuOpen(false);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const NavLink = ({ to, children, className = "", onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
        isActivePath(to)
          ? 'bg-primary-100 text-primary-700'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      } ${className}`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">
                  Tenkasi District
                </div>
                <div className="text-sm text-gray-500">
                  Petition System
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Public navigation */}
            <NavLink to="/">Home</NavLink>
            <NavLink to="/submit">
              <div className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>Submit Petition</span>
              </div>
            </NavLink>
            <NavLink to="/track">
              <div className="flex items-center space-x-1">
                <Search className="h-4 w-4" />
                <span>Track Petition</span>
              </div>
            </NavLink>

            {/* Authenticated navigation */}
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard">
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="h-4 w-4" />
                    <span>Dashboard</span>
                  </div>
                </NavLink>
                
                {userRole === 'admin' && (
                  <NavLink to="/admin">
                    <div className="flex items-center space-x-1">
                      <Settings className="h-4 w-4" />
                      <span>Admin</span>
                    </div>
                  </NavLink>
                )}
                
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                  <span className="text-sm text-gray-600">
                    {userRole === 'admin' ? '👨‍💼 Admin' : '👨‍💻 Official'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <NavLink to="/login">
                <div className="flex items-center space-x-1">
                  <LogIn className="h-4 w-4" />
                  <span>Official Login</span>
                </div>
              </NavLink>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900 p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              <NavLink 
                to="/" 
                className="block"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </NavLink>
              
              <NavLink 
                to="/submit" 
                className="block"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Submit Petition</span>
                </div>
              </NavLink>
              
              <NavLink 
                to="/track" 
                className="block"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <span>Track Petition</span>
                </div>
              </NavLink>

              {isAuthenticated ? (
                <>
                  <NavLink 
                    to="/dashboard" 
                    className="block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Dashboard</span>
                    </div>
                  </NavLink>
                  
                  {userRole === 'admin' && (
                    <NavLink 
                      to="/admin" 
                      className="block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>Admin</span>
                      </div>
                    </NavLink>
                  )}
                  
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="px-3 py-2 text-sm text-gray-600">
                      Logged in as {userRole === 'admin' ? 'Admin' : 'Official'}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <NavLink 
                  to="/login" 
                  className="block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <LogIn className="h-4 w-4" />
                    <span>Official Login</span>
                  </div>
                </NavLink>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
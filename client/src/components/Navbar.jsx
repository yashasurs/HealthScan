// filepath: c:\users\anees\OneDrive\Desktop\ProjectSunga\client\src\components\Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Pre-define SVG components to reduce render work
const LogoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  // useEffect(() => {
  //   // Set to true by default for consistent appearance
  //   setScrolled(true);
  // }, []);
  
  // Close mobile menu when changing routes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  
  const handleLogout = () => {
    logout();
    
  };
    const navigationLinks = isAuthenticated 
    ? [
        { name: 'Home', path: '/home' },
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Documents', path: '/documents' },
        { name: 'Collections', path: '/collections' },
      ]
    : [
        { name: 'Home', path: '/' },
        { name: 'Features', path: '/#features' },
        { name: 'About', path: '/#about' },
      ];  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100"
    >      <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
        <div className="flex justify-between h-16">
          {/* Logo and Brand - visible on all screens */}          <div className="flex items-center">            <Link to={isAuthenticated ? "/home" : "/"} className="flex items-center group pl-0 lg:pl-0">
              <img 
                src="/Logo.png" 
                alt="HealthScan Logo" 
                className="h-54 p-2 group-hover:scale-105 transition-transform duration-200" 
              />
            </Link>
              {/* Desktop Navigation - hidden on mobile */}
            <div className="hidden md:flex md:items-center md:space-x-5 ml-8">
              {navigationLinks.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="px-2 py-1 text-sm text-gray-700 hover:text-blue-500 transition-all duration-200 relative group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-200 group-hover:w-full"></span>
                </Link>
              ))}
            </div>
          </div>          {/* Desktop Authentication buttons */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {isAuthenticated ? (
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <div className="text-gray-500 mr-2">
                    <UserIcon />
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-md font-semibold text-red-500 cursor-pointer transition-all duration-200"
                >
                  Log out
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-md font-semibold text-gray-500 hover:text-blue-500 transition-all duration-200"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-md font-semibold text-blue-500 hover:text-blue-600 transition-all duration-200"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>          {/* Mobile menu button - only visible on mobile screens */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-500 hover:text-blue-500 transition-all duration-200"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div></div>
      </div>        {/* Mobile menu - only shown when menu is opened and hidden on desktop */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-4 py-3 bg-white/95 backdrop-blur-md border-t border-gray-100">          <div className="space-y-4">
            {navigationLinks.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="block py-2 text-base text-gray-700 hover:text-blue-500 transition-all duration-200"
              >
                {item.name}
              </Link>
            ))}
          </div>{/* Authentication in mobile menu */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="text-gray-500 mr-2">
                    <UserIcon />
                  </div>
                  <span className="text-gray-600">
                    {user?.username || 'User'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-gray-500 hover:text-blue-500 transition-all duration-200"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <Link
                  to="/login"
                  className="block py-2 text-gray-500 hover:text-blue-500 transition-all duration-200"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="block py-2 text-blue-500 hover:text-blue-600 transition-all duration-200"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
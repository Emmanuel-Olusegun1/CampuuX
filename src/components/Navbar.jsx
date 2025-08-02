import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation(); // Get current URL path

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-black text-white sticky top-0 z-50 border-b border-gray-800 backdrop-blur-sm bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <img
                src="https://res.cloudinary.com/dzibfknxq/image/upload/v1752874856/campus_logo-removebg-preview_1_zuoahf.png"
                alt="CampuusX Logo"
                className="h-12 w-12 mr-1 transition-transform duration-300 group-hover:scale-110"
              />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r  from-green-400 to-green-600 transition-all duration-300">
            CampuusX
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" currentPath={location.pathname}>Home</NavLink>
            <NavLink to="/resources" currentPath={location.pathname}>Resources</NavLink>
            <NavLink to="/jobs" currentPath={location.pathname}>Jobs</NavLink>
            <NavLink to="/scholarships" currentPath={location.pathname}>Scholarships</NavLink>
            <NavLink to="/request_resource" currentPath={location.pathname}>
              <span className="flex items-center gap-1">
              Request<RequestIcon />
              </span>
            </NavLink>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMobileMenu}
              className="hover:cursor-pointer inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <MobileNavLink to="/" currentPath={location.pathname}>Home</MobileNavLink>
          <MobileNavLink to="/resources" currentPath={location.pathname}>Resources</MobileNavLink>
          <MobileNavLink to="/jobs" currentPath={location.pathname}>Jobs</MobileNavLink>
          <MobileNavLink to="/scholarships" currentPath={location.pathname}>Scholarshipss</MobileNavLink>
          <MobileNavLink to="/request_resource" currentPath={location.pathname} className="border-2 border-green-600 hover:bg-green-600 text-white">
            <span className="flex items-center gap-1">
              Request <RequestIcon />
            </span>
          </MobileNavLink>
        </div>
      </div>
    </nav>
  );
}

// Reusable NavLink component for desktop
const NavLink = ({ to, children, currentPath }) => (
  <Link 
    to={to} 
    className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
      currentPath === to ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-green-400'
    }`}
  >
    {children}
  </Link>
);

// Reusable NavLink component for mobile
const MobileNavLink = ({ to, children, className = "", currentPath }) => (
  <Link 
    to={to} 
    className={`block px-3 py-2 rounded-md text-base font-medium ${
      currentPath === to ? 'bg-green-600 text-white' : (className || "text-gray-300 hover:bg-gray-800 hover:text-green-400")
    }`}
  >
    {children}
  </Link>
);

// Request icon component
const RequestIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export default Navbar;
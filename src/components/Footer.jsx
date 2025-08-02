import { useState } from "react";
import { Link } from "react-router-dom";
import { FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";

function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      // Replace with your Google Apps Script URL
      await fetch("https://script.google.com/macros/s/AKfycbzdGXf2Ze2AMEt7b4Pqd7jecwxg7FC533vRFjkzHa1LvYNnpPSsL2QzZk-m-Mhvf1r-/exec", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email,
          sheetUrl: "https://docs.google.com/spreadsheets/d/10iLlYOaWTOh5VnEaL81uEsdecPHy22lVQuQw63LQ0o0/edit" 
        }),
      });

      setStatus("success");
      setEmail("");
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <footer className="bg-black text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
                CampuusX
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              The open platform for students to find and share academic resources, opportunities, and jobs.
            </p>
            
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-green-600 hover:text-white transition-all duration-300">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-green-600 hover:text-white transition-all duration-300">
                <FaInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-green-600 hover:text-white transition-all duration-300">
                <FaLinkedin className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-green-600 hover:text-white transition-all duration-300">
                <FaEnvelope className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Explore</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/resources" className="text-gray-400 hover:text-green-400 transition-colors duration-300 flex items-center group">
                  <span className="w-1 h-1 bg-green-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Resources
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="text-gray-400 hover:text-green-400 transition-colors duration-300 flex items-center group">
                  <span className="w-1 h-1 bg-green-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Job Board
                </Link>
              </li>
              <li>
                <Link to="/scholarships" className="text-gray-400 hover:text-green-400 transition-colors duration-300 flex items-center group">
                  <span className="w-1 h-1 bg-green-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Scholarships
                </Link>
              </li>
              <li>
                <Link to="/share" className="text-gray-400 hover:text-green-400 transition-colors duration-300 flex items-center group">
                  <span className="w-1 h-1 bg-green-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Share Content
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                <span className="ml-3 text-gray-400">Lagos, Nigeria</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="flex-shrink-0 h-5 w-5 text-green-500" />
                <a href="mailto:contact@campuusx.com" className="ml-3 text-gray-400 hover:text-green-400 transition-colors duration-300">
                  contact@campuusx.com
                </a>
              </li>
              <li className="flex items-center">
                <FaPhoneAlt className="flex-shrink-0 h-5 w-5 text-green-500" />
                <a href="tel:+2349034010384" className="ml-3 text-gray-400 hover:text-green-400 transition-colors duration-300">
                  +234 9034010384
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter with Google Sheets Integration */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Stay Updated</h3>
            <p className="text-gray-400 mb-4">
              Get notified about new resources and opportunities
            </p>
            
            {status === "success" ? (
              <div className="p-3 bg-green-900/30 text-green-400 rounded-lg">
                Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-500 transition-all"
                  required
                />
                {status === "error" && (
                  <p className="text-red-400 text-sm">Failed to subscribe. Please try again.</p>
                )}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className={` cursor-pointer w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-medium py-3 px-6 rounded-lg shadow-lg transition-all duration-300 ${
                    status === "loading" ? "opacity-75 cursor-not-allowed" : "hover:from-green-600 hover:to-green-700 hover:shadow-green-500/20"
                  }`}
                >
                  {status === "loading" ? "Subscribing..." : "Subscribe"}
                </button>
                <p className="text-xs text-gray-500">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800 my-12"></div>

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} CampuusX. All rights reserved.
          </p>
          
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-500 hover:text-green-400 text-sm transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-green-400 text-sm transition-colors duration-300">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-gray-500 hover:text-green-400 text-sm transition-colors duration-300">
              Cookie Policy
            </Link>
          </div>
          
          <p className="text-gray-500 text-sm">
            Designed and Developed by <a className="hover:text-green-500" target="_blank" rel="noopener noreferrer" href='https://algoritic.com.ng'>Algoritic Inc.</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaBriefcase, FaMapPin, FaDollarSign, FaClock, FaFilter, FaExternalLinkAlt, FaTimes } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';

// Helper function to format relative time
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

function Jobs() {
  const [filters, setFilters] = useState({
    type: '',
    location: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch jobs from Supabase
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        let query = supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;
        setJobs(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleViewMore = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const filteredJobs = jobs.filter(job => {
    return (
      (filters.type === '' || job.type === filters.type) &&
      (filters.location === '' || job.location.includes(filters.location)) &&
      (searchQuery === '' || 
       job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       job.company.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <div className="flex justify-between items-center">
            <p>{error}</p>
            <button onClick={() => setError(null)}>
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      <main className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-6 md:p-8 text-white mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
            Find Your Dream Job
            </h1>
            <p className="text-lg md:text-xl text-gray-100">
            Discover opportunities from top companies looking for talented students and graduates.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-gray-200 hover:border-green-500 transition-all duration-300">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <input 
                type="text" 
                placeholder="Search for jobs or companies..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2 flex-grow">
                <FaBriefcase className="text-gray-500 mr-2" />
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="bg-transparent w-full focus:outline-none text-gray-700"
                >
                  <option value="">All Job Types</option>
                  <option value="Internship">Internship</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                </select>
              </div>
              <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2 flex-grow">
                <FaMapPin className="text-gray-500 mr-2" />
                <select
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  className="bg-transparent w-full focus:outline-none text-gray-700"
                >
                  <option value="">All Locations</option>
                  <option value="Lagos">Remote</option>
                  <option value="Abuja">On Site</option>
                  <option value="Remote">Hybrid</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          )}

          {/* Job Listings */}
          {!isLoading && (
            <div className="space-y-6">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, index) => (
                  <div 
                    key={job.id} 
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:border-green-500 hover:shadow-xl transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="mb-4 md:mb-0">
                        <h2 className="text-xl font-semibold text-black hover:text-green-600 transition-colors">
                          <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                        </h2>
                        <p className="text-gray-600">{job.company}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {job.type}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {job.location}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <FaDollarSign className="mr-1" />
                        <span>{job.salary}</span>
                      </div>
                      <div className="flex items-center">
                        <FaClock className="mr-1" />
                        <span>{formatRelativeTime(job.created_at)}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-gray-700 mb-2">{job.description}</p>
                      {job.requirements && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {job.requirements.split(',').slice(0, 3).map((req, index) => (
                            <span key={index} className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-700">
                              {req.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                      {job.url && (
                        <Button
                          onClick={() => handleViewMore(job.url)}
                          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:shadow-2xl hover:scale-105"
                        >
                          <FaExternalLinkAlt />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                !isLoading && (
                  <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-200 animate-fade-in">
                    <h3 className="text-lg font-semibold text-black mb-2">No jobs found</h3>
                    <p className="text-gray-600">Try adjusting your search or filters</p>
                  </div>
                )
              )}
            </div>
          )}

          
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Jobs;
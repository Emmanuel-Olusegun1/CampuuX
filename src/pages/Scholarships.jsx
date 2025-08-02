import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFilter, FaArrowRight, FaCalendarAlt, FaCheck, FaTimesCircle } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';

function Scholarships() {
  const [filters, setFilters] = useState({ type: '', field: '' });
  const [scholarships, setScholarships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Field options for scholarships
  const fieldOptions = ['All Fields', 'STEM', 'Engineering', 'Business', 'Medicine', 'Arts'];
  
  // Type options for scholarships
  const typeOptions = ['All Types', 'Merit-Based', 'Need-Based', 'Athletic', 'Minority'];

  // Fetch scholarships from Supabase
  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('scholarships')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setScholarships(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScholarships();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApply = (scholarshipId) => {
    // TODO: Implement backend for application tracking
    console.log('Apply to scholarship:', scholarshipId);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    return status === 'Open' ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <FaCheck className="mr-1" /> Open
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <FaTimesCircle className="mr-1" /> Closed
      </span>
    );
  };

  const filteredScholarships = scholarships.filter(scholarship => {
    return (
      (filters.type === '' || filters.type === 'All Types' || scholarship.type === filters.type) &&
      (filters.field === '' || filters.field === 'All Fields' || scholarship.field === filters.field)
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
              <FaTimesCircle />
            </button>
          </div>
        </div>
      )}

      <main className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-6 md:p-8 text-white mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
            Scholarship Opportunities
            </h1>
            <p className="text-lg md:text-xl text-gray-100">
            Discover financial support for your academic journey without any login required.
            </p>
          </div>

          {/* Filter Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-gray-200 hover:border-green-500 transition-all duration-300 animate-slide-up">
            <h3 className="text-2xl font-semibold text-black mb-6">Find Your Scholarship</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scholarship Type</label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
                >
                  {typeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                <select
                  name="field"
                  value={filters.field}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
                >
                  {fieldOptions.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={() => setFilters({ type: 'All Types', field: 'All Fields' })}
                  className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg transition-all duration-300"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Scholarship Cards */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredScholarships.map((scholarship, index) => (
                <div 
                  key={scholarship.id} 
                  className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:border-green-500 hover:shadow-xl transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-black">{scholarship.name}</h3>
                    <div className="flex space-x-2">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {scholarship.field}
                      </span>
                      {renderStatusBadge(scholarship.status)}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{scholarship.description}</p>
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <p className="text-sm text-gray-500">Provider</p>
                      <p className="font-medium text-gray-900">{scholarship.provider}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="font-medium text-green-600">{scholarship.amount_currency} {scholarship.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Deadline</p>
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-1 text-gray-400" />
                        <p className="font-medium text-gray-900">{formatDate(scholarship.deadline)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium text-gray-900">{scholarship.type}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    {scholarship.url ? (
                      <a
                        href={scholarship.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:shadow-2xl hover:scale-105"
                        onClick={() => handleApply(scholarship.id)}
                      >
                        Apply Now <FaArrowRight className="ml-2" />
                      </a>
                    ) : (
                      <Link
                        to={`/scholarships/${scholarship.id}`}
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:shadow-2xl hover:scale-105"
                        onClick={() => handleApply(scholarship.id)}
                      >
                        View Details <FaArrowRight className="ml-2" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && filteredScholarships.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-200 animate-fade-in">
              <h3 className="text-lg font-semibold text-black mb-2">No scholarships found</h3>
              <p className="text-gray-600">Try adjusting your filters or check back later</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Scholarships;
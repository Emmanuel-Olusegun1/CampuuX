import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSearch, FaUpload, FaBook, FaQuestionCircle, FaGraduationCap, 
  FaFilter, FaFileAlt, FaTimes, FaArrowRight, FaCalendarAlt, FaCheck,
  FaUser, FaExclamationCircle, FaCheckCircle, FaClock
} from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';

function Requests() {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'past_questions',
    requested_by_text: ''
  });

  // Categories for requests
  const categories = [
    { id: 'all', name: 'All', icon: FaFilter },
    { id: 'past_questions', name: 'Past Questions', icon: FaQuestionCircle },
    { id: 'e_books', name: 'E-Books', icon: FaBook },
    { id: 'courses', name: 'Courses', icon: FaGraduationCap },
    { id: 'lecture_notes', name: 'Lecture Notes', icon: FaFileAlt }
  ];

  // Category display names and colors
  const categoryNames = {
    past_questions: 'Past Questions',
    e_books: 'E-Books',
    courses: 'Courses',
    lecture_notes: 'Lecture Notes'
  };

  const categoryColors = {
    past_questions: 'bg-blue-100 text-blue-800',
    e_books: 'bg-purple-100 text-purple-800',
    courses: 'bg-amber-100 text-amber-800',
    lecture_notes: 'bg-emerald-100 text-emerald-800'
  };

  // Status display names and colors
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    fulfilled: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800'
  };

  const statusIcons = {
    pending: FaClock,
    fulfilled: FaCheckCircle,
    in_progress: FaExclamationCircle
  };

  // Fetch requests from Supabase
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        let query = supabase
          .from('requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (selectedCategory !== 'all') {
          query = query.eq('category', selectedCategory);
        }

        if (searchQuery) {
          query = query.ilike('title', `%${searchQuery}%`);
        }

        const { data, error } = await query;

        if (error) throw error;
        setRequests(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [searchQuery, selectedCategory]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Prepare request data
      const requestData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        requested_by_text: formData.requested_by_text || 'Anonymous',
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Insert into requests table
      const { error } = await supabase
        .from('requests')
        .insert([requestData]);

      if (error) throw error;

      // Refresh requests list
      const { data } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      setRequests(data || []);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'past_questions',
        requested_by_text: ''
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Truncate text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

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
              Resource Requests
            </h1>
            <p className="text-lg md:text-xl text-gray-100">
              Request educational materials you need from the community.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input 
                type="text" 
                placeholder="Search requests..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow px-4 py-2 md:py-3 rounded-lg border focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`cursor-pointer flex items-center px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm rounded-full ${
                    selectedCategory === category.id 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <category.icon className="mr-1 md:mr-2 w-3 h-3 md:w-4 md:h-4" />
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Request Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Make a Request</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title*</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., CS101 Past Questions 2023"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category*</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    {categories.filter(c => c.id !== 'all').map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description*</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what you're looking for in detail"
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name (Optional)</label>
                <input
                  type="text"
                  name="requested_by_text"
                  value={formData.requested_by_text}
                  onChange={handleInputChange}
                  placeholder="How you want to be credited"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading || !formData.title || !formData.description}
                  className="px-6 py-3 bg-green-600 text-white hover:bg-green-700 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </div>

          {/* Requests Grid */}
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Recent Requests</h2>
              <div className="text-sm text-gray-500">
                {requests.length} request{requests.length !== 1 ? 's' : ''} found
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : requests.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {requests.map(item => {
                  const StatusIcon = statusIcons[item.status] || FaClock;
                  const categoryIcon = categories.find(cat => cat.id === item.category)?.icon || FaQuestionCircle;
                  
                  return (
                    <div 
                      key={item.id} 
                      className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                    >
                      {/* Card Header */}
                      <div className={`px-4 py-3 ${categoryColors[item.category]} border-b`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <categoryIcon className="mr-2" />
                            <span className="text-xs font-semibold uppercase tracking-wide">
                              {categoryNames[item.category]}
                            </span>
                          </div>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusColors[item.status]}`}>
                            <StatusIcon className="mr-1" />
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 md:p-5">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {truncateText(item.description, 120)}
                        </p>

                        {/* Requestor Info */}
                        <div className="flex items-center mb-4">
                          <FaUser className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-700">
                            {item.requested_by_text || 'Anonymous'}
                          </span>
                        </div>

                        {/* Date and Stats */}
                        <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-1" />
                            <span>{formatDate(item.created_at)}</span>
                          </div>
                          {item.upvotes > 0 && (
                            <div className="flex items-center">
                              <span className="text-green-600 font-semibold">+{item.upvotes} upvotes</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-4">
                          <button className="flex-1 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors">
                            Upvote Request
                          </button>
                          <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors">
                            Fulfill Request
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FaQuestionCircle className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No requests found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filter' 
                    : 'Be the first to make a request!'}
                </p>
                <Button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  Make a Request
                </Button>
              </div>
            )}
          </div>

          {/* Call to Action Section */}
          <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl mt-8 p-8 md:p-10 text-center text-white">
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-center mb-4">
                <FaCheckCircle className="text-white text-4xl" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Help Fulfill Requests
              </h3>
              <p className="text-lg md:text-xl text-green-100 mb-6">
                Browse through requests and share resources you have to help fellow students.
              </p>
              <div className="flex justify-center gap-4">
                <Link 
                  to="/resources" 
                  className="inline-block bg-white text-green-600 hover:bg-green-50 font-medium px-8 py-3 rounded-lg transition-all duration-200 shadow-lg"
                >
                  Browse Resources
                </Link>
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="inline-block bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-600 font-medium px-8 py-3 rounded-lg transition-all duration-200"
                >
                  Make Another Request
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Requests;
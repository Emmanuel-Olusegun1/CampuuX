import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSearch, FaUpload, FaBook, FaQuestionCircle, FaGraduationCap, 
  FaFilter, FaFileAlt, FaTimes, FaArrowRight, FaCalendarAlt, FaCheck
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
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter requests
  const filteredRequests = requests.filter(item =>
    (selectedCategory === 'all' || item.category === selectedCategory) &&
    (searchQuery === '' || item.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
          <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-8 text-white mb-8">
            <h1 className="text-4xl font-extrabold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">Resource Requests</span>
            </h1>
            <p className="text-xl text-gray-100 max-w-3xl mx-auto">
              Request educational materials you need from the community.
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                placeholder="Search requests..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow px-6 py-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Request Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200 hover:border-green-500 transition-all duration-300">
            <h2 className="text-2xl font-semibold text-black mb-6">Make a Request</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title*</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., CS101 Past Questions 2023"
                  className="mt-1 block w-full border border-gray-300 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description*</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what you're looking for"
                  rows="4"
                  className="mt-1 block w-full border border-gray-300 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category*</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm"
                  required
                >
                  {categories.filter(c => c.id !== 'all').map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Your Name (Optional)</label>
                <input
                  type="text"
                  name="requested_by_text"
                  value={formData.requested_by_text}
                  onChange={handleInputChange}
                  placeholder="How you want to be credited"
                  className="mt-1 block w-full border border-gray-300 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 disabled:opacity-70"
                >
                  {isLoading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </div>

          {/* Requests List */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:border-green-500 transition-all duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-black">Recent Requests</h2>
              <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center px-4 py-2 text-sm rounded-full ${selectedCategory === category.id ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <category.icon className="mr-2" />
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map(item => {
                    const IconComponent = categories.find(cat => cat.id === item.category)?.icon || FaQuestionCircle;
                    return (
                      <div key={item.id} className="flex items-start p-4 border border-gray-200 rounded-xl hover:border-green-500 hover:shadow-lg transition-all duration-300">
                        <IconComponent className="flex-shrink-0 w-6 h-6 text-green-600 mr-4 mt-1" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === 'fulfilled' ? 'bg-green-100 text-green-800' :
                              item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.status}
                            </span>
                            <p className="text-xs text-gray-500">
                              Requested {formatDate(item.created_at)}
                              {item.requested_by_text && ` by ${item.requested_by_text}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-600 text-center">No requests found. Be the first to make a request!</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Requests;
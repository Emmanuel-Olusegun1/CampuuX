import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSearch, FaUpload, FaBook, FaQuestionCircle, FaGraduationCap, 
  FaFilter, FaFileAlt, FaTimes, FaCalendarAlt, FaCheck,
  FaUser, FaExclamationCircle, FaCheckCircle, FaClock, FaThumbsUp,
  FaShare, FaChevronUp, FaFire, FaThumbtack, FaCopy, FaSort,
  FaExternalLinkAlt, FaEye, FaComment
} from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';

function Requests() {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [requests, setRequests] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'past_questions',
    requested_by_text: ''
  });

  // Categories for requests
  const categories = [
    { id: 'all', name: 'All', icon: FaFilter, color: 'gray' },
    { id: 'past_questions', name: 'Past Questions', icon: FaQuestionCircle, color: 'green' },
    { id: 'e_books', name: 'E-Books', icon: FaBook, color: 'purple' },
    { id: 'courses', name: 'Courses', icon: FaGraduationCap, color: 'amber' },
    { id: 'lecture_notes', name: 'Lecture Notes', icon: FaFileAlt, color: 'emerald' }
  ];

  // Status options
  const statusOptions = [
    { id: 'all', name: 'All', color: 'gray' },
    { id: 'pending', name: 'Pending', color: 'yellow' },
    { id: 'in_progress', name: 'In Progress', color: 'green' },
    { id: 'fulfilled', name: 'Fulfilled', color: 'green' }
  ];

  // Sort options
  const sortOptions = [
    { id: 'newest', name: 'Newest', icon: FaCalendarAlt },
    { id: 'popular', name: 'Most Popular', icon: FaFire },
    { id: 'upvotes', name: 'Most Upvotes', icon: FaThumbsUp }
  ];

  // Category colors and icons
  const categoryColors = {
    past_questions: 'bg-green-50 text-green-700 border-green-200',
    e_books: 'bg-purple-50 text-purple-700 border-purple-200',
    courses: 'bg-amber-50 text-amber-700 border-amber-200',
    lecture_notes: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  const categoryIcons = {
    past_questions: FaQuestionCircle,
    e_books: FaBook,
    courses: FaGraduationCap,
    lecture_notes: FaFileAlt
  };

  // Status colors and icons
  const statusColors = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    fulfilled: 'bg-green-50 text-green-700 border-green-200',
    in_progress: 'bg-green-50 text-green-700 border-green-200'
  };

  const statusIcons = {
    pending: FaClock,
    fulfilled: FaCheckCircle,
    in_progress: FaExclamationCircle
  };

  // Fetch requests from Supabase
  useEffect(() => {
    fetchRequests();
  }, [searchQuery, selectedCategory, selectedStatus, sortBy]);

  // Fetch requests from Supabase
  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('requests')
        .select('*');

      // Apply filters
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popular':
          query = query.order('upvotes', { ascending: false });
          break;
        case 'upvotes':
          query = query.order('upvotes', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare request data
      const requestData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        requested_by_text: formData.requested_by_text || 'Anonymous',
        status: 'pending',
        upvotes: 0,
        created_at: new Date().toISOString()
      };

      // Insert into requests table
      const { error } = await supabase
        .from('requests')
        .insert([requestData]);

      if (error) throw error;

      // Refresh requests list
      await fetchRequests();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'past_questions',
        requested_by_text: ''
      });

      setSuccess('🎉 Request submitted successfully!');
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      setError(err.message || 'Failed to submit request');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle upvote (no authentication required)
  const handleUpvote = async (requestId, currentUpvotes) => {
    try {
      // Get existing upvotes from localStorage
      const upvotedRequests = JSON.parse(localStorage.getItem('upvotedRequests') || '[]');
      
      // Check if already upvoted
      if (upvotedRequests.includes(requestId)) {
        // Remove upvote
        const newUpvotes = currentUpvotes - 1;
        await supabase
          .from('requests')
          .update({ upvotes: newUpvotes })
          .eq('id', requestId);

        // Remove from localStorage
        const updatedVotes = upvotedRequests.filter(id => id !== requestId);
        localStorage.setItem('upvotedRequests', JSON.stringify(updatedVotes));
      } else {
        // Add upvote
        const newUpvotes = currentUpvotes + 1;
        await supabase
          .from('requests')
          .update({ upvotes: newUpvotes })
          .eq('id', requestId);

        // Add to localStorage
        upvotedRequests.push(requestId);
        localStorage.setItem('upvotedRequests', JSON.stringify(upvotedRequests));
      }

      // Refresh requests
      await fetchRequests();

    } catch (err) {
      setError('Failed to upvote');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Handle fulfill request (no authentication required)
  const handleFulfillRequest = async (requestId) => {
    try {
      // Mark request as fulfilled
      const { error } = await supabase
        .from('requests')
        .update({ 
          status: 'fulfilled',
          fulfilled_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      // Refresh requests
      await fetchRequests();
      
      setSuccess('✅ Request marked as fulfilled!');
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      setError('Failed to mark as fulfilled');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Handle share request
  const handleShareRequest = async (request) => {
    try {
      const shareText = `Check out this resource request: "${request.title}"\n\n${request.description?.substring(0, 100)}...`;
      const shareUrl = `${window.location.origin}/requests`;
      
      if (navigator.share) {
        await navigator.share({
          title: `Request: ${request.title}`,
          text: shareText,
          url: shareUrl,
        });
        setSuccess('📤 Shared successfully!');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareText}\n\nView at: ${shareUrl}`);
        setSuccess('📋 Link copied to clipboard!');
      }
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    }
  };

  // Handle copy link
  const handleCopyLink = async (requestId) => {
    const link = `${window.location.origin}/requests#request-${requestId}`;
    await navigator.clipboard.writeText(link);
    setSuccess('🔗 Link copied to clipboard!');
    setTimeout(() => setSuccess(null), 2000);
  };

  // Check if request is upvoted (from localStorage)
  const isRequestUpvoted = (requestId) => {
    const upvotedRequests = JSON.parse(localStorage.getItem('upvotedRequests') || '[]');
    return upvotedRequests.includes(requestId);
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

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  // Truncate text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      {/* Success Toast */}
      {success && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <FaCheckCircle />
            <span>{success}</span>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
          <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <FaExclamationCircle />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-4">
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      <main className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 md:p-8 text-white mb-8 shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Resource Requests</h1>
                <p className="text-lg text-green-100 opacity-90">
                  Need academic materials? Request them here from the community. No login required!
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  {requests.length} total requests
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  {requests.filter(r => r.status === 'fulfilled').length} fulfilled
                </span>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search requests by title or description..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                {/* Category Filter */}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                    <FaFilter />
                    <span>Category</span>
                    <FaChevronUp className="text-xs" />
                  </button>
                  <div className="absolute hidden group-hover:block mt-1 bg-white shadow-lg rounded-lg p-2 min-w-[200px] z-10">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded text-sm ${
                          selectedCategory === category.id
                            ? 'bg-green-50 text-green-700'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                    <FaCheckCircle />
                    <span>Status</span>
                    <FaChevronUp className="text-xs" />
                  </button>
                  <div className="absolute hidden group-hover:block mt-1 bg-white shadow-lg rounded-lg p-2 min-w-[150px] z-10">
                    {statusOptions.map(status => (
                      <button
                        key={status.id}
                        onClick={() => setSelectedStatus(status.id)}
                        className={`w-full text-left px-3 py-2 rounded text-sm ${
                          selectedStatus === status.id
                            ? 'bg-green-50 text-green-700'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {status.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Filter */}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                    <FaSort />
                    <span>Sort</span>
                    <FaChevronUp className="text-xs" />
                  </button>
                  <div className="absolute hidden group-hover:block mt-1 bg-white shadow-lg rounded-lg p-2 min-w-[150px] z-10">
                    {sortOptions.map(option => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() => setSortBy(option.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm ${
                            sortBy === option.id
                              ? 'bg-green-50 text-green-700'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <Icon />
                          {option.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clear Filters Button */}
                {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Active Filters Display */}
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                  Category: {categories.find(c => c.id === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory('all')} className="ml-1">
                    <FaTimes className="text-xs" />
                  </button>
                </span>
              )}
              {selectedStatus !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                  Status: {statusOptions.find(s => s.id === selectedStatus)?.name}
                  <button onClick={() => setSelectedStatus('all')} className="ml-1">
                    <FaTimes className="text-xs" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="ml-1">
                    <FaTimes className="text-xs" />
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* Request Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-xl">
                <FaUpload className="text-green-600 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Make a Request</h2>
                <p className="text-gray-600 text-sm">What academic resource do you need? No login required.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., CS101 Past Questions 2023"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    {categories.filter(c => c.id !== 'all').map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what you're looking for in detail. Be specific about course code, year, author, etc."
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  name="requested_by_text"
                  value={formData.requested_by_text}
                  onChange={handleInputChange}
                  placeholder="How you want to be credited. Leave blank for anonymous."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isLoading || !formData.title || !formData.description}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Requests Grid */}
          <div id="requests-grid" className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Recent Requests</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Showing {requests.length} request{requests.length !== 1 ? 's' : ''}
                  {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
                  {selectedStatus !== 'all' && ` • ${statusOptions.find(s => s.id === selectedStatus)?.name}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                  <FaThumbsUp className="text-green-500" />
                  <span>{requests.reduce((sum, req) => sum + (req.upvotes || 0), 0)} total upvotes</span>
                </div>
                <div className="text-sm text-gray-500">
                  Sorted by {sortOptions.find(s => s.id === sortBy)?.name.toLowerCase()}
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
                <p className="text-gray-600">Loading requests...</p>
              </div>
            ) : requests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {requests.map(item => {
                  const CategoryIcon = categoryIcons[item.category] || FaQuestionCircle;
                  const StatusIcon = statusIcons[item.status] || FaClock;
                  const hasUpvoted = isRequestUpvoted(item.id);
                  
                  return (
                    <div 
                      key={item.id} 
                      className="bg-white border border-gray-200 rounded-xl p-5 hover:border-green-300 hover:shadow-md transition-all duration-300 flex flex-col h-full"
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${categoryColors[item.category]}`}>
                            <CategoryIcon className="text-lg" />
                          </div>
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                            <StatusIcon className="text-xs" />
                            <span>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCopyLink(item.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Copy link"
                        >
                          <FaCopy />
                        </button>
                      </div>

                      {/* Title & Description */}
                      <div className="flex-grow">
                        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {truncateText(item.description, 120)}
                        </p>
                      </div>

                      {/* Requestor & Time */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-gray-100 rounded-full">
                            <FaUser className="text-gray-400 text-sm" />
                          </div>
                          <span className="text-sm text-gray-700">
                            {item.requested_by_text || 'Anonymous'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500" title={formatDate(item.created_at)}>
                          {formatRelativeTime(item.created_at)}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4 border-t">
                        {/* Upvote Button */}
                        <button
                          onClick={() => handleUpvote(item.id, item.upvotes || 0)}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                            hasUpvoted
                              ? 'bg-green-100 text-green-700 border border-green-300'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          <FaThumbsUp className={hasUpvoted ? 'text-green-500' : ''} />
                          <span>Upvote</span>
                          <span className="font-semibold">{item.upvotes || 0}</span>
                        </button>

                        {/* Fulfill Button */}
                        <button
                          onClick={() => handleFulfillRequest(item.id)}
                          disabled={item.status === 'fulfilled'}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                            item.status === 'fulfilled'
                              ? 'bg-green-100 text-green-700 border border-green-300 cursor-default'
                              : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                          }`}
                        >
                          <FaCheck />
                          <span>{item.status === 'fulfilled' ? 'Fulfilled' : 'Fulfill'}</span>
                        </button>

                        {/* Share Button */}
                        <button
                          onClick={() => handleShareRequest(item)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200 transition-all duration-200"
                        >
                          <FaShare />
                          <span className="hidden sm:inline">Share</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FaQuestionCircle className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No requests found</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                    ? 'Try adjusting your filters or search terms'
                    : 'Be the first to make a request!'}
                </p>
                <Button
                  onClick={clearFilters}
                  className="bg-green-500 text-white hover:bg-green-600"
                >
                  {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                    ? 'Clear Filters'
                    : 'Make First Request'}
                </Button>
              </div>
            )}
          </div>

          {/* Stats Summary */}
          {requests.length > 0 && (
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm border text-center">
                <div className="text-2xl font-bold text-green-600">{requests.length}</div>
                <div className="text-sm text-gray-600">Total Requests</div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border text-center">
                <div className="text-2xl font-bold text-green-600">
                  {requests.filter(r => r.status === 'fulfilled').length}
                </div>
                <div className="text-sm text-gray-600">Fulfilled</div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border text-center">
                <div className="text-2xl font-bold text-green-600">
                  {requests.reduce((sum, req) => sum + (req.upvotes || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Total Upvotes</div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(requests.filter(r => r.status === 'fulfilled').length / Math.max(requests.length, 1) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Fulfillment Rate</div>
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-8 bg-gradient-to-r from-emerald-600 to-green-500 rounded-2xl p-8 text-center text-white">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Help Fulfill Requests</h3>
              <p className="text-lg mb-6 opacity-90">
                Browse through requests and help fellow students by sharing your academic materials.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/resources" 
                  className="inline-block bg-white text-green-600 hover:bg-green-50 font-medium px-8 py-3 rounded-xl transition-all duration-200 shadow-lg"
                >
                  Browse Resources
                </Link>
                <button 
                  onClick={() => document.querySelector('#requests-grid').scrollIntoView({ behavior: 'smooth' })}
                  className="inline-block bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-600 font-medium px-8 py-3 rounded-xl transition-all duration-200 cursor-pointer"
                >
                  View All Requests
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
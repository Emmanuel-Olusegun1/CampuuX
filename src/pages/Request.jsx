import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSearch, FaUpload, FaBook, FaQuestionCircle, FaGraduationCap, 
  FaFilter, FaFileAlt, FaTimes, FaCalendarAlt, FaCheck,
  FaUser, FaExclamationCircle, FaCheckCircle, FaClock, FaThumbsUp,
  FaShare, FaFire, FaCopy, FaSort, FaEye, FaStar, FaLightbulb,
  FaRegHeart, FaHeart, FaRocket, FaUsers, FaChartLine, FaMagic,
  FaPlus, FaList, FaBolt, FaArrowUp, FaSeedling, FaHandsHelping,
  FaRegStar, FaRegBookmark, FaBookmark
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
  const [viewMode, setViewMode] = useState('grid');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'past_questions',
    requested_by_text: ''
  });

  // Categories for requests
  const categories = [
    { id: 'all', name: 'All', icon: FaList, color: 'gray', bgColor: 'bg-gray-100' },
    { id: 'past_questions', name: 'Past Questions', icon: FaQuestionCircle, color: 'emerald', bgColor: 'bg-emerald-100' },
    { id: 'e_books', name: 'E-Books', icon: FaBook, color: 'violet', bgColor: 'bg-violet-100' },
    { id: 'courses', name: 'Courses', icon: FaGraduationCap, color: 'amber', bgColor: 'bg-amber-100' },
    { id: 'lecture_notes', name: 'Lecture Notes', icon: FaFileAlt, color: 'blue', bgColor: 'bg-blue-100' }
  ];

  // Status options
  const statusOptions = [
    { id: 'all', name: 'All', icon: FaList, color: 'gray' },
    { id: 'pending', name: 'Pending', icon: FaClock, color: 'amber' },
    { id: 'fulfilled', name: 'Fulfilled', icon: FaCheckCircle, color: 'emerald' }
  ];

  // Sort options
  const sortOptions = [
    { id: 'newest', name: 'Newest', icon: FaCalendarAlt },
    { id: 'popular', name: 'Most Popular', icon: FaFire },
    { id: 'upvotes', name: 'Most Upvotes', icon: FaThumbsUp }
  ];

  // Category icons and colors
  const categoryInfo = {
    past_questions: { icon: FaQuestionCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    e_books: { icon: FaBook, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
    courses: { icon: FaGraduationCap, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    lecture_notes: { icon: FaFileAlt, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
  };

  // Status icons and colors
  const statusInfo = {
    pending: { icon: FaClock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    fulfilled: { icon: FaCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    in_progress: { icon: FaBolt, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
  };

  // Fetch requests from Supabase
  useEffect(() => {
    fetchRequests();
  }, [searchQuery, selectedCategory, selectedStatus, sortBy]);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      let query = supabase.from('requests').select('*');

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

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
      const requestData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        requested_by_text: formData.requested_by_text || 'Anonymous',
        status: 'pending',
        upvotes: 0,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('requests').insert([requestData]);
      if (error) throw error;

      await fetchRequests();
      
      setFormData({
        title: '',
        description: '',
        category: 'past_questions',
        requested_by_text: ''
      });

      setSuccess('🎉 Request submitted successfully!');
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      setError('Failed to submit request');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle upvote
  const handleUpvote = async (requestId, currentUpvotes) => {
    try {
      const upvotedRequests = JSON.parse(localStorage.getItem('upvotedRequests') || '[]');
      
      if (upvotedRequests.includes(requestId)) {
        const newUpvotes = Math.max(0, currentUpvotes - 1);
        await supabase
          .from('requests')
          .update({ upvotes: newUpvotes })
          .eq('id', requestId);

        const updatedVotes = upvotedRequests.filter(id => id !== requestId);
        localStorage.setItem('upvotedRequests', JSON.stringify(updatedVotes));
        setSuccess('👍 Upvote removed');
      } else {
        const newUpvotes = currentUpvotes + 1;
        await supabase
          .from('requests')
          .update({ upvotes: newUpvotes })
          .eq('id', requestId);

        upvotedRequests.push(requestId);
        localStorage.setItem('upvotedRequests', JSON.stringify(upvotedRequests));
        setSuccess('🚀 Upvoted successfully!');
      }

      await fetchRequests();
      setTimeout(() => setSuccess(null), 2000);

    } catch (err) {
      setError('Failed to upvote');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Handle fulfill request
  const handleFulfillRequest = async (requestId) => {
    if (!window.confirm('Mark this request as fulfilled?')) return;

    try {
      await supabase
        .from('requests')
        .update({ 
          status: 'fulfilled',
          fulfilled_at: new Date().toISOString()
        })
        .eq('id', requestId);

      await fetchRequests();
      setSuccess('✅ Request marked as fulfilled!');
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      setError('Failed to fulfill request');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Handle share request
  const handleShareRequest = async (request) => {
    try {
      const shareText = `📚 Academic Resource Request: "${request.title}"`;
      const shareUrl = `${window.location.origin}/requests`;
      
      if (navigator.share) {
        await navigator.share({
          title: `Help with: ${request.title}`,
          text: shareText,
          url: shareUrl,
        });
        setSuccess('📤 Shared successfully!');
      } else {
        await navigator.clipboard.writeText(`${shareText}\n\n🔗 ${shareUrl}`);
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
    setSuccess('🔗 Link copied!');
    setTimeout(() => setSuccess(null), 2000);
  };

  // Check if request is upvoted
  const isRequestUpvoted = (requestId) => {
    const upvotedRequests = JSON.parse(localStorage.getItem('upvotedRequests') || '[]');
    return upvotedRequests.includes(requestId);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-emerald-50/20 to-white">
      <Navbar />
      
      {/* Toast Notifications */}
      {success && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl shadow-xl flex items-center space-x-3 backdrop-blur-sm bg-opacity-90">
            <FaStar className="animate-pulse" />
            <span className="font-medium">{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
          <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-xl shadow-xl flex items-center space-x-3 backdrop-blur-sm bg-opacity-90">
            <FaExclamationCircle />
            <span className="font-medium">{error}</span>
            <button onClick={() => setError(null)} className="ml-4 hover:opacity-80">
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      <main className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 p-8 md:p-12 text-white mb-8 shadow-2xl">
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <FaHandsHelping className="text-2xl" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold">Community Requests</h1>
                  </div>
                  <p className="text-xl text-emerald-100 max-w-2xl mb-6">
                    Need academic materials? Request them from the community. Together, we build knowledge.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                      <FaUsers />
                      <span>Community-Powered</span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                      <FaSeedling />
                      <span>Growing Together</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-4">
                  <div className="text-center">
                    <div className="text-5xl font-bold">{requests.length}</div>
                    <div className="text-emerald-100">Total Requests</div>
                  </div>
                  <Button
                    onClick={() => document.getElementById('request-form')?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    })}
                    className="px-8 py-4 bg-white text-emerald-600 hover:bg-emerald-50 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <span className='flex items-center cursor-pointer'>
                    <FaUpload className="mr-2" />
                    Make a Request
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search requests by title or description..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-300"
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => {
                  const Icon = cat.icon;
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                        isActive
                          ? `bg-gradient-to-r from-${cat.color}-100 to-${cat.color}-50 text-${cat.color}-700 border border-${cat.color}-200 shadow-sm`
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <Icon />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <FaFilter className="text-gray-500" />
                  <span className="text-sm text-gray-600">Status:</span>
                  {statusOptions.map(status => {
                    const Icon = status.icon;
                    const isActive = selectedStatus === status.id;
                    return (
                      <button
                        key={status.id}
                        onClick={() => setSelectedStatus(status.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                          isActive
                            ? `bg-${status.color}-100 text-${status.color}-700`
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        <Icon />
                        <span>{status.name}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <FaSort className="text-gray-500" />
                  <span className="text-sm text-gray-600">Sort:</span>
                  {sortOptions.map(option => {
                    const Icon = option.icon;
                    const isActive = sortBy === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setSortBy(option.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        <Icon />
                        <span>{option.name}</span>
                      </button>
                    );
                  })}
                </div>

                {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') && (
                  <button
                    onClick={clearFilters}
                    className="ml-auto flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaTimes />
                    <span>Clear Filters</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          {requests.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { 
                  value: requests.length, 
                  label: 'Total Requests', 
                  icon: FaList,
                  color: 'text-emerald-600',
                  bg: 'bg-gradient-to-br from-emerald-50 to-green-50'
                },
                { 
                  value: requests.filter(r => r.status === 'fulfilled').length, 
                  label: 'Fulfilled', 
                  icon: FaCheckCircle,
                  color: 'text-green-600',
                  bg: 'bg-gradient-to-br from-green-50 to-emerald-50'
                },
                { 
                  value: requests.reduce((sum, req) => sum + (req.upvotes || 0), 0), 
                  label: 'Total Upvotes', 
                  icon: FaThumbsUp,
                  color: 'text-amber-600',
                  bg: 'bg-gradient-to-br from-amber-50 to-yellow-50'
                },
                { 
                  value: `${Math.round(requests.filter(r => r.status === 'fulfilled').length / Math.max(requests.length, 1) * 100)}%`, 
                  label: 'Success Rate', 
                  icon: FaChartLine,
                  color: 'text-blue-600',
                  bg: 'bg-gradient-to-br from-blue-50 to-cyan-50'
                }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className={`${stat.bg} rounded-2xl p-6 shadow-sm border border-gray-100 transform hover:-translate-y-1 transition-transform duration-300`}>
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`text-2xl ${stat.color}`} />
                      <div className="text-3xl font-bold">{stat.value}</div>
                    </div>
                    <div className="text-gray-700 font-semibold">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Request Form */}
          <div id="request-form" className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-emerald-100 to-green-100 rounded-2xl">
                <FaUpload className="text-2xl text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Make a Request</h2>
                <p className="text-gray-600">What academic resource do you need? Let the community help.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., CS101 Past Questions 2023"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-300 bg-white"
                    required
                  >
                    {categories.filter(c => c.id !== 'all').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what you're looking for in detail. Include course code, year, specific topics, etc."
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-300 resize-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  name="requested_by_text"
                  value={formData.requested_by_text}
                  onChange={handleInputChange}
                  placeholder="How you want to be credited. Leave blank for anonymous."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-300"
                />
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading || !formData.title || !formData.description}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FaRocket className="mr-2" />
                      Submit Request
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Requests Display */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Community Requests</h2>
                <p className="text-gray-600">
                  {requests.length === 0 ? 'No requests yet' : 
                   `Browse ${requests.length} request${requests.length !== 1 ? 's' : ''} from the community`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">
                  Sorted by {sortOptions.find(s => s.id === sortBy)?.name.toLowerCase()}
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
                <p className="text-gray-600">Loading requests...</p>
              </div>
            ) : requests.length > 0 ? (
              <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}`}>
                {requests.map(item => {
                  const catInfo = categoryInfo[item.category] || categoryInfo.past_questions;
                  const CategoryIcon = catInfo.icon;
                  const statusInfoItem = statusInfo[item.status] || statusInfo.pending;
                  const StatusIcon = statusInfoItem.icon;
                  const hasUpvoted = isRequestUpvoted(item.id);
                  
                  return (
                    <div 
                      key={item.id} 
                      className={`bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 rounded-2xl p-6 hover:border-emerald-200 hover:shadow-xl transition-all duration-500 group ${
                        viewMode === 'list' ? 'flex items-start gap-6' : ''
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl ${catInfo.bg} ${catInfo.border}`}>
                            <CategoryIcon className={`text-xl ${catInfo.color}`} />
                          </div>
                          <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusInfoItem.bg} ${statusInfoItem.color} border ${statusInfoItem.border}`}>
                            <StatusIcon className="inline mr-1.5" />
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </div>
                        </div>
                        <button
                          onClick={() => handleCopyLink(item.id)}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                          title="Copy link"
                        >
                          <FaCopy />
                        </button>
                      </div>

                      {/* Content */}
                      <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                        <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                          {truncateText(item.description, 120)}
                        </p>

                        {/* Meta Info */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-full">
                              <FaUser className="text-gray-500" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-700">
                                {item.requested_by_text || 'Anonymous Student'}
                              </div>
                              <div className="text-xs text-gray-500" title={new Date(item.created_at).toLocaleDateString()}>
                                {formatRelativeTime(item.created_at)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-emerald-600">{item.upvotes || 0}</div>
                            <div className="text-xs text-gray-500">upvotes</div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-6 border-t border-gray-100">
                          <button
                            onClick={() => handleUpvote(item.id, item.upvotes || 0)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                              hasUpvoted
                                ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-2 border-emerald-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                            }`}
                          >
                            <FaThumbsUp className={hasUpvoted ? 'text-emerald-500' : ''} />
                          </button>

                          <button
                            onClick={() => handleFulfillRequest(item.id)}
                            disabled={item.status === 'fulfilled'}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                              item.status === 'fulfilled'
                                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-200'
                                : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border border-emerald-500'
                            }`}
                          >
                            <FaCheck />
                            <span className="font-semibold">{item.status === 'fulfilled' ? 'Fulfilled' : 'Fulfill'}</span>
                          </button>

                          <button
                            onClick={() => handleShareRequest(item)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 hover:from-purple-200 hover:to-violet-200 border border-purple-200 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
                          >
                            <FaShare />
                            <span className="font-semibold">Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full flex items-center justify-center mb-6">
                  <FaQuestionCircle className="text-emerald-400 text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No requests found</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                    ? 'Try adjusting your filters or search terms'
                    : 'Be the first to make a request! Your request will help others too.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={clearFilters}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 rounded-xl font-bold"
                  >
                    {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                      ? 'Clear Filters'
                      : 'Make First Request'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Call to Action */}
          <div className="mt-8 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-2xl p-10 text-center text-white shadow-2xl overflow-x-hidden">
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
                <FaSeedling className="text-xl" />
                <span className="font-semibold">Community Powered</span>
              </div>
              <h3 className="text-3xl font-bold mb-4">Help Fellow Students Today</h3>
              <p className="text-xl text-emerald-100 mb-8 opacity-90">
                Browse through requests and share your academic materials. Together, we build a better learning community.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <Link 
                  to="/resources" 
                  className="inline-flex items-center justify-center gap-3 bg-white text-emerald-600 hover:bg-emerald-50 font-bold px-10 py-4 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
                >
                  <FaBook />
                  <span>Browse Resources</span>
                </Link>
                <button 
                  onClick={() => document.getElementById('request-form')?.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  })}
                  className="inline-flex items-center justify-center gap-3 bg-transparent border-2 border-white text-white hover:bg-white hover:text-emerald-600 font-bold px-10 py-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <FaPlus />
                  <span>Make a Request</span>
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
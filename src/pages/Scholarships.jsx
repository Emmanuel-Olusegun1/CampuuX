import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSearch, FaFilter, FaArrowRight, FaCalendarAlt, FaCheck, 
  FaTimesCircle, FaTimes, FaStar, FaGraduationCap, FaSeedling,
  FaUsers, FaChartLine, FaLightbulb, FaBuilding, FaGlobe,
  FaCalendar, FaClock, FaShare, FaCopy, FaHeart, FaRegHeart,
  FaSort, FaFire, FaBolt, FaExternalLinkAlt, FaDollarSign,
  FaBookmark, FaRegBookmark, FaRocket
} from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';

// Helper function to format relative time
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

function Scholarships() {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedField, setSelectedField] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [scholarships, setScholarships] = useState([]);
  const [savedScholarships, setSavedScholarships] = useState([]);

  // Scholarship types and fields
  const scholarshipTypes = [
    { id: 'all', name: 'All Types', icon: FaGraduationCap, color: 'gray', bgColor: 'bg-gray-100' },
    { id: 'Merit-Based', name: 'Merit-Based', icon: FaStar, color: 'emerald', bgColor: 'bg-emerald-100' },
    { id: 'Need-Based', name: 'Need-Based', icon: FaUsers, color: 'green', bgColor: 'bg-green-100' },
    { id: 'Athletic', name: 'Athletic', icon: FaRocket, color: 'amber', bgColor: 'bg-amber-100' },
    { id: 'Minority', name: 'Minority', icon: FaSeedling, color: 'blue', bgColor: 'bg-blue-100' }
  ];

  const fieldOptions = [
    { id: 'all', name: 'All Fields', icon: FaGlobe, color: 'gray' },
    { id: 'STEM', name: 'STEM', icon: FaChartLine, color: 'emerald' },
    { id: 'Engineering', name: 'Engineering', icon: FaBuilding, color: 'green' },
    { id: 'Business', name: 'Business', icon: FaDollarSign, color: 'amber' },
    { id: 'Medicine', name: 'Medicine', icon: FaUsers, color: 'blue' },
    { id: 'Arts', name: 'Arts', icon: FaLightbulb, color: 'purple' }
  ];

  // Sort options
  const sortOptions = [
    { id: 'newest', name: 'Newest', icon: FaCalendar },
    { id: 'popular', name: 'Most Popular', icon: FaFire },
    { id: 'amount', name: 'Highest Amount', icon: FaDollarSign }
  ];

  // Scholarship type info
  const scholarshipTypeInfo = {
    'Merit-Based': { icon: FaStar, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    'Need-Based': { icon: FaUsers, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    'Athletic': { icon: FaRocket, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    'Minority': { icon: FaSeedling, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
  };

  // Field info
  const fieldInfo = {
    'STEM': { icon: FaChartLine, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    'Engineering': { icon: FaBuilding, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    'Business': { icon: FaDollarSign, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    'Medicine': { icon: FaUsers, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    'Arts': { icon: FaLightbulb, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' }
  };

  // Fetch scholarships from Supabase
  useEffect(() => {
    fetchScholarships();
    // Load saved scholarships from localStorage
    const saved = JSON.parse(localStorage.getItem('savedScholarships') || '[]');
    setSavedScholarships(saved);
  }, []);

  const fetchScholarships = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('scholarships')
        .select('*');

      // Apply filters
      if (selectedType !== 'all') {
        query = query.eq('type', selectedType);
      }

      if (selectedField !== 'all') {
        query = query.eq('field', selectedField);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,provider.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popular':
          // Assuming we have an applications column
          query = query.order('created_at', { ascending: false });
          break;
        case 'amount':
          // Sort by amount (assuming amount is numeric)
          query = query.order('amount', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      setScholarships(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter changes with debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchScholarships();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedType, selectedField, sortBy]);

  // Handle save scholarship
  const handleSaveScholarship = (scholarshipId) => {
    const saved = [...savedScholarships];
    
    if (saved.includes(scholarshipId)) {
      // Remove from saved
      const updatedSaved = saved.filter(id => id !== scholarshipId);
      setSavedScholarships(updatedSaved);
      localStorage.setItem('savedScholarships', JSON.stringify(updatedSaved));
      setSuccess('Scholarship removed from saved');
    } else {
      // Add to saved
      saved.push(scholarshipId);
      setSavedScholarships(saved);
      localStorage.setItem('savedScholarships', JSON.stringify(saved));
      setSuccess('✅ Scholarship saved successfully!');
    }
    
    setTimeout(() => setSuccess(null), 2000);
  };

  // Check if scholarship is saved
  const isScholarshipSaved = (scholarshipId) => {
    return savedScholarships.includes(scholarshipId);
  };

  // Handle copy link
  const handleCopyLink = async (scholarshipId) => {
    const link = `${window.location.origin}/scholarships#scholarship-${scholarshipId}`;
    await navigator.clipboard.writeText(link);
    setSuccess('🔗 Link copied!');
    setTimeout(() => setSuccess(null), 2000);
  };

  // Handle share scholarship
  const handleShareScholarship = async (scholarship) => {
    try {
      const shareText = `🎓 Scholarship Opportunity: ${scholarship.name} by ${scholarship.provider}`;
      const shareUrl = window.location.href;
      
      if (navigator.share) {
        await navigator.share({
          title: `${scholarship.name} - ${scholarship.provider}`,
          text: shareText,
          url: shareUrl,
        });
        setSuccess('📤 Shared successfully!');
      } else {
        await navigator.clipboard.writeText(`${shareText}\n\n🔗 ${shareUrl}`);
        setSuccess('📋 Link copied!');
      }
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    }
  };

  // Handle apply now (opens external link)
  const handleApplyNow = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      setError('Application link not available');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedField('all');
    setSortBy('newest');
  };

  // Truncate text
  const truncateText = (text, maxLength = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  // Format amount
  const formatAmount = (amount, currency = '$') => {
    if (!amount) return 'Variable';
    return `${currency}${amount.toLocaleString()}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    return status === 'Open' ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200">
        <FaCheck className="mr-1" /> Open
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border border-red-200">
        <FaTimesCircle className="mr-1" /> Closed
      </span>
    );
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
            <FaTimes />
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
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 p-8 md:p-12 text-white mb-8 shadow-2xl">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <FaGraduationCap className="text-2xl" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold">Scholarship Opportunities</h1>
                  </div>
                  <p className="text-xl text-green-100 max-w-2xl mb-6">
                    Discover financial support for your academic journey without any login required.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                      <FaSeedling />
                      <span>Merit-Based</span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                      <FaUsers />
                      <span>Need-Based</span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                      <FaDollarSign />
                      <span>Full Funding</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-4">
                  <div className="text-center">
                    <div className="text-5xl font-bold">{scholarships.length}</div>
                    <div className="text-green-100">Available Scholarships</div>
                  </div>
                  <Button
                    onClick={() => {
                      // Scroll to scholarships section
                      document.getElementById('scholarships-list')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-8 py-4 bg-white text-green-600 hover:bg-green-50 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <span className='flex items-center'>
                      <FaGraduationCap className="mr-2" />
                      Browse Scholarships
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
                  placeholder="Search scholarships by name, provider, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                />
              </div>
            </div>

            {/* Quick Filters and Sort */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Scholarship Type Filters */}
                <div className="flex flex-wrap gap-2">
                  {scholarshipTypes.map(type => {
                    const Icon = type.icon;
                    const isActive = selectedType === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                          isActive
                            ? `bg-gradient-to-r from-${type.color}-100 to-${type.color}-50 text-${type.color}-700 border border-${type.color}-200 shadow-sm`
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        <Icon />
                        <span>{type.name}</span>
                        {type.id !== 'all' && (
                          <span className="text-xs bg-white px-2 py-0.5 rounded-full">
                            {scholarships.filter(s => s.type === type.id).length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Field Filters */}
                <div className="flex flex-wrap gap-2">
                  {fieldOptions.map(field => {
                    const Icon = field.icon;
                    const isActive = selectedField === field.id;
                    return (
                      <button
                        key={field.id}
                        onClick={() => setSelectedField(field.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                          isActive
                            ? `bg-gradient-to-r from-${field.color}-100 to-${field.color}-50 text-${field.color}-700 border border-${field.color}-200 shadow-sm`
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        <Icon />
                        <span>{field.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Sort Options */}
                <div className="flex items-center gap-2 ml-auto">
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
                            ? 'bg-green-100 text-green-700'
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        <Icon />
                        <span>{option.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {(searchQuery || selectedType !== 'all' || selectedField !== 'all' || sortBy !== 'newest') && (
                <div className="flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaTimes />
                    <span>Clear Filters</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          {scholarships.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { 
                  value: scholarships.length, 
                  label: 'Total Scholarships', 
                  icon: FaGraduationCap,
                  color: 'text-green-600',
                  bg: 'bg-gradient-to-br from-green-50 to-emerald-50'
                },
                { 
                  value: scholarships.filter(s => s.type === 'Merit-Based').length, 
                  label: 'Merit-Based', 
                  icon: FaStar,
                  color: 'text-emerald-600',
                  bg: 'bg-gradient-to-br from-emerald-50 to-green-50'
                },
                { 
                  value: scholarships.filter(s => s.type === 'Need-Based').length, 
                  label: 'Need-Based', 
                  icon: FaUsers,
                  color: 'text-emerald-600',
                  bg: 'bg-gradient-to-br from-emerald-50 to-green-50'
                },
                { 
                  value: scholarships.filter(s => s.field === 'STEM').length, 
                  label: 'STEM Scholarships', 
                  icon: FaChartLine,
                  color: 'text-emerald-600',
                  bg: 'bg-gradient-to-br from-emerald-50 to-green-50'
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

          {/* Scholarships List */}
          <div id="scholarships-list" className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Available Scholarships</h2>
                <p className="text-gray-600">
                  {scholarships.length === 0 ? 'No scholarships available' : 
                   `Browse ${scholarships.length} scholarship${scholarships.length !== 1 ? 's' : ''} sorted by ${sortOptions.find(s => s.id === sortBy)?.name.toLowerCase()}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">
                  {selectedType === 'all' ? 'All Types' : scholarshipTypes.find(t => t.id === selectedType)?.name}
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
                <p className="text-gray-600">Loading scholarship opportunities...</p>
              </div>
            ) : scholarships.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {scholarships.map((scholarship, index) => {
                  const scholarshipType = scholarshipTypeInfo[scholarship.type] || scholarshipTypeInfo['Merit-Based'];
                  const ScholarshipTypeIcon = scholarshipType.icon;
                  const field = fieldInfo[scholarship.field] || fieldInfo['STEM'];
                  const FieldIcon = field.icon;
                  const isSaved = isScholarshipSaved(scholarship.id);
                  
                  return (
                    <div 
                      key={scholarship.id} 
                      className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 rounded-2xl p-6 hover:border-green-200 hover:shadow-xl transition-all duration-500 group"
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl ${scholarshipType.bg} ${scholarshipType.border}`}>
                            <ScholarshipTypeIcon className={`text-xl ${scholarshipType.color}`} />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${scholarshipType.bg} ${scholarshipType.color} border ${scholarshipType.border}`}>
                              {scholarship.type}
                            </div>
                            <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${field.bg} ${field.color} border ${field.border}`}>
                              <FieldIcon className="inline mr-1" />
                              {scholarship.field}
                            </div>
                            {renderStatusBadge(scholarship.status)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyLink(scholarship.id)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                            title="Copy link"
                          >
                            <FaCopy />
                          </button>
                          <button
                            onClick={() => handleSaveScholarship(scholarship.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300"
                            title={isSaved ? "Remove from saved" : "Save scholarship"}
                          >
                            {isSaved ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div>
                        <h3 className="font-bold text-2xl text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                          {scholarship.name}
                        </h3>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <FaBuilding className="text-gray-400" />
                            <span className="text-lg font-medium text-gray-700">{scholarship.provider}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaDollarSign className="text-gray-400" />
                            <span className="text-lg font-semibold text-emerald-600">
                              {formatAmount(scholarship.amount, scholarship.amount_currency)}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-base leading-relaxed mb-4">
                          {truncateText(scholarship.description, 200)}
                        </p>

                        {/* Eligibility */}
                        {scholarship.eligibility && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Eligibility:</h4>
                            <div className="flex flex-wrap gap-2">
                              {scholarship.eligibility.split(',').slice(0, 5).map((req, idx) => (
                                <span key={idx} className="inline-block bg-gray-100 rounded-lg px-3 py-1.5 text-sm text-gray-700">
                                  {req.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Meta Info */}
                        <div className="flex items-center justify-between mb-6 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-full">
                              <FaClock className="text-gray-500" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-700">
                                Posted {formatRelativeTime(scholarship.created_at)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Deadline: {formatDate(scholarship.deadline)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-6 border-t border-gray-100">
                          <button
                            onClick={() => handleShareScholarship(scholarship)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 hover:from-gray-200 hover:to-gray-100 border border-gray-200 transition-all duration-300 transform hover:scale-[1.02]"
                          >
                            <FaShare />
                            <span className="font-semibold">Share</span>
                          </button>

                          {scholarship.url ? (
                            <button
                              onClick={() => handleApplyNow(scholarship.url)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border border-green-500 transition-all duration-300 transform hover:scale-[1.02]"
                            >
                              <FaExternalLinkAlt />
                              <span className="font-semibold">Apply Now</span>
                            </button>
                          ) : (
                            <Link
                              to={`/scholarships/${scholarship.id}`}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border border-green-500 transition-all duration-300 transform hover:scale-[1.02] text-center"
                            >
                              <FaArrowRight />
                              <span className="font-semibold">View Details</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <FaGraduationCap className="text-green-400 text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No scholarships found</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  {searchQuery || selectedType !== 'all' || selectedField !== 'all'
                    ? 'Try adjusting your filters or search terms'
                    : 'Check back soon for new opportunities!'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {(searchQuery || selectedType !== 'all' || selectedField !== 'all') && (
                    <Button
                      onClick={clearFilters}
                      className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 rounded-xl font-bold"
                    >
                      Clear Filters
                    </Button>
                  )}
                  <Button
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-bold"
                  >
                    Refresh Scholarships
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Tips Section */}
          <div className="mt-8 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 rounded-2xl p-10 text-center text-white shadow-2xl overflow-x-hidden">
            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
                <FaLightbulb className="text-xl" />
                <span className="font-semibold">Application Tips</span>
              </div>
              <h3 className="text-3xl font-bold mb-4">Need Help With Your Scholarship Application?</h3>
              <p className="text-xl text-green-100 mb-8 opacity-90">
                Get personalized advice and writing tips to make your application stand out.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <Link 
                  to="/resources" 
                  className="inline-flex items-center justify-center gap-3 bg-white text-green-600 hover:bg-green-50 font-bold px-10 py-4 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
                >
                  <FaGraduationCap />
                  <span>Application Guide</span>
                </Link>
                <button 
                  onClick={() => {
                    // Scroll to top for new search
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    clearFilters();
                  }}
                  className="inline-flex items-center justify-center gap-3 bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-600 font-bold px-10 py-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <FaSearch />
                  <span>Search Again</span>
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

export default Scholarships;
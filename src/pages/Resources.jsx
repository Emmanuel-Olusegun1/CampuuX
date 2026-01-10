import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSearch, FaUpload, FaTimes, FaBook, FaFileAlt, 
  FaFilter, FaArrowRight, FaQuestionCircle, FaGraduationCap,
  FaUser, FaCalendar, FaTag, FaThumbsUp, FaShare, FaEye,
  FaDownload, FaExternalLinkAlt, FaStar, FaRocket, FaMagic,
  FaChartLine, FaSeedling, FaUsers, FaLightbulb, FaBolt,
  FaRegHeart, FaHeart, FaCopy, FaFire, FaBookmark, FaRegBookmark,
  FaRegThumbsUp, FaSort, FaSortUp, FaSortDown
} from 'react-icons/fa';
import { supabase } from "../lib/supabase";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';

function Resources() {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [resources, setResources] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'past_questions',
    url: '',
    file: null,
    uploaded_by: '',
    uploader_name: '',
    is_anonymous: false
  });

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All', icon: FaFilter, color: 'gray', bgColor: 'bg-gray-100' },
    { id: 'past_questions', name: 'Past Questions', icon: FaQuestionCircle, color: 'emerald', bgColor: 'bg-emerald-100' },
    { id: 'e_books', name: 'E-Books', icon: FaBook, color: 'violet', bgColor: 'bg-violet-100' },
    { id: 'courses', name: 'Courses', icon: FaGraduationCap, color: 'amber', bgColor: 'bg-amber-100' },
    { id: 'lecture_notes', name: 'Lecture Notes', icon: FaFileAlt, color: 'blue', bgColor: 'bg-blue-100' }
  ];

  // Sort options
  const sortOptions = [
    { id: 'newest', name: 'Newest', icon: FaCalendar },
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

  // Fetch resources from Supabase
  useEffect(() => {
    fetchResources();
  }, [searchQuery, selectedCategory, sortBy]);

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('resources')
        .select('*');

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
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
      setResources(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload and resource creation
  const handleShareSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let fileUrl = formData.url;
      let fileName = null;

      // Upload file if exists
      if (formData.file) {
        const fileExt = formData.file.name.split('.').pop();
        fileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('resources')
          .upload(`uploads/${fileName}`, formData.file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('resources')
          .getPublicUrl(`uploads/${fileName}`);

        fileUrl = publicUrl;
      }

      // Prepare data for Supabase
      const resourceData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        url: fileUrl || null,
        file_name: fileName || null,
        uploaded_by: formData.is_anonymous ? null : formData.uploader_name || 'Anonymous',
        upvotes: 0,
        created_at: new Date().toISOString()
      };

      // Insert resource into database
      const { error: insertError } = await supabase
        .from('resources')
        .insert([resourceData]);

      if (insertError) throw insertError;

      // Refresh resources
      await fetchResources();
      
      setIsShareOpen(false);
      setCurrentStep(1);
      setFormData({
        title: '',
        description: '',
        category: 'past_questions',
        url: '',
        file: null,
        uploaded_by: '',
        uploader_name: '',
        is_anonymous: false
      });
      setUploadProgress(0);

      setSuccess('🚀 Resource shared successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      console.error('Submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle upvote - Optimistic update without full page reload
  const handleUpvote = async (resourceId, currentUpvotes) => {
    try {
      setIsUpvoting(resourceId);
      
      // Get existing upvotes from localStorage
      const upvotedResources = JSON.parse(localStorage.getItem('upvotedResources') || '[]');
      
      let newUpvotes;
      let updatedVotes;
      let successMessage;
      
      // Check if already upvoted
      if (upvotedResources.includes(resourceId)) {
        // Remove upvote
        newUpvotes = Math.max(0, currentUpvotes - 1);
        updatedVotes = upvotedResources.filter(id => id !== resourceId);
        successMessage = '👍 Upvote removed';
      } else {
        // Add upvote
        newUpvotes = currentUpvotes + 1;
        updatedVotes = [...upvotedResources, resourceId];
        successMessage = '🚀 Upvoted successfully!';
      }

      // Update localStorage immediately
      localStorage.setItem('upvotedResources', JSON.stringify(updatedVotes));

      // Update local state immediately (optimistic update)
      setResources(prevResources => 
        prevResources.map(resource => 
          resource.id === resourceId 
            ? { ...resource, upvotes: newUpvotes }
            : resource
        )
      );

      // Show success message
      setSuccess(successMessage);
      setTimeout(() => setSuccess(null), 2000);

      // Update database in the background
      try {
        await supabase
          .from('resources')
          .update({ upvotes: newUpvotes })
          .eq('id', resourceId);
      } catch (dbError) {
        console.error('Database update failed:', dbError);
        // Revert optimistic update if database fails
        setResources(prevResources => 
          prevResources.map(resource => 
            resource.id === resourceId 
              ? { ...resource, upvotes: currentUpvotes }
              : resource
          )
        );
        // Revert localStorage
        localStorage.setItem('upvotedResources', JSON.stringify(upvotedResources));
        setError('Failed to update upvote. Please try again.');
        setTimeout(() => setError(null), 3000);
      }

    } catch (err) {
      setError('Failed to upvote');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsUpvoting(null);
    }
  };

  // Check if resource is upvoted
  const isResourceUpvoted = (resourceId) => {
    const upvotedResources = JSON.parse(localStorage.getItem('upvotedResources') || '[]');
    return upvotedResources.includes(resourceId);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  // Open document in Google Docs viewer
  const openInViewer = (url) => {
    window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`, '_blank');
  };

  // Handle share resource
  const handleShareResource = async (resource) => {
    try {
      const shareText = `📚 Academic Resource: "${resource.title}"`;
      const shareUrl = window.location.href;
      
      if (navigator.share) {
        await navigator.share({
          title: resource.title,
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

  // Handle copy link
  const handleCopyLink = async (resourceId) => {
    const link = `${window.location.origin}/resources#resource-${resourceId}`;
    await navigator.clipboard.writeText(link);
    setSuccess('🔗 Link copied!');
    setTimeout(() => setSuccess(null), 2000);
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
    setSortBy('newest');
  };

  // Sort resources locally when sortBy changes
  useEffect(() => {
    if (resources.length > 0) {
      const sortedResources = [...resources];
      
      switch (sortBy) {
        case 'newest':
          sortedResources.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          break;
        case 'popular':
        case 'upvotes':
          sortedResources.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
          break;
      }
      
      setResources(sortedResources);
    }
  }, [sortBy]);

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
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 p-8 md:p-12 text-white mb-8 shadow-2xl">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <FaBook className="text-2xl" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold">Academic Resources</h1>
                  </div>
                  <p className="text-xl text-emerald-100 max-w-2xl mb-6">
                    Discover and share educational materials. Knowledge grows when shared.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                      <FaSeedling />
                      <span>Community Shared</span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                      <FaUsers />
                      <span>Open Access</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-4">
                  <div className="text-center">
                    <div className="text-5xl font-bold">{resources.length}</div>
                    <div className="text-emerald-100">Total Resources</div>
                  </div>
                  <Button
                    onClick={() => {
                      setIsShareOpen(true);
                      setCurrentStep(1);
                    }}
                    className="px-8 py-4 bg-white text-emerald-600 hover:bg-emerald-50 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <span className='flex items-center cursor-pointer'>
                      <FaUpload className="mr-2" />
                      Share Resource
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
                  placeholder="Search resources by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-300"
                />
              </div>
            </div>

            {/* Quick Filters and Sort */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Category Filters */}
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
                        {cat.id !== 'all' && (
                          <span className="text-xs bg-white px-2 py-0.5 rounded-full">
                            {resources.filter(r => r.category === cat.id).length}
                          </span>
                        )}
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
              </div>

              {(searchQuery || selectedCategory !== 'all' || sortBy !== 'newest') && (
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
          {resources.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { 
                  value: resources.length, 
                  label: 'Total Resources', 
                  icon: FaBook,
                  color: 'text-emerald-600',
                  bg: 'bg-gradient-to-br from-emerald-50 to-green-50'
                },
                { 
                  value: resources.filter(r => r.category === 'past_questions').length, 
                  label: 'Past Questions', 
                  icon: FaQuestionCircle,
                  color: 'text-green-600',
                  bg: 'bg-gradient-to-br from-green-50 to-emerald-50'
                },
                { 
                  value: resources.reduce((sum, r) => sum + (r.upvotes || 0), 0), 
                  label: 'Total Upvotes', 
                  icon: FaThumbsUp,
                  color: 'text-amber-600',
                  bg: 'bg-gradient-to-br from-amber-50 to-yellow-50'
                },
                { 
                  value: resources.filter(r => r.category === 'lecture_notes').length + resources.filter(r => r.category === 'courses').length, 
                  label: 'Learning Materials', 
                  icon: FaGraduationCap,
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

          {/* Share Modal - Multi-step */}
          {isShareOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 my-8 border border-gray-100">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {currentStep === 1 && 'Resource Details'}
                      {currentStep === 2 && 'Uploader Information'}
                      {currentStep === 3 && 'Upload Options'}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      {[1, 2, 3].map(step => (
                        <div
                          key={step}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            currentStep >= step
                              ? 'bg-emerald-500 w-8'
                              : 'bg-gray-200 w-4'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsShareOpen(false);
                      setCurrentStep(1);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaTimes className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleShareSubmit} className="p-6">
                  {/* Step 1: Resource Details */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Title*</label>
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
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description*</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Describe the resource, include key topics, relevance, etc."
                          rows="4"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-300 resize-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category*</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-300 bg-white"
                          required
                        >
                          <option value="past_questions">Past Questions</option>
                          <option value="e_books">E-Books</option>
                          <option value="courses">Courses</option>
                          <option value="lecture_notes">Lecture Notes</option>
                        </select>
                      </div>
                      <div className="flex justify-end pt-4">
                        <Button
                          type="button"
                          onClick={nextStep}
                          disabled={!formData.title || !formData.description}
                          className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 rounded-xl transition-all duration-300 disabled:opacity-50"
                        >
                          <span className="flex items-center">
                            Next
                            <FaArrowRight className="ml-2" />
                          </span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Uploader Information */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">How would you like to be credited?</label>
                        <div className="space-y-4">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <div className="relative">
                              <input
                                type="radio"
                                name="upload_option"
                                checked={!formData.is_anonymous}
                                onChange={() => setFormData(prev => ({ ...prev, is_anonymous: false }))}
                                className="sr-only"
                              />
                              <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${!formData.is_anonymous ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'}`}>
                                {!formData.is_anonymous && <div className="w-2 h-2 bg-white rounded-full"></div>}
                              </div>
                            </div>
                            <span className="text-gray-700">Show my name</span>
                          </label>
                          
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <div className="relative">
                              <input
                                type="radio"
                                name="upload_option"
                                checked={formData.is_anonymous}
                                onChange={() => setFormData(prev => ({ ...prev, is_anonymous: true }))}
                                className="sr-only"
                              />
                              <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${formData.is_anonymous ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'}`}>
                                {formData.is_anonymous && <div className="w-2 h-2 bg-white rounded-full"></div>}
                              </div>
                            </div>
                            <span className="text-gray-700">Share anonymously</span>
                          </label>
                        </div>
                      </div>

                      {!formData.is_anonymous && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name (Optional)</label>
                          <input
                            type="text"
                            name="uploader_name"
                            value={formData.uploader_name}
                            onChange={handleInputChange}
                            placeholder="How you want to be credited"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-300"
                          />
                        </div>
                      )}

                      <div className="flex justify-between pt-4">
                        <Button
                          type="button"
                          onClick={prevStep}
                          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-300"
                        >
                          <span className="flex items-center">
                            <FaArrowRight className="mr-2 rotate-180" />
                            Back
                          </span>
                        </Button>
                        <Button
                          type="button"
                          onClick={nextStep}
                          className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 rounded-xl transition-all duration-300"
                        >
                          <span className="flex items-center">
                            Next
                            <FaArrowRight className="ml-2" />
                          </span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Upload Options */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">File (Optional)</label>
                        <label className="block mt-1 flex justify-center px-6 py-8 border-3 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-300 group">
                          <div className="space-y-3 text-center">
                            {formData.file ? (
                              <>
                                <div className="p-3 bg-emerald-100 rounded-full inline-block">
                                  <FaBook className="text-emerald-600 text-2xl" />
                                </div>
                                <p className="text-lg font-semibold text-gray-900">{formData.file.name}</p>
                                <p className="text-sm text-gray-500">
                                  {(formData.file.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </>
                            ) : (
                              <>
                                <div className="p-4 bg-emerald-100 rounded-2xl inline-block group-hover:bg-emerald-200 transition-colors">
                                  <FaUpload className="text-emerald-600 text-3xl" />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-lg font-semibold text-gray-700">Select a file</p>
                                  <p className="text-sm text-gray-500">or drag and drop here</p>
                                  <p className="text-xs text-gray-400 mt-2">
                                    PDF, DOCX, PPTX up to 10MB
                                  </p>
                                </div>
                              </>
                            )}
                            <input 
                              type="file" 
                              name="file"
                              className="sr-only" 
                              accept=".pdf,.docx,.pptx" 
                              onChange={handleInputChange}
                            />
                          </div>
                        </label>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">OR</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Paste URL (Optional)</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <FaExternalLinkAlt className="text-gray-400" />
                          </div>
                          <input
                            type="url"
                            name="url"
                            value={formData.url}
                            onChange={handleInputChange}
                            placeholder="https://example.com/resource"
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-300"
                          />
                        </div>
                      </div>

                      {uploadProgress > 0 && (
                        <div className="pt-4">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 text-right">
                            {uploadProgress}% uploaded
                          </p>
                        </div>
                      )}

                      <div className="flex justify-between pt-6">
                        <Button
                          type="button"
                          onClick={prevStep}
                          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-300"
                        >
                          <span className="flex items-center">
                            <FaArrowRight className="mr-2 rotate-180" />
                            Back
                          </span>
                        </Button>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl transition-all duration-300 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <span className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Sharing...
                            </span>
                          ) : (
                            <span className="flex items-center cursor-pointer">
                              <FaRocket className="mr-2" />
                              Share Resource
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* Resources Grid */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Available Resources</h2>
                <p className="text-gray-600">
                  {resources.length === 0 ? 'No resources yet' : 
                   `Browse ${resources.length} resource${resources.length !== 1 ? 's' : ''} sorted by ${sortOptions.find(s => s.id === sortBy)?.name.toLowerCase()}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">
                  {selectedCategory === 'all' ? 'All Categories' : categories.find(c => c.id === selectedCategory)?.name}
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
                <p className="text-gray-600">Loading resources...</p>
              </div>
            ) : resources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map(item => {
                  const catInfo = categoryInfo[item.category] || categoryInfo.past_questions;
                  const CategoryIcon = catInfo.icon;
                  const hasUpvoted = isResourceUpvoted(item.id);
                  
                  return (
                    <div 
                      key={item.id} 
                      className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 rounded-2xl p-6 hover:border-emerald-200 hover:shadow-xl transition-all duration-500 group"
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl ${catInfo.bg} ${catInfo.border}`}>
                            <CategoryIcon className={`text-xl ${catInfo.color}`} />
                          </div>
                          <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${catInfo.bg} ${catInfo.color} border ${catInfo.border}`}>
                            {item.category === 'past_questions' ? 'Past Questions' : 
                             item.category === 'e_books' ? 'E-Book' : 
                             item.category === 'courses' ? 'Course' : 'Lecture Notes'}
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
                      <div>
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
                                {item.uploaded_by || 'Anonymous Contributor'}
                              </div>
                              <div className="text-xs text-gray-500">
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
                          {/* Upvote Button */}
                          <button
                            onClick={() => handleUpvote(item.id, item.upvotes || 0)}
                            disabled={isUpvoting === item.id}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                              hasUpvoted
                                ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-2 border-emerald-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                            } ${isUpvoting === item.id ? 'opacity-50 cursor-wait' : ''}`}
                          >
                            {isUpvoting === item.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent"></div>
                            ) : (
                              <>
                                <FaThumbsUp className={hasUpvoted ? 'text-emerald-500 cursor-pointer' : ''} />
                                <span className="font-semibold">{item.upvotes || 0}</span>
                              </>
                            )}
                          </button>

                          {/* View/Visit Button */}
                          {item.file_name ? (
                            <button
                              onClick={() => openInViewer(item.url)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border border-emerald-500 transition-all duration-300 transform hover:scale-[1.02]"
                            >
                              <FaEye />
                              <span className="font-semibold">View</span>
                            </button>
                          ) : item.url ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white border border-blue-500 transition-all duration-300 transform hover:scale-[1.02]"
                            >
                              <FaExternalLinkAlt />
                              <span className="font-semibold">Visit</span>
                            </a>
                          ) : (
                            <button
                              disabled
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed"
                            >
                              <FaEye />
                              <span className="font-semibold">No Link</span>
                            </button>
                          )}
                          
                          {/* Share Button */}
                          <button
                            onClick={() => handleShareResource(item)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 hover:from-green-200 hover:to-emerald-200 border border-green-200 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
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
                  <FaBook className="text-emerald-400 text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No resources found</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'Try adjusting your filters or search terms'
                    : 'Be the first to share a resource! Help build our knowledge base.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => {
                      setIsShareOpen(true);
                      setCurrentStep(1);
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 rounded-xl font-bold"
                  >
                    <span className="flex items-center cursor-pointer">
                      <FaUpload className="mr-2" />
                      Share Resource
                    </span>
                  </Button>
                  {(searchQuery || selectedCategory !== 'all') && (
                    <Button
                      onClick={clearFilters}
                      className="px-8 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-bold"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* "Can't Find What You Need?" Section */}
          <div className="mt-8 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-2xl p-10 text-center text-white shadow-2xl overflow-x-hidden">
            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
                <FaLightbulb className="text-xl" />
                <span className="font-semibold">Need Something Specific?</span>
              </div>
              <h3 className="text-3xl font-bold mb-4">Can't Find What You Need?</h3>
              <p className="text-xl text-emerald-100 mb-8 opacity-90">
                Request specific resources from the community. Let others know what you're looking for!
              </p>
              <div className="flex justify-center">
                <Link 
                  to="/requests" 
                  className="inline-flex items-center justify-center gap-3 bg-white text-emerald-600 hover:bg-emerald-50 font-bold px-10 py-4 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
                >
                  <FaQuestionCircle />
                  <span>Request a Resource</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Resources;
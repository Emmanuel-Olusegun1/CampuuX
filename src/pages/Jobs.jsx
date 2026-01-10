import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSearch, FaBriefcase, FaMapPin, FaDollarSign, FaClock, FaFilter, 
  FaExternalLinkAlt, FaTimes, FaStar, FaRocket, FaUsers, FaSeedling,
  FaChartLine, FaLightbulb, FaBuilding, FaGlobe, FaGraduationCap,
  FaCalendar, FaTag, FaShare, FaCopy, FaFileAlt,
  FaSort, FaFire, FaHeart, FaRegHeart, FaBolt, FaCheckCircle
} from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';

// Helper function to format relative time
const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Recently';
  
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

// Currency mapping
const currencySymbols = {
  'NGN': '₦',
  'USD': '$',
  'GBP': '£',
  'EUR': '€',
  'CAD': 'CA$',
  'AUD': 'A$'
};

// Format salary with currency
const formatSalary = (salary, currencyCode = 'NGN') => {
  if (!salary) return 'Negotiable';
  
  const currency = currencySymbols[currencyCode] || currencySymbols['NGN'];
  
  // Check if salary is a number or a range string
  if (typeof salary === 'number') {
    return `${currency}${salary.toLocaleString()}`;
  } else if (typeof salary === 'string') {
    // Handle salary ranges like "50000 - 70000"
    if (salary.includes('-')) {
      const [min, max] = salary.split('-').map(s => s.trim().replace(/[^0-9]/g, ''));
      if (min && max) {
        return `${currency}${parseInt(min).toLocaleString()} - ${currency}${parseInt(max).toLocaleString()}`;
      }
    }
    // Try to parse as number
    const numSalary = parseInt(salary.replace(/[^0-9]/g, ''));
    if (!isNaN(numSalary)) {
      return `${currency}${numSalary.toLocaleString()}`;
    }
  }
  
  return `${currency}${salary}`;
};

function Jobs() {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);

  // Job types and locations
  const jobTypes = [
    { id: 'all', name: 'All Types', icon: FaBriefcase, color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
    { id: 'Internship', name: 'Internship', icon: FaGraduationCap, color: 'emerald', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700' },
    { id: 'Full-time', name: 'Full-time', icon: FaBriefcase, color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700' },
    { id: 'Part-time', name: 'Part-time', icon: FaClock, color: 'amber', bgColor: 'bg-amber-100', textColor: 'text-amber-700' },
    { id: 'Contract', name: 'Contract', icon: FaFileAlt, color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' }
  ];

  const locations = [
    { id: 'all', name: 'All Locations', icon: FaMapPin, color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
    { id: 'Remote', name: 'Remote', icon: FaGlobe, color: 'emerald', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700' },
    { id: 'On Site', name: 'On Site', icon: FaBuilding, color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700' },
    { id: 'Hybrid', name: 'Hybrid', icon: FaBolt, color: 'amber', bgColor: 'bg-amber-100', textColor: 'text-amber-700' }
  ];

  // Sort options
  const sortOptions = [
    { id: 'newest', name: 'Newest', icon: FaCalendar },
    { id: 'popular', name: 'Most Popular', icon: FaFire },
    { id: 'salary', name: 'Highest Salary', icon: FaDollarSign }
  ];

  // Job type info
  const jobTypeInfo = {
    Internship: { icon: FaGraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Internship' },
    'Full-time': { icon: FaBriefcase, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'Full-time' },
    'Part-time': { icon: FaClock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Part-time' },
    Contract: { icon: FaFileAlt, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Contract' },
    'Freelance': { icon: FaGlobe, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', label: 'Freelance' }
  };

  // Location info
  const locationInfo = {
    Remote: { icon: FaGlobe, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Remote' },
    'On Site': { icon: FaBuilding, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'On Site' },
    Hybrid: { icon: FaBolt, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Hybrid' }
  };

  // Fetch jobs from Supabase
  useEffect(() => {
    fetchJobs();
    // Load saved jobs from localStorage
    const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    setSavedJobs(saved);
  }, []);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('jobs')
        .select('*');

      // Apply filters
      if (selectedType !== 'all') {
        query = query.eq('type', selectedType);
      }

      if (selectedLocation !== 'all') {
        query = query.eq('location', selectedLocation);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popular':
          // Assuming we have an applications or views column
          query = query.order('created_at', { ascending: false });
          break;
        case 'salary':
          // Sort by numeric salary value
          query = query.order('salary', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Add default currency for jobs missing it (compatibility with Admin page)
      const jobsWithDefaultCurrency = (data || []).map(job => ({
        ...job,
        salary_currency: job.salary_currency || 'NGN'
      }));
      
      setJobs(jobsWithDefaultCurrency);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter changes with debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedType, selectedLocation, sortBy]);

  // Handle save job
  const handleSaveJob = (jobId) => {
    const saved = [...savedJobs];
    
    if (saved.includes(jobId)) {
      // Remove from saved
      const updatedSaved = saved.filter(id => id !== jobId);
      setSavedJobs(updatedSaved);
      localStorage.setItem('savedJobs', JSON.stringify(updatedSaved));
      setSuccess('Job removed from saved');
    } else {
      // Add to saved
      saved.push(jobId);
      setSavedJobs(saved);
      localStorage.setItem('savedJobs', JSON.stringify(saved));
      setSuccess('✅ Job saved successfully!');
    }
    
    setTimeout(() => setSuccess(null), 2000);
  };

  // Check if job is saved
  const isJobSaved = (jobId) => {
    return savedJobs.includes(jobId);
  };

  // Handle copy link
  const handleCopyLink = async (jobId) => {
    const link = `${window.location.origin}/jobs#job-${jobId}`;
    await navigator.clipboard.writeText(link);
    setSuccess('🔗 Link copied!');
    setTimeout(() => setSuccess(null), 2000);
  };

  // Handle share job
  const handleShareJob = async (job) => {
    try {
      const shareText = `💼 Job Opportunity: ${job.title} at ${job.company} - ${formatSalary(job.salary, job.salary_currency)}`;
      const shareUrl = window.location.href;
      
      if (navigator.share) {
        await navigator.share({
          title: `${job.title} - ${job.company}`,
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
    setSelectedLocation('all');
    setSortBy('newest');
  };

  // Truncate text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  // Get job type count
  const getJobTypeCount = (typeId) => {
    if (typeId === 'all') return jobs.length;
    return jobs.filter(j => j.type === typeId).length;
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
                      <FaBriefcase className="text-2xl" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold">Career Opportunities</h1>
                  </div>
                  <p className="text-xl text-green-100 max-w-2xl mb-6">
                    Discover your dream job and kickstart your career journey with top companies.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                      <FaSeedling />
                      <span>Career Growth</span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                      <FaUsers />
                      <span>Top Companies</span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                      <FaDollarSign />
                      <span>Competitive Salaries</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-4">
                  <div className="text-center">
                    <div className="text-5xl font-bold">{jobs.length}</div>
                    <div className="text-green-100">Open Positions</div>
                  </div>
                  <Button
                    onClick={() => {
                      // Scroll to jobs section
                      document.getElementById('jobs-list')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-8 py-4 bg-white text-green-600 hover:bg-green-50 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <span className='flex items-center'>
                      <FaBriefcase className="mr-2" />
                      Browse Jobs
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
                  placeholder="Search jobs by title, company, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                />
              </div>
            </div>

            {/* Quick Filters and Sort */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Job Type Filters */}
                <div className="flex flex-wrap gap-2">
                  {jobTypes.map(type => {
                    const Icon = type.icon;
                    const isActive = selectedType === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                          isActive
                            ? `${type.bgColor} ${type.textColor} border border-${type.color}-200 shadow-sm`
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        <Icon />
                        <span className="font-medium">{type.name}</span>
                        {type.id !== 'all' && (
                          <span className={`text-xs ${isActive ? 'bg-white/80' : 'bg-gray-200'} px-2 py-0.5 rounded-full`}>
                            {getJobTypeCount(type.id)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Location Filters */}
                <div className="flex flex-wrap gap-2">
                  {locations.map(location => {
                    const Icon = location.icon;
                    const isActive = selectedLocation === location.id;
                    return (
                      <button
                        key={location.id}
                        onClick={() => setSelectedLocation(location.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                          isActive
                            ? `${location.bgColor} ${location.textColor} border border-${location.color}-200 shadow-sm`
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        <Icon />
                        <span className="font-medium">{location.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Sort Options */}
                <div className="flex items-center gap-2 ml-auto">
                  <FaSort className="text-gray-500" />
                  <span className="text-sm text-gray-600 font-medium">Sort by:</span>
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    {sortOptions.map(option => {
                      const Icon = option.icon;
                      const isActive = sortBy === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => setSortBy(option.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-300 ${
                            isActive
                              ? 'bg-white text-green-700 shadow-sm'
                              : 'hover:bg-gray-200 text-gray-600'
                          }`}
                        >
                          <Icon className="text-sm" />
                          <span>{option.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {(searchQuery || selectedType !== 'all' || selectedLocation !== 'all' || sortBy !== 'newest') && (
                <div className="flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                  >
                    <FaTimes />
                    <span>Clear Filters</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          {jobs.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { 
                  value: jobs.length, 
                  label: 'Total Jobs', 
                  icon: FaBriefcase,
                  color: 'text-green-600',
                  bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
                  change: '+12%'
                },
                { 
                  value: jobs.filter(j => j.type === 'Internship').length, 
                  label: 'Internships', 
                  icon: FaGraduationCap,
                  color: 'text-emerald-600',
                  bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
                  change: '+8%'
                },
                { 
                  value: jobs.filter(j => j.type === 'Full-time').length, 
                  label: 'Full-time', 
                  icon: FaCheckCircle,
                  color: 'text-green-600',
                  bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
                  change: '+15%'
                },
                { 
                  value: jobs.filter(j => j.location === 'Remote').length, 
                  label: 'Remote Jobs', 
                  icon: FaGlobe,
                  color: 'text-emerald-600',
                  bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
                  change: '+25%'
                }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className={`${stat.bg} rounded-2xl p-6 shadow-sm border border-gray-100 transform hover:-translate-y-1 transition-transform duration-300`}>
                    <div className="flex items-center justify-between mb-3">
                      <Icon className={`text-2xl ${stat.color}`} />
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        {stat.change}
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-gray-700 font-semibold">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Jobs List */}
          <div id="jobs-list" className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Available Positions</h2>
                <p className="text-gray-600">
                  {jobs.length === 0 ? 'No jobs available' : 
                   `Browse ${jobs.length} job${jobs.length !== 1 ? 's' : ''} sorted by ${sortOptions.find(s => s.id === sortBy)?.name.toLowerCase()}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-lg font-medium">
                  {selectedType === 'all' ? 'All Types' : jobTypes.find(t => t.id === selectedType)?.name}
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
                <p className="text-gray-600">Loading job opportunities...</p>
              </div>
            ) : jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job, index) => {
                  const jobType = jobTypeInfo[job.type] || jobTypeInfo['Full-time'];
                  const JobTypeIcon = jobType.icon;
                  const location = locationInfo[job.location] || locationInfo['Remote'];
                  const LocationIcon = location.icon;
                  const isSaved = isJobSaved(job.id);
                  
                  return (
                    <div 
                      key={job.id} 
                      className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 rounded-2xl p-5 hover:border-green-200 hover:shadow-xl transition-all duration-500 group flex flex-col"
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${jobType.bg} ${jobType.border}`}>
                            <JobTypeIcon className={`text-lg ${jobType.color}`} />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${jobType.bg} ${jobType.color} border ${jobType.border}`}>
                              {job.type}
                            </div>
                            <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${location.bg} ${location.color} border ${location.border}`}>
                              <LocationIcon className="inline mr-1" />
                              {job.location}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyLink(job.id)}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                            title="Copy link"
                          >
                            <FaCopy size={14} />
                          </button>
                          <button
                            onClick={() => handleSaveJob(job.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300"
                            title={isSaved ? "Remove from saved" : "Save job"}
                          >
                            {isSaved ? <FaHeart className="text-red-500" size={14} /> : <FaRegHeart size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-green-700 transition-colors line-clamp-2">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-1.5">
                            <FaBuilding className="text-gray-400 text-sm" />
                            <span className="font-medium text-gray-700 text-sm">{job.company}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                          {truncateText(job.description, 120)}
                        </p>

                        {/* Salary and Requirements */}
                        <div className="mb-4">
                          <div className="flex items-center gap-1.5 mb-2">
                            <FaDollarSign className="text-gray-400 text-sm" />
                            <span className="font-semibold text-emerald-600 text-sm">
                              {formatSalary(job.salary, job.salary_currency)}
                            </span>
                            <span className="text-xs text-gray-500 ml-1">
                              {job.salary_currency || 'NGN'}
                            </span>
                          </div>
                          
                          {job.requirements && (
                            <div className="mt-2">
                              <div className="text-xs font-semibold text-gray-700 mb-1">Key Requirements:</div>
                              <div className="flex flex-wrap gap-1">
                                {job.requirements.split(',').slice(0, 2).map((req, idx) => (
                                  <span key={idx} className="inline-block bg-gray-100 rounded-lg px-2 py-1 text-xs text-gray-700 truncate max-w-[120px]">
                                    {req.trim()}
                                  </span>
                                ))}
                                {job.requirements.split(',').length > 2 && (
                                  <span className="inline-block bg-gray-100 rounded-lg px-2 py-1 text-xs text-gray-500">
                                    +{job.requirements.split(',').length - 2} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Meta Info */}
                        <div className="mt-auto pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <FaClock className="text-gray-400" />
                              <span>Posted {formatRelativeTime(job.created_at)}</span>
                            </div>
                            {job.deadline && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <FaCalendar className="text-gray-400" />
                                <span>Until {new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-5 border-t border-gray-100">
                        <button
                          onClick={() => handleShareJob(job)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 hover:from-gray-200 hover:to-gray-100 border border-gray-200 transition-all duration-300 text-sm font-medium"
                        >
                          <FaShare size={14} />
                          <span>Share</span>
                        </button>

                        <button
                          onClick={() => handleApplyNow(job.url)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border border-green-500 transition-all duration-300 text-sm font-medium"
                        >
                          <FaExternalLinkAlt size={14} />
                          <span>Apply Now</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <FaBriefcase className="text-green-400 text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No jobs found</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  {searchQuery || selectedType !== 'all' || selectedLocation !== 'all'
                    ? 'Try adjusting your filters or search terms'
                    : 'Check back soon for new opportunities!'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {(searchQuery || selectedType !== 'all' || selectedLocation !== 'all') && (
                    <Button
                      onClick={clearFilters}
                      className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 rounded-xl font-bold"
                    >
                      Clear Filters
                    </Button>
                  )}
                  <Button
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-bold cursor-pointer"
                  >
                    Refresh Jobs
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Career Tips Section */}
          <div className="mt-8 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 rounded-2xl p-8 md:p-10 text-center text-white shadow-2xl overflow-x-hidden">
            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
                <FaLightbulb className="text-xl" />
                <span className="font-semibold">Career Tips</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Need Help With Your Job Search?</h3>
              <p className="text-lg md:text-xl text-green-100 mb-8 opacity-90">
                Get personalized career advice and resume tips to stand out from the competition.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/resources" 
                  className="inline-flex items-center justify-center gap-3 bg-white text-green-600 hover:bg-green-50 font-bold px-8 py-3.5 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 text-sm md:text-base"
                >
                  <FaGraduationCap />
                  <span>Learn Resources</span>
                </Link>
                <button 
                  onClick={() => {
                    // Scroll to top for new search
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    clearFilters();
                  }}
                  className="inline-flex items-center justify-center gap-3 bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-600 font-bold px-8 py-3.5 rounded-xl transition-all duration-300 transform hover:-translate-y-1 text-sm md:text-base cursor-pointer"
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

export default Jobs;
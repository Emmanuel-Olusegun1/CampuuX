import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  FaBriefcase, FaBuilding, FaMapMarkerAlt, FaMoneyBillWave, 
  FaFileAlt, FaTrash, FaEdit, FaGraduationCap, FaUsers,
  FaChartLine, FaCalendarAlt, FaEye, FaTimes, FaLink, FaCheck, FaTimesCircle,
  FaPlus, FaSearch, FaFilter, FaSort, FaExternalLinkAlt, FaQuestionCircle,
  FaArrowUp, FaArrowDown, FaClock, FaGlobe, FaUserGraduate, FaStar,
  FaSeedling, FaBolt, FaRocket, FaCommentDots, FaReply, FaArchive, 
  FaExclamationCircle, FaThumbsUp, FaThumbsDown, FaUser, FaEnvelope
} from 'react-icons/fa';

const AdminDashboard = () => {
  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isJobLoading, setIsJobLoading] = useState(false);
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobSearch, setJobSearch] = useState('');

  // Scholarships state
  const [scholarships, setScholarships] = useState([]);
  const [filteredScholarships, setFilteredScholarships] = useState([]);
  const [isScholarshipLoading, setIsScholarshipLoading] = useState(false);
  const [isEditingScholarship, setIsEditingScholarship] = useState(false);
  const [currentScholarship, setCurrentScholarship] = useState(null);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [showScholarshipModal, setShowScholarshipModal] = useState(false);
  const [scholarshipSearch, setScholarshipSearch] = useState('');

  // Feedback state
  const [feedback, setFeedback] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [feedbackFilter, setFeedbackFilter] = useState('all');
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  // Active tab state
  const [activeTab, setActiveTab] = useState('jobs');

  // Form states
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    type: 'Full-time',
    location: '',
    salary: '',
    salary_currency: 'NGN',
    description: '',
    requirements: '',
    url: ''
  });

  const [scholarshipForm, setScholarshipForm] = useState({
    name: '',
    provider: '',
    type: 'Merit-Based',
    field: 'STEM',
    amount: '',
    amount_currency: 'NGN',
    status: 'Open',
    deadline: '',
    description: '',
    eligibility: '',
    url: ''
  });

  // Stats state
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalScholarships: 0,
    totalFeedback: 0,
    activeJobs: 0,
    activeScholarships: 0,
    pendingFeedback: 0
  });

  // Success/Error messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Field options for scholarships
  const fieldOptions = [
    { id: 'STEM', name: 'STEM', icon: FaChartLine, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'Engineering', name: 'Engineering', icon: FaBuilding, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'Business', name: 'Business', icon: FaMoneyBillWave, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'Medicine', name: 'Medicine', icon: FaUserGraduate, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'Arts', name: 'Arts', icon: FaStar, color: 'text-purple-600', bg: 'bg-purple-50' }
  ];
  
  // Status options for scholarships
  const statusOptions = ['Open', 'Closed'];

  // Job type options
  const jobTypeOptions = [
    { id: 'Full-time', name: 'Full-time', icon: FaBriefcase, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'Part-time', name: 'Part-time', icon: FaClock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'Internship', name: 'Internship', icon: FaUserGraduate, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'Contract', name: 'Contract', icon: FaFileAlt, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'Freelance', name: 'Freelance', icon: FaGlobe, color: 'text-emerald-600', bg: 'bg-emerald-50' }
  ];

  // Scholarship type options
  const scholarshipTypeOptions = [
    { id: 'Merit-Based', name: 'Merit-Based', icon: FaStar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'Need-Based', name: 'Need-Based', icon: FaUsers, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'Athletic', name: 'Athletic', icon: FaRocket, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'Minority', name: 'Minority', icon: FaSeedling, color: 'text-blue-600', bg: 'bg-blue-50' }
  ];

  // Feedback type options
  const feedbackTypeOptions = [
    { id: 'General Feedback', name: 'General', icon: FaCommentDots, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'Feature Request', name: 'Feature', icon: FaThumbsUp, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'Bug Report', name: 'Bug', icon: FaExclamationCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { id: 'Content Issue', name: 'Content', icon: FaFileAlt, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'Other', name: 'Other', icon: FaQuestionCircle, color: 'text-gray-600', bg: 'bg-gray-50' }
  ];

  // Feedback status options
  const feedbackStatusOptions = [
    { id: 'pending', name: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { id: 'reviewed', name: 'Reviewed', color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'resolved', name: 'Resolved', color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'archived', name: 'Archived', color: 'text-gray-600', bg: 'bg-gray-50' }
  ];

  // Currency options
  const currencyOptions = [
    { code: 'NGN', symbol: '₦', name: 'Naira' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'EUR', symbol: '€', name: 'Euro' }
  ];

  // Format currency
  const formatCurrency = (amount, currencyCode) => {
    const currency = currencyOptions.find(c => c.code === currencyCode) || currencyOptions[0];
    if (!amount) return 'Not specified';
    return `${currency.symbol}${Number(amount).toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(dateString);
  };

  // Show success message
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Show error message
  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  // Fetch all data
  const fetchData = async () => {
    try {
      setIsJobLoading(true);
      setIsScholarshipLoading(true);
      setIsFeedbackLoading(true);

      // Fetch jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      // Fetch scholarships
      const { data: scholarshipsData, error: scholarshipsError } = await supabase
        .from('scholarships')
        .select('*')
        .order('created_at', { ascending: false });

      if (scholarshipsError) throw scholarshipsError;

      // Fetch feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (feedbackError) throw feedbackError;

      setJobs(jobsData || []);
      setFilteredJobs(jobsData || []);
      setScholarships(scholarshipsData || []);
      setFilteredScholarships(scholarshipsData || []);
      setFeedback(feedbackData || []);
      setFilteredFeedback(feedbackData || []);
      
      setStats({
        totalJobs: jobsData?.length || 0,
        totalScholarships: scholarshipsData?.length || 0,
        totalFeedback: feedbackData?.length || 0,
        activeJobs: jobsData?.filter(j => j.status !== 'Closed')?.length || 0,
        activeScholarships: scholarshipsData?.filter(s => s.status === 'Open')?.length || 0,
        pendingFeedback: feedbackData?.filter(f => f.status === 'pending')?.length || 0
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      showError('Failed to load data. Please try again.');
    } finally {
      setIsJobLoading(false);
      setIsScholarshipLoading(false);
      setIsFeedbackLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter jobs based on search
  useEffect(() => {
    if (jobSearch.trim() === '') {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter(job =>
        job.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
        job.company.toLowerCase().includes(jobSearch.toLowerCase()) ||
        job.location.toLowerCase().includes(jobSearch.toLowerCase())
      );
      setFilteredJobs(filtered);
    }
  }, [jobSearch, jobs]);

  // Filter scholarships based on search
  useEffect(() => {
    if (scholarshipSearch.trim() === '') {
      setFilteredScholarships(scholarships);
    } else {
      const filtered = scholarships.filter(scholarship =>
        scholarship.name.toLowerCase().includes(scholarshipSearch.toLowerCase()) ||
        scholarship.provider.toLowerCase().includes(scholarshipSearch.toLowerCase()) ||
        scholarship.field.toLowerCase().includes(scholarshipSearch.toLowerCase())
      );
      setFilteredScholarships(filtered);
    }
  }, [scholarshipSearch, scholarships]);

  // Filter feedback based on search and filter
  useEffect(() => {
    let filtered = [...feedback];
    
    // Apply search filter
    if (feedbackSearch.trim() !== '') {
      filtered = filtered.filter(item =>
        item.message?.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
        item.name?.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
        item.email?.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
        item.type?.toLowerCase().includes(feedbackSearch.toLowerCase())
      );
    }
    
    // Apply status filter
    if (feedbackFilter !== 'all') {
      filtered = filtered.filter(item => item.status === feedbackFilter);
    }
    
    setFilteredFeedback(filtered);
  }, [feedbackSearch, feedbackFilter, feedback]);

  // Jobs handlers
  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setIsJobLoading(true);

    try {
      const jobData = {
        ...jobForm,
        salary: jobForm.salary ? Number(jobForm.salary.replace(/\D/g, '')) : null,
        requirements: jobForm.requirements.split('\n').filter(r => r.trim() !== '').join(','),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      let result;
      if (isEditingJob && currentJob) {
        result = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', currentJob.id);
      } else {
        result = await supabase
          .from('jobs')
          .insert([jobData]);
      }

      if (result.error) throw result.error;

      showSuccess(isEditingJob ? 'Job updated successfully!' : 'Job created successfully!');
      resetJobForm();
      fetchData();
    } catch (error) {
      console.error('Error saving job:', error);
      showError(`Failed to save job: ${error.message}`);
    } finally {
      setIsJobLoading(false);
    }
  };

  const resetJobForm = () => {
    setJobForm({
      title: '',
      company: '',
      type: 'Full-time',
      location: '',
      salary: '',
      salary_currency: 'NGN',
      description: '',
      requirements: '',
      url: ''
    });
    setIsEditingJob(false);
    setCurrentJob(null);
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      showSuccess('Job deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting job:', error);
      showError('Failed to delete job. Please try again.');
    }
  };

  // Scholarship handlers
  const handleScholarshipSubmit = async (e) => {
    e.preventDefault();
    setIsScholarshipLoading(true);
    
    try {
      const scholarshipData = {
        ...scholarshipForm,
        amount: scholarshipForm.amount ? Number(scholarshipForm.amount.replace(/\D/g, '')) : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      let result;
      if (isEditingScholarship && currentScholarship) {
        result = await supabase
          .from('scholarships')
          .update(scholarshipData)
          .eq('id', currentScholarship.id);
      } else {
        result = await supabase
          .from('scholarships')
          .insert([scholarshipData]);
      }

      if (result.error) throw result.error;

      showSuccess(isEditingScholarship ? 'Scholarship updated successfully!' : 'Scholarship created successfully!');
      resetScholarshipForm();
      fetchData();
    } catch (error) {
      console.error('Error saving scholarship:', error);
      showError(`Failed to save scholarship: ${error.message}`);
    } finally {
      setIsScholarshipLoading(false);
    }
  };

  const resetScholarshipForm = () => {
    setScholarshipForm({
      name: '',
      provider: '',
      type: 'Merit-Based',
      field: 'STEM',
      amount: '',
      amount_currency: 'NGN',
      status: 'Open',
      deadline: '',
      description: '',
      eligibility: '',
      url: ''
    });
    setIsEditingScholarship(false);
    setCurrentScholarship(null);
  };

  const handleDeleteScholarship = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scholarship?')) return;

    try {
      const { error } = await supabase
        .from('scholarships')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      showSuccess('Scholarship deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting scholarship:', error);
      showError('Failed to delete scholarship. Please try again.');
    }
  };

  // Feedback handlers
  const handleUpdateFeedbackStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      showSuccess(`Feedback marked as ${status}`);
      fetchData();
    } catch (error) {
      console.error('Error updating feedback status:', error);
      showError('Failed to update feedback status');
    }
  };

  const handleSendReply = async (feedbackId) => {
    if (!replyText.trim()) {
      showError('Please enter a reply message');
      return;
    }

    setIsReplying(true);
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ 
          admin_reply: replyText,
          replied_at: new Date().toISOString(),
          status: 'resolved',
          updated_at: new Date().toISOString()
        })
        .eq('id', feedbackId);
      
      if (error) throw error;
      
      showSuccess('Reply sent successfully');
      setReplyText('');
      setShowFeedbackModal(false);
      fetchData();
    } catch (error) {
      console.error('Error sending reply:', error);
      showError('Failed to send reply');
    } finally {
      setIsReplying(false);
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;

    try {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      showSuccess('Feedback deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      showError('Failed to delete feedback');
    }
  };

  // Render function for status badge
  const renderStatusBadge = (status) => {
    const statusOption = feedbackStatusOptions.find(s => s.id === status) || feedbackStatusOptions[0];
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${statusOption.bg} ${statusOption.color}`}>
        {status === 'pending' && <FaClock />}
        {status === 'reviewed' && <FaEye />}
        {status === 'resolved' && <FaCheck />}
        {status === 'archived' && <FaArchive />}
        {statusOption.name}
      </span>
    );
  };

  // Render function for feedback type badge
  const renderFeedbackTypeBadge = (type) => {
    const typeOption = feedbackTypeOptions.find(t => t.id === type) || feedbackTypeOptions[0];
    const Icon = typeOption.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${typeOption.bg} ${typeOption.color}`}>
        <Icon />
        {typeOption.name}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-emerald-50/20 to-white">
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 animate-slideDown">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl shadow-xl flex items-center space-x-3 backdrop-blur-sm bg-opacity-90">
            <FaCheck className="animate-pulse" />
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 animate-slideDown">
          <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-xl shadow-xl flex items-center space-x-3 backdrop-blur-sm bg-opacity-90">
            <FaTimes />
            <span className="font-medium">{errorMessage}</span>
            <button onClick={() => setErrorMessage('')} className="ml-4 hover:opacity-80">
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Header */}
      <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <FaChartLine className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-green-100 mt-1">Manage jobs, scholarships, and feedback</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setActiveTab('jobs')}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
              >
                <FaBriefcase />
                Jobs: {stats.totalJobs}
              </button>
              <button 
                onClick={() => setActiveTab('scholarships')}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
              >
                <FaGraduationCap />
                Scholarships: {stats.totalScholarships}
              </button>
              <button 
                onClick={() => setActiveTab('feedback')}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2 relative"
              >
                <FaCommentDots />
                Feedback: {stats.totalFeedback}
                {stats.pendingFeedback > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {stats.pendingFeedback}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Jobs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalJobs}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className={`text-xs font-medium ${stats.totalJobs > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    {stats.activeJobs} Active
                  </span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                <FaBriefcase className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Scholarships</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalScholarships}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className={`text-xs font-medium ${stats.activeScholarships > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    {stats.activeScholarships} Open
                  </span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl">
                <FaGraduationCap className="text-2xl text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Feedback</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalFeedback}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className={`text-xs font-medium ${stats.pendingFeedback > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
                    {stats.pendingFeedback} Pending
                  </span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                <FaCommentDots className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Listings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalJobs + stats.totalScholarships}</p>
                <div className="text-xs text-gray-500 mt-2">All job and scholarship posts</div>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                <FaChartLine className="text-2xl text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-12">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('jobs')}
                className={`flex items-center gap-2 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === 'jobs' 
                    ? 'border-green-500 text-green-600 bg-green-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaBriefcase />
                Job Postings
                <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                  {jobs.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('scholarships')}
                className={`flex items-center gap-2 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === 'scholarships' 
                    ? 'border-green-500 text-green-600 bg-green-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaGraduationCap />
                Scholarships
                <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                  {scholarships.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`flex items-center gap-2 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === 'feedback' 
                    ? 'border-green-500 text-green-600 bg-green-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaCommentDots />
                User Feedback
                <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                  {feedback.length}
                </span>
                {stats.pendingFeedback > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                    {stats.pendingFeedback}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'jobs' ? (
              // ... (existing jobs content remains the same)
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Job Form */}
                <div className="lg:col-span-1">
                  {/* ... (existing job form) */}
                </div>

                {/* Jobs List */}
                <div className="lg:col-span-2">
                  {/* ... (existing jobs list) */}
                </div>
              </div>
            ) : activeTab === 'scholarships' ? (
              // ... (existing scholarships content remains the same)
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Scholarship Form */}
                <div className="lg:col-span-1">
                  {/* ... (existing scholarship form) */}
                </div>

                {/* Scholarships List */}
                <div className="lg:col-span-2">
                  {/* ... (existing scholarships list) */}
                </div>
              </div>
            ) : (
              /* Feedback Tab Content */
              <div className="space-y-6">
                {/* Feedback Filters */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">User Feedback</h2>
                      <p className="text-gray-600 mt-1">
                        {filteredFeedback.length} feedback item{filteredFeedback.length !== 1 ? 's' : ''} found
                        {feedbackFilter !== 'all' && ` (${feedbackStatusOptions.find(s => s.id === feedbackFilter)?.name})`}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                      <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search feedback..."
                          value={feedbackSearch}
                          onChange={(e) => setFeedbackSearch(e.target.value)}
                          className="w-full sm:w-64 pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                        />
                      </div>
                      <select
                        value={feedbackFilter}
                        onChange={(e) => setFeedbackFilter(e.target.value)}
                        className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300 bg-white"
                      >
                        <option value="all">All Status</option>
                        {feedbackStatusOptions.map(status => (
                          <option key={status.id} value={status.id}>{status.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Feedback Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {feedbackStatusOptions.map(status => {
                      const count = feedback.filter(f => f.status === status.id).length;
                      return (
                        <div key={status.id} className={`p-4 rounded-xl border ${status.bg.replace('bg-', 'bg-')} ${status.color.replace('text-', 'text-')} border-opacity-30`}>
                          <div className="text-2xl font-bold mb-1">{count}</div>
                          <div className="text-sm font-medium">{status.name}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Feedback List */}
                  {isFeedbackLoading && filteredFeedback.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading feedback...</p>
                    </div>
                  ) : filteredFeedback.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mb-4">
                        <FaCommentDots className="text-blue-400 text-2xl" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">No feedback found</h3>
                      <p className="text-gray-600">
                        {feedbackSearch || feedbackFilter !== 'all' 
                          ? 'Try adjusting your filters' 
                          : 'No feedback has been submitted yet'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {filteredFeedback.map(item => (
                        <div key={item.id} className="bg-white border-2 border-gray-100 rounded-xl p-5 hover:border-blue-200 hover:shadow-md transition-all duration-300 group">
                          <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start gap-3 mb-3">
                                <div className="flex-shrink-0">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center">
                                    <FaUser className="text-blue-600" />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    {renderFeedbackTypeBadge(item.type)}
                                    {renderStatusBadge(item.status)}
                                    <span className="text-xs text-gray-500">
                                      {formatTimeAgo(item.created_at)}
                                    </span>
                                  </div>
                                  <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                                    {item.name || 'Anonymous User'}
                                  </h3>
                                  {item.email && (
                                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                      <FaEnvelope />
                                      <span>{item.email}</span>
                                    </div>
                                  )}
                                  <div className="mt-3">
                                    <p className="text-gray-700 whitespace-pre-line bg-gray-50 rounded-lg p-3">
                                      {item.message}
                                    </p>
                                  </div>
                                  {item.page_source && (
                                    <div className="mt-2 text-xs text-gray-500">
                                      From: {item.page_source.replace('_', ' ')}
                                    </div>
                                  )}
                                  {item.admin_reply && (
                                    <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg">
                                      <div className="flex items-center gap-2 mb-2">
                                        <FaReply className="text-green-600" />
                                        <span className="text-sm font-semibold text-green-700">Admin Reply</span>
                                        <span className="text-xs text-gray-500">
                                          {item.replied_at && formatTimeAgo(item.replied_at)}
                                        </span>
                                      </div>
                                      <p className="text-gray-700 whitespace-pre-line">
                                        {item.admin_reply}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start gap-2">
                              <button
                                onClick={() => {
                                  setSelectedFeedback(item);
                                  setShowFeedbackModal(true);
                                }}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
                                title="View & Reply"
                              >
                                <FaEye size={16} />
                              </button>
                              {item.status !== 'resolved' && (
                                <button
                                  onClick={() => handleUpdateFeedbackStatus(item.id, 'resolved')}
                                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300"
                                  title="Mark as Resolved"
                                >
                                  <FaCheck size={16} />
                                </button>
                              )}
                              {item.status !== 'archived' && (
                                <button
                                  onClick={() => handleUpdateFeedbackStatus(item.id, 'archived')}
                                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-300"
                                  title="Archive"
                                >
                                  <FaArchive size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteFeedback(item.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                                title="Delete"
                              >
                                <FaTrash size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Details Modal */}
      {showJobModal && selectedJob && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          {/* ... (existing job modal) */}
        </div>
      )}

      {/* Scholarship Details Modal */}
      {showScholarshipModal && selectedScholarship && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          {/* ... (existing scholarship modal) */}
        </div>
      )}

      {/* Feedback Details Modal */}
      {showFeedbackModal && selectedFeedback && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-900 opacity-75" onClick={() => setShowFeedbackModal(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Feedback Details</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-500" />
                        <span className="font-medium text-gray-700">
                          {selectedFeedback.name || 'Anonymous User'}
                        </span>
                      </div>
                      {selectedFeedback.email && (
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="text-gray-500" />
                          <span className="text-gray-600">{selectedFeedback.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFeedbackModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-3">
                    {renderFeedbackTypeBadge(selectedFeedback.type)}
                    {renderStatusBadge(selectedFeedback.status)}
                    <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-gray-100 text-gray-700">
                      <FaCalendarAlt className="inline mr-1" />
                      {formatDate(selectedFeedback.created_at)}
                    </span>
                    {selectedFeedback.page_source && (
                      <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-purple-100 text-purple-700">
                        From: {selectedFeedback.page_source.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Message</h4>
                    <div className="text-gray-700 whitespace-pre-line bg-gray-50 rounded-xl p-4">
                      {selectedFeedback.message}
                    </div>
                  </div>

                  {selectedFeedback.admin_reply ? (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Your Reply</h4>
                      <div className="text-gray-700 whitespace-pre-line bg-green-50 border border-green-100 rounded-xl p-4">
                        {selectedFeedback.admin_reply}
                        {selectedFeedback.replied_at && (
                          <div className="text-xs text-gray-500 mt-2">
                            Replied: {formatDate(selectedFeedback.replied_at)}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Reply to Feedback</h4>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows="4"
                        placeholder="Type your reply here..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 rounded-b-2xl">
                <div className="flex justify-between">
                  <div className="flex gap-2">
                    {!selectedFeedback.admin_reply && (
                      <button
                        onClick={() => handleSendReply(selectedFeedback.id)}
                        disabled={isReplying || !replyText.trim()}
                        className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isReplying ? 'Sending...' : 'Send Reply'}
                      </button>
                    )}
                    <button
                      onClick={() => handleUpdateFeedbackStatus(selectedFeedback.id, 'resolved')}
                      className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all duration-300"
                    >
                      Mark Resolved
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleUpdateFeedbackStatus(selectedFeedback.id, 'archived')}
                      className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-300"
                    >
                      Archive
                    </button>
                    <button
                      type="button"
                      className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-300"
                      onClick={() => setShowFeedbackModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
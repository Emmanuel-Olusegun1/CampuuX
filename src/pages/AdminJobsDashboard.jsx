import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  FaBriefcase, FaBuilding, FaMapMarkerAlt, FaMoneyBillWave, 
  FaFileAlt, FaTrash, FaEdit, FaGraduationCap, FaUsers,
  FaChartLine, FaCalendarAlt, FaEye, FaTimes, FaLink, FaCheck, FaTimesCircle,
  FaPlus, FaSearch, FaFilter, FaSort, FaExternalLinkAlt, FaDownload,
  FaArrowUp, FaArrowDown, FaClock, FaGlobe, FaUserGraduate, FaStar,
  FaSeedling, FaBolt, FaRocket
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
    activeJobs: 0,
    activeScholarships: 0
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
      day: 'numeric' 
    });
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

      setJobs(jobsData || []);
      setFilteredJobs(jobsData || []);
      setScholarships(scholarshipsData || []);
      setFilteredScholarships(scholarshipsData || []);
      
      setStats({
        totalJobs: jobsData?.length || 0,
        totalScholarships: scholarshipsData?.length || 0,
        activeJobs: jobsData?.filter(j => j.status !== 'Closed')?.length || 0,
        activeScholarships: scholarshipsData?.filter(s => s.status === 'Open')?.length || 0
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      showError('Failed to load data. Please try again.');
    } finally {
      setIsJobLoading(false);
      setIsScholarshipLoading(false);
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

  // Render function for status badge
  const renderStatusBadge = (status) => {
    return status === 'Open' ? (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200">
        <FaCheck /> Open
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border border-red-200">
        <FaTimesCircle /> Closed
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
                <p className="text-green-100 mt-1">Manage jobs and scholarships</p>
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
                <p className="text-sm text-gray-600 font-medium">Active Opportunities</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeJobs + stats.activeScholarships}</p>
                <div className="text-xs text-gray-500 mt-2">Available for applications</div>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                <FaUsers className="text-2xl text-blue-600" />
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
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'jobs' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Job Form */}
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">
                        {isEditingJob ? 'Edit Job' : 'Create New Job'}
                      </h2>
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FaBriefcase className="text-green-600" />
                      </div>
                    </div>
                    
                    <form onSubmit={handleJobSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Job Title *</label>
                        <input
                          type="text"
                          name="title"
                          value={jobForm.title}
                          onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                          placeholder="Senior Software Engineer"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Company *</label>
                        <input
                          type="text"
                          name="company"
                          value={jobForm.company}
                          onChange={(e) => setJobForm({...jobForm, company: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                          placeholder="Company Name"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Job Type *</label>
                          <select
                            name="type"
                            value={jobForm.type}
                            onChange={(e) => setJobForm({...jobForm, type: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                            required
                          >
                            {jobTypeOptions.map(type => (
                              <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Location *</label>
                          <input
                            type="text"
                            name="location"
                            value={jobForm.location}
                            onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                            placeholder="Lagos, Nigeria"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Salary *</label>
                          <input
                            type="text"
                            name="salary"
                            value={jobForm.salary}
                            onChange={(e) => setJobForm({...jobForm, salary: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                            placeholder="100000"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Currency *</label>
                          <select
                            name="salary_currency"
                            value={jobForm.salary_currency}
                            onChange={(e) => setJobForm({...jobForm, salary_currency: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                            required
                          >
                            {currencyOptions.map(currency => (
                              <option key={currency.code} value={currency.code}>
                                {currency.name} ({currency.symbol})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Job URL</label>
                        <div className="relative">
                          <FaLink className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="url"
                            name="url"
                            value={jobForm.url}
                            onChange={(e) => setJobForm({...jobForm, url: e.target.value})}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                            placeholder="https://company.com/job"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Description *</label>
                        <textarea
                          name="description"
                          value={jobForm.description}
                          onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                          rows="4"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                          placeholder="Describe the job responsibilities and requirements..."
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Requirements (one per line) *</label>
                        <textarea
                          name="requirements"
                          value={jobForm.requirements}
                          onChange={(e) => setJobForm({...jobForm, requirements: e.target.value})}
                          rows="4"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                          placeholder="Bachelor's degree in Computer Science\n3+ years of experience..."
                          required
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="submit"
                          disabled={isJobLoading}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isJobLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              {isEditingJob ? 'Updating...' : 'Creating...'}
                            </>
                          ) : (
                            <>
                              {isEditingJob ? <FaEdit /> : <FaPlus />}
                              {isEditingJob ? 'Update Job' : 'Create Job'}
                            </>
                          )}
                        </button>
                        {isEditingJob && (
                          <button
                            type="button"
                            onClick={resetJobForm}
                            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>

                {/* Jobs List */}
                <div className="lg:col-span-2">
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Posted Jobs</h2>
                        <p className="text-gray-600 mt-1">{filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found</p>
                      </div>
                      <div className="relative w-full sm:w-auto">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search jobs..."
                          value={jobSearch}
                          onChange={(e) => setJobSearch(e.target.value)}
                          className="w-full sm:w-64 pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                        />
                      </div>
                    </div>
                    
                    {isJobLoading && filteredJobs.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading jobs...</p>
                      </div>
                    ) : filteredJobs.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-4">
                          <FaBriefcase className="text-green-400 text-2xl" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">No jobs found</h3>
                        <p className="text-gray-600">
                          {jobSearch ? 'Try adjusting your search terms' : 'Create your first job posting!'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {filteredJobs.map(job => {
                          const jobType = jobTypeOptions.find(t => t.id === job.type) || jobTypeOptions[0];
                          const JobTypeIcon = jobType.icon;
                          
                          return (
                            <div key={job.id} className="bg-white border-2 border-gray-100 rounded-xl p-5 hover:border-green-200 hover:shadow-md transition-all duration-300 group">
                              <div className="flex flex-col sm:flex-row justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-start gap-3 mb-3">
                                    <div className={`p-2.5 rounded-lg ${jobType.bg}`}>
                                      <JobTypeIcon className={`text-lg ${jobType.color}`} />
                                    </div>
                                    <div>
                                      <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                                        {job.title}
                                      </h3>
                                      <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                          <FaBuilding />
                                          <span>{job.company}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                          <FaMapMarkerAlt />
                                          <span>{job.location}</span>
                                        </div>
                                      </div>
                                      <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${jobType.bg} ${jobType.color}`}>
                                          {job.type}
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                          <FaMoneyBillWave className="inline mr-1" />
                                          {formatCurrency(job.salary, job.salary_currency)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  {job.url && (
                                    <a
                                      href={job.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300"
                                      title="View Job"
                                    >
                                      <FaExternalLinkAlt size={16} />
                                    </a>
                                  )}
                                  <button
                                    onClick={() => {
                                      setSelectedJob(job);
                                      setShowJobModal(true);
                                    }}
                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300"
                                    title="View Details"
                                  >
                                    <FaEye size={16} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setCurrentJob(job);
                                      setIsEditingJob(true);
                                      setJobForm({
                                        title: job.title,
                                        company: job.company,
                                        type: job.type,
                                        location: job.location,
                                        salary: job.salary?.toString() || '',
                                        salary_currency: job.salary_currency || 'NGN',
                                        description: job.description,
                                        requirements: job.requirements?.split(',').join('\n') || '',
                                        url: job.url || ''
                                      });
                                    }}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
                                    title="Edit"
                                  >
                                    <FaEdit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteJob(job.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                                    title="Delete"
                                  >
                                    <FaTrash size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Scholarship Form */}
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">
                        {isEditingScholarship ? 'Edit Scholarship' : 'Create New Scholarship'}
                      </h2>
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <FaGraduationCap className="text-emerald-600" />
                      </div>
                    </div>
                    
                    <form onSubmit={handleScholarshipSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Scholarship Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={scholarshipForm.name}
                          onChange={(e) => setScholarshipForm({...scholarshipForm, name: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                          placeholder="Merit Scholarship for STEM"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Provider *</label>
                        <input
                          type="text"
                          name="provider"
                          value={scholarshipForm.provider}
                          onChange={(e) => setScholarshipForm({...scholarshipForm, provider: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                          placeholder="Organization Name"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Type *</label>
                          <select
                            name="type"
                            value={scholarshipForm.type}
                            onChange={(e) => setScholarshipForm({...scholarshipForm, type: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                            required
                          >
                            {scholarshipTypeOptions.map(type => (
                              <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Field *</label>
                          <select
                            name="field"
                            value={scholarshipForm.field}
                            onChange={(e) => setScholarshipForm({...scholarshipForm, field: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                            required
                          >
                            {fieldOptions.map(field => (
                              <option key={field.id} value={field.id}>{field.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Amount *</label>
                          <input
                            type="text"
                            name="amount"
                            value={scholarshipForm.amount}
                            onChange={(e) => setScholarshipForm({...scholarshipForm, amount: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                            placeholder="50000"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Currency *</label>
                          <select
                            name="amount_currency"
                            value={scholarshipForm.amount_currency}
                            onChange={(e) => setScholarshipForm({...scholarshipForm, amount_currency: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                            required
                          >
                            {currencyOptions.map(currency => (
                              <option key={currency.code} value={currency.code}>
                                {currency.name} ({currency.symbol})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Status *</label>
                          <select
                            name="status"
                            value={scholarshipForm.status}
                            onChange={(e) => setScholarshipForm({...scholarshipForm, status: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                            required
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Deadline *</label>
                          <div className="relative">
                            <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="date"
                              name="deadline"
                              value={scholarshipForm.deadline}
                              onChange={(e) => setScholarshipForm({...scholarshipForm, deadline: e.target.value})}
                              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Scholarship URL</label>
                        <div className="relative">
                          <FaLink className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="url"
                            name="url"
                            value={scholarshipForm.url}
                            onChange={(e) => setScholarshipForm({...scholarshipForm, url: e.target.value})}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                            placeholder="https://scholarship.com/apply"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Description *</label>
                        <textarea
                          name="description"
                          value={scholarshipForm.description}
                          onChange={(e) => setScholarshipForm({...scholarshipForm, description: e.target.value})}
                          rows="4"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                          placeholder="Describe the scholarship opportunity..."
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Eligibility Criteria *</label>
                        <textarea
                          name="eligibility"
                          value={scholarshipForm.eligibility}
                          onChange={(e) => setScholarshipForm({...scholarshipForm, eligibility: e.target.value})}
                          rows="4"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                          placeholder="List eligibility requirements..."
                          required
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="submit"
                          disabled={isScholarshipLoading}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isScholarshipLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              {isEditingScholarship ? 'Updating...' : 'Creating...'}
                            </>
                          ) : (
                            <>
                              {isEditingScholarship ? <FaEdit /> : <FaPlus />}
                              {isEditingScholarship ? 'Update Scholarship' : 'Create Scholarship'}
                            </>
                          )}
                        </button>
                        {isEditingScholarship && (
                          <button
                            type="button"
                            onClick={resetScholarshipForm}
                            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>

                {/* Scholarships List */}
                <div className="lg:col-span-2">
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Posted Scholarships</h2>
                        <p className="text-gray-600 mt-1">{filteredScholarships.length} scholarship{filteredScholarships.length !== 1 ? 's' : ''} found</p>
                      </div>
                      <div className="relative w-full sm:w-auto">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search scholarships..."
                          value={scholarshipSearch}
                          onChange={(e) => setScholarshipSearch(e.target.value)}
                          className="w-full sm:w-64 pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                        />
                      </div>
                    </div>
                    
                    {isScholarshipLoading && filteredScholarships.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading scholarships...</p>
                      </div>
                    ) : filteredScholarships.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full flex items-center justify-center mb-4">
                          <FaGraduationCap className="text-emerald-400 text-2xl" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">No scholarships found</h3>
                        <p className="text-gray-600">
                          {scholarshipSearch ? 'Try adjusting your search terms' : 'Create your first scholarship!'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {filteredScholarships.map(scholarship => {
                          const scholarshipType = scholarshipTypeOptions.find(t => t.id === scholarship.type) || scholarshipTypeOptions[0];
                          const ScholarshipTypeIcon = scholarshipType.icon;
                          const field = fieldOptions.find(f => f.id === scholarship.field) || fieldOptions[0];
                          const FieldIcon = field.icon;
                          
                          return (
                            <div key={scholarship.id} className="bg-white border-2 border-gray-100 rounded-xl p-5 hover:border-emerald-200 hover:shadow-md transition-all duration-300 group">
                              <div className="flex flex-col sm:flex-row justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-start gap-3 mb-3">
                                    <div className={`p-2.5 rounded-lg ${scholarshipType.bg}`}>
                                      <ScholarshipTypeIcon className={`text-lg ${scholarshipType.color}`} />
                                    </div>
                                    <div>
                                      <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                                        {scholarship.name}
                                      </h3>
                                      <div className="flex items-center gap-2 mt-2">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                          <FaBuilding />
                                          <span>{scholarship.provider}</span>
                                        </div>
                                      </div>
                                      <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${field.bg} ${field.color}`}>
                                          <FieldIcon className="inline mr-1" />
                                          {scholarship.field}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${scholarshipType.bg} ${scholarshipType.color}`}>
                                          {scholarship.type}
                                        </span>
                                        {renderStatusBadge(scholarship.status)}
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                          <FaMoneyBillWave className="inline mr-1" />
                                          {formatCurrency(scholarship.amount, scholarship.amount_currency)}
                                        </span>
                                      </div>
                                      <div className="mt-3 flex items-center gap-1 text-sm text-gray-600">
                                        <FaCalendarAlt />
                                        <span>Deadline: {formatDate(scholarship.deadline)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  {scholarship.url && (
                                    <a
                                      href={scholarship.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-300"
                                      title="View Scholarship"
                                    >
                                      <FaExternalLinkAlt size={16} />
                                    </a>
                                  )}
                                  <button
                                    onClick={() => {
                                      setSelectedScholarship(scholarship);
                                      setShowScholarshipModal(true);
                                    }}
                                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-300"
                                    title="View Details"
                                  >
                                    <FaEye size={16} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setCurrentScholarship(scholarship);
                                      setIsEditingScholarship(true);
                                      setScholarshipForm({
                                        name: scholarship.name,
                                        provider: scholarship.provider,
                                        type: scholarship.type || 'Merit-Based',
                                        field: scholarship.field,
                                        amount: scholarship.amount?.toString() || '',
                                        amount_currency: scholarship.amount_currency || 'NGN',
                                        status: scholarship.status,
                                        deadline: scholarship.deadline,
                                        description: scholarship.description,
                                        eligibility: scholarship.eligibility,
                                        url: scholarship.url || ''
                                      });
                                    }}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
                                    title="Edit"
                                  >
                                    <FaEdit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteScholarship(scholarship.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                                    title="Delete"
                                  >
                                    <FaTrash size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Details Modal */}
      {showJobModal && selectedJob && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-900 opacity-75" onClick={() => setShowJobModal(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-gray-600">
                        <FaBuilding />
                        <span className="font-medium">{selectedJob.company}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <FaMapMarkerAlt />
                        <span>{selectedJob.location}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowJobModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-3">
                    {jobTypeOptions.find(t => t.id === selectedJob.type) && (
                      <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${jobTypeOptions.find(t => t.id === selectedJob.type).bg} ${jobTypeOptions.find(t => t.id === selectedJob.type).color}`}>
                        {selectedJob.type}
                      </span>
                    )}
                    <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-green-100 text-green-700">
                      <FaMoneyBillWave className="inline mr-1" />
                      {formatCurrency(selectedJob.salary, selectedJob.salary_currency)}
                    </span>
                    {selectedJob.url && (
                      <a
                        href={selectedJob.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-full text-sm font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                      >
                        <FaExternalLinkAlt className="inline mr-1" />
                        View Job
                      </a>
                    )}
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h4>
                    <div className="text-gray-700 whitespace-pre-line bg-gray-50 rounded-xl p-4">
                      {selectedJob.description}
                    </div>
                  </div>

                  {selectedJob.requirements && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h4>
                      <ul className="space-y-2">
                        {selectedJob.requirements.split(',').map((req, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-700">
                            <span className="text-green-500 mt-1">•</span>
                            <span>{req.trim()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 rounded-b-2xl">
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300"
                    onClick={() => setShowJobModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scholarship Details Modal */}
      {showScholarshipModal && selectedScholarship && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-900 opacity-75" onClick={() => setShowScholarshipModal(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedScholarship.name}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-gray-600">
                        <FaBuilding />
                        <span className="font-medium">{selectedScholarship.provider}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowScholarshipModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-3">
                    {fieldOptions.find(f => f.id === selectedScholarship.field) && (
                      <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${fieldOptions.find(f => f.id === selectedScholarship.field).bg} ${fieldOptions.find(f => f.id === selectedScholarship.field).color}`}>
                        <FieldIcon className="inline mr-1" />
                        {selectedScholarship.field}
                      </span>
                    )}
                    {renderStatusBadge(selectedScholarship.status)}
                    <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-emerald-100 text-emerald-700">
                      <FaMoneyBillWave className="inline mr-1" />
                      {formatCurrency(selectedScholarship.amount, selectedScholarship.amount_currency)}
                    </span>
                    <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-blue-100 text-blue-700">
                      <FaCalendarAlt className="inline mr-1" />
                      {formatDate(selectedScholarship.deadline)}
                    </span>
                    {selectedScholarship.url && (
                      <a
                        href={selectedScholarship.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-full text-sm font-bold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                      >
                        <FaExternalLinkAlt className="inline mr-1" />
                        Apply Now
                      </a>
                    )}
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
                    <div className="text-gray-700 whitespace-pre-line bg-gray-50 rounded-xl p-4">
                      {selectedScholarship.description}
                    </div>
                  </div>

                  {selectedScholarship.eligibility && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Eligibility Criteria</h4>
                      <div className="text-gray-700 whitespace-pre-line bg-gray-50 rounded-xl p-4">
                        {selectedScholarship.eligibility}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 rounded-b-2xl">
                <div className="flex justify-end gap-3">
                  {selectedScholarship.url && (
                    <a
                      href={selectedScholarship.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-300"
                    >
                      Apply Now
                    </a>
                  )}
                  <button
                    type="button"
                    className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-300"
                    onClick={() => setShowScholarshipModal(false)}
                  >
                    Close
                  </button>
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
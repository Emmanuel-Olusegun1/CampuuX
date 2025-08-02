import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  FaBriefcase, FaBuilding, FaMapMarkerAlt, FaMoneyBillWave, 
  FaFileAlt, FaTrash, FaEdit, FaGraduationCap, FaUsers,
  FaChartLine, FaCalendarAlt, FaEye, FaTimes, FaLink, FaCheck, FaTimesCircle
} from 'react-icons/fa';

const AdminDashboard = () => {
  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [isJobLoading, setIsJobLoading] = useState(false);
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);

  // Scholarships state
  const [scholarships, setScholarships] = useState([]);
  const [isScholarshipLoading, setIsScholarshipLoading] = useState(false);
  const [isEditingScholarship, setIsEditingScholarship] = useState(false);
  const [currentScholarship, setCurrentScholarship] = useState(null);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [showScholarshipModal, setShowScholarshipModal] = useState(false);

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
    activeOpportunities: 0
  });

  // Field options for scholarships
  const fieldOptions = ['STEM', 'Engineering', 'Business', 'Medical', 'Creative Arts'];
  
  // Status options for scholarships
  const statusOptions = ['Open', 'Closed'];

  // Job type options
  const jobTypeOptions = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'];

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
    if (!amount) return '';
    return `${currency.symbol}${amount.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  // Fetch all data
  const fetchData = async () => {
    try {
      setIsJobLoading(true);
      setIsScholarshipLoading(true);

      // Fetch jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch scholarships from Supabase
      const { data: scholarshipsData } = await supabase
        .from('scholarships')
        .select('*')
        .order('created_at', { ascending: false });

      setJobs(jobsData || []);
      setScholarships(scholarshipsData || []);
      setStats({
        totalJobs: jobsData?.length || 0,
        totalScholarships: scholarshipsData?.length || 0,
        activeOpportunities: (jobsData?.length || 0) + (scholarshipsData?.length || 0)
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsJobLoading(false);
      setIsScholarshipLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Jobs handlers
  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setIsJobLoading(true);

    try {
      const jobData = {
        ...jobForm,
        requirements: jobForm.requirements.split('\n').filter(r => r.trim() !== '').join(',')
      };

      if (isEditingJob && currentJob) {
        const { error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', currentJob.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('jobs')
          .insert([jobData]);
        
        if (error) throw error;
      }

      resetJobForm();
      fetchData();
    } catch (error) {
      console.error('Error saving job:', error);
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
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        const { error } = await supabase
          .from('jobs')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        fetchData();
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  // Scholarship handlers
  const handleScholarshipSubmit = async (e) => {
    e.preventDefault();
    setIsScholarshipLoading(true);
    
    try {
      const scholarshipData = {
        ...scholarshipForm,
        amount: scholarshipForm.amount
      };

      if (isEditingScholarship && currentScholarship) {
        const { error } = await supabase
          .from('scholarships')
          .update(scholarshipData)
          .eq('id', currentScholarship.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('scholarships')
          .insert([scholarshipData]);
        
        if (error) throw error;
      }
      
      resetScholarshipForm();
      fetchData();
    } catch (error) {
      console.error('Error saving scholarship:', error);
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
    if (window.confirm('Are you sure you want to delete this scholarship?')) {
      try {
        const { error } = await supabase
          .from('scholarships')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        fetchData();
      } catch (error) {
        console.error('Error deleting scholarship:', error);
      }
    }
  };

  // Render function for status badge
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

  return (
    <div className="min-h-screen bg-green-50">
      {/* Dashboard Header */}
      <div className="bg-green-600 shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <div className="flex space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <FaChartLine className="mr-1" /> Admin Mode
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg border border-green-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <FaBriefcase className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Jobs</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.totalJobs}</div>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg border border-green-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <FaGraduationCap className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Scholarships</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.totalScholarships}</div>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg border border-green-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <FaUsers className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Opportunities</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.activeOpportunities}</div>
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white shadow rounded-lg overflow-hidden border border-green-200">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('jobs')}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${activeTab === 'jobs' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <FaBriefcase className="inline mr-2" />
                Job Postings
              </button>
              <button
                onClick={() => setActiveTab('scholarships')}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${activeTab === 'scholarships' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <FaGraduationCap className="inline mr-2" />
                Scholarships
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'jobs' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Job Form */}
                <div className="lg:col-span-1">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h2 className="text-lg font-semibold mb-3">
                      {isEditingJob ? 'Edit Job' : 'Create New Job'}
                    </h2>
                    <form onSubmit={handleJobSubmit} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                        <input
                          type="text"
                          name="title"
                          value={jobForm.title}
                          onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                        <input
                          type="text"
                          name="company"
                          value={jobForm.company}
                          onChange={(e) => setJobForm({...jobForm, company: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                        <select
                          name="type"
                          value={jobForm.type}
                          onChange={(e) => setJobForm({...jobForm, type: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          required
                        >
                          {jobTypeOptions.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                          type="text"
                          name="location"
                          value={jobForm.location}
                          onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                          <input
                            type="text"
                            name="salary"
                            value={jobForm.salary}
                            onChange={(e) => setJobForm({...jobForm, salary: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                          <select
                            name="salary_currency"
                            value={jobForm.salary_currency}
                            onChange={(e) => setJobForm({...jobForm, salary_currency: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job URL</label>
                        <input
                          type="url"
                          name="url"
                          value={jobForm.url}
                          onChange={(e) => setJobForm({...jobForm, url: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          placeholder="https://example.com/job"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          name="description"
                          value={jobForm.description}
                          onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                          rows="4"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (one per line)</label>
                        <textarea
                          name="requirements"
                          value={jobForm.requirements}
                          onChange={(e) => setJobForm({...jobForm, requirements: e.target.value})}
                          rows="4"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <button
                          type="submit"
                          disabled={isJobLoading}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
                        >
                          {isJobLoading ? 'Saving...' : (isEditingJob ? 'Update' : 'Create')}
                        </button>
                        {isEditingJob && (
                          <button
                            type="button"
                            onClick={resetJobForm}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md"
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
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h2 className="text-lg font-semibold mb-3">Posted Jobs</h2>
                    
                    {isJobLoading && jobs.length === 0 ? (
                      <p>Loading jobs...</p>
                    ) : jobs.length === 0 ? (
                      <p>No jobs posted yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {jobs.map(job => (
                          <div key={job.id} className="p-3 bg-white rounded-md border border-gray-200 hover:shadow-sm">
                            <div className="flex justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium text-green-800">{job.title}</h3>
                                <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                                <span className={`inline-block mt-1 px-2 py-1 text-xs rounded ${
                                  job.type === 'Full-time' ? 'bg-green-100 text-green-800' :
                                  job.type === 'Part-time' ? 'bg-yellow-100 text-yellow-800' :
                                  job.type === 'Internship' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {job.type}
                                </span>
                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                  <FaMoneyBillWave className="mr-1" />
                                  {formatCurrency(job.salary, job.salary_currency)}
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                {job.url && (
                                  <a
                                    href={job.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-500 hover:text-green-600 p-1"
                                    title="View More"
                                  >
                                    <FaLink size={14} />
                                  </a>
                                )}
                                <button
                                  onClick={() => {
                                    setSelectedJob(job);
                                    setShowJobModal(true);
                                  }}
                                  className="text-gray-500 hover:text-green-600 p-1"
                                  title="View Details"
                                >
                                  <FaEye size={14} />
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
                                      salary: job.salary,
                                      salary_currency: job.salary_currency || 'NGN',
                                      description: job.description,
                                      requirements: job.requirements?.split(',').join('\n') || '',
                                      url: job.url || ''
                                    });
                                  }}
                                  className="text-gray-500 hover:text-blue-600 p-1"
                                  title="Edit"
                                >
                                  <FaEdit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteJob(job.id)}
                                  className="text-gray-500 hover:text-red-600 p-1"
                                  title="Delete"
                                >
                                  <FaTrash size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Scholarship Form */}
                <div className="lg:col-span-1">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h2 className="text-lg font-semibold mb-3">
                      {isEditingScholarship ? 'Edit Scholarship' : 'Create New Scholarship'}
                    </h2>
                    <form onSubmit={handleScholarshipSubmit} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Scholarship Name</label>
                        <input
                          type="text"
                          name="name"
                          value={scholarshipForm.name}
                          onChange={(e) => setScholarshipForm({...scholarshipForm, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                        <input
                          type="text"
                          name="provider"
                          value={scholarshipForm.provider}
                          onChange={(e) => setScholarshipForm({...scholarshipForm, provider: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Scholarship Type</label>
                        <select
                          name="type"
                          value={scholarshipForm.type}
                          onChange={(e) => setScholarshipForm({...scholarshipForm, type: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          required
                        >
                          <option value="Merit-Based">Merit-Based</option>
                          <option value="Need-Based">Need-Based</option>
                          <option value="Athletic">Athletic</option>
                          <option value="Minority">Minority</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Field/Domain</label>
                        <select
                          name="field"
                          value={scholarshipForm.field}
                          onChange={(e) => setScholarshipForm({...scholarshipForm, field: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          required
                        >
                          {fieldOptions.map((field) => (
                            <option key={field} value={field}>{field}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                          <input
                            type="text"
                            name="amount"
                            value={scholarshipForm.amount}
                            onChange={(e) => setScholarshipForm({...scholarshipForm, amount: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                          <select
                            name="amount_currency"
                            value={scholarshipForm.amount_currency}
                            onChange={(e) => setScholarshipForm({...scholarshipForm, amount_currency: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          name="status"
                          value={scholarshipForm.status}
                          onChange={(e) => setScholarshipForm({...scholarshipForm, status: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          required
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <FaCalendarAlt className="text-gray-400" />
                          </div>
                          <input
                            type="date"
                            name="deadline"
                            value={scholarshipForm.deadline}
                            onChange={(e) => setScholarshipForm({...scholarshipForm, deadline: e.target.value})}
                            className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Scholarship URL</label>
                        <input
                          type="url"
                          name="url"
                          value={scholarshipForm.url}
                          onChange={(e) => setScholarshipForm({...scholarshipForm, url: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          placeholder="https://example.com/scholarship"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          name="description"
                          value={scholarshipForm.description}
                          onChange={(e) => setScholarshipForm({...scholarshipForm, description: e.target.value})}
                          rows="4"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility Criteria</label>
                        <textarea
                          name="eligibility"
                          value={scholarshipForm.eligibility}
                          onChange={(e) => setScholarshipForm({...scholarshipForm, eligibility: e.target.value})}
                          rows="4"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <button
                          type="submit"
                          disabled={isScholarshipLoading}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
                        >
                          {isScholarshipLoading ? 'Saving...' : (isEditingScholarship ? 'Update' : 'Create')}
                        </button>
                        {isEditingScholarship && (
                          <button
                            type="button"
                            onClick={resetScholarshipForm}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md"
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
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h2 className="text-lg font-semibold mb-3">Posted Scholarships</h2>
                    
                    {isScholarshipLoading && scholarships.length === 0 ? (
                      <p>Loading scholarships...</p>
                    ) : scholarships.length === 0 ? (
                      <p>No scholarships posted yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {scholarships.map(scholarship => (
                          <div key={scholarship.id} className="p-3 bg-white rounded-md border border-gray-200 hover:shadow-sm">
                            <div className="flex justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium text-green-800">{scholarship.name}</h3>
                                <p className="text-sm text-gray-600">{scholarship.provider}</p>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {scholarship.field}
                                  </span>
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    {formatCurrency(scholarship.amount, scholarship.amount_currency)}
                                  </span>
                                  {renderStatusBadge(scholarship.status)}
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                  <FaCalendarAlt className="mr-1" />
                                  Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                {scholarship.url && (
                                  <a
                                    href={scholarship.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-500 hover:text-green-600 p-1"
                                    title="View More"
                                  >
                                    <FaLink size={14} />
                                  </a>
                                )}
                                <button
                                  onClick={() => {
                                    setSelectedScholarship(scholarship);
                                    setShowScholarshipModal(true);
                                  }}
                                  className="text-gray-500 hover:text-green-600 p-1"
                                  title="View Details"
                                >
                                  <FaEye size={14} />
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
                                      amount: scholarship.amount,
                                      amount_currency: scholarship.amount_currency || 'NGN',
                                      status: scholarship.status,
                                      deadline: scholarship.deadline,
                                      description: scholarship.description,
                                      eligibility: scholarship.eligibility,
                                      url: scholarship.url || ''
                                    });
                                  }}
                                  className="text-gray-500 hover:text-blue-600 p-1"
                                  title="Edit"
                                >
                                  <FaEdit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteScholarship(scholarship.id)}
                                  className="text-gray-500 hover:text-red-600 p-1"
                                  title="Delete"
                                >
                                  <FaTrash size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
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
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowJobModal(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {selectedJob.title}
                      </h3>
                      <button
                        onClick={() => setShowJobModal(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <FaTimes />
                      </button>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        <FaBuilding className="inline mr-1" /> {selectedJob.company}
                      </p>
                      <p className="text-sm text-gray-500">
                        <FaMapMarkerAlt className="inline mr-1" /> {selectedJob.location}
                      </p>
                      <p className="text-sm text-gray-500">
                        <FaMoneyBillWave className="inline mr-1" /> {formatCurrency(selectedJob.salary, selectedJob.salary_currency)}
                      </p>
                      {selectedJob.url && (
                        <p className="text-sm text-gray-500">
                          <FaLink className="inline mr-1" /> 
                          <a href={selectedJob.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            View Job Posting
                          </a>
                        </p>
                      )}
                      <span className={`inline-block mt-1 px-2 py-1 text-xs rounded ${
                        selectedJob.type === 'Full-time' ? 'bg-green-100 text-green-800' :
                        selectedJob.type === 'Part-time' ? 'bg-yellow-100 text-yellow-800' :
                        selectedJob.type === 'Internship' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedJob.type}
                      </span>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900">Job Description</h4>
                      <div className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                        {selectedJob.description}
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900">Requirements</h4>
                      <ul className="mt-2 text-sm text-gray-700 list-disc pl-5">
                        {selectedJob.requirements?.split(',').map((req, i) => (
                          <li key={i}>{req.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowJobModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scholarship Details Modal */}
      {showScholarshipModal && selectedScholarship && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowScholarshipModal(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {selectedScholarship.name}
                      </h3>
                      <button
                        onClick={() => setShowScholarshipModal(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <FaTimes />
                      </button>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        <FaBuilding className="inline mr-1" /> {selectedScholarship.provider}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {selectedScholarship.field}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {formatCurrency(selectedScholarship.amount, selectedScholarship.amount_currency)}
                        </span>
                        {renderStatusBadge(selectedScholarship.status)}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        <FaCalendarAlt className="inline mr-1" /> Deadline: {new Date(selectedScholarship.deadline).toLocaleDateString()}
                      </p>
                      {selectedScholarship.url && (
                        <p className="text-sm text-gray-500">
                          <FaLink className="inline mr-1" /> 
                          <a href={selectedScholarship.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            View Scholarship Details
                          </a>
                        </p>
                      )}
                    </div>
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900">Description</h4>
                      <div className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                        {selectedScholarship.description}
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900">Eligibility Criteria</h4>
                      <div className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                        {selectedScholarship.eligibility}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {selectedScholarship.url && (
                  <a
                    href={selectedScholarship.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Apply Now
                  </a>
                )}
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowScholarshipModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
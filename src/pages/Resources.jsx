import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSearch, FaUpload, FaTimes, FaBook, FaFileAlt, 
  FaFilter, FaArrowRight, FaQuestionCircle, FaGraduationCap,
  FaUser, FaArrowLeft, FaGlobe, FaDownload, FaExternalLinkAlt
} from 'react-icons/fa';
import { supabase } from "../lib/supabase";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';

function Resources() {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
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
    { id: 'all', name: 'All', icon: FaFilter },
    { id: 'past_questions', name: 'Past Questions', icon: FaQuestionCircle },
    { id: 'e_books', name: 'E-Books', icon: FaBook },
    { id: 'courses', name: 'Courses', icon: FaGraduationCap },
    { id: 'lecture_notes', name: 'Lecture Notes', icon: FaFileAlt }
  ];

  // Fetch resources from Supabase
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true);
        let query = supabase
          .from('resources')
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
        setResources(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, [searchQuery, selectedCategory]);

  // Handle file upload and resource creation
  const handleShareSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

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
        uploaded_by: formData.is_anonymous ? null : formData.uploader_name || 'User',
        created_at: new Date().toISOString()
      };

      // Remove null values to prevent 400 errors
      const cleanData = Object.fromEntries(
        Object.entries(resourceData).filter(([_, v]) => v !== null)
      );

      // Insert resource into database
      const { error: insertError } = await supabase
        .from('resources')
        .insert([cleanData]);

      if (insertError) throw insertError;

      // Refresh resources
      const { data } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      setResources(data);
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
    } catch (err) {
      setError(err.message);
      console.error('Submission error:', err);
    } finally {
      setIsLoading(false);
    }
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

  // Filter resources locally (fallback)
  const filteredResources = resources.filter(item =>
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
          <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-6 md:p-8 text-white mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
              Academic Resources
            </h1>
            <p className="text-lg md:text-xl text-gray-100">
              Browse and share educational materials from the community.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input 
                type="text" 
                placeholder="Search resources..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow px-4 py-2 md:py-3 rounded-lg border focus:ring-2 focus:ring-green-500"
              />
              <Button 
                onClick={() => {
                  setIsShareOpen(true);
                  setCurrentStep(1);
                }}
                className="cursor-pointer bg-green-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg text-sm md:text-base"
              > Share Resource
              </Button>
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

          {/* Share Modal - Multi-step */}
          {isShareOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 my-8">
                <div className="flex justify-between items-center p-4 md:p-6 border-b">
                  <h3 className="text-xl md:text-2xl font-bold">
                    {currentStep === 1 && 'Resource Details'}
                    {currentStep === 2 && 'Uploader Information'}
                    {currentStep === 3 && 'Upload Options'}
                  </h3>
                  <button onClick={() => {
                    setIsShareOpen(false);
                    setCurrentStep(1);
                  }}>
                    <FaTimes className="cursor-pointer w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleShareSubmit} className="p-4 md:p-6">
                  {/* Step 1: Resource Details */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="e.g., CS101 Past Questions 2023"
                          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Describe the resource"
                          rows="4"
                          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                          className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg disabled:bg-gray-300"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Uploader Information */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="upload_option"
                            checked={!formData.is_anonymous}
                            onChange={() => setFormData(prev => ({ ...prev, is_anonymous: false }))}
                            className="text-green-600 focus:ring-green-500"
                          />
                          <span className="ml-2">Show my name</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="upload_option"
                            checked={formData.is_anonymous}
                            onChange={() => setFormData(prev => ({ ...prev, is_anonymous: true }))}
                            className="text-green-600 focus:ring-green-500"
                          />
                          <span className="ml-2">Share anonymously</span>
                        </label>
                      </div>

                      {!formData.is_anonymous && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Your Name (Optional)</label>
                          <input
                            type="text"
                            name="uploader_name"
                            value={formData.uploader_name}
                            onChange={handleInputChange}
                            placeholder="How you want to be credited"
                            className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      )}

                      <div className="flex justify-between pt-4">
                        <Button
                          type="button"
                          onClick={prevStep}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                        >
                        Back
                        </Button>
                        <Button
                          type="button"
                          onClick={nextStep}
                          className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Upload Options */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">File (Optional)</label>
                        <label className="block mt-1 flex justify-center px-4 pt-4 pb-5 md:px-6 md:pt-5 md:pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-green-500 transition-colors">
                          <div className="space-y-1 text-center">
                            {formData.file ? (
                              <>
                                <p className="text-sm text-gray-900 font-medium">{formData.file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(formData.file.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </>
                            ) : (
                              <>
                                <FaUpload className="mx-auto h-8 w-8 md:h-10 md:w-10 text-gray-400" />
                                <div className="flex text-xs md:text-sm text-gray-600 justify-center">
                                  <span className="relative bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none">
                                    Select a file
                                  </span>
                                  <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">
                                  PDF, DOCX, PPTX up to 10MB
                                </p>
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

                      <div className="pt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">OR Paste URL (Optional)</label>
                        <div className="flex items-center">
                          <FaGlobe className="text-gray-400 mr-2" />
                          <input
                            type="url"
                            name="url"
                            value={formData.url}
                            onChange={handleInputChange}
                            placeholder="https://example.com/resource"
                            className="flex-grow px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>

                      {uploadProgress > 0 && (
                        <div className="pt-2">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-600 transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 text-right">
                            {uploadProgress}% uploaded
                          </p>
                        </div>
                      )}

                      <div className="flex justify-between pt-4">
                        <Button
                          type="button"
                          onClick={prevStep}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                        >
                        Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg disabled:bg-green-400"
                        >
                          {isLoading ? 'Sharing...' : 'Share Resource'}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* Resources List */}
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {filteredResources.length > 0 ? (
                  filteredResources.map(item => (
                    <div key={item.id} className="p-3 md:p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center">
                        {item.category === 'past_questions' && <FaQuestionCircle className="text-green-600 mr-3 md:mr-4 w-4 h-4 md:w-5 md:h-5" />}
                        {item.category === 'e_books' && <FaBook className="text-green-600 mr-3 md:mr-4 w-4 h-4 md:w-5 md:h-5" />}
                        {item.category === 'courses' && <FaGraduationCap className="text-green-600 mr-3 md:mr-4 w-4 h-4 md:w-5 md:h-5" />}
                        {item.category === 'lecture_notes' && <FaFileAlt className="text-green-600 mr-3 md:mr-4 w-4 h-4 md:w-5 md:h-5" />}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm md:text-base font-medium truncate">{item.title}</h3>
                          <p className="text-xs md:text-sm text-gray-600 line-clamp-2">{item.description}</p>
                          <div className="flex items-center mt-1">
                            <p className="text-xs text-gray-500">
                              {item.uploaded_by ? `Shared by ${item.uploaded_by}` : 'Shared anonymously'}
                            </p>
                            <div className="flex space-x-2 ml-2">
                              {item.file_name && (
                                <button
                                  onClick={() => openInViewer(item.url)}
                                  className="text-xs md:text-sm text-green-600 hover:underline flex items-center"
                                >
                                  <FaDownload className="mr-1" /> View Document
                                </button>
                              )}
                              {item.url && !item.file_name && (
                                <a 
                                  href={item.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs md:text-sm text-green-600 hover:underline flex items-center"
                                >
                                  <FaExternalLinkAlt className="mr-1" /> View Resource
                                </a>
                              )}
                              {item.file_name && item.url && (
                                <a 
                                  href={item.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs md:text-sm text-green-600 hover:underline flex items-center"
                                >
                                  <FaExternalLinkAlt className="mr-1" /> Original URL
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-gray-500 text-sm md:text-base">
                    No resources found. Be the first to share!
                  </p>
                )}
              </div>
            )}
          </div>
{/* Improved "Can't Find What You Need?" Section */}
<div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl mt-4 p-8 md:p-10 text-center text-white">
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-center mb-4">
                <FaQuestionCircle className="text-white text-4xl" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Can't Find What You Need?
              </h3>
              <p className="text-lg md:text-xl text-green-100 mb-6">
                Let us know what resource you're looking for and we'll help you find it or notify you when it becomes available.
              </p>
              <div className="flex justify-center">
                <Link 
                  to="/request_resource" 
                  className="inline-block bg-white text-green-600 hover:bg-green-50 font-medium px-8 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Request a Resource
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
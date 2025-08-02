import { Link } from "react-router-dom";
import { FaUsers, FaBook, FaBriefcase, FaArrowRight, FaArrowDown, FaQuoteLeft, FaStar, FaQuestionCircle, FaSearch, FaUpload } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";  

function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80"></div>
        <div className="absolute inset-0">
          <img
            src="https://res.cloudinary.com/dzibfknxq/image/upload/v1752722294/Download_premium_image_of_Friends_People_Group_Teamwork_Diversity_about_black_student_african_student_african_american_students_students_talking_and_tutoring_25546_c2lf9j.jpg"
            alt="Students collaborating"
            className="w-full h-full object-cover opacity-30 transition-opacity duration-1000"
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="mb-8 inline-flex px-5 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-lg animate-fade-in">
            <span className="text-sm font-semibold text-white tracking-wide">50,000+ Resources Shared</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold mb-6 leading-tight animate-slide-up">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">Discover.</span> <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">Share.</span> <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">Succeed.</span>
          </h1>
          <p className="text-xl sm:text-2xl mb-10 max-w-3xl mx-auto text-gray-200 animate-fade-in delay-200">
            The open platform for students to find and share academic resources, opportunities, and jobs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/resources"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              Browse Resources <FaArrowRight className="ml-2" />
            </Link>
            <Link
              to="/share"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 backdrop-blur-lg"
            >
              Share Content <FaUpload className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "50K+", label: "Resources", icon: <FaBook className="text-3xl text-green-500 mb-2 mx-auto" /> },
              { number: "10K+", label: "Opportunities", icon: <FaBriefcase className="text-3xl text-green-600 mb-2 mx-auto" /> },
              { number: "15K+", label: "Students", icon: <FaUsers className="text-3xl text-green-500 mb-2 mx-auto" /> },
              { number: "100+", label: "Universities", icon: <FaUsers className="text-3xl text-green-600 mb-2 mx-auto" /> }
            ].map((stat, index) => (
              <div key={index} className="text-center group animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                {stat.icon}
                <p className="text-5xl font-extrabold text-black mb-2 group-hover:scale-110 transition-transform duration-300">{stat.number}</p>
                <p className="text-gray-600 uppercase text-sm font-medium tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-black mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800">Why CampuusX?</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              An open platform to find everything students need
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaBook className="text-4xl text-green-500 mb-4" />,
                title: "Find Resources",
                description: "Access lecture notes, past exams, and study materials shared by students."
              },
              {
                icon: <FaBriefcase className="text-4xl text-green-600 mb-4" />,
                title: "Discover Opportunities",
                description: "Find internships, jobs, and scholarships posted by the community."
              },
              {
                icon: <FaUpload className="text-4xl text-green-500 mb-4" />,
                title: "Share Easily",
                description: "Contribute resources and opportunities without any login required."
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-green-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {feature.icon}
                <h3 className="text-2xl font-semibold text-black mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-black mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800">Get Started Instantly</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Browse",
                description: "Search for resources and opportunities by university, course, or keyword"
              },
              {
                step: "02",
                title: "Download",
                description: "Access materials directly with no login required"
              },
              {
                step: "03",
                title: "Contribute",
                description: "Share your resources and opportunities with fellow students"
              }
            ].map((item, index) => (
              <div key={index} className="group">
                <div className="relative h-full bg-white p-8 rounded-2xl border border-gray-200 group-hover:border-green-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-slide-up"
                     style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="text-8xl font-extrabold absolute -right-4 -top-4 text-gray-100 group-hover:text-green-100 transition-all duration-300 z-0">
                    {item.step}
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-semibold text-black mb-4">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-semibold text-black mb-6 text-center">Find What You Need</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                placeholder="Search for resources, jobs, internships..." 
                className="flex-grow px-6 py-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 flex items-center justify-center">
                <FaSearch className="mr-2" /> Search
              </button>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm">Past Questions</button>
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm">Lecture Notes</button>
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm">Internships</button>
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm">Scholarships</button>
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm">Part-time Jobs</button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">Student Experiences</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              How CampuusX has helped students succeed
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                quote: "Found all my course materials on CampuusX without any hassle. Saved me so much time!",
                name: "Aisha B.",
                school: "Computer Science, UNILAG"
              },
              {
                quote: "Landed my first internship through an opportunity posted here. No login needed!",
                name: "Emeka O.",
                school: "Business Admin, Covenant"
              }
            ].map((testimonial, index) => (
              <div 
                key={index}
                className="bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-green-500 transition-all duration-300 hover:shadow-lg animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start mb-6">
                  <FaQuoteLeft className="text-3xl text-green-400 mr-4" />
                  <p className="text-xl text-gray-200 italic">"{testimonial.quote}"</p>
                </div>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-gray-400">{testimonial.school}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-black mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800">Frequently Asked Questions</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about using CampuusX
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: "Do I need to create an account?",
                answer: "No! CampuusX is completely open. You can browse, download, and share resources without any login."
              },
              {
                question: "How do I share content?",
                answer: "Simply go to our Share page, fill in the details about your resource or opportunity, and submit. No registration needed."
              },
              {
                question: "Is there any verification of content?",
                answer: "Our community moderators review all submissions to ensure quality and relevance for students."
              },
              {
                question: "Can I request specific resources?",
                answer: "Yes! Use our request feature to ask for materials you need, and other students can help by uploading them."
              }
            ].map((faq, index) => (
              <div 
                key={index}
                className="bg-gray-50 p-8 rounded-2xl border border-gray-200 hover:border-green-500 transition-all duration-300 hover:shadow-lg animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start mb-4">
                  <FaQuestionCircle className="text-3xl text-green-500 mr-4" />
                  <h3 className="text-xl font-semibold text-black">{faq.question}</h3>
                </div>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-gradient-to-br from-green-600 to-green-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold mb-6 animate-slide-up">
            Start Exploring Now
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto text-gray-100 animate-fade-in">
            Join thousands of students benefiting from shared knowledge and opportunities.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/resources"
              className="inline-flex items-center justify-center gap-2 bg-white text-green-700 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              Browse Resources <FaArrowRight className="ml-2" />
            </Link>
            <Link
              to="/share"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 backdrop-blur-lg"
            >
              Share Content <FaUpload className="ml-2" />
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default Home;
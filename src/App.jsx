import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages for code splitting
const Register = lazy(() => import('./pages/Register'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
const CareerDashboard = lazy(() => import('./pages/CareerDashboard'));
const ResumeUpload = lazy(() => import('./pages/ResumeUpload'));
const SkillGapAnalysis = lazy(() => import('./pages/SkillGapAnalysis'));
const LearningRoadmap = lazy(() => import('./pages/LearningRoadmap'));
const CourseCatalog = lazy(() => import('./pages/CourseCatalog'));
const CourseDetails = lazy(() => import('./pages/CourseDetails'));
const LessonViewer = lazy(() => import('./pages/LessonViewer'));
const MyEnrollments = lazy(() => import('./pages/MyEnrollments'));
const MyCertificates = lazy(() => import('./pages/MyCertificates'));
const CertificateVerify = lazy(() => import('./pages/CertificateVerify'));
const CreatorApplication = lazy(() => import('./pages/CreatorApplication'));
const CreatorDashboard = lazy(() => import('./pages/CreatorDashboard'));
const CreatorCourses = lazy(() => import('./pages/CreatorCourses'));
const CreatorAnalytics = lazy(() => import('./pages/CreatorAnalytics'));
const CourseForm = lazy(() => import('./pages/CourseForm'));
const LessonManagement = lazy(() => import('./pages/LessonManagement'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminApplications = lazy(() => import('./pages/AdminApplications'));
const AdminSkillDemand = lazy(() => import('./pages/AdminSkillDemand'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminCourses = lazy(() => import('./pages/AdminCourses'));
const TranscriptAnalysisDemo = lazy(() => import('./pages/TranscriptAnalysisDemo'));

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Modern Header with Glass Effect */}
      <header className="glass sticky top-0 z-50 border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 gradient-primary rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                  Career GPS
                </h1>
                <p className="text-xs text-gray-500">Navigate Your Future</p>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  {/* Common Links - Courses only for learners */}
                  {user?.role === 'learner' && (
                    <Link
                      to="/courses"
                      className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium"
                    >
                      Courses
                    </Link>
                  )}
                  
                  {/* Learner-specific Links */}
                  {user?.role === 'learner' && (
                    <>
                      <Link
                        to="/career/dashboard"
                        className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium"
                      >
                        Career Dashboard
                      </Link>
                      <Link
                        to="/enrollments"
                        className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium"
                      >
                        My Enrollments
                      </Link>
                      <Link
                        to="/certificates"
                        className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium"
                      >
                        Certificates
                      </Link>
                    </>
                  )}
                  
                  {/* Creator-specific Links */}
                  {(user?.role === 'creator') && (
                    <>
                      <Link
                        to="/creator/dashboard"
                        className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium"
                      >
                        Creator Dashboard
                      </Link>
                      <Link
                        to="/creator/courses"
                        className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium"
                      >
                        My Courses
                      </Link>
                    </>
                  )}
                  
                  {/* Admin-specific Links */}
                  {user?.role === 'admin' && (
                    <>
                      <Link
                        to="/admin/dashboard"
                        className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium"
                      >
                        Admin Panel
                      </Link>
                    </>
                  )}
                  
                  <Link
                    to="/profile"
                    className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium"
                  >
                    Profile
                  </Link>
                  
                  {/* User Badge */}
                  <div className="ml-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg border border-primary-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="hidden xl:block">
                        <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={logout}
                    className="ml-2 px-3 sm:px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:scale-105 text-sm sm:text-base"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 sm:px-6 py-2 sm:py-2.5 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium text-sm sm:text-base"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 sm:px-6 py-2 sm:py-2.5 gradient-primary text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium transform hover:scale-105 text-sm sm:text-base"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile Menu Button */}
            {isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden ml-2 p-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}
          </div>

          {/* Mobile Menu */}
          {isAuthenticated && mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4 animate-fade-in">
              <div className="flex flex-col space-y-2">
                {/* Common Links - Courses only for learners */}
                {user?.role === 'learner' && (
                  <Link
                    to="/courses"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium"
                  >
                    📚 Courses
                  </Link>
                )}
                
                {/* Learner-specific Links */}
                {user?.role === 'learner' && (
                  <>
                    <Link
                      to="/career/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium"
                    >
                      🎯 Career Dashboard
                    </Link>
                    <Link
                      to="/enrollments"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium"
                    >
                      📖 My Enrollments
                    </Link>
                    <Link
                      to="/certificates"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium"
                    >
                      🏆 Certificates
                    </Link>
                  </>
                )}
                
                {/* Creator-specific Links */}
                {user?.role === 'creator' && (
                  <>
                    <Link
                      to="/creator/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium"
                    >
                      📊 Creator Dashboard
                    </Link>
                    <Link
                      to="/creator/courses"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium"
                    >
                      📚 My Courses
                    </Link>
                  </>
                )}
                
                {/* Admin-specific Links */}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium"
                  >
                    ⚙️ Admin Panel
                    </Link>
                )}
                
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium"
                >
                  👤 Profile
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected Routes - Require Authentication */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          
          {/* Career GPS Routes - Protected */}
          <Route
            path="/career/dashboard"
            element={
              <ProtectedRoute>
                <CareerDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/career/resume-upload"
            element={
              <ProtectedRoute>
                <ResumeUpload />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/career/skill-gap"
            element={
              <ProtectedRoute>
                <SkillGapAnalysis />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/career/roadmap"
            element={
              <ProtectedRoute>
                <LearningRoadmap />
              </ProtectedRoute>
            }
          />
          
          {/* Course Catalog - Public */}
          <Route path="/courses" element={<CourseCatalog />} />
          
          {/* Course Details - Public */}
          <Route path="/courses/:id" element={<CourseDetails />} />
          
          {/* Lesson Viewer - Protected */}
          <Route
            path="/lessons/:id"
            element={
              <ProtectedRoute>
                <LessonViewer />
              </ProtectedRoute>
            }
          />
          
          {/* My Enrollments - Protected */}
          <Route
            path="/enrollments"
            element={
              <ProtectedRoute>
                <MyEnrollments />
              </ProtectedRoute>
            }
          />
          
          {/* My Certificates - Protected */}
          <Route
            path="/certificates"
            element={
              <ProtectedRoute>
                <MyCertificates />
              </ProtectedRoute>
            }
          />
          
          {/* Certificate Verification - Public */}
          <Route path="/certificates/verify/:id?" element={<CertificateVerify />} />
          
          {/* Transcript Analysis Demo - Protected */}
          <Route
            path="/transcript-demo"
            element={
              <ProtectedRoute>
                <TranscriptAnalysisDemo />
              </ProtectedRoute>
            }
          />
          
          {/* Creator Application - Protected */}
          <Route
            path="/creator/apply"
            element={
              <ProtectedRoute>
                <CreatorApplication />
              </ProtectedRoute>
            }
          />
          
          {/* Creator Dashboard - Protected */}
          <Route
            path="/creator/dashboard"
            element={
              <ProtectedRoute allowedRoles={['creator']}>
                <CreatorDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Creator Courses List - Protected */}
          <Route
            path="/creator/courses"
            element={
              <ProtectedRoute allowedRoles={['creator']}>
                <CreatorCourses />
              </ProtectedRoute>
            }
          />
          
          {/* Creator Analytics - Protected */}
          <Route
            path="/creator/analytics"
            element={
              <ProtectedRoute allowedRoles={['creator']}>
                <CreatorAnalytics />
              </ProtectedRoute>
            }
          />
          
          {/* Creator Course Management - Protected */}
          <Route
            path="/creator/courses/new"
            element={
              <ProtectedRoute allowedRoles={['creator']}>
                <CourseForm />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/creator/courses/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['creator']}>
                <CourseForm />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/creator/courses/:courseId/lessons"
            element={
              <ProtectedRoute allowedRoles={['creator']}>
                <LessonManagement />
              </ProtectedRoute>
            }
          />
          
          {/* Creator-only Routes */}
          <Route
            path="/creator/*"
            element={
              <ProtectedRoute allowedRoles={['creator']}>
                <CreatorArea />
              </ProtectedRoute>
            }
          />
          
          {/* Admin-only Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/applications"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminApplications />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/skill-demand"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSkillDemand />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminCourses />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminArea />
              </ProtectedRoute>
            }
          />
          </Routes>
        </Suspense>
      </main>
      
      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © 2026 Career GPS Platform. Navigate your career with confidence.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Home() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="text-center py-8 sm:py-16 px-4">
        <div className="inline-block mb-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-primary-100 to-purple-100 rounded-full">
          <span className="text-primary-700 font-semibold text-xs sm:text-sm">🚀 AI-Powered Career Navigation</span>
        </div>
        
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
          Navigate Your Career
          <br />
          <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">With Confidence</span>
        </h2>
        
        <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
          Discover skill gaps, get personalized learning roadmaps, and accelerate your career growth with AI-powered insights and curated microcourses.
        </p>
        
        {!isAuthenticated && (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Link
              to="/register"
              className="w-full sm:w-auto group px-6 sm:px-8 py-3 sm:py-4 gradient-primary text-white rounded-xl hover:shadow-2xl transition-all duration-300 font-semibold text-base sm:text-lg transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Get Started Free</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-600 border-2 border-primary-200 rounded-xl hover:border-primary-400 hover:shadow-lg transition-all duration-300 font-semibold text-base sm:text-lg text-center"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
      
      {/* Features Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-16 px-4">
        <div className="group bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
          <div className="w-12 h-12 sm:w-14 sm:h-14 gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Skill Gap Analysis</h3>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Identify exactly what skills you need to reach your dream role with AI-powered analysis.
          </p>
        </div>
        
        <div className="group bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Learning Roadmaps</h3>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Get personalized, step-by-step learning paths tailored to your goals and timeline.
          </p>
        </div>
        
        <div className="group bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 sm:col-span-2 md:col-span-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Curated Courses</h3>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Access high-quality microcourses designed by industry experts to fill your skill gaps.
          </p>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="mt-12 sm:mt-20 bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-white mx-4 sm:mx-0">
        <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center">
          <div className="animate-fade-in">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-2">10K+</div>
            <div className="text-xs sm:text-sm md:text-base text-primary-100">Active Learners</div>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-2">500+</div>
            <div className="text-xs sm:text-sm md:text-base text-primary-100">Expert Courses</div>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-2">95%</div>
            <div className="text-xs sm:text-sm md:text-base text-primary-100">Success Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect users to their role-specific dashboard
    if (user?.role === 'learner') {
      navigate('/career/dashboard', { replace: true });
    } else if (user?.role === 'creator') {
      navigate('/creator/dashboard', { replace: true });
    } else if (user?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else {
      // Fallback to career dashboard for unknown roles
      navigate('/career/dashboard', { replace: true });
    }
  }, [user, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500"></div>
        <p className="text-gray-600 font-medium">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}

function CreatorArea() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/creator/dashboard', { replace: true });
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
    </div>
  );
}

function AdminArea() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/admin/dashboard', { replace: true });
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
    </div>
  );
}

function Unauthorized() {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Unauthorized</h2>
      <p className="text-gray-600 mb-4">
        You do not have permission to access this page.
      </p>
      <Link to="/" className="text-primary-600 hover:text-primary-700">
        Go back to home
      </Link>
    </div>
  );
}

export default App;

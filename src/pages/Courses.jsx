import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { 
  Search, 
  Filter, 
  Play, 
  Clock, 
  Users, 
  Star, 
  ChevronRight,
  BookOpen,
  Award,
  Globe,
  Lock
} from 'lucide-react'
import { fetchCourses, setSearchQuery, setFilters } from '../store/slices/courseSlice'
import { openModal } from '../store/slices/uiSlice'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const CourseCard = ({ course }) => {
  const { isAuthenticated } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  const handleCourseClick = () => {
    if (isAuthenticated) {
      // Navigate to course detail if authenticated
      window.location.href = `/courses/${course.id}`
    } else {
      // Open login modal if not authenticated
      dispatch(openModal('login'))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      onClick={handleCourseClick}
    >
      <div className="aspect-video bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center relative overflow-hidden">
        <Play className="h-12 w-12 text-white z-10" />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        {course.thumbnail && (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {!isAuthenticated && (
          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg flex items-center space-x-1">
            <Lock className="h-3 w-3" />
            <span className="text-xs">Login Required</span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
            {course.category || 'Cybersecurity'}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {course.level || 'Intermediate'}
          </span>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {course.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {course.description}
        </p>
        
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{course.duration || '10 hours'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{course.enrollments?.[0]?.count || 0} students</span>
          </div>
          <div className="flex items-center space-x-1">
            <BookOpen className="h-4 w-4" />
            <span>{course.lessons?.[0]?.count || 0} lessons</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              4.8 ({course.enrollments?.[0]?.count || 0})
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {course.price ? (
              <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                ${course.price}
              </span>
            ) : (
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                Free
              </span>
            )}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors flex items-center justify-center space-x-2">
            <span>{isAuthenticated ? 'View Course' : 'Login to Access'}</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const FilterSection = ({ filters, onFilterChange, searchQuery, onSearchChange }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.category}
            onChange={(e) => onFilterChange({ category: e.target.value })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Categories</option>
            <option value="penetration-testing">Penetration Testing</option>
            <option value="ethical-hacking">Ethical Hacking</option>
            <option value="incident-response">Incident Response</option>
            <option value="malware-analysis">Malware Analysis</option>
            <option value="digital-forensics">Digital Forensics</option>
          </select>

          <select
            value={filters.level}
            onChange={(e) => onFilterChange({ level: e.target.value })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <select
            value={filters.duration}
            onChange={(e) => onFilterChange({ duration: e.target.value })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Any Duration</option>
            <option value="short">Under 5 hours</option>
            <option value="medium">5-20 hours</option>
            <option value="long">20+ hours</option>
          </select>
        </div>
      </div>
    </div>
  )
}

const Courses = () => {
  const { courses, loading, error, searchQuery, filters } = useSelector(state => state.courses)
  const { isAuthenticated } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      dispatch(openModal('login'))
      return
    }
    
    dispatch(fetchCourses())
  }, [dispatch, isAuthenticated])

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters))
  }

  const handleSearchChange = (query) => {
    dispatch(setSearchQuery(query))
  }

  // Filter courses based on search and filters
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = filters.category === 'all' || course.category === filters.category
    const matchesLevel = filters.level === 'all' || course.level === filters.level
    
    return matchesSearch && matchesCategory && matchesLevel
  })

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mb-4">
                <Lock className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Login Required
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Please log in to access our cybersecurity courses and start your learning journey.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => dispatch(openModal('login'))}
                className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors"
              >
                <span>Sign In</span>
              </button>
              <button
                onClick={() => dispatch(openModal('signup'))}
                className="inline-flex items-center justify-center space-x-2 border-2 border-primary-500 text-primary-600 dark:text-primary-400 px-6 py-3 rounded-lg hover:bg-primary-500 hover:text-white transition-colors"
              >
                <span>Sign Up</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Cybersecurity Courses - SecurGeek</title>
        <meta name="description" content="Browse our comprehensive collection of cybersecurity courses. Learn penetration testing, ethical hacking, incident response, and more." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Cybersecurity Courses
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Master the skills needed to protect organizations from cyber threats with our comprehensive training programs.
            </p>
          </div>

          {/* Filters */}
          <FilterSection
            filters={filters}
            onFilterChange={handleFilterChange}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
          />

          {/* Course Grid */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No courses found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="text-primary-100 mb-6">
              We're constantly adding new courses. Contact us to suggest a topic or request custom training.
            </p>
            <button className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Courses
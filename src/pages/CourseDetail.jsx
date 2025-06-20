import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  Award, 
  ChevronRight,
  Download,
  Share2,
  Heart,
  CheckCircle
} from 'lucide-react'
import { fetchCourseById, enrollInCourse, fetchEnrolledCourses } from '../store/slices/courseSlice'
import { openModal } from '../store/slices/uiSlice'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const CourseDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentCourse, enrolledCourses, loading, error } = useSelector(state => state.courses)
  const { user, isAuthenticated } = useSelector(state => state.auth)
  const [isEnrolled, setIsEnrolled] = useState(false)

  useEffect(() => {
    if (id) {
      dispatch(fetchCourseById(id))
    }
  }, [dispatch, id])

  // Fetch enrolled courses when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      dispatch(fetchEnrolledCourses(user.id))
    }
  }, [dispatch, isAuthenticated, user?.id])

  // Check if user is enrolled in current course
  useEffect(() => {
    if (currentCourse && enrolledCourses && user?.id) {
      const enrollment = enrolledCourses.find(
        enrollment => enrollment.course_id === currentCourse.id
      )
      setIsEnrolled(!!enrollment)
    }
  }, [currentCourse, enrolledCourses, user?.id])

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      dispatch(openModal('login'))
      return
    }

    // Prevent duplicate enrollment
    if (isEnrolled) {
      toast.info('You are already enrolled in this course!')
      return
    }

    try {
      await dispatch(enrollInCourse({ courseId: id, userId: user.id }))
      setIsEnrolled(true)
      toast.success('Successfully enrolled in course!')
    } catch (error) {
      toast.error('Failed to enroll in course')
    }
  }

  const handleStartLearning = () => {
    navigate(`/courses/${id}/learn`)
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

  if (error || !currentCourse) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Course Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            The course you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/courses"
            className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{currentCourse.title} - SecurGeek</title>
        <meta name="description" content={currentCourse.description} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          {/* Course Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="md:flex">
              <div className="md:w-1/2">
                <div className="aspect-video bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                  <Play className="h-16 w-16 text-white" />
                </div>
              </div>
              <div className="md:w-1/2 p-8">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                    {currentCourse.category || 'Cybersecurity'}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {currentCourse.level || 'Intermediate'}
                  </span>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {currentCourse.title}
                </h1>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {currentCourse.description}
                </p>
                
                <div className="flex items-center space-x-6 mb-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{currentCourse.duration || '10 hours'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{currentCourse.enrollments?.[0]?.count || 0} students</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{currentCourse.lessons?.length || 0} lessons</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    4.8 ({currentCourse.enrollments?.[0]?.count || 0} reviews)
                  </span>
                </div>
                
                <div className="flex items-center space-x-4">
                  {isEnrolled ? (
                    <button
                      onClick={handleStartLearning}
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors flex items-center space-x-2"
                    >
                      <Play className="h-5 w-5" />
                      <span>Continue Learning</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors flex items-center space-x-2"
                    >
                      <BookOpen className="h-5 w-5" />
                      <span>Enroll Now</span>
                    </button>
                  )}
                  
                  {currentCourse.price && (
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      ${currentCourse.price}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Course Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Course Overview
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-300">
                    {currentCourse.long_description || currentCourse.description}
                  </p>
                </div>
              </div>

              {/* Course Curriculum */}
              {currentCourse.lessons && currentCourse.lessons.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Course Curriculum
                  </h2>
                  <div className="space-y-4">
                    {currentCourse.lessons.map((lesson, index) => (
                      <div key={lesson.id} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                              {index + 1}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {lesson.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {lesson.duration || '10 min'}
                          </p>
                        </div>
                        <Play className="h-5 w-5 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Course Features */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  What You'll Learn
                </h3>
                <ul className="space-y-3">
                  {[
                    'Advanced penetration testing techniques',
                    'Ethical hacking methodologies',
                    'Security vulnerability assessment',
                    'Incident response procedures',
                    'Digital forensics fundamentals'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Course Requirements */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Requirements
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• Basic understanding of networking</li>
                  <li>• Familiarity with Linux command line</li>
                  <li>• No prior cybersecurity experience required</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CourseDetail
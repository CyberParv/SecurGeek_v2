import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  Play, 
  Calendar,
  Target,
  Users,
  CheckCircle
} from 'lucide-react'
import { fetchEnrolledCourses } from '../store/slices/courseSlice'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const Dashboard = () => {
  const dispatch = useDispatch()
  const { enrolledCourses, loading } = useSelector(state => state.courses)
  const { user, profile } = useSelector(state => state.auth)

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchEnrolledCourses(user.id))
    }
  }, [dispatch, user])

  const stats = [
    {
      icon: BookOpen,
      label: 'Courses Enrolled',
      value: enrolledCourses.length,
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      icon: CheckCircle,
      label: 'Courses Completed',
      value: enrolledCourses.filter(e => e.progress === 100).length,
      color: 'text-green-600',
      bg: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      icon: Clock,
      label: 'Hours Learned',
      value: '24',
      color: 'text-purple-600',
      bg: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      icon: Award,
      label: 'Certificates',
      value: enrolledCourses.filter(e => e.progress === 100).length,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100 dark:bg-yellow-900/20'
    }
  ]

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
        <title>Dashboard - SecurGeek</title>
        <meta name="description" content="Track your learning progress and manage your cybersecurity courses." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user?.user_metadata?.first_name || 'Student'}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Continue your cybersecurity learning journey
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Enrolled Courses */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    My Courses
                  </h2>
                  <Link
                    to="/courses"
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                  >
                    Browse More
                  </Link>
                </div>

                {enrolledCourses.length > 0 ? (
                  <div className="space-y-4">
                    {enrolledCourses.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                              {enrollment.course.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              {enrollment.course.description}
                            </p>
                            
                            {/* Progress Bar */}
                            <div className="flex items-center space-x-3">
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                                  style={{ width: `${enrollment.progress || 0}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                {enrollment.progress || 0}%
                              </span>
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            <Link
                              to={`/courses/${enrollment.course.id}/learn`}
                              className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors flex items-center space-x-2"
                            >
                              <Play className="h-4 w-4" />
                              <span>Continue</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No courses enrolled yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Start your cybersecurity journey by enrolling in a course
                    </p>
                    <Link
                      to="/courses"
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors"
                    >
                      Browse Courses
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Learning Goals */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Learning Goals
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-primary-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Complete 3 courses this month
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-primary-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Study 2 hours daily
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-primary-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Earn 2 certificates
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Completed lesson: Introduction to Cybersecurity
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Started course: Ethical Hacking Fundamentals
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Earned certificate: Network Security Basics
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard
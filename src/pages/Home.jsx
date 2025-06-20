import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { 
  Shield, 
  Users, 
  Award, 
  TrendingUp, 
  Play, 
  ChevronRight,
  Star,
  CheckCircle,
  BookOpen,
  Globe,
  Lock,
  Clock,
  Smartphone,
  Target,
  Headphones,
  BarChart3
} from 'lucide-react'
import { fetchCourses } from '../store/slices/courseSlice'
import { openModal } from '../store/slices/uiSlice'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const Hero = () => {
  const { isAuthenticated } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  return (
    <section className="relative bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 py-20 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Learn{' '}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Cybersecurity
              </span>{' '}
              Anywhere, Anytime
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Transform your commute into a cybersecurity masterclass. Quality video lessons designed for busy professionals.
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">20+</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Audio Lessons</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400"><10min</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Per Lesson</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Access</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/courses"
                className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <BookOpen className="h-5 w-5" />
                <span>Start Learning</span>
              </Link>
              <Link
                to="/courses"
                className="border-2 border-primary-500 text-primary-600 dark:text-primary-400 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-500 hover:text-white transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Play className="h-5 w-5" />
                <span>Preview Lessons</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

const VideoLearningFeatures = () => {
  const features = [
    {
      icon: Smartphone,
      title: 'Learn While Mobile',
      description: 'Turn your commute, workout, or daily walk into a productive learning session.',
    },
    {
      icon: Target,
      title: 'Real-World Applications',
      description: 'Practical examples and actionable security strategies you can implement immediately.',
    },
    {
      icon: Clock,
      title: 'Bite-Sized Lessons',
      description: 'Concise 10-minute lessons designed for optimal retention and engagement.',
    },
  ]

  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Why Video Learning?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Our video-based approach makes cybersecurity training accessible and engaging for busy professionals.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg mb-4">
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const FeaturedCourses = () => {
  const { courses, loading } = useSelector(state => state.courses)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchCourses())
  }, [dispatch])

  // Get top 3 courses by enrollment count
  const getTopCourses = () => {
    if (!courses || courses.length === 0) return []
    
    // Sort courses by enrollment count (descending) and take top 3
    const sortedCourses = [...courses].sort((a, b) => {
      const aEnrollments = a.enrollments?.[0]?.count || 0
      const bEnrollments = b.enrollments?.[0]?.count || 0
      return bEnrollments - aEnrollments
    })
    
    return sortedCourses.slice(0, 3)
  }

  const topCourses = getTopCourses()

  // Static fallback programs
  const staticPrograms = [
    {
      title: 'Cybersecurity Basics & Awareness',
      description: 'Master the fundamentals of cybersecurity with interactive training. Learn to identify threats, implement defensive strategies, and protect digital assets.',
      icon: Shield,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Social Engineering Defense',
      description: 'Recognize and counter manipulation tactics used by hackers. Covers phishing, impersonation, and practical defense strategies.',
      icon: Users,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Data Privacy Fundamentals',
      description: 'Understand data privacy, regulatory requirements, best practices, and privacy controls.',
      icon: Lock,
      color: 'from-green-500 to-green-600'
    }
  ]

  if (loading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Courses
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Comprehensive cybersecurity courses designed for SMEs and professionals.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {topCourses.length > 0 ? (
            // Show real courses if available
            topCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg mb-4`}>
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {course.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {course.description}
                </p>
                <Link
                  to={`/courses/${course.id}`}
                  className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
                >
                  <span>View Details</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </motion.div>
            ))
          ) : (
            // Show static programs as fallback
            staticPrograms.map((program, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${program.color} rounded-lg mb-4`}>
                  <program.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {program.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {program.description}
                </p>
                <Link
                  to="/courses"
                  className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
                >
                  <span>View Details</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </motion.div>
            ))
          )}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/courses"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-3 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors"
          >
            <span>View All Courses</span>
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

const WhyChooseUs = () => {
  const features = [
    'Customized training for SMEs',
    'Interactive learning modules',
    'Real-world scenario simulations',
    'Progress tracking & reporting',
    'Multilingual support',
    'Mobile-friendly platform'
  ]

  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Why Choose Our Training?
            </h2>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-video bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <Users className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg font-semibold">Corporate Training Session</p>
                <p className="text-sm opacity-90">Interactive cybersecurity workshops</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const CTA = () => {
  const { isAuthenticated } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  return (
    <section className="py-16 bg-gradient-to-r from-primary-500 to-secondary-500">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Strengthen Your Security Culture?
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Start building your human firewall today with our comprehensive security awareness training programs.
          </p>
          {isAuthenticated ? (
            <Link
              to="/courses"
              className="inline-flex items-center space-x-2 bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <BookOpen className="h-5 w-5" />
              <span>Browse Courses</span>
            </Link>
          ) : (
            <button
              onClick={() => dispatch(openModal('signup'))}
              className="inline-flex items-center space-x-2 bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <Shield className="h-5 w-5" />
              <span>Get Started Today</span>
            </button>
          )}
        </motion.div>
      </div>
    </section>
  )
}

const Home = () => {
  return (
    <>
      <Helmet>
        <title>SecurGeek - Learn Cybersecurity Anywhere, Anytime</title>
        <meta name="description" content="Transform your commute into a cybersecurity masterclass. Quality video lessons designed for busy professionals. 20+ audio lessons, under 10 minutes each, with 24/7 access." />
        <meta name="keywords" content="cybersecurity training, video learning, mobile learning, security awareness, SME training" />
      </Helmet>
      
      <div className="min-h-screen">
        <Hero />
        <VideoLearningFeatures />
        <FeaturedCourses />
        <WhyChooseUs />
        <CTA />
      </div>
    </>
  )
}

export default Home
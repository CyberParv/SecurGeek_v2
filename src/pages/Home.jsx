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
  Lock
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
              Master{' '}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Cybersecurity
              </span>{' '}
              Skills
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Learn from industry experts and advance your career with hands-on training in 
              penetration testing, ethical hacking, incident response, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link
                  to="/courses"
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Browse Courses</span>
                </Link>
              ) : (
                <button
                  onClick={() => dispatch(openModal('signup'))}
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Shield className="h-5 w-5" />
                  <span>Start Learning</span>
                </button>
              )}
              <Link
                to="/courses"
                className="border-2 border-primary-500 text-primary-600 dark:text-primary-400 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-500 hover:text-white transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Play className="h-5 w-5" />
                <span>Watch Demo</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

const Stats = () => {
  const stats = [
    { icon: Users, value: '10,000+', label: 'Students Trained' },
    { icon: Award, value: '50+', label: 'Expert Instructors' },
    { icon: BookOpen, value: '200+', label: 'Courses Available' },
    { icon: TrendingUp, value: '95%', label: 'Success Rate' },
  ]

  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg mb-4">
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                {stat.label}
              </div>
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

  const featuredCourses = courses.slice(0, 3)

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
            Featured Courses
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get started with our most popular cybersecurity courses, designed by industry experts.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {featuredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="aspect-video bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                <Play className="h-12 w-12 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      ({course.enrollments?.[0]?.count || 0})
                    </span>
                  </div>
                  <Link
                    to={`/courses/${course.id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
                  >
                    <span>Learn More</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
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

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: 'Industry-Standard Training',
      description: 'Learn the latest cybersecurity techniques and tools used by professionals worldwide.',
    },
    {
      icon: Globe,
      title: 'Real-World Scenarios',
      description: 'Practice with hands-on labs and simulations based on actual security incidents.',
    },
    {
      icon: Award,
      title: 'Industry Certifications',
      description: 'Earn recognized certificates that boost your career prospects in cybersecurity.',
    },
    {
      icon: Lock,
      title: 'Secure Learning Environment',
      description: 'Practice safely in our isolated environments without risk to real systems.',
    },
  ]

  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose SecurGeek?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We provide comprehensive cybersecurity training with hands-on experience and industry-recognized certifications.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
            Ready to Start Your Cybersecurity Journey?
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have advanced their careers with our comprehensive cybersecurity training programs.
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
        <title>SecurGeek - Master Cybersecurity Skills</title>
        <meta name="description" content="Learn cybersecurity from industry experts. Master penetration testing, ethical hacking, incident response, and more with hands-on training." />
        <meta name="keywords" content="cybersecurity, training, ethical hacking, penetration testing, security courses" />
      </Helmet>
      
      <div className="min-h-screen">
        <Hero />
        <Stats />
        <FeaturedCourses />
        <Features />
        <CTA />
      </div>
    </>
  )
}

export default Home
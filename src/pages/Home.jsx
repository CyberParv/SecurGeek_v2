import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { 
  Shield, 
  Users, 
  Award, 
  Play, 
  ChevronRight,
  CheckCircle,
  BookOpen,
  Globe,
  Lock,
  Clock,
  Smartphone,
  Target,
  Headphones,
  Zap,
  Brain,
  Eye,
  ArrowRight
} from 'lucide-react'
import { fetchCourses } from '../store/slices/courseSlice'
import { openModal } from '../store/slices/uiSlice'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Optimized floating geometric shapes */}
      <motion.div
        className="absolute top-20 left-10 w-12 h-12 bg-gradient-to-r from-primary-400/10 to-secondary-400/10 rounded-full blur-sm"
        animate={{
          y: [0, -10, 0],
          x: [0, 5, 0],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-32 right-16 w-8 h-8 bg-gradient-to-r from-secondary-400/10 to-primary-400/10 rounded-lg blur-sm"
        animate={{
          y: [0, 8, 0],
          x: [0, -8, 0],
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-32 left-1/4 w-6 h-6 bg-gradient-to-r from-cyber-400/10 to-primary-400/10 rounded-full blur-sm"
        animate={{
          y: [0, -12, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  )
}

const Hero = () => {
  // const { isAuthenticated } = useSelector(state => state.auth)
  // const dispatch = useDispatch()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden py-16">
      {/* Optimized background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-3"></div>
      
      {/* Floating elements */}
      <FloatingElements />
      
      {/* Optimized gradient orbs */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-r from-secondary-500/5 to-cyber-500/5 rounded-full blur-2xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <motion.div 
              className="inline-flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-primary-200 dark:border-primary-800 rounded-full px-4 py-2 mb-6"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Zap className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Transform Your Cybersecurity Skills
              </span>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Learn{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-cyber-600 bg-clip-text text-transparent">
                  Cybersecurity
                </span>
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full"
                  style={{ zIndex: -1 }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                />
              </span>{' '}
              <br />Anywhere, Anytime
            </h1>
          </motion.div>

          <motion.div variants={itemVariants}>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
              Transform your commute into a cybersecurity masterclass. Quality video lessons designed for busy professionals.
            </p>
          </motion.div>
          
          {/* Enhanced Stats */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-6 mb-8"
          >
            {[
              { number: "20+", label: "Audio Lessons", icon: Headphones, color: "from-primary-500 to-primary-600" },
              { number: "<10min", label: "Per Lesson", icon: Clock, color: "from-secondary-500 to-secondary-600" },
              { number: "24/7", label: "Access", icon: Globe, color: "from-cyber-500 to-cyber-600" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center group"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className={`w-12 h-12 mx-auto mb-2 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Link
                to="/courses"
                className="group relative bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <BookOpen className="h-5 w-5 group-hover:rotate-6 transition-transform duration-200" />
                <span>Start Learning</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Link
                to="/courses"
                className="group relative border-2 border-primary-500 text-primary-600 dark:text-primary-400 px-6 py-3 rounded-xl text-lg font-semibold hover:bg-primary-500 hover:text-white transition-all duration-200 flex items-center justify-center space-x-2 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50"
              >
                <Play className="h-5 w-5 group-hover:scale-105 transition-transform duration-200" />
                <span>Preview Lessons</span>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
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
      color: 'from-blue-500 to-blue-600',
      delay: 0
    },
    {
      icon: Target,
      title: 'Real-World Applications',
      description: 'Practical examples and actionable security strategies you can implement immediately.',
      color: 'from-purple-500 to-purple-600',
      delay: 0.1
    },
    {
      icon: Brain,
      title: 'Bite-Sized Lessons',
      description: 'Concise 10-minute lessons designed for optimal retention and engagement.',
      color: 'from-green-500 to-green-600',
      delay: 0.2
    },
  ]

  return (
    <section className="py-16 bg-white dark:bg-gray-800 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-cyber-500"></div>
      
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full px-4 py-2 mb-4"
            whileHover={{ scale: 1.01 }}
          >
            <Eye className="h-4 w-4" />
            <span className="font-medium">Why Video Learning?</span>
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Learn Smarter, Not Harder
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Our video-based approach makes cybersecurity training accessible and engaging for busy professionals.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: feature.delay }}
              viewport={{ once: true }}
              whileHover={{ y: -3 }}
            >
              <div className="relative bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg group-hover:shadow-xl transition-all duration-200 border border-gray-100 dark:border-gray-600 overflow-hidden">
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl mb-4 group-hover:scale-105 transition-transform duration-200 shadow-lg`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
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

  // Get top 3 courses by enrollment count
  const getTopCourses = () => {
    if (!courses || courses.length === 0) return []
    
    const sortedCourses = [...courses].sort((a, b) => {
      const aEnrollments = a.enrollments?.[0]?.count || 0
      const bEnrollments = b.enrollments?.[0]?.count || 0
      return bEnrollments - aEnrollments
    })
    
    return sortedCourses.slice(0, 3)
  }

  const topCourses = getTopCourses()

  // Enhanced static fallback programs
  const staticPrograms = [
    {
      title: 'Cybersecurity Basics & Awareness',
      description: 'Master the fundamentals of cybersecurity with interactive training. Learn to identify threats, implement defensive strategies, and protect digital assets.',
      icon: Shield,
      color: 'from-blue-500 to-blue-600',
      gradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20'
    },
    {
      title: 'Social Engineering Defense',
      description: 'Recognize and counter manipulation tactics used by hackers. Covers phishing, impersonation, and practical defense strategies.',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      gradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20'
    },
    {
      title: 'Data Privacy Fundamentals',
      description: 'Understand data privacy, regulatory requirements, best practices, and privacy controls.',
      icon: Lock,
      color: 'from-green-500 to-green-600',
      gradient: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20'
    }
  ]

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-16 left-8 w-16 h-16 bg-primary-500/3 rounded-full blur-xl"></div>
        <div className="absolute bottom-16 right-8 w-20 h-20 bg-secondary-500/3 rounded-full blur-xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full px-4 py-2 mb-4"
            whileHover={{ scale: 1.01 }}
          >
            <BookOpen className="h-4 w-4" />
            <span className="font-medium">Featured Courses</span>
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Start Your Journey
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Comprehensive cybersecurity courses designed for SMEs and professionals.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {(topCourses.length > 0 ? topCourses : staticPrograms).map((course, index) => (
            <motion.div
              key={course.id || index}
              className="group relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -3 }}
            >
              <div className={`relative bg-gradient-to-br ${course.gradient || 'from-white to-gray-50 dark:from-gray-800 dark:to-gray-700'} rounded-2xl p-6 shadow-lg group-hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-600 overflow-hidden`}>
                {/* Animated border */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-secondary-500 to-cyber-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-[2px] bg-white dark:bg-gray-800 rounded-2xl"></div>
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${course.color || 'from-primary-500 to-secondary-500'} rounded-xl mb-4 group-hover:scale-105 transition-transform duration-200 shadow-lg`}>
                    {course.icon ? (
                      <course.icon className="h-6 w-6 text-white" />
                    ) : (
                      <BookOpen className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed text-sm">
                    {course.description}
                  </p>
                  <motion.div
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Link
                      to={course.id ? `/courses/${course.id}` : '/courses'}
                      className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold group-hover:text-primary-700 transition-colors duration-200"
                    >
                      <span>View Details</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Link
              to="/courses"
              className="group inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
            >
              <span>View All Courses</span>
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </motion.div>
        </motion.div>
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
    <section className="py-16 bg-white dark:bg-gray-800 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-l from-primary-500/3 to-transparent rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-r from-secondary-500/3 to-transparent rounded-full blur-2xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center space-x-2 bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400 rounded-full px-4 py-2 mb-4"
              whileHover={{ scale: 1.01 }}
            >
              <Award className="h-4 w-4" />
              <span className="font-medium">Why Choose Us</span>
            </motion.div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Training That Actually Works
            </h2>
            
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3 group"
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ x: 5 }}
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-success-500 to-success-600 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200 font-medium">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-2 -left-2 w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl opacity-20 blur-lg"></div>
              <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-r from-secondary-500 to-cyber-500 rounded-xl opacity-20 blur-lg"></div>
              
              <motion.div 
                className="relative aspect-video bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-xl overflow-hidden"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {/* Animated background pattern */}
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                
                <div className="relative text-center text-white z-10">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.02, 1],
                      rotate: [0, 1, -1, 0]
                    }}
                    transition={{ 
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <img 
                      src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800" 
                      alt="Corporate Training Session"
                      className="w-full h-64 md:h-80 lg:h-96 object-cover rounded-2xl"
                      style={{ minHeight: '16rem', maxHeight: '28rem' }}
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-2xl flex items-end justify-center p-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-2 drop-shadow-lg">Corporate Training Session</h3>
                      <p className="text-lg opacity-95 drop-shadow-lg">Interactive cybersecurity workshops</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

const CTA = () => {
  const { isAuthenticated } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  return (
    <section className="py-16 bg-gradient-to-br from-primary-500 via-secondary-500 to-cyber-500 relative overflow-hidden">
      {/* Optimized animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-8 left-8 w-12 h-12 bg-white/5 rounded-full blur-lg"
          animate={{
            y: [0, -10, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-8 right-8 w-16 h-16 bg-white/5 rounded-full blur-lg"
          animate={{
            y: [0, 10, 0],
            x: [0, -10, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white rounded-full px-4 py-2 mb-6"
            whileHover={{ scale: 1.01 }}
          >
            <Shield className="h-4 w-4" />
            <span className="font-medium">Ready to Get Started?</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Ready to Strengthen Your{' '}
            <span className="relative">
              Security Culture?
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-1 bg-white/50 rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                viewport={{ once: true }}
              />
            </span>
          </h2>
          
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Start building your human firewall today with our comprehensive security awareness training programs.
          </p>
          
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {isAuthenticated ? (
              <Link
                to="/courses"
                className="group inline-flex items-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-200 shadow-2xl hover:shadow-3xl"
              >
                <BookOpen className="h-5 w-5 group-hover:rotate-6 transition-transform duration-200" />
                <span>Browse Courses</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            ) : (
              <button
                onClick={() => dispatch(openModal('signup'))}
                className="group inline-flex items-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-200 shadow-2xl hover:shadow-3xl"
              >
                <Shield className="h-5 w-5 group-hover:rotate-6 transition-transform duration-200" />
                <span>Get Started Today</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            )}
          </motion.div>
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
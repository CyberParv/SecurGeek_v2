import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  Moon, 
  Sun, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings,
  BookOpen,
  BarChart3,
  Crown,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'
import { toggleTheme, openModal } from '../../store/slices/uiSlice'
import { signOut } from '../../store/slices/authSlice'

const ContactModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Contact Us
              </h2>
              <motion.button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </motion.button>
            </div>
            
            <div className="space-y-6">
              <motion.div 
                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Email</p>
                  <p className="text-gray-600 dark:text-gray-300">securgeek@gmail.com</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-secondary-50 to-cyber-50 dark:from-secondary-900/20 dark:to-cyber-900/20 rounded-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-secondary-500 to-cyber-500 rounded-xl flex items-center justify-center">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Phone</p>
                  <p className="text-gray-600 dark:text-gray-300">+91 8826038451</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-cyber-50 to-primary-50 dark:from-cyber-900/20 dark:to-primary-900/20 rounded-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-cyber-500 to-primary-500 rounded-xl flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Address</p>
                  <p className="text-gray-600 dark:text-gray-300">Manipal University Jaipur, Rajasthan-303007</p>
                </div>
              </motion.div>
              
              <div className="pt-4">
                <motion.button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Close
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isContactOpen, setIsContactOpen] = useState(false)
  const { theme } = useSelector(state => state.ui)
  const { user, isAuthenticated, profile } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await dispatch(signOut())
    navigate('/')
    setIsProfileOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen)
  }

  const openContactModal = () => {
    setIsContactOpen(true)
    setIsMenuOpen(false)
  }

  useEffect(() => {
    setIsMenuOpen(false)
    setIsProfileOpen(false)
  }, [])

  const isAdmin = user?.user_metadata?.role === 'admin' || profile?.role === 'admin'

  return (
    <>
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link to="/" className="flex items-center space-x-3">
                <div className="relative">
                  <div className="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl shadow-lg">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl blur opacity-30"></div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  SecurGeek
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {[
                { to: "/", label: "Home" },
                { to: "/courses", label: "Courses" },
                { action: openContactModal, label: "Contact Us" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {item.to ? (
                    <Link 
                      to={item.to}
                      className="relative text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium group"
                    >
                      {item.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 group-hover:w-full transition-all duration-300"></span>
                    </Link>
                  ) : (
                    <button
                      onClick={item.action}
                      className="relative text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium group"
                    >
                      {item.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 group-hover:w-full transition-all duration-300"></span>
                    </button>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <motion.button
                onClick={() => dispatch(toggleTheme())}
                className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait">
                  {theme === 'light' ? (
                    <motion.div
                      key="moon"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="sun"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Authentication */}
              {isAuthenticated ? (
                <div className="relative">
                  <motion.button
                    onClick={toggleProfile}
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
                        {isAdmin ? (
                          <Crown className="h-5 w-5 text-white" />
                        ) : (
                          <User className="h-5 w-5 text-white" />
                        )}
                      </div>
                      {isAdmin && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                          <Crown className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="hidden md:block text-gray-700 dark:text-gray-300 font-medium">
                      {user?.user_metadata?.first_name || profile?.first_name || 'User'}
                    </span>
                  </motion.button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 backdrop-blur-xl"
                      >
                        {[
                          { to: "/dashboard", icon: BarChart3, label: "Dashboard" },
                          { to: "/profile", icon: Settings, label: "Profile" },
                          { to: "/courses", icon: BookOpen, label: "My Courses" }
                        ].map((item, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ x: 4 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Link
                              to={item.to}
                              className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <item.icon className="h-5 w-5" />
                              <span className="font-medium">{item.label}</span>
                            </Link>
                          </motion.div>
                        ))}
                        
                        {isAdmin && (
                          <>
                            <hr className="my-2 border-gray-200 dark:border-gray-700" />
                            <motion.div
                              whileHover={{ x: 4 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <Link
                                to="/admin"
                                className="flex items-center space-x-3 px-4 py-3 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                                onClick={() => setIsProfileOpen(false)}
                              >
                                <Crown className="h-5 w-5" />
                                <span className="font-medium">Admin Dashboard</span>
                              </Link>
                            </motion.div>
                          </>
                        )}
                        
                        <hr className="my-2 border-gray-200 dark:border-gray-700" />
                        <motion.button
                          onClick={handleSignOut}
                          className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                          whileHover={{ x: 4 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <LogOut className="h-5 w-5" />
                          <span className="font-medium">Sign Out</span>
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <motion.button
                    onClick={() => dispatch(openModal('login'))}
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign In
                  </motion.button>
                  <motion.button
                    onClick={() => dispatch(openModal('signup'))}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2.5 rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign Up
                  </motion.button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                onClick={toggleMenu}
                className="md:hidden p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4"
              >
                <div className="flex flex-col space-y-4">
                  {[
                    { to: "/", label: "Home" },
                    { to: "/courses", label: "Courses" },
                    { action: openContactModal, label: "Contact Us" }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {item.to ? (
                        <Link 
                          to={item.to}
                          className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <button
                          onClick={item.action}
                          className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-left font-medium"
                        >
                          {item.label}
                        </button>
                      )}
                    </motion.div>
                  ))}
                  
                  {isAuthenticated && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Link 
                        to="/dashboard" 
                        className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </motion.div>
                  )}
                  
                  {isAdmin && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Link 
                        to="/admin" 
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors flex items-center space-x-2 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Crown className="h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Contact Modal */}
      <ContactModal 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)} 
      />
    </>
  )
}

export default Navbar
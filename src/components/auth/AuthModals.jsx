import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, Shield, AlertCircle, Check } from 'lucide-react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import toast from 'react-hot-toast'
import { closeModal, openModal } from '../../store/slices/uiSlice'
import { signUp, signIn } from '../../store/slices/authSlice'
import { validatePassword } from '../../lib/supabase'
import LoadingSpinner from '../ui/LoadingSpinner'

const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

const PasswordStrengthIndicator = ({ password }) => {
  const validation = validatePassword(password)
  
  const criteria = [
    { key: 'minLength', label: 'At least 8 characters', valid: validation.minLength },
    { key: 'hasUpperCase', label: 'One uppercase letter', valid: validation.hasUpperCase },
    { key: 'hasLowerCase', label: 'One lowercase letter', valid: validation.hasLowerCase },
    { key: 'hasNumbers', label: 'One number', valid: validation.hasNumbers },
    { key: 'hasSpecialChar', label: 'One special character', valid: validation.hasSpecialChar },
  ]

  return (
    <div className="mt-2">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        Password strength:
      </div>
      <div className="space-y-1">
        {criteria.map((criterion) => (
          <div key={criterion.key} className="flex items-center space-x-2">
            {criterion.valid ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm ${criterion.valid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {criterion.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const AuthModals = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { modals } = useSelector(state => state.ui)
  const { loading, error } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  const signUpSchema = Yup.object({
    firstName: Yup.string()
      .min(2, 'First name must be at least 2 characters')
      .required('First name is required'),
    lastName: Yup.string()
      .min(2, 'Last name must be at least 2 characters')
      .required('Last name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Please confirm your password'),
    agreeToTerms: Yup.boolean()
      .oneOf([true], 'You must agree to the terms and conditions'),
  })

  const signInSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required'),
  })

  const signUpFormik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
    validationSchema: signUpSchema,
    onSubmit: async (values) => {
      try {
        const result = await dispatch(signUp({
          email: values.email,
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName,
        }))
        
        if (signUp.fulfilled.match(result)) {
          toast.success('Account created successfully! Please check your email to verify your account.')
          dispatch(closeModal('signup'))
          signUpFormik.resetForm()
        }
      } catch (error) {
        toast.error(error.message || 'Failed to create account')
      }
    },
  })

  const signInFormik = useFormik({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validationSchema: signInSchema,
    onSubmit: async (values) => {
      try {
        const result = await dispatch(signIn({
          email: values.email,
          password: values.password,
        }))
        
        if (signIn.fulfilled.match(result)) {
          toast.success('Welcome back!')
          dispatch(closeModal('login'))
          signInFormik.resetForm()
        }
      } catch (error) {
        toast.error(error.message || 'Failed to sign in')
      }
    },
  })

  const handleModalClose = (modalName) => {
    dispatch(closeModal(modalName))
    if (modalName === 'signup') {
      signUpFormik.resetForm()
    } else if (modalName === 'login') {
      signInFormik.resetForm()
    }
  }

  return (
    <>
      {/* Sign Up Modal */}
      <Modal
        isOpen={modals.signup}
        onClose={() => handleModalClose('signup')}
        title="Create Your Account"
      >
        <form onSubmit={signUpFormik.handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                {...signUpFormik.getFieldProps('firstName')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="John"
              />
              {signUpFormik.touched.firstName && signUpFormik.errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{signUpFormik.errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                {...signUpFormik.getFieldProps('lastName')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Doe"
              />
              {signUpFormik.touched.lastName && signUpFormik.errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{signUpFormik.errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              {...signUpFormik.getFieldProps('email')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="john@example.com"
            />
            {signUpFormik.touched.email && signUpFormik.errors.email && (
              <p className="mt-1 text-sm text-red-600">{signUpFormik.errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...signUpFormik.getFieldProps('password')}
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {signUpFormik.touched.password && signUpFormik.errors.password && (
              <p className="mt-1 text-sm text-red-600">{signUpFormik.errors.password}</p>
            )}
            {signUpFormik.values.password && (
              <PasswordStrengthIndicator password={signUpFormik.values.password} />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                {...signUpFormik.getFieldProps('confirmPassword')}
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {signUpFormik.touched.confirmPassword && signUpFormik.errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{signUpFormik.errors.confirmPassword}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              {...signUpFormik.getFieldProps('agreeToTerms')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              I agree to the{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Privacy Policy
              </a>
            </label>
          </div>
          {signUpFormik.touched.agreeToTerms && signUpFormik.errors.agreeToTerms && (
            <p className="text-sm text-red-600">{signUpFormik.errors.agreeToTerms}</p>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading && <LoadingSpinner size="sm" />}
            <span>Create Account</span>
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  dispatch(closeModal('signup'))
                  dispatch(openModal('login'))
                }}
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      </Modal>

      {/* Sign In Modal */}
      <Modal
        isOpen={modals.login}
        onClose={() => handleModalClose('login')}
        title="Welcome Back"
      >
        <form onSubmit={signInFormik.handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              {...signInFormik.getFieldProps('email')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="john@example.com"
            />
            {signInFormik.touched.email && signInFormik.errors.email && (
              <p className="mt-1 text-sm text-red-600">{signInFormik.errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...signInFormik.getFieldProps('password')}
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {signInFormik.touched.password && signInFormik.errors.password && (
              <p className="mt-1 text-sm text-red-600">{signInFormik.errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...signInFormik.getFieldProps('rememberMe')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Remember me
              </label>
            </div>
            <button
              type="button"
              onClick={() => {
                dispatch(closeModal('login'))
                dispatch(openModal('forgotPassword'))
              }}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading && <LoadingSpinner size="sm" />}
            <span>Sign In</span>
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  dispatch(closeModal('login'))
                  dispatch(openModal('signup'))
                }}
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default AuthModals
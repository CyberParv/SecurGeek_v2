import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  X,
  Shield,
  Key,
  Bell,
  Globe
} from 'lucide-react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { fetchProfile } from '../store/slices/authSlice'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const Profile = () => {
  const { user, profile } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const profileSchema = Yup.object({
    phone: Yup.string(),
    location: Yup.string(),
    bio: Yup.string().max(500, 'Bio must be less than 500 characters'),
  })

  const formik = useFormik({
    initialValues: {
      firstName: user?.user_metadata?.first_name || profile?.first_name || '',
      lastName: user?.user_metadata?.last_name || profile?.last_name || '',
      email: user?.email || '',
      phone: profile?.phone || '',
      location: profile?.location || '',
      bio: profile?.bio || '',
    },
    validationSchema: profileSchema,
    enableReinitialize: true, // This allows the form to update when profile data changes
    onSubmit: async (values) => {
      setLoading(true)
      try {
        // Update profile - only update the editable fields
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email, // Keep the original email
            first_name: user.user_metadata?.first_name || profile?.first_name,
            last_name: user.user_metadata?.last_name || profile?.last_name,
            phone: values.phone,
            location: values.location,
            bio: values.bio,
            updated_at: new Date().toISOString(),
          })

        if (profileError) throw profileError

        // Refresh the profile data
        await dispatch(fetchProfile(user.id))

        toast.success('Profile updated successfully!')
        setIsEditing(false)
      } catch (error) {
        toast.error(error.message || 'Failed to update profile')
      } finally {
        setLoading(false)
      }
    },
  })

  // Fetch profile data on component mount
  useEffect(() => {
    if (user?.id && !profile) {
      dispatch(fetchProfile(user.id))
    }
  }, [user?.id, profile, dispatch])

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ]

  return (
    <>
      <Helmet>
        <title>Profile - SecurGeek</title>
        <meta name="description" content="Manage your profile settings and preferences." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user?.user_metadata?.first_name || profile?.first_name} {user?.user_metadata?.last_name || profile?.last_name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">{user?.email}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Member since {new Date(user?.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <nav className="space-y-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <tab.icon className="h-5 w-5" />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  {activeTab === 'profile' && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Profile Information
                        </h2>
                        {!isEditing ? (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 dark:text-primary-400"
                          >
                            <Edit3 className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setIsEditing(false)
                                formik.resetForm()
                              }}
                              className="flex items-center space-x-2 text-gray-600 hover:text-gray-700 dark:text-gray-400"
                            >
                              <X className="h-4 w-4" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <form onSubmit={formik.handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              First Name
                            </label>
                            <input
                              type="text"
                              value={formik.values.firstName}
                              disabled={true} // Always disabled
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Contact support to change your name
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Last Name
                            </label>
                            <input
                              type="text"
                              value={formik.values.lastName}
                              disabled={true} // Always disabled
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Contact support to change your name
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={formik.values.email}
                            disabled={true} // Always disabled
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                          />
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Contact support to change your email address
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              {...formik.getFieldProps('phone')}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Location
                            </label>
                            <input
                              type="text"
                              {...formik.getFieldProps('location')}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Bio
                          </label>
                          <textarea
                            {...formik.getFieldProps('bio')}
                            disabled={!isEditing}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                            placeholder="Tell us about yourself..."
                          />
                          {formik.touched.bio && formik.errors.bio && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.bio}</p>
                          )}
                        </div>

                        {isEditing && (
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              disabled={loading}
                              className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                              {loading && <LoadingSpinner size="sm" />}
                              <Save className="h-4 w-4" />
                              <span>Save Changes</span>
                            </button>
                          </div>
                        )}
                      </form>
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                        Security Settings
                      </h2>
                      <div className="space-y-6">
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                Change Password
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                Update your password to keep your account secure
                              </p>
                            </div>
                            <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                              Change
                            </button>
                          </div>
                        </div>

                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                Two-Factor Authentication
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                Add an extra layer of security to your account
                              </p>
                            </div>
                            <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                              Enable
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'notifications' && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                        Notification Preferences
                      </h2>
                      <div className="space-y-4">
                        {[
                          { label: 'Course updates', description: 'Get notified about new lessons and course updates' },
                          { label: 'Email notifications', description: 'Receive important updates via email' },
                          { label: 'Marketing emails', description: 'Receive promotional content and offers' },
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between py-3">
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {item.label}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {item.description}
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'preferences' && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                        Preferences
                      </h2>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Language
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                            <option>English</option>
                            <option>Spanish</option>
                            <option>French</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Timezone
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                            <option>UTC-8 (Pacific Time)</option>
                            <option>UTC-5 (Eastern Time)</option>
                            <option>UTC+0 (GMT)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Profile
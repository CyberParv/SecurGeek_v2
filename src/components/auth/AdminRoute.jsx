import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { fetchProfile } from '../../store/slices/authSlice'
import LoadingSpinner from '../ui/LoadingSpinner'

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, profile, loading } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  
  // Fetch profile data when user is authenticated but profile is not loaded
  useEffect(() => {
    if (isAuthenticated && user?.id && !profile) {
      dispatch(fetchProfile(user.id))
    }
  }, [isAuthenticated, user?.id, profile, dispatch])

  // Show loading while checking authentication or fetching profile
  if (loading || (isAuthenticated && user?.id && !profile)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />
  }

  // Check if user has admin role - check both user metadata and profile
  const isAdmin = user?.user_metadata?.role === 'admin' || profile?.role === 'admin'

  console.log('Admin check:', {
    userMetadataRole: user?.user_metadata?.role,
    profileRole: profile?.role,
    isAdmin,
    user: user?.email,
    profile: profile
  })

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default AdminRoute
import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { store } from './store/store'
import { supabase } from './lib/supabase'
import { useDispatch, useSelector } from 'react-redux'
import { setUser, setSession, fetchProfile } from './store/slices/authSlice'
import { setTheme } from './store/slices/uiSlice'

// Components
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LoadingSpinner from './components/ui/LoadingSpinner'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'

// Pages
import Home from './pages/Home'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import CoursePlayer from './pages/CoursePlayer'
import CoursePreview from './pages/CoursePreview'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import AdminDashboard from './pages/admin/AdminDashboard'
import AssessmentInterface from './pages/AssessmentInterface'
import AssessmentBuilder from './pages/admin/AssessmentBuilder'
import NotFound from './pages/NotFound'

// Auth Components
import AuthModals from './components/auth/AuthModals'

import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function AppContent() {
  const dispatch = useDispatch()
  const { theme } = useSelector(state => state.ui)

  useEffect(() => {
    // Set theme on mount
    const savedTheme = localStorage.getItem('theme') || 'light'
    dispatch(setTheme(savedTheme))
    document.documentElement.className = savedTheme
  }, [dispatch])

  useEffect(() => {
    // Update theme class
    document.documentElement.className = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        dispatch(setSession(session))
        dispatch(setUser(session.user))
        // Fetch profile data for the authenticated user
        dispatch(fetchProfile(session.user.id))
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        dispatch(setSession(session))
        dispatch(setUser(session?.user ?? null))
        
        if (session?.user) {
          // Fetch profile data when user signs in
          dispatch(fetchProfile(session.user.id))
        }
        
        if (event === 'SIGNED_OUT') {
          queryClient.clear()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [dispatch])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Router>
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/preview" element={<CoursePreview />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/courses/:id/learn" element={
              <ProtectedRoute>
                <CoursePlayer />
              </ProtectedRoute>
            } />
            <Route path="/assessment/:assessmentId" element={
              <ProtectedRoute>
                <AssessmentInterface />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/admin/*" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/admin/assessment-builder/:courseId/:assessmentId" element={
              <AdminRoute>
                <AssessmentBuilder />
              </AdminRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <AuthModals />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'dark:bg-gray-800 dark:text-white',
          }}
        />
      </Router>
    </div>
  )
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <AppContent />
        </Provider>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

export default App
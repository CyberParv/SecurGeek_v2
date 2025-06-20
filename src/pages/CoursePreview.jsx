import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { 
  Play, 
  BookOpen,
  FileText,
  MessageSquare,
  CheckCircle,
  Lock,
  Award,
  Clock,
  Users,
  Star
} from 'lucide-react'
import { fetchCourseById } from '../store/slices/courseSlice'
import { openModal } from '../store/slices/uiSlice'
import { supabase } from '../lib/supabase'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import VideoPlayer from '../components/VideoPlayer'

const CoursePreview = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentCourse, loading } = useSelector(state => state.courses)
  const { isAuthenticated } = useSelector(state => state.auth)
  const [activeTab, setActiveTab] = useState('overview')
  const [sections, setSections] = useState([])
  const [previewLesson, setPreviewLesson] = useState(null)

  useEffect(() => {
    if (id) {
      dispatch(fetchCourseById(id))
      fetchCourseSections()
    }
  }, [dispatch, id])

  const fetchCourseSections = async () => {
    try {
      const { data: sectionsData, error } = await supabase
        .from('course_sections')
        .select(`
          *,
          lessons:lessons(*),
          assessments:assessments(*)
        `)
        .eq('course_id', id)
        .order('order_index')
      
      if (error) throw error
      
      // Combine lessons and assessments into content array and sort by order_index
      const sectionsWithContent = sectionsData?.map(section => {
        const content = [
          ...(section.lessons?.map(lesson => ({ ...lesson, type: 'lesson' })) || []),
          ...(section.assessments?.map(assessment => ({ ...assessment, type: 'assessment' })) || [])
        ].sort((a, b) => a.order_index - b.order_index)
        
        return {
          ...section,
          content
        }
      }) || []
      
      setSections(sectionsWithContent)
      
      // Set first lesson as preview if available
      if (sectionsWithContent && sectionsWithContent.length > 0) {
        const firstLesson = sectionsWithContent[0].content?.find(item => item.type === 'lesson')
        if (firstLesson) {
          setPreviewLesson(firstLesson)
        }
      }
    } catch (error) {
      console.error('Error fetching course sections:', error)
    }
  }

  const handleLoginToAccess = () => {
    dispatch(openModal('login'))
  }

  const handleEnrollNow = () => {
    if (isAuthenticated) {
      navigate(`/courses/${id}`)
    } else {
      dispatch(openModal('signup'))
    }
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

  if (!currentCourse) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Course Not Found
          </h1>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{currentCourse.title} - Preview - SecurGeek</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex">
          {/* Video Player */}
          <div className="flex-1">
            <div className="w-full flex justify-center">
              <div className="w-full max-w-3xl">
                {previewLesson?.video_url ? (
                  <VideoPlayer
                    videoUrl={previewLesson.video_url}
                    title={previewLesson.title}
                  />
                ) : (
                  <div className="bg-black aspect-video relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center max-w-md px-4">
                        <Play className="h-16 w-16 text-white mb-4 mx-auto opacity-50" />
                        <p className="text-white text-lg mb-2">
                          Course Preview
                        </p>
                        <p className="text-gray-300 text-sm">
                          Sign up to access all course content
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Course Content */}
            <div className="p-6 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {previewLesson?.title || currentCourse.title}
                </h1>
                <div className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
                  Preview Mode
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {previewLesson?.description || 'This is a preview of the course content. Sign up to access all lessons and features.'}
              </p>

              {/* Course Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Clock className="h-6 w-6 text-primary-500 mx-auto mb-2" />
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {currentCourse.duration || '10 hours'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Duration</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Users className="h-6 w-6 text-secondary-500 mx-auto mb-2" />
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {currentCourse.enrollments?.[0]?.count || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Students</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <BookOpen className="h-6 w-6 text-cyber-500 mx-auto mb-2" />
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {sections.reduce((total, section) => total + (section.content?.filter(c => c.type === 'lesson').length || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Lessons</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                  <div className="text-lg font-bold text-gray-900 dark:text-white">4.8</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Rating</div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="flex space-x-8">
                  {[
                    { id: 'overview', label: 'Overview', icon: BookOpen },
                    { id: 'resources', label: 'Resources', icon: FileText },
                    { id: 'discussion', label: 'Discussion', icon: MessageSquare },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div>
                {activeTab === 'overview' && (
                  <div className="prose dark:prose-invert max-w-none">
                    <h3>About This Course</h3>
                    <p>{currentCourse.long_description || currentCourse.description}</p>
                    
                    <h3>What You'll Learn</h3>
                    <ul>
                      <li>Advanced cybersecurity concepts and techniques</li>
                      <li>Practical hands-on experience with security tools</li>
                      <li>Real-world scenarios and case studies</li>
                      <li>Industry best practices and standards</li>
                    </ul>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                      <h4 className="text-blue-800 dark:text-blue-200 font-semibold mb-2">
                        🎯 Preview Limitation
                      </h4>
                      <p className="text-blue-700 dark:text-blue-300 text-sm">
                        You're currently viewing a preview. Sign up to access all course content, quizzes, and certificates.
                      </p>
                    </div>
                  </div>
                )}
                
                {activeTab === 'resources' && (
                  <div className="text-center py-8">
                    <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Resources Locked
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Sign up to access course resources and downloads
                    </p>
                    <button
                      onClick={handleLoginToAccess}
                      className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      Sign Up to Access
                    </button>
                  </div>
                )}
                
                {activeTab === 'discussion' && (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Join the Discussion
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Connect with other students and instructors
                    </p>
                    <button
                      onClick={handleLoginToAccess}
                      className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      Sign Up to Join
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="mb-6">
                <button
                  onClick={handleEnrollNow}
                  className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors font-semibold text-lg"
                >
                  {isAuthenticated ? 'Enroll Now' : 'Sign Up to Enroll'}
                </button>
                {currentCourse.price && (
                  <div className="text-center mt-2">
                    <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      ${currentCourse.price}
                    </span>
                  </div>
                )}
              </div>

              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Course Content
              </h2>
              
              <div className="space-y-4">
                {sections.map((section, sectionIndex) => (
                  <div key={section.id} className="space-y-2">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                      {section.title}
                    </h3>
                    <div className="space-y-1">
                      {section.content?.map((content, contentIndex) => (
                        <div
                          key={content.id}
                          className={`p-3 rounded-lg transition-colors ${
                            sectionIndex === 0 && contentIndex === 0 && content.type === 'lesson'
                              ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                              : 'bg-gray-50 dark:bg-gray-700 opacity-60'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {sectionIndex === 0 && contentIndex === 0 && content.type === 'lesson' ? (
                                <Play className="h-5 w-5 text-primary-500" />
                              ) : (
                                <Lock className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {content.title}
                              </p>
                              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                <span className={`px-2 py-1 rounded ${
                                  content.type === 'lesson' 
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                                }`}>
                                  {content.type === 'lesson' ? 'Lesson' : 'Assessment'}
                                </span>
                                {content.type === 'lesson' && (
                                  <span>{content.duration_minutes || 10} min</span>
                                )}
                                {sectionIndex === 0 && contentIndex === 0 && content.type === 'lesson' && (
                                  <span className="text-green-600 dark:text-green-400 font-medium">Preview</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  Preview Mode
                </h4>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  You can only access the first lesson in preview mode. Sign up to unlock all content.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CoursePreview
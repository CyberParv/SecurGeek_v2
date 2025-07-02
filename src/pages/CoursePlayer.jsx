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
  Award,
  ChevronDown,
  ChevronRight,
  ArrowRight
} from 'lucide-react'
import { fetchCourseById, setCurrentLesson } from '../store/slices/courseSlice'
import { supabase } from '../lib/supabase'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import VideoPlayer from '../components/VideoPlayer'
import toast from 'react-hot-toast'

const CoursePlayer = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { currentCourse, currentLesson, loading } = useSelector(state => state.courses)
  const { user } = useSelector(state => state.auth)
  const [activeTab, setActiveTab] = useState('overview')
  const [sections, setSections] = useState([])
  const [collapsedSections, setCollapsedSections] = useState({})
  const [progress, setProgress] = useState({})
  const [enrollment, setEnrollment] = useState(null)
  const [resources, setResources] = useState([])

  useEffect(() => {
    if (id) {
      dispatch(fetchCourseById(id))
      fetchCourseSections()
      fetchUserProgress()
      fetchResources()
    }
  }, [dispatch, id])

  useEffect(() => {
    if (currentLesson?.id) {
      fetchResources()
    }
  }, [currentLesson?.id])

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
      
      // Initialize collapsed state - expand first section, collapse others
      const initialCollapsed = {}
      sectionsWithContent.forEach((section, index) => {
        initialCollapsed[section.id] = index !== 0
      })
      setCollapsedSections(initialCollapsed)
      
      // Set current lesson based on progress or first lesson
      if (sectionsWithContent && sectionsWithContent.length > 0 && !currentLesson) {
        await setCurrentLessonBasedOnProgress(sectionsWithContent)
      }
    } catch (error) {
      console.error('Error fetching course sections:', error)
    }
  }

  const fetchUserProgress = async () => {
    if (!user?.id) return

    try {
      // Get enrollment
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', id)
        .single()

      if (enrollmentError) throw enrollmentError
      setEnrollment(enrollmentData)

      // Get progress for all lessons and assessments
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select('*')
        .eq('enrollment_id', enrollmentData.id)

      if (progressError) throw progressError

      // Get assessment attempts for this enrollment
      const { data: assessmentAttempts, error: attemptError } = await supabase
        .from('assessment_attempts')
        .select('assessment_id, passed, score, completed_at')
        .eq('enrollment_id', enrollmentData.id)
        .eq('passed', true) // Only get passed attempts

      if (attemptError) throw attemptError

      const progressMap = {}
      progressData?.forEach(p => {
        progressMap[p.lesson_id] = p
      })

      // Add assessment completion status to progress map
      assessmentAttempts?.forEach(attempt => {
        if (attempt.passed) {
          progressMap[attempt.assessment_id] = {
            completed: true,
            progress: 100,
            assessment_score: attempt.score,
            completed_at: attempt.completed_at
          }
        }
      })

      setProgress(progressMap)
    } catch (error) {
      console.error('Error fetching user progress:', error)
    }
  }

  const fetchResources = async () => {
    if (!currentLesson?.id) return

    try {
      const { data: resourcesData, error } = await supabase
        .from('resources')
        .select('*')
        .eq('lesson_id', currentLesson.id)
        .order('created_at')

      if (error) throw error
      setResources(resourcesData || [])
    } catch (error) {
      console.error('Error fetching resources:', error)
    }
  }

  const setCurrentLessonBasedOnProgress = async (sectionsWithContent) => {
    if (!user?.id) {
      // If not authenticated, set first lesson
      const firstLesson = sectionsWithContent[0].content?.find(item => item.type === 'lesson')
      if (firstLesson) {
        dispatch(setCurrentLesson(firstLesson))
      }
      return
    }

    try {
      // Get user's progress to find the next lesson to continue
      const { data: enrollmentData } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', id)
        .single()

      if (!enrollmentData) {
        // If not enrolled, set first lesson
        const firstLesson = sectionsWithContent[0].content?.find(item => item.type === 'lesson')
        if (firstLesson) {
          dispatch(setCurrentLesson(firstLesson))
        }
        return
      }

      // Get completed lessons
      const { data: progressData } = await supabase
        .from('progress')
        .select('*')
        .eq('enrollment_id', enrollmentData.id)
        .eq('completed', true)

      const completedLessonIds = new Set(progressData?.map(p => p.lesson_id) || [])

      // Find the first incomplete lesson
      let nextLesson = null
      for (const section of sectionsWithContent) {
        for (const content of section.content) {
          if (content.type === 'lesson' && !completedLessonIds.has(content.id)) {
            nextLesson = content
            break
          }
        }
        if (nextLesson) break
      }

      // If all lessons are completed, set the last lesson
      if (!nextLesson) {
        for (let i = sectionsWithContent.length - 1; i >= 0; i--) {
          const section = sectionsWithContent[i]
          for (let j = section.content.length - 1; j >= 0; j--) {
            const content = section.content[j]
            if (content.type === 'lesson') {
              nextLesson = content
              break
            }
          }
          if (nextLesson) break
        }
      }

      // If still no lesson found, set first lesson
      if (!nextLesson) {
        nextLesson = sectionsWithContent[0].content?.find(item => item.type === 'lesson')
      }

      if (nextLesson) {
        dispatch(setCurrentLesson(nextLesson))
        
        // Expand the section containing the current lesson
        const sectionWithCurrentLesson = sectionsWithContent.find(section =>
          section.content.some(content => content.id === nextLesson.id)
        )
        if (sectionWithCurrentLesson) {
          setCollapsedSections(prev => ({
            ...prev,
            [sectionWithCurrentLesson.id]: false
          }))
        }
      }
    } catch (error) {
      console.error('Error setting current lesson based on progress:', error)
      // Fallback to first lesson
      const firstLesson = sectionsWithContent[0].content?.find(item => item.type === 'lesson')
      if (firstLesson) {
        dispatch(setCurrentLesson(firstLesson))
      }
    }
  }

  const handleContentSelect = (content) => {
    if (content.type === 'lesson') {
      dispatch(setCurrentLesson(content))
    } else if (content.type === 'assessment') {
      // Navigate to the assessment interface
      navigate(`/assessment/${content.id}`)
    }
  }

  const markAsCompleted = async () => {
    if (!currentLesson || !user?.id || !enrollment) return

    try {
      const { error } = await supabase
        .from('progress')
        .upsert({
          enrollment_id: enrollment.id,
          lesson_id: currentLesson.id,
          completed: true,
          progress: 100,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      // Update local progress state
      setProgress(prev => ({
        ...prev,
        [currentLesson.id]: {
          ...prev[currentLesson.id],
          completed: true,
          progress: 100
        }
      }))

      toast.success('Lesson marked as completed!')
    } catch (error) {
      console.error('Error marking lesson as completed:', error)
      toast.error('Failed to mark lesson as completed')
    }
  }

  const goToNextLesson = () => {
    if (!sections || sections.length === 0) return

    // Find current lesson in sections
    let currentSectionIndex = -1
    let currentContentIndex = -1

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]
      for (let j = 0; j < section.content.length; j++) {
        const content = section.content[j]
        if (content.type === 'lesson' && content.id === currentLesson?.id) {
          currentSectionIndex = i
          currentContentIndex = j
          break
        }
      }
      if (currentSectionIndex !== -1) break
    }

    if (currentSectionIndex === -1) return

    // Find next lesson
    let nextLesson = null

    // Look for next lesson in current section
    for (let j = currentContentIndex + 1; j < sections[currentSectionIndex].content.length; j++) {
      const content = sections[currentSectionIndex].content[j]
      if (content.type === 'lesson') {
        nextLesson = content
        break
      }
    }

    // If no next lesson in current section, look in next sections
    if (!nextLesson) {
      for (let i = currentSectionIndex + 1; i < sections.length; i++) {
        const section = sections[i]
        for (const content of section.content) {
          if (content.type === 'lesson') {
            nextLesson = content
            break
          }
        }
        if (nextLesson) break
      }
    }

    if (nextLesson) {
      dispatch(setCurrentLesson(nextLesson))
      
      // Expand the section containing the next lesson
      const sectionWithNextLesson = sections.find(section =>
        section.content.some(content => content.id === nextLesson.id)
      )
      if (sectionWithNextLesson) {
        setCollapsedSections(prev => ({
          ...prev,
          [sectionWithNextLesson.id]: false
        }))
      }
    } else {
      toast.info('You have reached the end of the course!')
    }
  }

  const toggleSection = (sectionId) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const handleVideoProgress = (progress) => {
    // Update lesson progress when video progresses
    if (currentLesson && user?.id) {
      // You can implement progress tracking here
      console.log(`Video progress: ${progress}%`)
    }
  }

  const handleVideoEnded = () => {
    // Mark lesson as completed when video ends
    if (currentLesson && user?.id) {
      markAsCompleted()
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
        <title>{currentCourse.title} - Learning - SecurGeek</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex">
          {/* Video Player */}
          <div className="flex-1">
            <div className="w-full flex justify-center">
              <div className="w-full max-w-5xl">
                {currentLesson?.video_url ? (
                  <VideoPlayer
                    videoUrl={currentLesson.video_url}
                    title={currentLesson.title}
                    onProgress={handleVideoProgress}
                    onEnded={handleVideoEnded}
                  />
                ) : (
                  <div className="bg-black aspect-video relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center max-w-md px-4">
                        <Play className="h-16 w-16 text-white mb-4 mx-auto opacity-50" />
                        <p className="text-white text-lg">
                          {currentLesson ? 'No video available for this lesson' : 'Select a lesson to start learning'}
                        </p>
                        {currentLesson && (
                          <p className="text-gray-300 text-sm mt-2">
                            Continue with the lesson content below
                          </p>
                        )}
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
                  {currentLesson?.title || 'Select content to start learning'}
                </h1>
                {currentLesson && user && (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={markAsCompleted}
                      disabled={progress[currentLesson.id]?.completed}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        progress[currentLesson.id]?.completed
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 cursor-not-allowed'
                          : 'bg-primary-500 text-white hover:bg-primary-600'
                      }`}
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>
                        {progress[currentLesson.id]?.completed ? 'Completed' : 'Mark as Completed'}
                      </span>
                    </button>
                    <button
                      onClick={goToNextLesson}
                      className="flex items-center space-x-2 px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors"
                    >
                      <span>Next Lesson</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {currentLesson?.description || 'Choose a lesson or assessment from the sidebar to start learning.'}
              </p>

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
                    {currentLesson?.content ? (
                      <div className="whitespace-pre-wrap">{currentLesson.content}</div>
                    ) : (
                      <p>
                        This lesson covers important concepts in cybersecurity. Watch the video above and review the materials to understand the key topics.
                      </p>
                    )}
                  </div>
                )}
                
                {activeTab === 'resources' && (
                  <div className="space-y-4">
                    {resources.length > 0 ? (
                      resources.map((resource) => (
                        <div key={resource.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <span className="text-gray-900 dark:text-white font-medium">{resource.title}</span>
                              {resource.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">{resource.description}</p>
                              )}
                            </div>
                          </div>
                          <button 
                            onClick={() => window.open(resource.file_url, '_blank')}
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium transition-colors"
                          >
                            Download
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                          No resources available for this lesson
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'discussion' && (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Discussion forum coming soon
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-[400px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Course Content
              </h2>
              
              <div className="space-y-4">
                {sections.map((section) => (
                  <div key={section.id} className="space-y-2">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm text-left">
                        {section.title}
                      </h3>
                      {collapsedSections[section.id] ? (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                    
                    {!collapsedSections[section.id] && (
                      <div className="space-y-1 ml-2">
                        {section.content?.map((content) => (
                          <button
                            key={content.id}
                            onClick={() => handleContentSelect(content)}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                              currentLesson?.id === content.id && content.type === 'lesson'
                                ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                {progress[content.id]?.completed ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : content.type === 'lesson' ? (
                                  <Play className="h-5 w-5 text-blue-500" />
                                ) : (
                                  <Award className="h-5 w-5 text-purple-500" />
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
                                    {content.type === 'lesson' ? 'Lesson' : content.assessment_type || 'Assessment'}
                                  </span>
                                  {content.type === 'lesson' && (
                                    <>
                                      <span>{content.duration_minutes || 10} min</span>
                                      {content.video_url && (
                                        <span className="text-blue-600 dark:text-blue-400">Video</span>
                                      )}
                                    </>
                                  )}
                                  {content.type === 'assessment' && (
                                    <span>{content.passing_score || 70}% to pass</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CoursePlayer
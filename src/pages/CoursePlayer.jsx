import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { 
  Play, 
  BookOpen,
  FileText,
  MessageSquare,
  CheckCircle,
  Lock,
  Award
} from 'lucide-react'
import { fetchCourseById, setCurrentLesson } from '../store/slices/courseSlice'
import { supabase } from '../lib/supabase'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import VideoPlayer from '../components/VideoPlayer'

const CoursePlayer = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { currentCourse, currentLesson, loading } = useSelector(state => state.courses)
  const { user } = useSelector(state => state.auth)
  const [activeTab, setActiveTab] = useState('overview')
  const [sections, setSections] = useState([])

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
      
      // Set first lesson as current if no lesson is selected
      if (sectionsWithContent && sectionsWithContent.length > 0) {
        const firstContent = sectionsWithContent[0].content?.find(item => item.type === 'lesson')
        if (firstContent && !currentLesson) {
          dispatch(setCurrentLesson(firstContent))
        }
      }
    } catch (error) {
      console.error('Error fetching course sections:', error)
    }
  }

  const handleContentSelect = (content) => {
    if (content.type === 'lesson') {
      dispatch(setCurrentLesson(content))
    } else if (content.type === 'assessment') {
      // Handle assessment selection - could navigate to assessment page
      console.log('Assessment selected:', content)
      // For now, just show a message
      alert(`Assessment: ${content.title}\nThis would open the assessment interface.`)
    }
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
      // You can implement completion tracking here
      console.log('Video completed')
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
              <div className="w-full max-w-3xl">
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {currentLesson?.title || 'Select content to start learning'}
              </h1>
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
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">Lesson Notes.pdf</span>
                      </div>
                      <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                        Download
                      </button>
                    </div>
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
          <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Course Content
              </h2>
              
              <div className="space-y-4">
                {sections.map((section) => (
                  <div key={section.id} className="space-y-2">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                      {section.title}
                    </h3>
                    <div className="space-y-1">
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
                              {content.completed ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : content.locked ? (
                                <Lock className="h-5 w-5 text-gray-400" />
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
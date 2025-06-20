import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  GripVertical,
  Play,
  FileText,
  Award,
  Clock,
  Users,
  BookOpen,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const CourseEditor = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('content')
  const [editingSection, setEditingSection] = useState(null)
  const [editingContent, setEditingContent] = useState(null)

  useEffect(() => {
    if (courseId) {
      fetchCourseData()
    }
  }, [courseId])

  const fetchCourseData = async () => {
    try {
      setLoading(true)
      
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()
      
      if (courseError) throw courseError
      setCourse(courseData)

      // Fetch sections with lessons
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('course_sections')
        .select(`
          *,
          lessons:lessons(*)
        `)
        .eq('course_id', courseId)
        .order('order_index')
      
      if (sectionsError) throw sectionsError

      // Fetch assessments separately and group by section_id
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('assessments')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index')
      
      if (assessmentsError) throw assessmentsError
      
      // Group assessments by section_id
      const assessmentsBySection = {}
      assessmentsData?.forEach(assessment => {
        const sectionId = assessment.section_id
        if (!assessmentsBySection[sectionId]) {
          assessmentsBySection[sectionId] = []
        }
        assessmentsBySection[sectionId].push({ ...assessment, type: 'assessment' })
      })
      
      // Combine lessons and assessments into content array and sort by order_index
      const sectionsWithContent = sectionsData?.map(section => {
        const lessons = section.lessons?.map(lesson => ({ ...lesson, type: 'lesson' })) || []
        const assessments = assessmentsBySection[section.id] || []
        
        const content = [...lessons, ...assessments].sort((a, b) => a.order_index - b.order_index)
        
        return {
          ...section,
          content
        }
      }) || []
      
      setSections(sectionsWithContent)

    } catch (error) {
      toast.error('Failed to load course data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const createSection = async (sectionData) => {
    try {
      const { data, error } = await supabase
        .from('course_sections')
        .insert([{
          ...sectionData,
          course_id: courseId,
          order_index: sections.length + 1
        }])
        .select()
        .single()
      
      if (error) throw error
      setSections([...sections, { ...data, content: [] }])
      toast.success('Section created successfully!')
    } catch (error) {
      toast.error('Failed to create section')
      console.error(error)
    }
  }

  const updateSection = async (sectionId, updates) => {
    try {
      const { error } = await supabase
        .from('course_sections')
        .update(updates)
        .eq('id', sectionId)
      
      if (error) throw error
      
      setSections(sections.map(section => 
        section.id === sectionId ? { ...section, ...updates } : section
      ))
      toast.success('Section updated successfully!')
    } catch (error) {
      toast.error('Failed to update section')
      console.error(error)
    }
  }

  const deleteSection = async (sectionId) => {
    if (!window.confirm('Are you sure? This will delete all content in this section.')) return
    
    try {
      const { error } = await supabase
        .from('course_sections')
        .delete()
        .eq('id', sectionId)
      
      if (error) throw error
      
      setSections(sections.filter(section => section.id !== sectionId))
      toast.success('Section deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete section')
      console.error(error)
    }
  }

  // Helper function to clean data for database insertion/update
  const cleanDataForDatabase = (data, contentType) => {
    const cleaned = { ...data }
    
    // Remove the 'type' field as it's not a database column
    delete cleaned.type
    delete cleaned.isNew
    delete cleaned.sectionId
    
    if (contentType === 'lesson') {
      // For lessons, only keep lesson-specific fields
      const lessonFields = [
        'title', 'description', 'content', 'video_url', 'duration_minutes', 
        'order_index', 'is_preview', 'is_published', 'course_id', 'section_id'
      ]
      
      // Remove assessment-specific fields that don't belong in lessons table
      Object.keys(cleaned).forEach(key => {
        if (!lessonFields.includes(key)) {
          delete cleaned[key]
        }
      })
      
      // Convert empty strings to null for integer fields
      const integerFields = ['duration_minutes']
      integerFields.forEach(field => {
        if (cleaned[field] === '' || cleaned[field] === undefined) {
          cleaned[field] = null
        } else if (cleaned[field] !== null) {
          const num = parseInt(cleaned[field], 10)
          cleaned[field] = isNaN(num) ? null : num
        }
      })
      
      // Handle boolean fields
      const booleanFields = ['is_preview', 'is_published']
      booleanFields.forEach(field => {
        if (cleaned[field] !== undefined) {
          cleaned[field] = Boolean(cleaned[field])
        }
      })
      
    } else if (contentType === 'assessment') {
      // For assessments, only keep assessment-specific fields
      const assessmentFields = [
        'title', 'description', 'assessment_type', 'instructions', 'time_limit_minutes',
        'passing_score', 'max_attempts', 'is_required', 'is_published', 'order_index',
        'course_id', 'section_id'
      ]
      
      // Remove lesson-specific fields that don't belong in assessments table
      Object.keys(cleaned).forEach(key => {
        if (!assessmentFields.includes(key)) {
          delete cleaned[key]
        }
      })
      
      // Convert empty strings to null for integer fields
      const integerFields = ['time_limit_minutes', 'passing_score', 'max_attempts']
      integerFields.forEach(field => {
        if (cleaned[field] === '' || cleaned[field] === undefined) {
          cleaned[field] = null
        } else if (cleaned[field] !== null) {
          const num = parseInt(cleaned[field], 10)
          cleaned[field] = isNaN(num) ? null : num
        }
      })
      
      // Handle boolean fields
      const booleanFields = ['is_required', 'is_published']
      booleanFields.forEach(field => {
        if (cleaned[field] !== undefined) {
          cleaned[field] = Boolean(cleaned[field])
        }
      })
    }
    
    return cleaned
  }

  const createContent = async (sectionId, contentData) => {
    try {
      const table = contentData.type === 'lesson' ? 'lessons' : 'assessments'
      
      // Get the maximum order_index for this course to ensure uniqueness
      let maxOrderIndex = 0
      if (contentData.type === 'lesson') {
        const { data: existingLessons, error: queryError } = await supabase
          .from('lessons')
          .select('order_index')
          .eq('course_id', courseId)
          .order('order_index', { ascending: false })
          .limit(1)
        
        if (queryError) throw queryError
        
        if (existingLessons && existingLessons.length > 0) {
          maxOrderIndex = existingLessons[0].order_index || 0
        }
      } else {
        const { data: existingAssessments, error: queryError } = await supabase
          .from('assessments')
          .select('order_index')
          .eq('course_id', courseId)
          .order('order_index', { ascending: false })
          .limit(1)
        
        if (queryError) throw queryError
        
        if (existingAssessments && existingAssessments.length > 0) {
          maxOrderIndex = existingAssessments[0].order_index || 0
        }
      }

      const insertData = {
        course_id: courseId,
        section_id: sectionId,
        order_index: maxOrderIndex + 1
      }

      // Clean and merge the content data
      const cleanedData = cleanDataForDatabase(contentData, contentData.type)
      Object.assign(insertData, cleanedData)

      console.log('Creating content with data:', insertData)

      const { data, error } = await supabase
        .from(table)
        .insert([insertData])
        .select()
        .single()
      
      if (error) {
        console.error('Insert error:', error)
        throw error
      }
      
      const newContent = { ...data, type: contentData.type }
      
      setSections(sections.map(section => 
        section.id === sectionId 
          ? { ...section, content: [...(section.content || []), newContent] }
          : section
      ))
      toast.success(`${contentData.type === 'lesson' ? 'Lesson' : 'Assessment'} created successfully!`)
    } catch (error) {
      console.error(`Error creating ${contentData.type}:`, error)
      toast.error(`Failed to create ${contentData.type}: ${error.message}`)
    }
  }

  const updateContent = async (contentId, updates) => {
    try {
      console.log('Updating content:', { contentId, updates })
      
      if (!contentId || !updates.type) {
        throw new Error('Content ID and type are required')
      }

      const table = updates.type === 'lesson' ? 'lessons' : 'assessments'
      
      // Clean the update data
      const updateData = cleanDataForDatabase(updates, updates.type)
      updateData.updated_at = new Date().toISOString()

      console.log('Cleaned update data:', updateData)

      const { data, error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', contentId)
        .select()
      
      console.log('Update result:', { data, error })
      
      if (error) {
        console.error('Update error:', error)
        throw error
      }
      
      // Check if any rows were updated
      if (!data || data.length === 0) {
        console.error('No data returned from update:', { contentId, table, updateData })
        throw new Error(`${updates.type === 'lesson' ? 'Lesson' : 'Assessment'} not found or could not be updated`)
      }
      
      const updatedContent = { ...data[0], type: updates.type }
      
      setSections(sections.map(section => ({
        ...section,
        content: section.content?.map(content => 
          content.id === contentId ? updatedContent : content
        )
      })))
      toast.success(`${updates.type === 'lesson' ? 'Lesson' : 'Assessment'} updated successfully!`)
    } catch (error) {
      console.error(`Error updating ${updates.type}:`, error)
      toast.error(`Failed to update ${updates.type}: ${error.message}`)
    }
  }

  const deleteContent = async (contentId, contentType) => {
    if (!window.confirm(`Are you sure you want to delete this ${contentType}?`)) return
    
    try {
      const table = contentType === 'lesson' ? 'lessons' : 'assessments'
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', contentId)
      
      if (error) throw error
      
      setSections(sections.map(section => ({
        ...section,
        content: section.content?.filter(content => content.id !== contentId)
      })))
      toast.success(`${contentType === 'lesson' ? 'Lesson' : 'Assessment'} deleted successfully!`)
    } catch (error) {
      toast.error(`Failed to delete ${contentType}`)
      console.error(error)
    }
  }

  const moveContent = async (sectionId, contentId, direction) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section || !section.content) return

    const contentIndex = section.content.findIndex(c => c.id === contentId)
    if (contentIndex === -1) return

    const newIndex = direction === 'up' ? contentIndex - 1 : contentIndex + 1
    if (newIndex < 0 || newIndex >= section.content.length) return

    // Create new content array with swapped positions
    const newContent = [...section.content]
    const [movedItem] = newContent.splice(contentIndex, 1)
    newContent.splice(newIndex, 0, movedItem)

    // Update order_index for affected items
    const updates = newContent.map((item, index) => ({
      id: item.id,
      order_index: index + 1,
      type: item.type
    }))

    try {
      // Update in database
      for (const update of updates) {
        const table = update.type === 'lesson' ? 'lessons' : 'assessments'
        await supabase
          .from(table)
          .update({ order_index: update.order_index })
          .eq('id', update.id)
      }

      // Update local state
      setSections(sections.map(s => 
        s.id === sectionId 
          ? { ...s, content: newContent.map((item, index) => ({ ...item, order_index: index + 1 })) }
          : s
      ))

      toast.success('Content order updated successfully!')
    } catch (error) {
      toast.error('Failed to update content order')
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/courses')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {course?.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Course Editor
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                course?.status === 'published' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
              }`}>
                {course?.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'content', label: 'Course Content', icon: BookOpen },
              { id: 'settings', label: 'Settings', icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
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
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'content' && (
          <CourseContentTab
            sections={sections}
            onCreateSection={createSection}
            onUpdateSection={updateSection}
            onDeleteSection={deleteSection}
            onCreateContent={createContent}
            onUpdateContent={updateContent}
            onDeleteContent={deleteContent}
            onMoveContent={moveContent}
            editingSection={editingSection}
            setEditingSection={setEditingSection}
            editingContent={editingContent}
            setEditingContent={setEditingContent}
          />
        )}
        
        {activeTab === 'settings' && (
          <CourseSettingsTab course={course} setCourse={setCourse} />
        )}
      </div>
    </div>
  )
}

// Course Content Tab Component
const CourseContentTab = ({ 
  sections, 
  onCreateSection, 
  onUpdateSection, 
  onDeleteSection,
  onCreateContent,
  onUpdateContent,
  onDeleteContent,
  onMoveContent,
  editingSection,
  setEditingSection,
  editingContent,
  setEditingContent
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Course Content
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
            Organize your course into sections with lessons and assessments
          </p>
        </div>
        <button
          onClick={() => setEditingSection({ isNew: true })}
          className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Section</span>
        </button>
      </div>

      {sections.map((section, index) => (
        <SectionCard
          key={section.id}
          section={section}
          index={index}
          onUpdate={onUpdateSection}
          onDelete={onDeleteSection}
          onCreateContent={onCreateContent}
          onUpdateContent={onUpdateContent}
          onDeleteContent={onDeleteContent}
          onMoveContent={onMoveContent}
          onEdit={() => setEditingSection(section)}
          editingContent={editingContent}
          setEditingContent={setEditingContent}
        />
      ))}

      {sections.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No sections yet
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Create your first section to organize your course content
          </p>
          <button
            onClick={() => setEditingSection({ isNew: true })}
            className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors"
          >
            Create First Section
          </button>
        </div>
      )}

      {/* Section Modal */}
      <SectionModal
        isOpen={!!editingSection}
        section={editingSection}
        onClose={() => setEditingSection(null)}
        onSave={editingSection?.isNew ? onCreateSection : onUpdateSection}
      />

      {/* Content Modal */}
      <ContentModal
        isOpen={!!editingContent}
        content={editingContent}
        onClose={() => setEditingContent(null)}
        onSave={editingContent?.isNew ? onCreateContent : onUpdateContent}
      />
    </div>
  )
}

// Section Card Component
const SectionCard = ({ 
  section, 
  index, 
  onUpdate, 
  onDelete, 
  onCreateContent,
  onUpdateContent,
  onDeleteContent,
  onMoveContent,
  onEdit,
  editingContent,
  setEditingContent
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GripVertical className="h-5 w-5 text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {section.title}
              </h3>
              {section.description && (
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {section.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {section.content?.length || 0} items
            </span>
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(section.id)}
              className="p-2 text-gray-400 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900 dark:text-white">Content</h4>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setEditingContent({ isNew: true, sectionId: section.id, type: 'lesson' })}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Lesson</span>
            </button>
            <button
              onClick={() => setEditingContent({ isNew: true, sectionId: section.id, type: 'assessment' })}
              className="text-secondary-600 hover:text-secondary-700 dark:text-secondary-400 text-sm flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Assessment</span>
            </button>
          </div>
        </div>

        {section.content && section.content.length > 0 ? (
          <div className="space-y-3">
            {section.content.map((content, contentIndex) => (
              <div
                key={content.id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-6">
                    {contentIndex + 1}.
                  </span>
                  {content.type === 'lesson' ? (
                    <Play className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Award className="h-4 w-4 text-purple-500" />
                  )}
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      {content.title}
                    </h5>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className={`px-2 py-1 rounded text-xs ${
                        content.type === 'lesson' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                      }`}>
                        {content.type === 'lesson' ? 'Lesson' : content.assessment_type || 'Assessment'}
                      </span>
                      {content.type === 'lesson' && (
                        <>
                          <span>{content.duration_minutes || 0} min</span>
                          {content.video_url && (
                            <span className="text-green-600 dark:text-green-400 flex items-center space-x-1">
                              <Play className="h-3 w-3" />
                              <span>Video</span>
                            </span>
                          )}
                          {content.is_preview && (
                            <span className="text-blue-600 dark:text-blue-400">Preview</span>
                          )}
                        </>
                      )}
                      {content.type === 'assessment' && (
                        <>
                          <span>{content.passing_score}% to pass</span>
                          {content.time_limit_minutes && (
                            <span>{content.time_limit_minutes} min limit</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex flex-col">
                    <button
                      onClick={() => onMoveContent(section.id, content.id, 'up')}
                      disabled={contentIndex === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onMoveContent(section.id, content.id, 'down')}
                      disabled={contentIndex === section.content.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => setEditingContent({ ...content, sectionId: section.id })}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteContent(content.id, content.type)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No content in this section</p>
            <div className="flex items-center justify-center space-x-4 mt-2">
              <button
                onClick={() => setEditingContent({ isNew: true, sectionId: section.id, type: 'lesson' })}
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm"
              >
                Add lesson
              </button>
              <button
                onClick={() => setEditingContent({ isNew: true, sectionId: section.id, type: 'assessment' })}
                className="text-secondary-600 hover:text-secondary-700 dark:text-secondary-400 text-sm"
              >
                Add assessment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Section Modal Component
const SectionModal = ({ isOpen, section, onClose, onSave }) => {
  const formik = useFormik({
    initialValues: {
      title: section?.title || '',
      description: section?.description || '',
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Title is required'),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (section?.isNew) {
        await onSave(values)
      } else {
        await onSave(section.id, values)
      }
      onClose()
    },
  })

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
                {section?.isNew ? 'Create Section' : 'Edit Section'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  {...formik.getFieldProps('title')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter section title"
                />
                {formik.touched.title && formik.errors.title && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  {...formik.getFieldProps('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Brief description of this section"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{section?.isNew ? 'Create' : 'Update'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Content Modal Component (handles both lessons and assessments)
const ContentModal = ({ isOpen, content, onClose, onSave }) => {
  const isLesson = content?.type === 'lesson'
  
  const formik = useFormik({
    initialValues: {
      title: content?.title || '',
      description: content?.description || '',
      // Lesson fields
      content: content?.content || '',
      video_url: content?.video_url || '',
      duration_minutes: content?.duration_minutes || '',
      is_preview: content?.is_preview || false,
      // Assessment fields
      assessment_type: content?.assessment_type || 'quiz',
      instructions: content?.instructions || '',
      time_limit_minutes: content?.time_limit_minutes || '',
      passing_score: content?.passing_score || 70,
      max_attempts: content?.max_attempts || 3,
      is_required: content?.is_required !== undefined ? content.is_required : true,
      is_published: content?.is_published !== undefined ? content.is_published : false,
      type: content?.type || 'lesson',
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Title is required'),
      video_url: Yup.string().url('Must be a valid URL'),
      duration_minutes: Yup.number().nullable().min(0, 'Duration must be positive'),
      assessment_type: Yup.string().when('type', {
        is: 'assessment',
        then: (schema) => schema.required('Assessment type is required'),
        otherwise: (schema) => schema
      }),
      passing_score: Yup.number().when('type', {
        is: 'assessment',
        then: (schema) => schema.min(0).max(100).required('Passing score is required'),
        otherwise: (schema) => schema
      }),
      max_attempts: Yup.number().when('type', {
        is: 'assessment',
        then: (schema) => schema.min(1).required('Max attempts is required'),
        otherwise: (schema) => schema
      }),
      time_limit_minutes: Yup.number().nullable().min(1, 'Time limit must be at least 1 minute'),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (content?.isNew) {
        await onSave(content.sectionId, values)
      } else {
        await onSave(content.id, values)
      }
      onClose()
    },
  })

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
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {content?.isNew ? `Create ${isLesson ? 'Lesson' : 'Assessment'}` : `Edit ${isLesson ? 'Lesson' : 'Assessment'}`}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isLesson ? 'Lesson' : 'Assessment'} Title
                </label>
                <input
                  type="text"
                  {...formik.getFieldProps('title')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder={`Enter ${isLesson ? 'lesson' : 'assessment'} title`}
                />
                {formik.touched.title && formik.errors.title && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  {...formik.getFieldProps('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder={`Brief description of the ${isLesson ? 'lesson' : 'assessment'}`}
                />
              </div>

              {isLesson ? (
                // Lesson-specific fields
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      YouTube Video URL
                    </label>
                    <input
                      type="url"
                      {...formik.getFieldProps('video_url')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="https://www.youtube.com/watch?v=... (optional)"
                    />
                    {formik.touched.video_url && formik.errors.video_url && (
                      <p className="mt-1 text-sm text-red-600">{formik.errors.video_url}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Supports YouTube URLs in various formats (watch, youtu.be, embed)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="0"
                      {...formik.getFieldProps('duration_minutes')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Leave empty if unknown"
                    />
                    {formik.touched.duration_minutes && formik.errors.duration_minutes && (
                      <p className="mt-1 text-sm text-red-600">{formik.errors.duration_minutes}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Lesson Content
                    </label>
                    <textarea
                      {...formik.getFieldProps('content')}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Detailed lesson content, notes, and materials"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...formik.getFieldProps('is_preview')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Allow preview (visible to non-enrolled users)
                    </label>
                  </div>
                </>
              ) : (
                // Assessment-specific fields
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Assessment Type
                    </label>
                    <select
                      {...formik.getFieldProps('assessment_type')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="quiz">Quiz</option>
                      <option value="midterm">Mid-Term Examination</option>
                      <option value="final">Final Examination</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Instructions
                    </label>
                    <textarea
                      {...formik.getFieldProps('instructions')}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Detailed instructions for students"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Time Limit (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        {...formik.getFieldProps('time_limit_minutes')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Optional"
                      />
                      {formik.touched.time_limit_minutes && formik.errors.time_limit_minutes && (
                        <p className="mt-1 text-sm text-red-600">{formik.errors.time_limit_minutes}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Passing Score (%)
                      </label>
                      <input
                        type="number"
                        {...formik.getFieldProps('passing_score')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        min="0"
                        max="100"
                      />
                      {formik.touched.passing_score && formik.errors.passing_score && (
                        <p className="mt-1 text-sm text-red-600">{formik.errors.passing_score}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Max Attempts
                      </label>
                      <input
                        type="number"
                        {...formik.getFieldProps('max_attempts')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        min="1"
                      />
                      {formik.touched.max_attempts && formik.errors.max_attempts && (
                        <p className="mt-1 text-sm text-red-600">{formik.errors.max_attempts}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        {...formik.getFieldProps('is_required')}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Required for course completion
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        {...formik.getFieldProps('is_published')}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Publish assessment (make visible to students)
                      </label>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{content?.isNew ? 'Create' : 'Update'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Course Settings Tab Component
const CourseSettingsTab = ({ course, setCourse }) => {
  const [loading, setLoading] = useState(false)

  const formik = useFormik({
    initialValues: {
      title: course?.title || '',
      description: course?.description || '',
      long_description: course?.long_description || '',
      level: course?.level || 'beginner',
      price: course?.price || 0,
      duration_hours: course?.duration_hours || 1,
      status: course?.status || 'draft',
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Title is required'),
      description: Yup.string().required('Description is required'),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('courses')
          .update({
            ...values,
            updated_at: new Date().toISOString()
          })
          .eq('id', course.id)
          .select()
          .single()
        
        if (error) throw error
        
        setCourse(data)
        toast.success('Course settings updated successfully!')
      } catch (error) {
        toast.error('Failed to update course settings')
        console.error(error)
      } finally {
        setLoading(false)
      }
    },
  })

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Course Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
          Update basic course information and settings
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Course Title
          </label>
          <input
            type="text"
            {...formik.getFieldProps('title')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          {formik.touched.title && formik.errors.title && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Short Description
          </label>
          <textarea
            {...formik.getFieldProps('description')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          {formik.touched.description && formik.errors.description && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Detailed Description
          </label>
          <textarea
            {...formik.getFieldProps('long_description')}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Level
            </label>
            <select
              {...formik.getFieldProps('level')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              {...formik.getFieldProps('price')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Duration (hours)
            </label>
            <input
              type="number"
              {...formik.getFieldProps('duration_hours')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            {...formik.getFieldProps('status')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

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
      </form>
    </div>
  )
}

export default CourseEditor
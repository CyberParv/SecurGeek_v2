import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  ArrowUp, 
  ArrowDown, 
  FileText,
  Clock,
  Target,
  Settings,
  Eye,
  X,
  BookOpen,
  Award,
  Play,
  Users,
  BarChart3,
  ChevronDown,
  ChevronRight,
  GripVertical
} from 'lucide-react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const SectionModal = ({ isOpen, onClose, courseId, section, onSave }) => {
  const [loading, setLoading] = useState(false)

  const sectionSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string(),
  })

  const formik = useFormik({
    initialValues: {
      title: section?.title || '',
      description: section?.description || '',
    },
    validationSchema: sectionSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true)
      try {
        await onSave(values)
        onClose()
        formik.resetForm()
      } catch (error) {
        toast.error(error.message || 'Failed to save section')
      } finally {
        setLoading(false)
      }
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
                {section ? 'Edit Section' : 'Create New Section'}
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
                  placeholder="Brief description of the section"
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
                  disabled={loading}
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading && <LoadingSpinner size="sm" />}
                  <Save className="h-4 w-4" />
                  <span>{section ? 'Update Section' : 'Create Section'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

const ContentModal = ({ isOpen, onClose, sectionId, content, contentType, onSave }) => {
  const [loading, setLoading] = useState(false)

  const contentSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string(),
    ...(contentType === 'lesson' ? {
      content: Yup.string(),
      video_url: Yup.string().url('Must be a valid URL'),
      duration_minutes: Yup.number().min(1, 'Duration must be at least 1 minute'),
    } : {
      assessment_type: Yup.string().required('Assessment type is required'),
      passing_score: Yup.number().min(0).max(100).required('Passing score is required'),
      max_attempts: Yup.number().min(1).required('Max attempts is required'),
    })
  })

  const formik = useFormik({
    initialValues: {
      title: content?.title || '',
      description: content?.description || '',
      // Lesson fields
      content: content?.content || '',
      video_url: content?.video_url || '',
      duration_minutes: content?.duration_minutes || 10,
      // Assessment fields
      assessment_type: content?.assessment_type || 'quiz',
      instructions: content?.instructions || '',
      time_limit_minutes: content?.time_limit_minutes || '',
      passing_score: content?.passing_score || 70,
      max_attempts: content?.max_attempts || 3,
      is_required: content?.is_required ?? true,
      is_published: content?.is_published ?? false,
    },
    validationSchema: contentSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true)
      try {
        // Filter values based on content type to prevent schema mismatches
        let filteredValues = {
          title: values.title,
          description: values.description,
        }

        if (contentType === 'lesson') {
          filteredValues = {
            ...filteredValues,
            content: values.content,
            video_url: values.video_url,
            duration_minutes: values.duration_minutes,
          }
        } else {
          filteredValues = {
            ...filteredValues,
            assessment_type: values.assessment_type,
            instructions: values.instructions,
            time_limit_minutes: values.time_limit_minutes || null,
            passing_score: values.passing_score,
            max_attempts: values.max_attempts,
            is_required: values.is_required,
            is_published: values.is_published,
          }
        }

        await onSave(filteredValues, contentType)
        onClose()
        formik.resetForm()
      } catch (error) {
        toast.error(error.message || `Failed to save ${contentType}`)
      } finally {
        setLoading(false)
      }
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
                {content ? `Edit ${contentType}` : `Create New ${contentType}`}
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
                  {contentType === 'lesson' ? 'Lesson' : 'Assessment'} Title
                </label>
                <input
                  type="text"
                  {...formik.getFieldProps('title')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder={`Enter ${contentType} title`}
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
                  placeholder={`Brief description of the ${contentType}`}
                />
              </div>

              {contentType === 'lesson' ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Video URL
                      </label>
                      <input
                        type="url"
                        {...formik.getFieldProps('video_url')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="https://youtube.com/watch?v=..."
                      />
                      {formik.touched.video_url && formik.errors.video_url && (
                        <p className="mt-1 text-sm text-red-600">{formik.errors.video_url}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        {...formik.getFieldProps('duration_minutes')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="10"
                      />
                      {formik.touched.duration_minutes && formik.errors.duration_minutes && (
                        <p className="mt-1 text-sm text-red-600">{formik.errors.duration_minutes}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Lesson Content
                    </label>
                    <textarea
                      {...formik.getFieldProps('content')}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Detailed lesson content, notes, and materials..."
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Assessment Type
                      </label>
                      <select
                        {...formik.getFieldProps('assessment_type')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="quiz">Quiz</option>
                        <option value="midterm">Midterm</option>
                        <option value="final">Final Exam</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Time Limit (minutes)
                      </label>
                      <input
                        type="number"
                        {...formik.getFieldProps('time_limit_minutes')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Leave empty for no limit"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Passing Score (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        {...formik.getFieldProps('passing_score')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                        min="1"
                        {...formik.getFieldProps('max_attempts')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                      {formik.touched.max_attempts && formik.errors.max_attempts && (
                        <p className="mt-1 text-sm text-red-600">{formik.errors.max_attempts}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Instructions
                    </label>
                    <textarea
                      {...formik.getFieldProps('instructions')}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Instructions for students taking this assessment"
                    />
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        {...formik.getFieldProps('is_required')}
                        checked={formik.values.is_required}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Required Assessment
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        {...formik.getFieldProps('is_published')}
                        checked={formik.values.is_published}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Published
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
                  disabled={loading}
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading && <LoadingSpinner size="sm" />}
                  <Save className="h-4 w-4" />
                  <span>{content ? `Update ${contentType}` : `Create ${contentType}`}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

const CourseEditor = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  
  const [course, setCourse] = useState(null)
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSectionModal, setShowSectionModal] = useState(false)
  const [showContentModal, setShowContentModal] = useState(false)
  const [editingSection, setEditingSection] = useState(null)
  const [editingContent, setEditingContent] = useState(null)
  const [selectedSectionId, setSelectedSectionId] = useState(null)
  const [contentType, setContentType] = useState('lesson')
  const [collapsedSections, setCollapsedSections] = useState({})

  useEffect(() => {
    if (courseId) {
      fetchCourseData()
    }
  }, [courseId])

  const fetchCourseData = async () => {
    try {
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

      if (courseError) throw courseError

      // Fetch course sections with lessons and assessments
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('course_sections')
        .select(`
          *,
          lessons:lessons(*),
          assessments:assessments(*)
        `)
        .eq('course_id', courseId)
        .order('order_index')

      if (sectionsError) throw sectionsError

      // Combine lessons and assessments into unified content array
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

      setCourse(courseData)
      setSections(sectionsWithContent)

      // Initialize collapsed state
      const initialCollapsed = {}
      sectionsWithContent?.forEach(section => {
        initialCollapsed[section.id] = false
      })
      setCollapsedSections(initialCollapsed)
    } catch (error) {
      console.error('Error fetching course data:', error)
      toast.error('Failed to load course data')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSection = async (sectionData) => {
    setSaving(true)
    try {
      if (editingSection) {
        // Update existing section
        const { error } = await supabase
          .from('course_sections')
          .update(sectionData)
          .eq('id', editingSection.id)

        if (error) throw error

        setSections(prev => prev.map(s => 
          s.id === editingSection.id ? { ...s, ...sectionData } : s
        ))
        toast.success('Section updated successfully!')
      } else {
        // Create new section - calculate next order_index
        const { data: existingSections, error: fetchError } = await supabase
          .from('course_sections')
          .select('order_index')
          .eq('course_id', courseId)
          .order('order_index', { ascending: false })
          .limit(1)

        if (fetchError) throw fetchError

        const nextOrderIndex = existingSections.length > 0 ? existingSections[0].order_index + 1 : 0

        const { data, error } = await supabase
          .from('course_sections')
          .insert({
            ...sectionData,
            course_id: courseId,
            order_index: nextOrderIndex
          })
          .select()
          .single()

        if (error) throw error

        setSections(prev => [...prev, { ...data, content: [] }])
        toast.success('Section created successfully!')
      }

      setShowSectionModal(false)
      setEditingSection(null)
    } catch (error) {
      console.error('Error saving section:', error)
      toast.error('Failed to save section')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveContent = async (contentData, type) => {
    setSaving(true)
    try {
      if (editingContent) {
        // Update existing content
        const table = type === 'lesson' ? 'lessons' : 'assessments'
        const { error } = await supabase
          .from(table)
          .update(contentData)
          .eq('id', editingContent.id)

        if (error) throw error

        setSections(prev => prev.map(section => ({
          ...section,
          content: section.content?.map(content =>
            content.id === editingContent.id ? { ...content, ...contentData } : content
          ) || []
        })))
        toast.success(`${type} updated successfully!`)
      } else {
        // Create new content - calculate next order_index for this section
        const table = type === 'lesson' ? 'lessons' : 'assessments'
        
        const { data: existingContent, error: fetchError } = await supabase
          .from(table)
          .select('order_index')
          .eq('section_id', selectedSectionId)
          .order('order_index', { ascending: false })
          .limit(1)

        if (fetchError) throw fetchError

        const nextOrderIndex = existingContent.length > 0 ? existingContent[0].order_index + 1 : 0
        
        const insertData = {
          ...contentData,
          course_id: courseId,
          section_id: selectedSectionId,
          order_index: nextOrderIndex
        }

        const { data, error } = await supabase
          .from(table)
          .insert(insertData)
          .select()
          .single()

        if (error) throw error

        setSections(prev => prev.map(section =>
          section.id === selectedSectionId
            ? { ...section, content: [...(section.content || []), { ...data, type }] }
            : section
        ))
        toast.success(`${type} created successfully!`)
      }

      setShowContentModal(false)
      setEditingContent(null)
      setSelectedSectionId(null)
    } catch (error) {
      console.error(`Error saving ${type}:`, error)
      toast.error(`Failed to save ${type}`)
    } finally {
      setSaving(false)
    }
  }

  const handleMoveContent = async (sectionId, contentId, direction) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return

    const currentIndex = section.content.findIndex(c => c.id === contentId)
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    if (newIndex < 0 || newIndex >= section.content.length) return

    const newContent = [...section.content]
    const [movedItem] = newContent.splice(currentIndex, 1)
    newContent.splice(newIndex, 0, movedItem)

    // Update order_index for affected items
    const updates = newContent.map((item, index) => ({
      id: item.id,
      order_index: index,
      type: item.type
    }))

    try {
      // Update both lessons and assessments
      for (const update of updates) {
        const table = update.type === 'lesson' ? 'lessons' : 'assessments'
        await supabase
          .from(table)
          .update({ order_index: update.order_index })
          .eq('id', update.id)
      }

      // Update local state
      setSections(prev => prev.map(s => 
        s.id === sectionId ? { ...s, content: newContent } : s
      ))

      toast.success('Content order updated!')
    } catch (error) {
      console.error('Error updating content order:', error)
      toast.error('Failed to update content order')
    }
  }

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section? This will also delete all content in this section.')) return

    try {
      const { error } = await supabase
        .from('course_sections')
        .delete()
        .eq('id', sectionId)

      if (error) throw error

      setSections(prev => prev.filter(s => s.id !== sectionId))
      toast.success('Section deleted successfully!')
    } catch (error) {
      console.error('Error deleting section:', error)
      toast.error('Failed to delete section')
    }
  }

  const handleDeleteContent = async (contentId, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return

    try {
      const table = type === 'lesson' ? 'lessons' : 'assessments'
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', contentId)

      if (error) throw error

      setSections(prev => prev.map(section => ({
        ...section,
        content: section.content?.filter(content => content.id !== contentId) || []
      })))
      toast.success(`${type} deleted successfully!`)
    } catch (error) {
      console.error(`Error deleting ${type}:`, error)
      toast.error(`Failed to delete ${type}`)
    }
  }

  const handleEditSection = (section) => {
    setEditingSection(section)
    setShowSectionModal(true)
  }

  const handleEditContent = (content) => {
    setEditingContent(content)
    setContentType(content.type)
    setShowContentModal(true)
  }

  const handleAddContent = (sectionId, type) => {
    setSelectedSectionId(sectionId)
    setContentType(type)
    setEditingContent(null)
    setShowContentModal(true)
  }

  const toggleSection = (sectionId) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Course Not Found
          </h1>
          <button
            onClick={() => navigate('/admin/courses')}
            className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Edit Course: {course.title} - SecurGeek Admin</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {course.title}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Course Content Management
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Link
                    to={`/courses/${courseId}`}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Preview</span>
                  </Link>
                  <button
                    onClick={() => navigate('/admin/courses')}
                    className="px-6 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Back to Courses
                  </button>
                </div>
              </div>

              {/* Course Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {sections.reduce((total, section) => total + (section.content?.filter(c => c.type === 'lesson').length || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Total Lessons
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {sections.reduce((total, section) => total + (section.content?.filter(c => c.type === 'assessment').length || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Assessments
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {sections.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Sections
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {course.status}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Status
                  </div>
                </div>
              </div>
            </div>

            {/* Course Content Management */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Course Content & Structure
                </h2>
                <button 
                  onClick={() => setShowSectionModal(true)}
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Section</span>
                </button>
              </div>

              <div className="space-y-4">
                {sections.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No sections created yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      Start organizing your course by creating sections
                    </p>
                    <button 
                      onClick={() => setShowSectionModal(true)}
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors"
                    >
                      Create First Section
                    </button>
                  </div>
                ) : (
                  sections.map((section, sectionIndex) => (
                    <div key={section.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-t-lg">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          >
                            {collapsedSections[section.id] ? (
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            )}
                          </button>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {section.title}
                          </h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({section.content?.length || 0} items)
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleAddContent(section.id, 'lesson')}
                              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800 transition-colors"
                              title="Add Lesson"
                            >
                              Add Lesson
                            </button>
                            <button 
                              onClick={() => handleAddContent(section.id, 'assessment')}
                              className="px-3 py-1 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md border border-purple-200 dark:border-purple-800 transition-colors"
                              title="Add Assessment"
                            >
                              Add Assessment
                            </button>
                          </div>
                          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                          <button 
                            onClick={() => handleEditSection(section)}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                            title="Edit Section"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteSection(section.id)}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            title="Delete Section"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {!collapsedSections[section.id] && (
                        <div className="p-4 space-y-2">
                          {section.content?.length > 0 ? (
                            section.content.map((content, contentIndex) => (
                              <div key={content.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg group">
                                <div className="flex items-center space-x-3">
                                  <GripVertical className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  {content.type === 'lesson' ? (
                                    <Play className="h-4 w-4 text-blue-500" />
                                  ) : (
                                    <Award className="h-4 w-4 text-purple-500" />
                                  )}
                                  <div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {content.title}
                                    </span>
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
                                <div className="flex items-center space-x-1">
                                  <button 
                                    onClick={() => handleMoveContent(section.id, content.id, 'up')}
                                    disabled={contentIndex === 0}
                                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Move Up"
                                  >
                                    <ArrowUp className="h-3 w-3" />
                                  </button>
                                  <button 
                                    onClick={() => handleMoveContent(section.id, content.id, 'down')}
                                    disabled={contentIndex === section.content.length - 1}
                                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Move Down"
                                  >
                                    <ArrowDown className="h-3 w-3" />
                                  </button>
                                  <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                                  {content.type === 'assessment' && (
                                    <Link
                                      to={`/admin/assessment-builder/${courseId}/${content.id}`}
                                      className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                      title="Manage Questions"
                                    >
                                      <Settings className="h-3 w-3" />
                                    </Link>
                                  )}
                                  <button 
                                    onClick={() => handleEditContent(content)}
                                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                    title="Edit"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteContent(content.id, content.type)}
                                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <div className="flex items-center justify-center space-x-4 mb-4">
                                <Play className="h-8 w-8 text-gray-300" />
                                <Award className="h-8 w-8 text-gray-300" />
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                No content in this section yet
                              </p>
                              <div className="flex items-center justify-center space-x-2">
                                <button 
                                  onClick={() => handleAddContent(section.id, 'lesson')}
                                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                                >
                                  <Play className="h-3 w-3" />
                                  <span>Add Lesson</span>
                                </button>
                                <span className="text-gray-300">or</span>
                                <button 
                                  onClick={() => handleAddContent(section.id, 'assessment')}
                                  className="text-sm text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                                >
                                  <Award className="h-3 w-3" />
                                  <span>Add Assessment</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SectionModal
        isOpen={showSectionModal}
        onClose={() => {
          setShowSectionModal(false)
          setEditingSection(null)
        }}
        courseId={courseId}
        section={editingSection}
        onSave={handleSaveSection}
      />

      <ContentModal
        isOpen={showContentModal}
        onClose={() => {
          setShowContentModal(false)
          setEditingContent(null)
          setSelectedSectionId(null)
        }}
        sectionId={selectedSectionId}
        content={editingContent}
        contentType={contentType}
        onSave={handleSaveContent}
      />
    </>
  )
}

export default CourseEditor
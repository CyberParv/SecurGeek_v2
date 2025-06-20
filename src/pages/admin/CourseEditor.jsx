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
  ChevronRight
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
        const sectionData = {
          ...values,
          course_id: courseId,
          order_index: section?.order_index || 0,
        }

        await onSave(sectionData)
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

const LessonModal = ({ isOpen, onClose, sectionId, lesson, onSave }) => {
  const [loading, setLoading] = useState(false)

  const lessonSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string(),
    content: Yup.string(),
    video_url: Yup.string().url('Must be a valid URL'),
    duration_minutes: Yup.number().min(1, 'Duration must be at least 1 minute'),
  })

  const formik = useFormik({
    initialValues: {
      title: lesson?.title || '',
      description: lesson?.description || '',
      content: lesson?.content || '',
      video_url: lesson?.video_url || '',
      duration_minutes: lesson?.duration_minutes || 10,
    },
    validationSchema: lessonSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true)
      try {
        const lessonData = {
          ...values,
          section_id: sectionId,
          order_index: lesson?.order_index || 0,
        }

        await onSave(lessonData)
        onClose()
        formik.resetForm()
      } catch (error) {
        toast.error(error.message || 'Failed to save lesson')
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
                {lesson ? 'Edit Lesson' : 'Create New Lesson'}
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
                  Lesson Title
                </label>
                <input
                  type="text"
                  {...formik.getFieldProps('title')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter lesson title"
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
                  placeholder="Brief description of the lesson"
                />
              </div>

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
                  <span>{lesson ? 'Update Lesson' : 'Create Lesson'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

const AssessmentModal = ({ isOpen, onClose, courseId, assessment, onSave }) => {
  const [loading, setLoading] = useState(false)

  const assessmentSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    assessment_type: Yup.string().required('Assessment type is required'),
    passing_score: Yup.number().min(0).max(100).required('Passing score is required'),
    max_attempts: Yup.number().min(1).required('Max attempts is required'),
  })

  const formik = useFormik({
    initialValues: {
      title: assessment?.title || '',
      description: assessment?.description || '',
      assessment_type: assessment?.assessment_type || 'quiz',
      instructions: assessment?.instructions || '',
      time_limit_minutes: assessment?.time_limit_minutes || '',
      passing_score: assessment?.passing_score || 70,
      max_attempts: assessment?.max_attempts || 3,
      is_required: assessment?.is_required ?? true,
      is_published: assessment?.is_published ?? false,
    },
    validationSchema: assessmentSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true)
      try {
        const assessmentData = {
          ...values,
          course_id: courseId,
          time_limit_minutes: values.time_limit_minutes || null,
          order_index: assessment?.order_index || 0,
        }

        await onSave(assessmentData)
        onClose()
        formik.resetForm()
      } catch (error) {
        toast.error(error.message || 'Failed to save assessment')
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
                {assessment ? 'Edit Assessment' : 'Create New Assessment'}
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
                  Assessment Title
                </label>
                <input
                  type="text"
                  {...formik.getFieldProps('title')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter assessment title"
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
                  placeholder="Brief description of the assessment"
                />
              </div>

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
                  <span>{assessment ? 'Update Assessment' : 'Create Assessment'}</span>
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
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSectionModal, setShowSectionModal] = useState(false)
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [showAssessmentModal, setShowAssessmentModal] = useState(false)
  const [editingSection, setEditingSection] = useState(null)
  const [editingLesson, setEditingLesson] = useState(null)
  const [editingAssessment, setEditingAssessment] = useState(null)
  const [selectedSectionId, setSelectedSectionId] = useState(null)
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

      // Fetch course sections with lessons
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('course_sections')
        .select(`
          *,
          lessons:lessons(*)
        `)
        .eq('course_id', courseId)
        .order('order_index')

      if (sectionsError) throw sectionsError

      // Fetch assessments
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('assessments')
        .select(`
          *,
          questions:assessment_questions(count)
        `)
        .eq('course_id', courseId)
        .order('order_index')

      if (assessmentsError) throw assessmentsError

      setCourse(courseData)
      setSections(sectionsData || [])
      setAssessments(assessmentsData || [])

      // Initialize collapsed state
      const initialCollapsed = {}
      sectionsData?.forEach(section => {
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
        // Create new section
        const { data, error } = await supabase
          .from('course_sections')
          .insert({
            ...sectionData,
            order_index: sections.length
          })
          .select()
          .single()

        if (error) throw error

        setSections(prev => [...prev, { ...data, lessons: [] }])
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

  const handleSaveLesson = async (lessonData) => {
    setSaving(true)
    try {
      if (editingLesson) {
        // Update existing lesson
        const { error } = await supabase
          .from('lessons')
          .update(lessonData)
          .eq('id', editingLesson.id)

        if (error) throw error

        setSections(prev => prev.map(section => ({
          ...section,
          lessons: section.lessons?.map(lesson =>
            lesson.id === editingLesson.id ? { ...lesson, ...lessonData } : lesson
          ) || []
        })))
        toast.success('Lesson updated successfully!')
      } else {
        // Create new lesson
        const sectionLessons = sections.find(s => s.id === selectedSectionId)?.lessons || []
        const { data, error } = await supabase
          .from('lessons')
          .insert({
            ...lessonData,
            course_id: courseId,
            order_index: sectionLessons.length
          })
          .select()
          .single()

        if (error) throw error

        setSections(prev => prev.map(section =>
          section.id === selectedSectionId
            ? { ...section, lessons: [...(section.lessons || []), data] }
            : section
        ))
        toast.success('Lesson created successfully!')
      }

      setShowLessonModal(false)
      setEditingLesson(null)
      setSelectedSectionId(null)
    } catch (error) {
      console.error('Error saving lesson:', error)
      toast.error('Failed to save lesson')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAssessment = async (assessmentData) => {
    setSaving(true)
    try {
      if (editingAssessment) {
        // Update existing assessment
        const { error } = await supabase
          .from('assessments')
          .update(assessmentData)
          .eq('id', editingAssessment.id)

        if (error) throw error

        setAssessments(prev => prev.map(a => 
          a.id === editingAssessment.id ? { ...a, ...assessmentData } : a
        ))
        toast.success('Assessment updated successfully!')
      } else {
        // Create new assessment
        const { data, error } = await supabase
          .from('assessments')
          .insert({
            ...assessmentData,
            order_index: assessments.length
          })
          .select()
          .single()

        if (error) throw error

        setAssessments(prev => [...prev, { ...data, questions: [{ count: 0 }] }])
        toast.success('Assessment created successfully!')
      }

      setShowAssessmentModal(false)
      setEditingAssessment(null)
    } catch (error) {
      console.error('Error saving assessment:', error)
      toast.error('Failed to save assessment')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section? This will also delete all lessons in this section.')) return

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

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return

    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId)

      if (error) throw error

      setSections(prev => prev.map(section => ({
        ...section,
        lessons: section.lessons?.filter(lesson => lesson.id !== lessonId) || []
      })))
      toast.success('Lesson deleted successfully!')
    } catch (error) {
      console.error('Error deleting lesson:', error)
      toast.error('Failed to delete lesson')
    }
  }

  const handleDeleteAssessment = async (assessmentId) => {
    if (!window.confirm('Are you sure you want to delete this assessment? This will also delete all questions.')) return

    try {
      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('id', assessmentId)

      if (error) throw error

      setAssessments(prev => prev.filter(a => a.id !== assessmentId))
      toast.success('Assessment deleted successfully!')
    } catch (error) {
      console.error('Error deleting assessment:', error)
      toast.error('Failed to delete assessment')
    }
  }

  const handleEditSection = (section) => {
    setEditingSection(section)
    setShowSectionModal(true)
  }

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson)
    setShowLessonModal(true)
  }

  const handleEditAssessment = (assessment) => {
    setEditingAssessment(assessment)
    setShowAssessmentModal(true)
  }

  const handleAddLesson = (sectionId) => {
    setSelectedSectionId(sectionId)
    setEditingLesson(null)
    setShowLessonModal(true)
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
                    Course Management Dashboard
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
                    {sections.reduce((total, section) => total + (section.lessons?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Total Lessons
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
                    {assessments.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Assessments
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sections & Lessons */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Course Sections & Lessons
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
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        No sections created yet
                      </p>
                      <button 
                        onClick={() => setShowSectionModal(true)}
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors"
                      >
                        Create First Section
                      </button>
                    </div>
                  ) : (
                    sections.map((section, index) => (
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
                              ({section.lessons?.length || 0} lessons)
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleAddLesson(section.id)}
                              className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                              title="Add Lesson"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
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
                            {section.lessons?.map((lesson, lessonIndex) => (
                              <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <Play className="h-4 w-4 text-blue-500" />
                                  <div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {lesson.title}
                                    </span>
                                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                      <span>{lesson.duration_minutes || 10} min</span>
                                      {lesson.video_url && (
                                        <span className="text-blue-600 dark:text-blue-400">Video</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <button 
                                    onClick={() => handleEditLesson(lesson)}
                                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                    title="Edit Lesson"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteLesson(lesson.id)}
                                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                    title="Delete Lesson"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            )) || (
                              <div className="text-center py-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                  No lessons in this section
                                </p>
                                <button 
                                  onClick={() => handleAddLesson(section.id)}
                                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1 mx-auto"
                                >
                                  <Plus className="h-3 w-3" />
                                  <span>Add First Lesson</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Assessments */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Course Assessments
                  </h2>
                  <button 
                    onClick={() => setShowAssessmentModal(true)}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Assessment</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {assessments.length === 0 ? (
                    <div className="text-center py-8">
                      <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        No assessments created yet
                      </p>
                      <button 
                        onClick={() => setShowAssessmentModal(true)}
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors"
                      >
                        Create First Assessment
                      </button>
                    </div>
                  ) : (
                    assessments.map((assessment) => (
                      <div key={assessment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {assessment.title}
                              </h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                assessment.is_published 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              }`}>
                                {assessment.is_published ? 'Published' : 'Draft'}
                              </span>
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                                {assessment.assessment_type}
                              </span>
                            </div>
                            
                            {assessment.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                {assessment.description}
                              </p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              <span>{assessment.questions?.[0]?.count || 0} questions</span>
                              <span>{assessment.passing_score}% to pass</span>
                              {assessment.time_limit_minutes && (
                                <span>{assessment.time_limit_minutes} min limit</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Link
                              to={`/admin/assessment-builder/${courseId}/${assessment.id}`}
                              className="p-2 text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors"
                              title="Manage Questions"
                            >
                              <Settings className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleEditAssessment(assessment)}
                              className="p-2 text-gray-600 hover:text-gray-700 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors"
                              title="Edit Assessment"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAssessment(assessment.id)}
                              className="p-2 text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete Assessment"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
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

      <LessonModal
        isOpen={showLessonModal}
        onClose={() => {
          setShowLessonModal(false)
          setEditingLesson(null)
          setSelectedSectionId(null)
        }}
        sectionId={selectedSectionId}
        lesson={editingLesson}
        onSave={handleSaveLesson}
      />

      <AssessmentModal
        isOpen={showAssessmentModal}
        onClose={() => {
          setShowAssessmentModal(false)
          setEditingAssessment(null)
        }}
        courseId={courseId}
        assessment={editingAssessment}
        onSave={handleSaveAssessment}
      />
    </>
  )
}

export default CourseEditor
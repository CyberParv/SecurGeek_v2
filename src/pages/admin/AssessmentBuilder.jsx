import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
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
  X
} from 'lucide-react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const QuestionEditor = ({ question, onSave, onCancel, questionTypes }) => {
  const questionSchema = Yup.object({
    question_text: Yup.string().required('Question text is required'),
    question_type: Yup.string().required('Question type is required'),
    correct_answer: Yup.string().required('Correct answer is required'),
    points: Yup.number().min(1, 'Points must be at least 1').required('Points are required'),
  })

  const formik = useFormik({
    initialValues: {
      question_text: question?.question_text || '',
      question_type: question?.question_type || 'multiple_choice',
      options: question?.options || ['', '', '', ''],
      correct_answer: question?.correct_answer || '',
      explanation: question?.explanation || '',
      points: question?.points || 1,
    },
    validationSchema: questionSchema,
    onSubmit: (values) => {
      const questionData = {
        ...values,
        options: values.question_type === 'multiple_choice' ? 
          values.options.filter(opt => opt.trim() !== '') : 
          values.question_type === 'true_false' ? ['True', 'False'] : null
      }
      onSave(questionData)
    },
  })

  const addOption = () => {
    formik.setFieldValue('options', [...formik.values.options, ''])
  }

  const removeOption = (index) => {
    const newOptions = formik.values.options.filter((_, i) => i !== index)
    formik.setFieldValue('options', newOptions)
  }

  const updateOption = (index, value) => {
    const newOptions = [...formik.values.options]
    newOptions[index] = value
    formik.setFieldValue('options', newOptions)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {question ? 'Edit Question' : 'Add New Question'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question Text
            </label>
            <textarea
              {...formik.getFieldProps('question_text')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter your question here..."
            />
            {formik.touched.question_text && formik.errors.question_text && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.question_text}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Question Type
              </label>
              <select
                {...formik.getFieldProps('question_type')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {questionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Points
              </label>
              <input
                type="number"
                {...formik.getFieldProps('points')}
                min="1"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              {formik.touched.points && formik.errors.points && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.points}</p>
              )}
            </div>
          </div>

          {/* Options for multiple choice */}
          {formik.values.question_type === 'multiple_choice' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Answer Options
                </label>
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Option</span>
                </button>
              </div>
              <div className="space-y-3">
                {formik.values.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500 w-8">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    />
                    {formik.values.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="p-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Correct Answer
            </label>
            {formik.values.question_type === 'multiple_choice' ? (
              <select
                {...formik.getFieldProps('correct_answer')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select correct answer</option>
                {formik.values.options.filter(opt => opt.trim() !== '').map((option, index) => (
                  <option key={index} value={option}>
                    {String.fromCharCode(65 + index)}. {option}
                  </option>
                ))}
              </select>
            ) : formik.values.question_type === 'true_false' ? (
              <select
                {...formik.getFieldProps('correct_answer')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select correct answer</option>
                <option value="True">True</option>
                <option value="False">False</option>
              </select>
            ) : (
              <textarea
                {...formik.getFieldProps('correct_answer')}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter the correct answer or key points..."
              />
            )}
            {formik.touched.correct_answer && formik.errors.correct_answer && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.correct_answer}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Explanation (Optional)
            </label>
            <textarea
              {...formik.getFieldProps('explanation')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Explain why this is the correct answer..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Question</span>
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

const AssessmentBuilder = () => {
  const { courseId, assessmentId } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  
  const [assessment, setAssessment] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [showQuestionEditor, setShowQuestionEditor] = useState(false)

  const questionTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'true_false', label: 'True/False' },
    { value: 'short_answer', label: 'Short Answer' },
    { value: 'essay', label: 'Essay' }
  ]

  useEffect(() => {
    if (assessmentId) {
      fetchAssessment()
    } else {
      setLoading(false)
    }
  }, [assessmentId])

  const fetchAssessment = async () => {
    try {
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single()

      if (assessmentError) throw assessmentError

      const { data: questionsData, error: questionsError } = await supabase
        .from('assessment_questions')
        .select('*')
        .eq('assessment_id', assessmentId)
        .order('order_index')

      if (questionsError) throw questionsError

      setAssessment(assessmentData)
      setQuestions(questionsData)
    } catch (error) {
      console.error('Error fetching assessment:', error)
      toast.error('Failed to load assessment')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveQuestion = async (questionData) => {
    setSaving(true)
    try {
      if (editingQuestion) {
        // Update existing question
        const { error } = await supabase
          .from('assessment_questions')
          .update(questionData)
          .eq('id', editingQuestion.id)

        if (error) throw error

        setQuestions(prev => prev.map(q => 
          q.id === editingQuestion.id ? { ...q, ...questionData } : q
        ))
        toast.success('Question updated successfully!')
      } else {
        // Create new question
        const { data, error } = await supabase
          .from('assessment_questions')
          .insert({
            ...questionData,
            assessment_id: assessmentId,
            order_index: questions.length
          })
          .select()
          .single()

        if (error) throw error

        setQuestions(prev => [...prev, data])
        toast.success('Question added successfully!')
      }

      setShowQuestionEditor(false)
      setEditingQuestion(null)
    } catch (error) {
      console.error('Error saving question:', error)
      toast.error('Failed to save question')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return

    try {
      const { error } = await supabase
        .from('assessment_questions')
        .delete()
        .eq('id', questionId)

      if (error) throw error

      setQuestions(prev => prev.filter(q => q.id !== questionId))
      toast.success('Question deleted successfully!')
    } catch (error) {
      console.error('Error deleting question:', error)
      toast.error('Failed to delete question')
    }
  }

  const handleMoveQuestion = async (questionId, direction) => {
    const currentIndex = questions.findIndex(q => q.id === questionId)
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    if (newIndex < 0 || newIndex >= questions.length) return

    const newQuestions = [...questions]
    const [movedQuestion] = newQuestions.splice(currentIndex, 1)
    newQuestions.splice(newIndex, 0, movedQuestion)

    // Update order_index for affected questions
    const updates = newQuestions.map((q, index) => ({
      id: q.id,
      order_index: index
    }))

    try {
      for (const update of updates) {
        await supabase
          .from('assessment_questions')
          .update({ order_index: update.order_index })
          .eq('id', update.id)
      }

      setQuestions(newQuestions)
      toast.success('Question order updated!')
    } catch (error) {
      console.error('Error updating question order:', error)
      toast.error('Failed to update question order')
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Assessment Builder
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {assessment ? `Editing: ${assessment.title}` : 'Create and manage assessment questions'}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowQuestionEditor(true)}
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Question</span>
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
              </div>
            </div>

            {/* Assessment Stats */}
            {assessment && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {questions.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Questions
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {questions.reduce((sum, q) => sum + (q.points || 1), 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Total Points
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {assessment.time_limit_minutes || 'No'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Time Limit {assessment.time_limit_minutes ? '(min)' : ''}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {assessment.passing_score}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Passing Score
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Questions Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Start building your assessment by adding your first question.
                </p>
                <button
                  onClick={() => setShowQuestionEditor(true)}
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors"
                >
                  Add First Question
                </button>
              </div>
            ) : (
              questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-3 py-1 rounded-full text-sm font-medium">
                          Question {index + 1}
                        </span>
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                          {questionTypes.find(t => t.value === question.question_type)?.label}
                        </span>
                        <span className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 px-3 py-1 rounded-full text-sm">
                          {question.points} {question.points === 1 ? 'point' : 'points'}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        {question.question_text}
                      </h3>
                      
                      {question.question_type === 'multiple_choice' && question.options && (
                        <div className="space-y-2 mb-3">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`flex items-center space-x-2 p-2 rounded-lg ${
                                option === question.correct_answer
                                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                  : 'bg-gray-50 dark:bg-gray-700'
                              }`}
                            >
                              <span className="text-sm font-medium text-gray-500 w-6">
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              <span className={`text-sm ${
                                option === question.correct_answer
                                  ? 'text-green-800 dark:text-green-200 font-medium'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {option}
                              </span>
                              {option === question.correct_answer && (
                                <span className="text-green-600 dark:text-green-400 text-xs">
                                  ✓ Correct
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {question.question_type === 'true_false' && (
                        <div className="mb-3">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            Correct Answer: 
                            <span className="ml-2 font-medium text-green-600 dark:text-green-400">
                              {question.correct_answer}
                            </span>
                          </span>
                        </div>
                      )}

                      {question.explanation && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleMoveQuestion(question.id, 'up')}
                        disabled={index === 0}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleMoveQuestion(question.id, 'down')}
                        disabled={index === questions.length - 1}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingQuestion(question)
                          setShowQuestionEditor(true)
                        }}
                        className="p-2 text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="p-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Question Editor Modal */}
      <AnimatePresence>
        {showQuestionEditor && (
          <QuestionEditor
            question={editingQuestion}
            questionTypes={questionTypes}
            onSave={handleSaveQuestion}
            onCancel={() => {
              setShowQuestionEditor(false)
              setEditingQuestion(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default AssessmentBuilder
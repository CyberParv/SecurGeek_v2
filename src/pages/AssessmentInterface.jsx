import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Flag,
  Award,
  RotateCcw,
  FileText,
  Target
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const AssessmentInterface = () => {
  const { assessmentId } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  
  const [assessment, setAssessment] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssessment()
  }, [assessmentId])

  useEffect(() => {
    let timer
    if (hasStarted && timeRemaining > 0 && !isCompleted) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitAssessment()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [hasStarted, timeRemaining, isCompleted])

  const fetchAssessment = async () => {
    try {
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessments')
        .select(`
          *,
          course:courses(title)
        `)
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
      
      if (assessmentData.time_limit_minutes) {
        setTimeRemaining(assessmentData.time_limit_minutes * 60)
      }
    } catch (error) {
      console.error('Error fetching assessment:', error)
      toast.error('Failed to load assessment')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleStartAssessment = () => {
    setHasStarted(true)
    toast.success('Assessment started! Good luck!')
  }

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmitAssessment = async () => {
    setIsSubmitting(true)
    try {
      // Calculate score
      let earnedPoints = 0
      let totalPoints = 0

      questions.forEach(question => {
        totalPoints += question.points || 1
        const userAnswer = answers[question.id]
        if (userAnswer && userAnswer.toLowerCase() === question.correct_answer.toLowerCase()) {
          earnedPoints += question.points || 1
        }
      })

      const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
      const passed = score >= (assessment.passing_score || 70)

      // Get enrollment ID
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', assessment.course_id)
        .single()

      if (enrollmentError) throw enrollmentError

      // Save attempt
      const { data: attempt, error: attemptError } = await supabase
        .from('assessment_attempts')
        .insert({
          user_id: user.id,
          assessment_id: assessmentId,
          enrollment_id: enrollment.id,
          score,
          total_points: totalPoints,
          earned_points: earnedPoints,
          answers,
          passed,
          completed_at: new Date().toISOString(),
          time_taken_minutes: assessment.time_limit_minutes ? 
            Math.ceil((assessment.time_limit_minutes * 60 - timeRemaining) / 60) : 0
        })
        .select()
        .single()

      if (attemptError) throw attemptError

      setResults({
        score,
        passed,
        earnedPoints,
        totalPoints,
        attempt
      })
      setIsCompleted(true)
      
      if (passed) {
        toast.success('Congratulations! You passed the assessment!')
      } else {
        toast.error('You did not pass this time. Keep studying and try again!')
      }
    } catch (error) {
      console.error('Error submitting assessment:', error)
      toast.error('Failed to submit assessment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isCompleted && results) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
            >
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                results.passed 
                  ? 'bg-green-100 dark:bg-green-900/20' 
                  : 'bg-red-100 dark:bg-red-900/20'
              }`}>
                {results.passed ? (
                  <Award className="h-10 w-10 text-green-600 dark:text-green-400" />
                ) : (
                  <RotateCcw className="h-10 w-10 text-red-600 dark:text-red-400" />
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Assessment {results.passed ? 'Completed!' : 'Not Passed'}
              </h1>
              
              <div className="text-6xl font-bold mb-4">
                <span className={results.passed ? 'text-green-600' : 'text-red-600'}>
                  {results.score}%
                </span>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You scored {results.earnedPoints} out of {results.totalPoints} points
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {results.score}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Your Score
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {assessment.passing_score}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Passing Score
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors"
                >
                  Back to Dashboard
                </button>
                {!results.passed && (
                  <button
                    onClick={() => window.location.reload()}
                    className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {assessment.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {assessment.course?.title}
                </p>
              </div>

              {assessment.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {assessment.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {questions.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Questions
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {assessment.time_limit_minutes || 'No'} 
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Time Limit {assessment.time_limit_minutes ? '(min)' : ''}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {assessment.passing_score}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Passing Score
                  </div>
                </div>
              </div>

              {assessment.instructions && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Instructions
                  </h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-blue-800 dark:text-blue-200">
                      {assessment.instructions}
                    </p>
                  </div>
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={handleStartAssessment}
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-4 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors text-lg font-semibold"
                >
                  Start Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{assessment.title} - Assessment - SecurGeek</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {assessment.title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {timeRemaining !== null && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span className={`font-mono text-lg ${
                    timeRemaining < 300 ? 'text-red-600' : 'text-gray-900 dark:text-white'
                  }`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
              <button
                onClick={handleSubmitAssessment}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isSubmitting && <LoadingSpinner size="sm" />}
                <Flag className="h-4 w-4" />
                <span>Submit</span>
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {currentQuestion?.question_text}
                  </h2>
                  
                  {currentQuestion?.question_type === 'multiple_choice' && (
                    <div className="space-y-3">
                      {currentQuestion.options?.map((option, index) => (
                        <label
                          key={index}
                          className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion.id}`}
                            value={option}
                            checked={answers[currentQuestion.id] === option}
                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                            className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-gray-900 dark:text-white">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {currentQuestion?.question_type === 'true_false' && (
                    <div className="space-y-3">
                      {['True', 'False'].map((option) => (
                        <label
                          key={option}
                          className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion.id}`}
                            value={option}
                            checked={answers[currentQuestion.id] === option}
                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                            className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-gray-900 dark:text-white">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {(currentQuestion?.question_type === 'short_answer' || currentQuestion?.question_type === 'essay') && (
                    <textarea
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      rows={currentQuestion.question_type === 'essay' ? 8 : 3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your answer here..."
                    />
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </button>

                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {Object.keys(answers).length} of {questions.length} answered
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span>Next</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  )
}

export default AssessmentInterface